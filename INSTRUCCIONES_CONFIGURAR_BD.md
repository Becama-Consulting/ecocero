# 🔧 Instrucciones para Configurar Base de Datos Supabase

## ❌ Problema Actual
Las órdenes NO aparecen en el dashboard porque:
1. Faltan columnas en la base de datos (`pedido_comercial`, `material_preparado`, etc.)
2. Falta la tabla `bom_items` (lista de materiales)
3. No hay datos insertados

## ✅ Solución (3 pasos)

### 📋 PASO 1: Ejecutar Migración de Campos SAP
1. Ve a **Supabase Dashboard**: https://supabase.com/dashboard/project/dqwqgvgfiyfmnybyxojc
2. En el menú lateral, click en **SQL Editor**
3. Click en **+ New Query**
4. Copia TODO el contenido del archivo: `/Volumes/Proyectos/Trabajo/prompts/sql/add_sap_commercial_fields.sql`
5. Pégalo en el editor SQL
6. Click en **Run** (o presiona Cmd+Enter)
7. ✅ Verifica que diga: "Success. No rows returned"

**Este script agrega:**
- Columnas: `pedido_comercial`, `oferta_comercial`, `referencia_proyecto`, `fecha_entrega_comprometida`, `propietario_comercial`, `numero_albaran`, `fecha_albaran`, `estado_sap`, `material_preparado`, `material_solicitado_at`
- Tabla: `bom_items` (lista de materiales por OF)
- Tabla: `of_etapas` (etapas de fabricación)
- Índices para búsquedas rápidas
- Vistas consolidadas

---

### 📋 PASO 2: Insertar Datos de Prueba

**Opción A - Datos Reales de SAP** (Recomendado):
1. En el SQL Editor de Supabase
2. Click en **+ New Query**
3. Copia TODO el contenido del archivo: `/Volumes/Proyectos/Trabajo/ecocero/supabase/seed_sap_real_data.sql`
4. Pégalo en el editor
5. Click en **Run**
6. ✅ Verifica que inserte 4 OFs con pedidos 252000119-252000122

**Opción B - Datos de Prueba (40 OFs, 2 clientes grandes)**:
1. Copia el archivo: `/Volumes/Proyectos/Trabajo/prompts/sql/seed_produccion_clientes_grandes.sql`
2. Ejecútalo igual que antes
3. ✅ Inserta 40 OFs: POLYMER TECH (10) + PACKAGING SOLUTIONS (30)

---

### 📋 PASO 3: Regenerar Tipos de TypeScript
Después de ejecutar las migraciones SQL, los tipos TypeScript están desactualizados:

```bash
cd /Volumes/Proyectos/Trabajo/ecocero
npx supabase gen types typescript --project-id dqwqgvgfiyfmnybyxojc > src/integrations/supabase/types.ts
```

Este comando actualiza los tipos para que incluyan:
- `bom_items` table
- `pedido_comercial`, `material_preparado` columns
- Todas las nuevas columnas agregadas

---

## 🎯 Verificación Final

1. Reinicia el servidor de desarrollo (Ctrl+C y luego `npm run dev`)
2. Ve a: http://localhost:8080/produccion/dashboard
3. Deberías ver:
   - ✅ Lista de clientes agrupados
   - ✅ Botón "Preparar Material" funcionando
   - ✅ Contador de OFs por cliente
   - ✅ Sin errores en la consola

---

## 🚨 Importante
**SIEMPRE ejecutar en este orden:**
1. ✅ Migración (add_sap_commercial_fields.sql)
2. ✅ Seed de datos (seed_sap_real_data.sql)
3. ✅ Regenerar tipos TypeScript
4. ✅ Reiniciar servidor dev

---

## 📂 Archivos Necesarios
- `/Volumes/Proyectos/Trabajo/prompts/sql/add_sap_commercial_fields.sql` (migración)
- `/Volumes/Proyectos/Trabajo/ecocero/supabase/seed_sap_real_data.sql` (datos reales)
- `/Volumes/Proyectos/Trabajo/prompts/sql/seed_produccion_clientes_grandes.sql` (datos prueba)
