-- ============================================
-- FIX: Políticas RLS para fabrication_orders
-- Problema: dataLength: 0 aunque usuario esté autenticado
-- ============================================

-- 1. VERIFICAR POLÍTICAS ACTUALES
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'fabrication_orders';

-- 2. HABILITAR RLS (si no está habilitado)
ALTER TABLE fabrication_orders ENABLE ROW LEVEL SECURITY;

-- 3. ELIMINAR POLÍTICAS EXISTENTES (si hay conflictos)
DROP POLICY IF EXISTS "allow_read_fabrication_orders" ON fabrication_orders;
DROP POLICY IF EXISTS "allow_insert_fabrication_orders" ON fabrication_orders;
DROP POLICY IF EXISTS "allow_update_fabrication_orders" ON fabrication_orders;
DROP POLICY IF EXISTS "allow_delete_fabrication_orders" ON fabrication_orders;

-- 4. CREAR POLÍTICA PERMISIVA PARA LECTURA (todos los usuarios autenticados)
CREATE POLICY "allow_read_fabrication_orders"
ON fabrication_orders
FOR SELECT
TO authenticated
USING (true);

-- 5. CREAR POLÍTICA PARA INSERCIÓN (admin y supervisor)
CREATE POLICY "allow_insert_fabrication_orders"
ON fabrication_orders
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin_global', 'admin_departamento', 'supervisor')
  )
);

-- 6. CREAR POLÍTICA PARA ACTUALIZACIÓN (admin, supervisor, operario asignado)
CREATE POLICY "allow_update_fabrication_orders"
ON fabrication_orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND (
      user_roles.role IN ('admin_global', 'admin_departamento', 'supervisor')
      OR fabrication_orders.assignee_id = auth.uid()
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND (
      user_roles.role IN ('admin_global', 'admin_departamento', 'supervisor')
      OR fabrication_orders.assignee_id = auth.uid()
    )
  )
);

-- 7. CREAR POLÍTICA PARA ELIMINACIÓN (solo admin_global)
CREATE POLICY "allow_delete_fabrication_orders"
ON fabrication_orders
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin_global'
  )
);

-- 8. VERIFICAR QUE LAS POLÍTICAS SE CREARON
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'fabrication_orders';

-- 9. VERIFICAR TU USUARIO Y ROL
SELECT 
  u.id,
  u.email,
  ur.role,
  ur.department
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'dennis@becamaconsulting.com';

-- 10. PROBAR CONSULTA DIRECTA
SELECT 
  id,
  sap_id,
  customer,
  status,
  pedido_comercial
FROM fabrication_orders
LIMIT 5;
