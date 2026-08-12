ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS hearts_day date;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id text NOT NULL,
  provider text NOT NULL DEFAULT 'stripe',
  provider_ref text,
  status text NOT NULL DEFAULT 'ACTIVE',
  start_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  auto_renew boolean NOT NULL DEFAULT false,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_select_own ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_provider_ref_key
  ON public.subscriptions (provider, provider_ref) WHERE provider_ref IS NOT NULL;
CREATE INDEX IF NOT EXISTS subscriptions_user_idx ON public.subscriptions (user_id, status);

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.usage_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  day date NOT NULL DEFAULT ((now() AT TIME ZONE 'Europe/Paris')::date),
  voice_seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, day)
);

GRANT SELECT ON public.usage_daily TO authenticated;
GRANT ALL ON public.usage_daily TO service_role;
ALTER TABLE public.usage_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY usage_daily_select_own ON public.usage_daily
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER usage_daily_updated_at BEFORE UPDATE ON public.usage_daily
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.active_plans(_user_id uuid)
RETURNS TABLE(plan_id text, status text, expires_at timestamptz, auto_renew boolean, cancel_at_period_end boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.plan_id, s.status, s.expires_at, s.auto_renew, s.cancel_at_period_end
  FROM public.subscriptions s
  WHERE s.user_id = _user_id
    AND s.status IN ('ACTIVE', 'CANCELLED')
    AND (s.expires_at IS NULL OR s.expires_at > now())
$$;

REVOKE EXECUTE ON FUNCTION public.active_plans(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.active_plans(uuid) TO service_role;