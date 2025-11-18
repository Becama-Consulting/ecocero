# 🚀 DEPLOYMENT GUIDE - User Management System Fix

## 📦 Archivos Creados/Modificados

### 1. Migración SQL
- `supabase/migrations/20251114000000_fix_user_roles_rls.sql`

### 2. Edge Functions
- `supabase/functions/create-user/index.ts` (mejorado)
- `supabase/functions/delete-user/index.ts` (nuevo)
- `supabase/functions/regenerate-password/index.ts` (nuevo)

### 3. Frontend
- `src/pages/AdminUsers.tsx` (mejorado)
- `src/components/GenerateCredentialsModal.tsx` (mejorado)

---

## 🔧 PASOS PARA DEPLOYMENT

### OPCIÓN A: Deploy Manual via Supabase Dashboard

#### 1️⃣ Aplicar Migración SQL
1. Ir a Supabase Dashboard → SQL Editor
2. Copiar contenido de `supabase/migrations/20251114000000_fix_user_roles_rls.sql`
3. Ejecutar el script
4. Verificar que no hay errores

#### 2️⃣ Deploy Edge Functions

**Function: create-user** (actualizada)
1. Dashboard → Edge Functions → `create-user`
2. Copiar código de `supabase/functions/create-user/index.ts`
3. Deploy

**Function: delete-user** (nueva)
1. Dashboard → Edge Functions → Create new function
2. Nombre: `delete-user`
3. Copiar código de `supabase/functions/delete-user/index.ts`
4. Deploy

**Function: regenerate-password** (nueva)
1. Dashboard → Edge Functions → Create new function
2. Nombre: `regenerate-password`
3. Copiar código de `supabase/functions/regenerate-password/index.ts`
4. Deploy

#### 3️⃣ Deploy Frontend (Lovable)
1. Hacer commit de cambios:
   ```bash
   git add .
   git commit -m "fix: Professional user management system with enhanced error handling"
   git push origin main
   ```
2. Lovable auto-deployará los cambios

---

### OPCIÓN B: Deploy via Supabase CLI (Recomendado)

```bash
# 1. Link proyecto (si no está linked)
cd /Volumes/Proyectos/Trabajo/ecocero
supabase link --project-ref <YOUR_PROJECT_REF>

# 2. Aplicar migraciones
supabase db push

# 3. Deploy Edge Functions
supabase functions deploy create-user
supabase functions deploy delete-user
supabase functions deploy regenerate-password

# 4. Verificar que funcionen
supabase functions list
```

---

## ✅ VERIFICACIÓN POST-DEPLOYMENT

### 1. Verificar RLS Policies
```sql
-- En Supabase SQL Editor
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('user_roles', 'profiles')
ORDER BY tablename, policyname;
```

Debe mostrar:
- ✅ "Users can view their own roles" (SELECT)
- ✅ "Admins can view all roles" (SELECT)
- ✅ "Admins can insert roles" (INSERT)
- ✅ "Admins can update roles" (UPDATE)
- ✅ "Admins can delete roles" (DELETE)
- ✅ "Admins can delete profiles" (DELETE)

### 2. Test Edge Functions

**Test create-user:**
```bash
curl -i --location --request POST 'https://<project-ref>.supabase.co/functions/v1/create-user' \
  --header 'Authorization: Bearer <YOUR_ANON_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{"email":"test@ecocero.com","password":"Test1234@","name":"Test User","departamento":"produccion","role":"operario"}'
```

**Test delete-user:**
```bash
curl -i --location --request POST 'https://<project-ref>.supabase.co/functions/v1/delete-user' \
  --header 'Authorization: Bearer <YOUR_ANON_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{"userId":"<USER_UUID>"}'
```

**Test regenerate-password:**
```bash
curl -i --location --request POST 'https://<project-ref>.supabase.co/functions/v1/regenerate-password' \
  --header 'Authorization: Bearer <YOUR_ANON_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{"userId":"<USER_UUID>"}'
```

### 3. Test UI (ecocero.t4tproyect.com/admin/users)

**Crear Usuario:**
- ✅ Llenar formulario completo
- ✅ Click "Crear Usuario"
- ✅ Debe mostrar modal con credenciales
- ✅ Usuario aparece en tabla
- ✅ Sin errores en consola

**Eliminar Usuario:**
- ✅ Click botón eliminar (trash icon)
- ✅ Confirmar diálogo
- ✅ Usuario desaparece de tabla
- ✅ Toast de éxito
- ✅ Sin errores en consola

**Generar Credenciales:**
- ✅ Click "Generar Credenciales"
- ✅ Buscar y seleccionar usuario
- ✅ Click "Generar Contraseña Aleatoria"
- ✅ Modal muestra nueva contraseña
- ✅ Botón copiar funciona
- ✅ Sin errores en consola

---

## 🐛 TROUBLESHOOTING

### Error: "User not allowed"
**Causa**: RLS policies no aplicadas
**Solución**: Ejecutar migración SQL

### Error: "Edge Function returned non-2xx status code"
**Causa**: Edge Function no desplegada o con errores
**Solución**: 
1. Verificar logs en Dashboard → Edge Functions → Logs
2. Re-deploy la función

### Error: "Cannot find module cors.ts"
**Causa**: Falta archivo _shared/cors.ts
**Solución**: 
```typescript
// supabase/functions/_shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### Usuario "Hector" sigue sin roles
**Solución**: 
```sql
-- Asignar rol manualmente
INSERT INTO user_roles (user_id, role)
VALUES (
  (SELECT id FROM profiles WHERE email = 'hector@becamaconsulting.com'),
  'supervisor'
)
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## 📊 RESUMEN DE MEJORAS

### ✅ Backend (Edge Functions)
- Validación exhaustiva de inputs
- Mensajes de error específicos y detallados
- Logging completo para debugging
- Rollback automático en caso de error
- Uso correcto de Service Role Key para bypass RLS

### ✅ Base de Datos (RLS)
- Usuarios pueden ver sus propios roles (necesario para login)
- Admins mantienen control total
- Policies para delete en profiles

### ✅ Frontend (AdminUsers.tsx)
- Llamadas a Edge Functions en lugar de queries directas
- Mejor manejo de errores
- UX mejorada con confirmaciones
- Logging para debugging

---

## 🎯 RESULTADO ESPERADO

Después del deployment:
1. ✅ Crear usuario funciona sin errores
2. ✅ Eliminar usuario realmente elimina de todo el sistema
3. ✅ Generar credenciales funciona correctamente
4. ✅ Tabla muestra roles correctamente
5. ✅ Zero errores en consola
6. ✅ Usuarios pueden hacer login después de creados
7. ✅ Roles se cargan correctamente en useAuth

---

**Fecha**: 14 de noviembre de 2025  
**Desarrollador**: GitHub Copilot (Claude Sonnet 4.5)  
**Status**: ✅ LISTO PARA DEPLOYMENT
