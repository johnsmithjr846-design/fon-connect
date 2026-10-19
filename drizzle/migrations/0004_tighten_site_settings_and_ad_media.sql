DROP POLICY IF EXISTS site_settings_public_read ON public.site_settings;
CREATE POLICY site_settings_public_read ON public.site_settings FOR SELECT TO anon, authenticated
  USING (key IN ('contact_email', 'company_name', 'announcement', 'download_intro'));

DROP POLICY IF EXISTS ad_media_public_read ON storage.objects;
CREATE POLICY ad_media_admin_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'ad-media' AND private.has_role(auth.uid(), 'admin'::app_role));