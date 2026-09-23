CREATE TABLE public.lesson_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  path_id text NOT NULL,
  lesson_id text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX lesson_unlocks_uniq ON public.lesson_unlocks (user_id, path_id, coalesce(lesson_id, ''));
GRANT SELECT ON public.lesson_unlocks TO authenticated;
GRANT ALL ON public.lesson_unlocks TO service_role;
ALTER TABLE public.lesson_unlocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own unlocks" ON public.lesson_unlocks FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.user_bans (
  user_id uuid PRIMARY KEY,
  reason text NOT NULL DEFAULT '',
  banned_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.user_bans TO service_role;
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;