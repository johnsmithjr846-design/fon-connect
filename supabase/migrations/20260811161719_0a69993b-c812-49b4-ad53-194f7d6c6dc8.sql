CREATE POLICY "app_downloads_admin_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'app-downloads' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "app_downloads_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'app-downloads' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "app_downloads_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'app-downloads' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'app-downloads' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "app_downloads_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'app-downloads' AND public.has_role(auth.uid(), 'admin'));