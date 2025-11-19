-- ============================================
-- SCRIPT DE IMPORTACIÓN DE DATOS REALES SAP
-- Basado en CSV: db_test_producción - Hoja 1.csv
-- ============================================

-- LIMPIAR DATOS ANTERIORES
DELETE FROM of_etapas WHERE of_id IN (SELECT id FROM fabrication_orders WHERE pedido_comercial LIKE '252%');
DELETE FROM bom_items WHERE of_id IN (SELECT id FROM fabrication_orders WHERE pedido_comercial LIKE '252%');
DELETE FROM fabrication_orders WHERE pedido_comercial LIKE '252%';

-- ============================================
-- PEDIDO 252000119: JESUS TERUEL MARTINEZ
-- ============================================

-- OF 25000001
INSERT INTO fabrication_orders (
  sap_id,
  pedido_comercial,
  oferta_comercial,
  referencia_proyecto,
  customer,
  fecha_creacion_pedido,
  fecha_entrega_comprometida,
  producto_codigo,
  producto_descripcion,
  cantidad,
  unidad,
  status,
  estado_sap,
  propietario_comercial,
  numero_albaran,
  fecha_albaran,
  created_at
) VALUES (
  '25000001',
  '252000119',
  '251000189',
  'MATEOFIC GP LIMITE ANDAMUR CV',
  'JESUS TERUEL MARTINEZ',
  '2025-03-05',
  '2025-03-06',
  'ADHESIVO-TURBO',
  'ADHESIVO TURBO GAMA ECO 290 ml',
  1,
  'unidades',
  'pendiente',
  'L',
  'Belén',
  '253000054',
  '2025-03-06',
  '2025-03-05 00:00:00'
);

-- Etapas OF 25000001
INSERT INTO of_etapas (
  of_id,
  nombre,
  orden,
  descripcion,
  material_codigo,
  cantidad_emitida,
  estado,
  estado_sap,
  started_at,
  completed_at
) 
SELECT 
  id,
  'Preparación Material',
  1,
  'Preparar adhesivo turbo',
  'EC-BTURBO-2554',
  1,
  'pendiente',
  'O',
  '2025-03-05 00:00:00',
  '2025-03-05 00:00:00'
FROM fabrication_orders WHERE sap_id = '25000001';

-- ============================================
-- PEDIDO 252000120: GREENAREA PAISAJISMO SL
-- ============================================

-- OF 25000002
INSERT INTO fabrication_orders (
  sap_id,
  pedido_comercial,
  oferta_comercial,
  referencia_proyecto,
  customer,
  fecha_creacion_pedido,
  fecha_entrega_comprometida,
  producto_codigo,
  producto_descripcion,
  cantidad,
  unidad,
  status,
  estado_sap,
  propietario_comercial,
  numero_albaran,
  fecha_albaran,
  created_at
) VALUES (
  '25000002',
  '252000120',
  '251000002',
  'GREENAREA PEDIDO TABLEROS GAMA ECO CV',
  'GREENAREA PAISAJISMO SL',
  '2025-03-05',
  '2025-03-10',
  'PANEL-9MM-CAT',
  '-10 PANEL A. BASICO 9 MM -20 UDS.CAT',
  2,
  'unidades',
  'pendiente',
  'L',
  'Luis',
  '253000148',
  '2025-03-12',
  '2025-03-05 00:00:00'
);

-- Etapas OF 25000002
INSERT INTO of_etapas (
  of_id,
  nombre,
  orden,
  descripcion,
  material_codigo,
  cantidad_emitida,
  estado,
  estado_sap
) 
SELECT 
  fo.id,
  etapa.nombre,
  etapa.orden,
  etapa.descripcion,
  etapa.material_codigo,
  etapa.cantidad,
  'pendiente',
  'O'
FROM fabrication_orders fo,
  (VALUES
    ('Corte Panel', 1, 'Cortar panel básico 9mm', 'EC-9-107', 2),
    ('Embalaje', 2, 'Embalar en cartón', 'EC-CARTON', 2)
  ) AS etapa(nombre, orden, descripcion, material_codigo, cantidad)
WHERE fo.sap_id = '25000002';

-- OF 25000003
INSERT INTO fabrication_orders (
  sap_id,
  pedido_comercial,
  oferta_comercial,
  referencia_proyecto,
  customer,
  fecha_creacion_pedido,
  fecha_entrega_comprometida,
  producto_codigo,
  producto_descripcion,
  cantidad,
  unidad,
  status,
  estado_sap,
  propietario_comercial,
  numero_albaran,
  fecha_albaran,
  created_at
) VALUES (
  '25000003',
  '252000120',
  '251000002',
  'GREENAREA PEDIDO TABLEROS GAMA ECO CV',
  'GREENAREA PAISAJISMO SL',
  '2025-03-05',
  '2025-03-10',
  'PANEL-12MM-CA',
  '-10 PANEL A. BASICO 12 MM -20 UDS.CA',
  1,
  'unidades',
  'pendiente',
  'L',
  'Luis',
  '253000148',
  '2025-03-12',
  '2025-03-05 00:00:00'
);

-- Etapas OF 25000003
INSERT INTO of_etapas (
  of_id,
  nombre,
  orden,
  descripcion,
  material_codigo,
  cantidad_emitida,
  estado,
  estado_sap
) 
SELECT 
  fo.id,
  etapa.nombre,
  etapa.orden,
  etapa.descripcion,
  etapa.material_codigo,
  etapa.cantidad,
  'pendiente',
  'O'
FROM fabrication_orders fo,
  (VALUES
    ('Corte Panel', 1, 'Cortar panel básico 12mm', 'EC-12-116', 1),
    ('Embalaje', 2, 'Embalar en cartón', 'EC-CARTON', 1)
  ) AS etapa(nombre, orden, descripcion, material_codigo, cantidad)
WHERE fo.sap_id = '25000003';

-- ============================================
-- PEDIDO 252000121: FORMA 5 SA
-- ============================================

-- OF 25000004
INSERT INTO fabrication_orders (
  sap_id,
  pedido_comercial,
  oferta_comercial,
  referencia_proyecto,
  customer,
  fecha_creacion_pedido,
  fecha_entrega_comprometida,
  producto_codigo,
  producto_descripcion,
  cantidad,
  unidad,
  status,
  estado_sap,
  propietario_comercial,
  numero_albaran,
  fecha_albaran,
  almacen,
  created_at
) VALUES (
  '25000004',
  '252000121',
  '251000067',
  'FORMA 5 PANELES GAMA ECO AND',
  'FORMA 5 SA',
  '2025-03-05',
  '2025-03-10',
  'PANEL-9MM-CAT',
  '-10 PANEL A. BASICO 9 MM -20 UDS.CAT',
  2,
  'unidades',
  'pendiente',
  'L',
  'Luis',
  '253000116',
  '2025-03-11',
  'NAVE_1',
  '2025-03-05 00:00:00'
);

-- Etapas OF 25000004
INSERT INTO of_etapas (
  of_id,
  nombre,
  orden,
  descripcion,
  material_codigo,
  cantidad_emitida,
  estado,
  estado_sap
) 
SELECT 
  fo.id,
  etapa.nombre,
  etapa.orden,
  etapa.descripcion,
  etapa.material_codigo,
  etapa.cantidad,
  'pendiente',
  'O'
FROM fabrication_orders fo,
  (VALUES
    ('Corte Panel', 1, 'Cortar panel básico 9mm', 'EC-9-125', 2),
    ('Embalaje', 2, 'Embalar en cartón', 'EC-CARTON', 2)
  ) AS etapa(nombre, orden, descripcion, material_codigo, cantidad)
WHERE fo.sap_id = '25000004';

-- ============================================
-- CONSOLIDAR MATERIALES EN bom_items
-- ============================================

-- Consolidar materiales para cada OF
INSERT INTO bom_items (
  of_id,
  sap_material_id,
  material_codigo,
  material_descripcion,
  cantidad_necesaria,
  cantidad_recibida,
  unidad,
  estado,
  ubicacion_almacen
)
SELECT 
  fo.id,
  'SAP-' || e.material_codigo,
  e.material_codigo,
  'Material ' || e.material_codigo,
  SUM(e.cantidad_emitida),
  0,
  'unidades',
  'pendiente',
  COALESCE(fo.almacen, 'ALMACEN-GENERAL')
FROM fabrication_orders fo
JOIN of_etapas e ON e.of_id = fo.id
WHERE fo.pedido_comercial IN ('252000119', '252000120', '252000121')
GROUP BY fo.id, e.material_codigo, fo.almacen;

-- ============================================
-- VERIFICACIÓN DE DATOS IMPORTADOS
-- ============================================

-- Ver pedidos importados
SELECT 
  pedido_comercial,
  COUNT(*) as total_ofs,
  customer,
  propietario_comercial,
  referencia_proyecto
FROM fabrication_orders
WHERE pedido_comercial IN ('252000119', '252000120', '252000121')
GROUP BY pedido_comercial, customer, propietario_comercial, referencia_proyecto;

-- Ver etapas con materiales
SELECT 
  fo.pedido_comercial,
  fo.sap_id,
  e.orden,
  e.nombre,
  e.material_codigo,
  e.cantidad_emitida
FROM of_etapas e
JOIN fabrication_orders fo ON e.of_id = fo.id
WHERE fo.pedido_comercial IN ('252000119', '252000120', '252000121')
ORDER BY fo.pedido_comercial, fo.sap_id, e.orden;

-- Ver materiales consolidados
SELECT 
  fo.pedido_comercial,
  fo.sap_id,
  b.material_codigo,
  b.cantidad_necesaria,
  b.estado
FROM bom_items b
JOIN fabrication_orders fo ON b.of_id = fo.id
WHERE fo.pedido_comercial IN ('252000119', '252000120', '252000121')
ORDER BY fo.pedido_comercial, fo.sap_id;

-- ============================================
-- RESUMEN
-- ============================================
DO $$ 
BEGIN
  RAISE NOTICE '✅ Importación completada';
  RAISE NOTICE '📦 Pedidos importados: 3 (252000119, 252000120, 252000121)';
  RAISE NOTICE '🔧 OFs creadas: 4 (25000001-25000004)';
  RAISE NOTICE '📊 Etapas creadas con materiales específicos';
  RAISE NOTICE '🎯 Materiales consolidados en bom_items';
END $$;
