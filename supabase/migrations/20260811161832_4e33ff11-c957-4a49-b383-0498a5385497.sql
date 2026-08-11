CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') $$;

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RAISE EXCEPTION 'admin already exists';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin')
  ON CONFLICT DO NOTHING;
  RETURN true;
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_role_by_email(_email text, _grant boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE target uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT id INTO target FROM auth.users WHERE lower(email) = lower(_email);
  IF target IS NULL THEN RAISE EXCEPTION 'user not found'; END IF;
  IF _grant THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (target, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    IF target = auth.uid() THEN RAISE EXCEPTION 'cannot demote yourself'; END IF;
    DELETE FROM public.user_roles WHERE user_id = target AND role = 'admin';
  END IF;
  RETURN true;
END $$;

GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_role_by_email(text, boolean) TO authenticated;