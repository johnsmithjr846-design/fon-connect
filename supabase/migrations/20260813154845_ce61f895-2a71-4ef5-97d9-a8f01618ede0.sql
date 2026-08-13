ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT friendships_distinct CHECK (requester_id <> addressee_id),
  CONSTRAINT friendships_status_valid CHECK (status IN ('pending','accepted')),
  CONSTRAINT friendships_unique_pair UNIQUE (requester_id, addressee_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY friendships_select_involved ON public.friendships FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY friendships_insert_own ON public.friendships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id AND status = 'pending');
CREATE POLICY friendships_update_addressee ON public.friendships FOR UPDATE TO authenticated
  USING (auth.uid() = addressee_id) WITH CHECK (auth.uid() = addressee_id AND status = 'accepted');
CREATE POLICY friendships_delete_involved ON public.friendships FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE TRIGGER friendships_updated_at BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX friendships_addressee_idx ON public.friendships (addressee_id, status);
CREATE INDEX friendships_requester_idx ON public.friendships (requester_id, status);

CREATE OR REPLACE FUNCTION public.are_friends(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE f.status = 'accepted'
      AND ((f.requester_id = _a AND f.addressee_id = _b) OR (f.requester_id = _b AND f.addressee_id = _a))
  )
$$;

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT messages_distinct CHECK (sender_id <> recipient_id),
  CONSTRAINT messages_body_len CHECK (char_length(body) BETWEEN 1 AND 2000)
);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY messages_select_involved ON public.messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY messages_insert_friends ON public.messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND public.are_friends(sender_id, recipient_id));
CREATE POLICY messages_update_recipient ON public.messages FOR UPDATE TO authenticated
  USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);
CREATE TRIGGER messages_updated_at BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX messages_pair_idx ON public.messages (sender_id, recipient_id, created_at DESC);
CREATE INDEX messages_recipient_idx ON public.messages (recipient_id, read_at);

CREATE OR REPLACE FUNCTION public.search_profiles(_actor uuid, _q text)
RETURNS TABLE(user_id uuid, pseudo text, avatar_url text, xp_total integer, friend_status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.pseudo, p.avatar_url, coalesce(s.xp_total, 0),
         CASE
           WHEN f.status = 'accepted' THEN 'friends'
           WHEN f.status = 'pending' AND f.requester_id = _actor THEN 'sent'
           WHEN f.status = 'pending' THEN 'received'
           ELSE 'none'
         END
  FROM public.profiles p
  LEFT JOIN public.user_stats s ON s.user_id = p.id
  LEFT JOIN public.friendships f
    ON (f.requester_id = _actor AND f.addressee_id = p.id)
    OR (f.addressee_id = _actor AND f.requester_id = p.id)
  WHERE _actor IS NOT NULL
    AND p.id <> _actor
    AND p.pseudo IS NOT NULL
    AND coalesce(_q, '') <> ''
    AND p.pseudo ILIKE '%' || _q || '%'
  ORDER BY p.pseudo
  LIMIT 20
$$;

CREATE OR REPLACE FUNCTION public.list_friendships(_actor uuid)
RETURNS TABLE(friendship_id uuid, user_id uuid, pseudo text, avatar_url text, xp_total integer, status text, direction text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT f.id,
         other.id, other.pseudo, other.avatar_url, coalesce(s.xp_total, 0),
         f.status,
         CASE WHEN f.requester_id = _actor THEN 'outgoing' ELSE 'incoming' END,
         f.created_at
  FROM public.friendships f
  JOIN public.profiles other
    ON other.id = CASE WHEN f.requester_id = _actor THEN f.addressee_id ELSE f.requester_id END
  LEFT JOIN public.user_stats s ON s.user_id = other.id
  WHERE _actor IS NOT NULL AND (f.requester_id = _actor OR f.addressee_id = _actor)
  ORDER BY f.created_at DESC
$$;

CREATE OR REPLACE FUNCTION public.list_conversations(_actor uuid)
RETURNS TABLE(user_id uuid, pseudo text, avatar_url text, xp_total integer, last_body text, last_at timestamptz, unread integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH peers AS (
    SELECT CASE WHEN m.sender_id = _actor THEN m.recipient_id ELSE m.sender_id END AS peer,
           m.body, m.created_at,
           row_number() OVER (
             PARTITION BY CASE WHEN m.sender_id = _actor THEN m.recipient_id ELSE m.sender_id END
             ORDER BY m.created_at DESC) AS rn
    FROM public.messages m
    WHERE _actor IS NOT NULL AND (m.sender_id = _actor OR m.recipient_id = _actor)
  )
  SELECT pr.id, pr.pseudo, pr.avatar_url, coalesce(st.xp_total, 0), p.body, p.created_at,
         (SELECT count(*)::int FROM public.messages um
           WHERE um.recipient_id = _actor AND um.sender_id = pr.id AND um.read_at IS NULL)
  FROM peers p
  JOIN public.profiles pr ON pr.id = p.peer
  LEFT JOIN public.user_stats st ON st.user_id = pr.id
  WHERE p.rn = 1
  ORDER BY p.created_at DESC
$$;

CREATE OR REPLACE FUNCTION public.get_public_profile(_actor uuid, _target uuid)
RETURNS TABLE(user_id uuid, pseudo text, avatar_url text, xp_total integer, current_streak integer, is_friend boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.pseudo, p.avatar_url, coalesce(s.xp_total, 0), coalesce(s.current_streak, 0),
         public.are_friends(_actor, p.id)
  FROM public.profiles p
  LEFT JOIN public.user_stats s ON s.user_id = p.id
  WHERE _actor IS NOT NULL AND p.id = _target
$$;