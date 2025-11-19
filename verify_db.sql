-- ============================================
-- SCRIPT DE VERIFICACIÓN DE BASE DE DATOS
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. VERIFICAR COLUMNAS DE fabrication_orders
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'fabrication_orders' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR SI EXISTE TABLA bom_items
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'bom_items'
) AS bom_items_existe;

-- 3. VERIFICAR SI EXISTE TABLA of_etapas
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'of_etapas'
) AS of_etapas_existe;

-- 4. CONTAR ÓRDENES TOTALES
SELECT COUNT(*) as total_ordenes 
FROM fabrication_orders;

-- 5. VERIFICAR COLUMNAS ESPECÍFICAS QUE NECESITA EL CÓDIGO
SELECT 
  column_name,
  CASE 
    WHEN column_name IN ('pedido_comercial', 'oferta_comercial', 'material_preparado', 'material_solicitado_at') 
    THEN '✅ Necesaria para el código'
    ELSE ''
  END as estado
FROM information_schema.columns 
WHERE table_name = 'fabrication_orders' 
  AND table_schema = 'public'
  AND column_name IN ('pedido_comercial', 'oferta_comercial', 'referencia_proyecto', 
                      'fecha_entrega_comprometida', 'propietario_comercial', 
                      'numero_albaran', 'fecha_albaran', 'estado_sap', 
                      'material_preparado', 'material_solicitado_at')
ORDER BY column_name;

-- 6. SI bom_items EXISTE, VERIFICAR SUS COLUMNAS
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'bom_items' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. ÚLTIMAS 5 ÓRDENES (si existen)
SELECT 
  id,
  sap_id,
  customer,
  status,
  pedido_comercial,
  material_preparado,
  created_at
FROM fabrication_orders 
ORDER BY created_at DESC 
LIMIT 5;
