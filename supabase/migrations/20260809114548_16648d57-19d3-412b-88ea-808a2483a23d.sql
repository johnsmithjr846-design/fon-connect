CREATE TABLE public.user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_total integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  last_active_day date,
  hearts integer NOT NULL DEFAULT 5,
  hearts_updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_stats TO authenticated;
GRANT ALL ON public.user_stats TO service_role;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_stats_own ON public.user_stats FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON public.user_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_badges_own ON public.user_badges FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_user_badges_updated_at BEFORE UPDATE ON public.user_badges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.chest_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chest_id text NOT NULL,
  xp_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, chest_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chest_rewards TO authenticated;
GRANT ALL ON public.chest_rewards TO service_role;
ALTER TABLE public.chest_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY chest_rewards_own ON public.chest_rewards FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_chest_rewards_updated_at BEFORE UPDATE ON public.chest_rewards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.lesson_progress
  ADD COLUMN IF NOT EXISTS path_id text,
  ADD COLUMN IF NOT EXISTS xp_earned integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS best_accuracy numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 1;

CREATE UNIQUE INDEX IF NOT EXISTS lesson_progress_user_module_lesson_key
  ON public.lesson_progress (user_id, module_id, lesson_id);