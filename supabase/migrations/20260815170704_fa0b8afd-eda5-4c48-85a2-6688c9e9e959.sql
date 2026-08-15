CREATE TABLE public.places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  address text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  photos text[] NOT NULL DEFAULT '{}',
  opening_hours text NOT NULL DEFAULT '',
  price text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT '',
  languages text[] NOT NULL DEFAULT '{fr}',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.places TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.places TO authenticated;
GRANT ALL ON public.places TO service_role;

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

CREATE POLICY places_public_read ON public.places
  FOR SELECT TO anon, authenticated USING (published);

CREATE POLICY places_admin_all ON public.places
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_places_updated_at
  BEFORE UPDATE ON public.places
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX places_category_idx ON public.places (category);
CREATE INDEX places_city_idx ON public.places (city);

CREATE TABLE public.place_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_ref text NOT NULL,
  name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'other',
  latitude double precision,
  longitude double precision,
  address text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, place_ref)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.place_favorites TO authenticated;
GRANT ALL ON public.place_favorites TO service_role;

ALTER TABLE public.place_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY place_favorites_own ON public.place_favorites
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_place_favorites_updated_at
  BEFORE UPDATE ON public.place_favorites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();