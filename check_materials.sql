-- Ver si hay materiales en bom_items
SELECT 
  'Total bom_items' as tipo,
  COUNT(*) as total
FROM bom_items
UNION ALL
SELECT 
  'OFs con materiales',
  COUNT(DISTINCT of_id)
FROM bom_items
UNION ALL
SELECT 
  'Total OFs',
  COUNT(*)
FROM fabrication_orders;

-- Ver materiales por pedido
SELECT 
  fo.pedido_comercial,
  fo.sap_id,
  fo.customer,
  COUNT(b.id) as total_materiales
FROM fabrication_orders fo
LEFT JOIN bom_items b ON b.of_id = fo.id
GROUP BY fo.pedido_comercial, fo.sap_id, fo.customer
ORDER BY fo.pedido_comercial;

-- Ver detalle de materiales existentes
SELECT 
  fo.pedido_comercial,
  fo.sap_id,
  b.material_codigo,
  b.material_descripcion,
  b.cantidad_necesaria,
  b.estado
FROM bom_items b
JOIN fabrication_orders fo ON b.of_id = fo.id
ORDER BY fo.pedido_comercial, fo.sap_id;
