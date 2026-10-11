-- ==============================================================================
-- MIGRACIÓN 03: Bucket 'covers' en Supabase Storage para Carátulas Multimedia
-- ==============================================================================
-- Esta migración es 100% segura e incremental. No afecta tablas de datos ni usuarios.

-- 1. Crear o actualizar el bucket 'covers' como público
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'covers',
  'covers',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Políticas de seguridad en storage.objects para el bucket 'covers'

-- A) Lectura Pública: Cualquier usuario puede cargar y ver las portadas en la web
DROP POLICY IF EXISTS "covers_public_read" ON storage.objects;
CREATE POLICY "covers_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

-- B) Subida Autenticada: Cualquier usuario registrado puede subir una portada
DROP POLICY IF EXISTS "covers_authenticated_upload" ON storage.objects;
CREATE POLICY "covers_authenticated_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'covers');

-- C) Actualización por propietario:
DROP POLICY IF EXISTS "covers_owner_update" ON storage.objects;
CREATE POLICY "covers_owner_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'covers' AND auth.uid() = owner);

-- D) Eliminación por propietario:
DROP POLICY IF EXISTS "covers_owner_delete" ON storage.objects;
CREATE POLICY "covers_owner_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'covers' AND auth.uid() = owner);

