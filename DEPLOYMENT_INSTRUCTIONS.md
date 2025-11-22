# 🚀 Instrucciones de Despliegue - 2FA y Recuperación de Contraseña

## ✅ Ya Completado
- ✅ Código frontend implementado
- ✅ Código Edge Functions creado
- ✅ Migración SQL creada
- ✅ Tipos TypeScript actualizados
- ✅ Enlace "¿Olvidaste tu contraseña?" añadido

## 🔧 Pasos Pendientes (5 minutos)

### 1️⃣ Ejecutar Migración en Base de Datos

**Opción A: Desde Supabase Dashboard (Recomendado)**
1. Ve a: https://supabase.com/dashboard/project/TU_PROJECT_ID/editor
2. Click en **SQL Editor**
3. Click en **New query**
4. Copia y pega el contenido completo de:
   ```
   /Volumes/Proyectos/Trabajo/ecocero/supabase/migrations/20251122120000_add_2fa_and_password_reset.sql
   ```
5. Click en **Run** (botón verde)
6. Verifica que se ejecutó sin errores

**Opción B: Desde terminal con Supabase CLI**
```bash
cd /Volumes/Proyectos/Trabajo/ecocero
supabase db push
```

### 2️⃣ Desplegar Edge Functions

**Desde Supabase Dashboard:**

#### Función 1: verify-totp
1. Ve a: **Edge Functions** → **Deploy a new function**
2. Nombre: `verify-totp`
3. Copia y pega el contenido de:
   ```
   /Volumes/Proyectos/Trabajo/ecocero/supabase/functions/verify-totp/index.ts
   ```
4. Click en **Deploy function**

#### Función 2: password-reset
1. Ve a: **Edge Functions** → **Deploy a new function**
2. Nombre: `password-reset`
3. Copia y pega el contenido de:
   ```
   /Volumes/Proyectos/Trabajo/ecocero/supabase/functions/password-reset/index.ts
   ```
4. Click en **Deploy function**

**Desde terminal (alternativa):**
```bash
cd /Volumes/Proyectos/Trabajo/ecocero
supabase functions deploy verify-totp
supabase functions deploy password-reset
```

### 3️⃣ Configurar Variables de Entorno

1. Ve a: **Settings** → **Edge Functions** → **Secrets**
2. Añade:
   ```
   SITE_URL = http://localhost:8080
   ```
   (Cámbialo por tu URL de producción cuando despliegues)

### 4️⃣ Verificar que Todo Funciona

#### Probar Recuperación de Contraseña:
1. Ve a: http://localhost:8080/auth
2. Click en "¿Olvidaste tu contraseña?"
3. Introduce un email existente
4. **IMPORTANTE:** En desarrollo, el link se muestra en los logs de la Edge Function
   - Ve a: **Edge Functions** → **password-reset** → **Logs**
   - Busca el link de recuperación y cópialo
   - Pégalo en el navegador manualmente

#### Probar 2FA:
1. Inicia sesión normalmente
2. Ve a: http://localhost:8080/profile/security
3. Click en "Activar 2FA"
4. Escanea el QR con Google Authenticator
5. Introduce el código de 6 dígitos
6. Cierra sesión
7. Vuelve a iniciar sesión → Te pedirá el código 2FA

### 5️⃣ Configurar Envío de Emails (Producción)

**Para que los emails se envíen automáticamente:**

#### Opción A: Usar SMTP de Supabase
1. Ve a: **Authentication** → **Email Templates**
2. Click en **SMTP Settings**
3. Configura tu proveedor SMTP:
   - **SendGrid** (Recomendado - 100 emails gratis/día)
   - **AWS SES**
   - **Postmark**
   - **Mailgun**

#### Opción B: Modificar Edge Function para usar servicio externo
1. Edita `password-reset/index.ts`
2. Descomenta las líneas 68-90 (ejemplo con fetch)
3. Añade tu API key como secret en Supabase
4. Re-despliega la función

## 🎯 Flujo Completo Final

### Login sin 2FA:
```
Email + Contraseña → Dashboard (como siempre)
```

### Login con 2FA:
```
Email + Contraseña → Pantalla "Código de 6 dígitos" → Dashboard
```

### Recuperar Contraseña:
```
"¿Olvidaste tu contraseña?" → Email → Link en correo → Nueva contraseña → Login
```

### Activar 2FA:
```
Dashboard → Perfil → Seguridad → Activar 2FA → Escanear QR → Verificar código → ✅
```

## 🐛 Troubleshooting

**Error: "column 'two_factor_enabled' does not exist"**
- ❌ No has ejecutado la migración SQL
- ✅ Ejecuta el paso 1️⃣

**Error: "Edge function not found"**
- ❌ No has desplegado las Edge Functions
- ✅ Ejecuta el paso 2️⃣

**No recibo el email de recuperación**
- ℹ️ En desarrollo, los emails se logean en consola
- ✅ Ve a los logs de la Edge Function `password-reset`
- ✅ Copia el link manualmente

**El código 2FA no funciona**
- ⚠️ Verifica que la hora del dispositivo esté sincronizada
- ⚠️ Los códigos TOTP expiran cada 30 segundos

## 📞 Soporte

Si algo no funciona, verifica:
1. ✅ Migración ejecutada correctamente
2. ✅ Edge Functions desplegadas
3. ✅ Variable `SITE_URL` configurada
4. ✅ Logs de las Edge Functions para errores

## 🎉 ¡Listo!

Todo está configurado y listo para usar. El sistema es 100% compatible con la autenticación existente.
