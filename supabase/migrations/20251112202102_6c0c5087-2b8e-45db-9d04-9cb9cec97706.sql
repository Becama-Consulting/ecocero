-- Crear bucket para fotos de producción
INSERT INTO storage.buckets (id, name, public)
VALUES ('production-photos', 'production-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Policy para que usuarios autenticados suban fotos
CREATE POLICY "Authenticated users can upload production photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'production-photos' AND
  auth.role() = 'authenticated'
);

-- Policy para que usuarios autenticados vean fotos
CREATE POLICY "Authenticated users can view production photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'production-photos' AND
  auth.role() = 'authenticated'
);

-- Policy para que usuarios autenticados eliminen sus fotos
CREATE POLICY "Authenticated users can delete production photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'production-photos' AND
  auth.role() = 'authenticated'
);