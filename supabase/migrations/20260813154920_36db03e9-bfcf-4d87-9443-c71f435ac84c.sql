DROP FUNCTION IF EXISTS public.search_profiles(uuid, text);
DROP FUNCTION IF EXISTS public.list_friendships(uuid);
DROP FUNCTION IF EXISTS public.list_conversations(uuid);
DROP FUNCTION IF EXISTS public.get_public_profile(uuid, uuid);

CREATE OR REPLACE FUNCTION public.search_profiles(_q text)
RETURNS TABLE(user_id uuid, pseudo text, avatar_url text, xp_total integer, friend_status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.pseudo, p.avatar_url, coalesce(s.xp_total, 0),
         CASE
           WHEN f.status = 'accepted' THEN 'friends'
           WHEN f.status = 'pending' AND f.requester_id = auth.uid() THEN 'sent'
           WHEN f.status = 'pending' THEN 'received'
           ELSE 'none'
         END
  FROM public.profiles p
  LEFT JOIN public.user_stats s ON s.user_id = p.id
  LEFT JOIN public.friendships f
    ON (f.requester_id = auth.uid() AND f.addressee_id = p.id)
    OR (f.addressee_id = auth.uid() AND f.requester_id = p.id)
  WHERE auth.uid() IS NOT NULL
    AND p.id <> auth.uid()
    AND p.pseudo IS NOT NULL
    AND coalesce(_q, '') <> ''
    AND p.pseudo ILIKE '%' || _q || '%'
  ORDER BY p.pseudo
  LIMIT 20
$$;

CREATE OR REPLACE FUNCTION public.list_friendships()
RETURNS TABLE(friendship_id uuid, user_id uuid, pseudo text, avatar_url text, xp_total integer, status text, direction text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT f.id, other.id, other.pseudo, other.avatar_url, coalesce(s.xp_total, 0), f.status,
         CASE WHEN f.requester_id = auth.uid() THEN 'outgoing' ELSE 'incoming' END,
         f.created_at
  FROM public.friendships f
  JOIN public.profiles other
    ON other.id = CASE WHEN f.requester_id = auth.uid() THEN f.addressee_id ELSE f.requester_id END
  LEFT JOIN public.user_stats s ON s.user_id = other.id
  WHERE auth.uid() IS NOT NULL AND (f.requester_id = auth.uid() OR f.addressee_id = auth.uid())
  ORDER BY f.created_at DESC
$$;

CREATE OR REPLACE FUNCTION public.list_conversations()
RETURNS TABLE(user_id uuid, pseudo text, avatar_url text, xp_total integer, last_body text, last_at timestamptz, unread integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH peers AS (
    SELECT CASE WHEN m.sender_id = auth.uid() THEN m.recipient_id ELSE m.sender_id END AS peer,
           m.body, m.created_at,
           row_number() OVER (
             PARTITION BY CASE WHEN m.sender_id = auth.uid() THEN m.recipient_id ELSE m.sender_id END
             ORDER BY m.created_at DESC) AS rn
    FROM public.messages m
    WHERE auth.uid() IS NOT NULL AND (m.sender_id = auth.uid() OR m.recipient_id = auth.uid())
  )
  SELECT pr.id, pr.pseudo, pr.avatar_url, coalesce(st.xp_total, 0), p.body, p.created_at,
         (SELECT count(*)::int FROM public.messages um
           WHERE um.recipient_id = auth.uid() AND um.sender_id = pr.id AND um.read_at IS NULL)
  FROM peers p
  JOIN public.profiles pr ON pr.id = p.peer
  LEFT JOIN public.user_stats st ON st.user_id = pr.id
  WHERE p.rn = 1
  ORDER BY p.created_at DESC
$$;

CREATE OR REPLACE FUNCTION public.get_public_profile(_target uuid)
RETURNS TABLE(user_id uuid, pseudo text, avatar_url text, xp_total integer, current_streak integer, is_friend boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.pseudo, p.avatar_url, coalesce(s.xp_total, 0), coalesce(s.current_streak, 0),
         public.are_friends(auth.uid(), p.id)
  FROM public.profiles p
  LEFT JOIN public.user_stats s ON s.user_id = p.id
  WHERE auth.uid() IS NOT NULL AND p.id = _target
$$;

REVOKE ALL ON FUNCTION public.search_profiles(text) FROM anon, public;
REVOKE ALL ON FUNCTION public.list_friendships() FROM anon, public;
REVOKE ALL ON FUNCTION public.list_conversations() FROM anon, public;
REVOKE ALL ON FUNCTION public.get_public_profile(uuid) FROM anon, public;
REVOKE ALL ON FUNCTION public.are_friends(uuid, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.search_profiles(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_friendships() TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_conversations() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.are_friends(uuid, uuid) TO authenticated;