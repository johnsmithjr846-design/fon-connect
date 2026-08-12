CREATE TABLE public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  plan_ids text[] NOT NULL DEFAULT '{}',
  discount_type text NOT NULL DEFAULT 'percent',
  discount_value integer NOT NULL DEFAULT 0,
  code text,
  audience text NOT NULL DEFAULT 'all',
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  active boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promotions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotions TO authenticated;
GRANT ALL ON public.promotions TO service_role;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY promotions_admin_all ON public.promotions FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY promotions_public_read ON public.promotions FOR SELECT TO anon, authenticated
  USING (active AND audience = 'all' AND starts_at <= now() AND (ends_at IS NULL OR ends_at >= now()));
CREATE TRIGGER promotions_updated_at BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.promotion_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id uuid NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (promotion_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotion_targets TO authenticated;
GRANT ALL ON public.promotion_targets TO service_role;
ALTER TABLE public.promotion_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY promotion_targets_admin_all ON public.promotion_targets FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY promotion_targets_select_own ON public.promotion_targets FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '/tarifs',
  kind text NOT NULL DEFAULT 'promo',
  promotion_id uuid REFERENCES public.promotions(id) ON DELETE CASCADE,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON public.notifications (user_id, created_at DESC);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_select_own ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY notifications_update_own ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY notifications_admin_all ON public.notifications FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER notifications_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.admin_list_subscriptions(_actor uuid)
RETURNS TABLE(
  id uuid, user_id uuid, email text, pseudo text, plan_id text, status text,
  provider text, start_at timestamptz, expires_at timestamptz, auto_renew boolean,
  cancel_at_period_end boolean, payment_state text, grace_until timestamptz,
  created_at timestamptz, updated_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT private.has_role(_actor, 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT s.id, s.user_id, u.email::text, p.pseudo, s.plan_id, s.status, s.provider,
         s.start_at, s.expires_at, s.auto_renew, s.cancel_at_period_end,
         s.payment_state, s.grace_until, s.created_at, s.updated_at
  FROM public.subscriptions s
  LEFT JOIN auth.users u ON u.id = s.user_id
  LEFT JOIN public.profiles p ON p.id = s.user_id
  ORDER BY s.created_at DESC;
END $$;

CREATE OR REPLACE FUNCTION public.admin_send_promotion(_actor uuid, _promotion_id uuid)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE promo public.promotions%ROWTYPE; sent integer := 0;
BEGIN
  IF NOT private.has_role(_actor, 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO promo FROM public.promotions WHERE id = _promotion_id;
  IF promo.id IS NULL THEN RAISE EXCEPTION 'promotion not found'; END IF;

  IF promo.audience = 'all' THEN
    INSERT INTO public.notifications (user_id, title, body, link, kind, promotion_id)
    SELECT u.id, promo.title, promo.description, '/tarifs', 'promo', promo.id
    FROM auth.users u;
  ELSE
    INSERT INTO public.notifications (user_id, title, body, link, kind, promotion_id)
    SELECT t.user_id, promo.title, promo.description, '/tarifs', 'promo', promo.id
    FROM public.promotion_targets t WHERE t.promotion_id = promo.id;
  END IF;
  GET DIAGNOSTICS sent = ROW_COUNT;
  RETURN sent;
END $$;