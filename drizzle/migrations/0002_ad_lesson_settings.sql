ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS media_path text,
  ADD COLUMN IF NOT EXISTS show_after_questions boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS question_interval integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS show_on_hearts_empty boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS max_per_lesson integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS reward_heart boolean NOT NULL DEFAULT false;

CREATE POLICY "ad_media_public_read" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'ad-media');
CREATE POLICY "ad_media_admin_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ad-media' AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "ad_media_admin_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'ad-media' AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "ad_media_admin_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'ad-media' AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));