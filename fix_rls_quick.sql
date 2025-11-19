-- ============================================
-- FIX RÁPIDO: Habilitar lectura de fabrication_orders
-- ============================================

-- 1. ELIMINAR POLÍTICAS RESTRICTIVAS ACTUALES
DROP POLICY IF EXISTS "allow_read_fabrication_orders" ON fabrication_orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON fabrication_orders;
DROP POLICY IF EXISTS "Users can view fabrication orders" ON fabrication_orders;

-- 2. CREAR POLÍTICA PERMISIVA PARA TODOS LOS USUARIOS AUTENTICADOS
CREATE POLICY "allow_read_all_fabrication_orders"
ON fabrication_orders
FOR SELECT
TO authenticated
USING (true);

-- 3. VERIFICAR QUE SE CREÓ
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'fabrication_orders'
AND cmd = 'SELECT';
