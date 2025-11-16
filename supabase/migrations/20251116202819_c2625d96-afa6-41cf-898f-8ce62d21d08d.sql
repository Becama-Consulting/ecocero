-- Crear tabla de historial de cambios en OFs
CREATE TABLE IF NOT EXISTS public.of_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  of_id UUID NOT NULL REFERENCES fabrication_orders(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_of_history_of_id ON public.of_history(of_id);
CREATE INDEX idx_of_history_created_at ON public.of_history(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.of_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuarios autenticados pueden ver historial"
ON public.of_history
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Sistema puede insertar en historial"
ON public.of_history
FOR INSERT
TO authenticated
WITH CHECK (true);