-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ROLES
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_roles_admin_all" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ADMIN CONFIG (passcode)
CREATE TABLE IF NOT EXISTS public.admin_config (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  code_hash text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_config TO service_role;
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;
INSERT INTO public.admin_config (id, code_hash) VALUES (true, NULL) ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.admin_code_is_set()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.admin_config WHERE id AND code_hash IS NOT NULL) $$;

CREATE OR REPLACE FUNCTION public.verify_admin_code(_code text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE h text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RETURN false; END IF;
  SELECT code_hash INTO h FROM public.admin_config WHERE id;
  IF h IS NULL THEN RETURN true; END IF;
  RETURN h = extensions.crypt(_code, h);
END $$;

CREATE OR REPLACE FUNCTION public.set_admin_code(_code text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.admin_config
     SET code_hash = CASE WHEN _code IS NULL OR length(_code) = 0
                          THEN NULL ELSE extensions.crypt(_code, extensions.gen_salt('bf')) END,
         updated_at = now()
   WHERE id;
  RETURN true;
END $$;

GRANT EXECUTE ON FUNCTION public.admin_code_is_set() TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admin_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_admin_code(text) TO authenticated;

-- SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "site_settings_admin_write" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (key, value) VALUES
  ('contact_email', 'contact@fonconnect.app'),
  ('company_name', 'FonConnect'),
  ('announcement', ''),
  ('download_intro', '')
ON CONFLICT (key) DO NOTHING;

-- APP RELEASES
CREATE TABLE IF NOT EXISTS public.app_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('android','ios')),
  version text NOT NULL DEFAULT '',
  download_url text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  size_label text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT false,
  released_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_releases TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.app_releases TO authenticated;
GRANT ALL ON public.app_releases TO service_role;
ALTER TABLE public.app_releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_releases_public_read" ON public.app_releases
  FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "app_releases_admin_all" ON public.app_releases
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ADS
CREATE TABLE IF NOT EXISTS public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  link_url text NOT NULL DEFAULT '',
  placement text NOT NULL DEFAULT 'home' CHECK (placement IN ('home','lessons','translator','all')),
  active boolean NOT NULL DEFAULT false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ads TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ads TO authenticated;
GRANT ALL ON public.ads TO service_role;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ads_public_read" ON public.ads
  FOR SELECT TO anon, authenticated
  USING (active AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now()));
CREATE POLICY "ads_admin_all" ON public.ads
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PAGE VIEWS (anonymous aggregate)
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  views integer NOT NULL DEFAULT 0,
  visitors integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (path, day)
);
GRANT SELECT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "page_views_admin_read" ON public.page_views
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.track_page_view(_path text, _new_visitor boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE p text := left(coalesce(_path, '/'), 200);
BEGIN
  INSERT INTO public.page_views (path, day, views, visitors)
  VALUES (p, (now() AT TIME ZONE 'utc')::date, 1, CASE WHEN _new_visitor THEN 1 ELSE 0 END)
  ON CONFLICT (path, day) DO UPDATE
    SET views = public.page_views.views + 1,
        visitors = public.page_views.visitors + CASE WHEN _new_visitor THEN 1 ELSE 0 END,
        updated_at = now();
END $$;
GRANT EXECUTE ON FUNCTION public.track_page_view(text, boolean) TO anon, authenticated;

-- ADMIN USER LIST
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id uuid, email text, pseudo text, preferred_language text,
  created_at timestamptz, last_sign_in_at timestamptz,
  xp_total integer, current_streak integer, last_active_day date
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT u.id, u.email::text, p.pseudo, coalesce(p.preferred_language, 'fr'),
         u.created_at, u.last_sign_in_at,
         coalesce(s.xp_total, 0), coalesce(s.current_streak, 0), s.last_active_day
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  LEFT JOIN public.user_stats s ON s.user_id = u.id
  ORDER BY u.created_at DESC;
END $$;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

-- updated_at triggers
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER app_releases_updated_at BEFORE UPDATE ON public.app_releases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER ads_updated_at BEFORE UPDATE ON public.ads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();