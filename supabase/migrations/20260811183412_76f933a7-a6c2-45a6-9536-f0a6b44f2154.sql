CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

ALTER POLICY user_roles_admin_all ON public.user_roles
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
ALTER POLICY site_settings_admin_write ON public.site_settings
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
ALTER POLICY app_releases_admin_all ON public.app_releases
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
ALTER POLICY ads_admin_all ON public.ads
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
ALTER POLICY page_views_admin_read ON public.page_views
  USING (private.has_role(auth.uid(), 'admin'));

ALTER POLICY app_downloads_admin_read ON storage.objects
  USING (bucket_id = 'app-downloads' AND private.has_role(auth.uid(), 'admin'));
ALTER POLICY app_downloads_admin_insert ON storage.objects
  WITH CHECK (bucket_id = 'app-downloads' AND private.has_role(auth.uid(), 'admin'));
ALTER POLICY app_downloads_admin_update ON storage.objects
  USING (bucket_id = 'app-downloads' AND private.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'app-downloads' AND private.has_role(auth.uid(), 'admin'));
ALTER POLICY app_downloads_admin_delete ON storage.objects
  USING (bucket_id = 'app-downloads' AND private.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.admin_list_users();
DROP FUNCTION IF EXISTS public.admin_set_role_by_email(text, boolean);
DROP FUNCTION IF EXISTS public.set_admin_code(text);
DROP FUNCTION IF EXISTS public.verify_admin_code(text);
DROP FUNCTION IF EXISTS public.claim_first_admin();
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

CREATE OR REPLACE FUNCTION public.admin_list_users(_actor uuid)
RETURNS TABLE(user_id uuid, email text, pseudo text, preferred_language text, created_at timestamptz, last_sign_in_at timestamptz, xp_total integer, current_streak integer, last_active_day date)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT private.has_role(_actor, 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT u.id, u.email::text, p.pseudo, coalesce(p.preferred_language, 'fr'),
         u.created_at, u.last_sign_in_at,
         coalesce(s.xp_total, 0), coalesce(s.current_streak, 0), s.last_active_day
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  LEFT JOIN public.user_stats s ON s.user_id = u.id
  ORDER BY u.created_at DESC;
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_role_by_email(_actor uuid, _email text, _grant boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target uuid;
BEGIN
  IF NOT private.has_role(_actor, 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT id INTO target FROM auth.users WHERE lower(email) = lower(_email);
  IF target IS NULL THEN RAISE EXCEPTION 'user not found'; END IF;
  IF _grant THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (target, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    IF target = _actor THEN RAISE EXCEPTION 'cannot demote yourself'; END IF;
    DELETE FROM public.user_roles WHERE user_id = target AND role = 'admin';
  END IF;
  RETURN true;
END $$;

CREATE OR REPLACE FUNCTION public.set_admin_code(_actor uuid, _code text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT private.has_role(_actor, 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.admin_config
     SET code_hash = CASE WHEN _code IS NULL OR length(_code) = 0
                          THEN NULL ELSE extensions.crypt(_code, extensions.gen_salt('bf')) END,
         updated_at = now()
   WHERE id;
  RETURN true;
END $$;

CREATE OR REPLACE FUNCTION public.verify_admin_code(_actor uuid, _code text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE h text;
BEGIN
  IF NOT private.has_role(_actor, 'admin') THEN RETURN false; END IF;
  SELECT code_hash INTO h FROM public.admin_config WHERE id;
  IF h IS NULL THEN RETURN true; END IF;
  RETURN h = extensions.crypt(_code, h);
END $$;

CREATE OR REPLACE FUNCTION public.claim_first_admin(_actor uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _actor IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RAISE EXCEPTION 'admin already exists';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_actor, 'admin') ON CONFLICT DO NOTHING;
  RETURN true;
END $$;

DO $$
DECLARE fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn.sig);
  END LOOP;
END $$;