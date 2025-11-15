-- Agregar columna validated_at a employee_documents
ALTER TABLE public.employee_documents 
  ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP WITH TIME ZONE;