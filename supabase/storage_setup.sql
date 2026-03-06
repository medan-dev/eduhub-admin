-- ============================================
-- EDUHUB UG — Supabase Storage Setup
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('papers', 'papers', true),
       ('icons', 'icons', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS Policies for 'papers' bucket

-- Allow public read access (Select)
CREATE POLICY "Public Read Access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'papers');

-- Allow authenticated uploads (Insert)
CREATE POLICY "Authenticated Upload Access" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'papers');

-- Allow authenticated updates/deletes (Update/Delete)
CREATE POLICY "Authenticated Update Access" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'papers');

CREATE POLICY "Authenticated Delete Access" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'papers');

-- 3. Set up RLS Policies for 'icons' bucket

-- Allow public read access (Select)
CREATE POLICY "Public Read Access Icons" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'icons');

-- Allow authenticated uploads (Insert)
CREATE POLICY "Authenticated Upload Access Icons" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'icons');

-- Allow authenticated updates/deletes (Update/Delete)
CREATE POLICY "Authenticated Update Access Icons" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'icons');

CREATE POLICY "Authenticated Delete Access Icons" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'icons');
