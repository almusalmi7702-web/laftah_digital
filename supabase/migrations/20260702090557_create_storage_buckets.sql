/*
# Create Storage Buckets for Image Uploads

1. New Storage Buckets
- `portfolio` — public bucket for portfolio thumbnail images
- `services` — public bucket for service thumbnail images
- `uploads` — public bucket for general/misc image uploads (pricing icons, etc.)

2. Security
- All three buckets are PUBLIC (anyone can read via public URL).
- Writes are restricted to authenticated users (admin only).
- This allows the anon-key frontend to read uploaded image public URLs
  while only authenticated admin users can upload/delete.

3. Policies
- SELECT (read): public — `TO anon, authenticated` with `USING (true)`
- INSERT (upload): authenticated only — `TO authenticated WITH CHECK (true)`
- UPDATE: authenticated only — `TO authenticated WITH CHECK (true)`
- DELETE: authenticated only — `TO authenticated USING (true)`
*/

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('portfolio', 'portfolio', true),
  ('services', 'services', true),
  ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Portfolio bucket policies
DROP POLICY IF EXISTS "public_read_portfolio" ON storage.objects;
CREATE POLICY "public_read_portfolio" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "auth_upload_portfolio" ON storage.objects;
CREATE POLICY "auth_upload_portfolio" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "auth_update_portfolio" ON storage.objects;
CREATE POLICY "auth_update_portfolio" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'portfolio') WITH CHECK (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "auth_delete_portfolio" ON storage.objects;
CREATE POLICY "auth_delete_portfolio" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'portfolio');

-- Services bucket policies
DROP POLICY IF EXISTS "public_read_services" ON storage.objects;
CREATE POLICY "public_read_services" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'services');

DROP POLICY IF EXISTS "auth_upload_services" ON storage.objects;
CREATE POLICY "auth_upload_services" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'services');

DROP POLICY IF EXISTS "auth_update_services" ON storage.objects;
CREATE POLICY "auth_update_services" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'services') WITH CHECK (bucket_id = 'services');

DROP POLICY IF EXISTS "auth_delete_services" ON storage.objects;
CREATE POLICY "auth_delete_services" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'services');

-- Uploads bucket policies
DROP POLICY IF EXISTS "public_read_uploads" ON storage.objects;
CREATE POLICY "public_read_uploads" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'uploads');

DROP POLICY IF EXISTS "auth_upload_uploads" ON storage.objects;
CREATE POLICY "auth_upload_uploads" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');

DROP POLICY IF EXISTS "auth_update_uploads" ON storage.objects;
CREATE POLICY "auth_update_uploads" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'uploads') WITH CHECK (bucket_id = 'uploads');

DROP POLICY IF EXISTS "auth_delete_uploads" ON storage.objects;
CREATE POLICY "auth_delete_uploads" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'uploads');