-- ============================================
-- FIX: Políticas RLS para bom_items
-- ============================================

-- Ver políticas actuales
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'bom_items';

-- Deshabilitar RLS temporalmente para verificar
ALTER TABLE bom_items DISABLE ROW LEVEL SECURITY;

-- O habilitar con políticas permisivas
ALTER TABLE bom_items ENABLE ROW LEVEL SECURITY;

-- Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver materiales" ON bom_items;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar materiales" ON bom_items;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar materiales" ON bom_items;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar materiales" ON bom_items;
DROP POLICY IF EXISTS "Allow authenticated users to view bom_items" ON bom_items;
DROP POLICY IF EXISTS "Allow authenticated users to insert bom_items" ON bom_items;
DROP POLICY IF EXISTS "Allow authenticated users to update bom_items" ON bom_items;
DROP POLICY IF EXISTS "Allow authenticated users to delete bom_items" ON bom_items;

-- Crear políticas permisivas para usuarios autenticados
CREATE POLICY "Allow authenticated users to view bom_items"
ON bom_items
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert bom_items"
ON bom_items
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update bom_items"
ON bom_items
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete bom_items"
ON bom_items
FOR DELETE
TO authenticated
USING (true);

-- Verificar que funcionan
SELECT 
  'Verificación de acceso' as test,
  COUNT(*) as total_bom_items
FROM bom_items;

SELECT 
  'Materiales del pedido 252000165' as test,
  COUNT(*) as total_materiales
FROM bom_items b
JOIN fabrication_orders fo ON b.of_id = fo.id
WHERE fo.pedido_comercial = '252000165';
