-- Migration: CAD Admin Features, Media, and Users Config

-- 1. Agregamos teléfono a cad_users_mapping
ALTER TABLE public.cad_users_mapping ADD COLUMN IF NOT EXISTS telefono TEXT;

-- 2. Creamos un cubo de Storage (Bucket) para logotipos e imágenes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cad_media', 'cad_media', true)
ON CONFLICT (id) DO NOTHING;

-- Configuramos Permisos de Storage (RLS) para 'cad_media'
-- Cualquiera puede ver las imágenes públicas
CREATE POLICY "Public Access" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'cad_media');

-- Solo usuarios autenticados pueden subir/modificar/borrar imágenes
CREATE POLICY "Authenticated users can upload media"
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'cad_media' AND auth.role() = 'authenticated');
    
CREATE POLICY "Authenticated users can update media"
    ON storage.objects FOR UPDATE 
    USING (bucket_id = 'cad_media' AND auth.role() = 'authenticated');
    
CREATE POLICY "Authenticated users can delete media"
    ON storage.objects FOR DELETE 
    USING (bucket_id = 'cad_media' AND auth.role() = 'authenticated');
