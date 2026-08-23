CREATE TABLE public.admin_heart_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount >= 1),
  hearts_remaining integer NOT NULL CHECK (hearts_remaining >= 0),
  kind text NOT NULL DEFAULT 'free' CHECK (kind IN ('free','paid')),
  reason text NOT NULL DEFAULT '',
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX admin_heart_grants_user_idx ON public.admin_heart_grants (user_id, expires_at DESC);

GRANT SELECT ON public.admin_heart_grants TO authenticated;
GRANT ALL ON public.admin_heart_grants TO service_role;

ALTER TABLE public.admin_heart_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own heart grants"
ON public.admin_heart_grants FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER admin_heart_grants_updated_at
BEFORE UPDATE ON public.admin_heart_grants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.validate_heart_grant()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.expires_at <= NEW.starts_at THEN
    RAISE EXCEPTION 'expiration must be after start';
  END IF;
  IF NEW.hearts_remaining > NEW.amount THEN
    RAISE EXCEPTION 'remaining cannot exceed amount';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER admin_heart_grants_validate
BEFORE INSERT OR UPDATE ON public.admin_heart_grants
FOR EACH ROW EXECUTE FUNCTION public.validate_heart_grant();