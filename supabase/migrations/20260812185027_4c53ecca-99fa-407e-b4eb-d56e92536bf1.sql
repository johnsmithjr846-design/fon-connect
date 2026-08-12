ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS payment_state text NOT NULL DEFAULT 'ok',
  ADD COLUMN IF NOT EXISTS grace_until timestamp with time zone;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
  ON public.subscriptions (user_id, status);