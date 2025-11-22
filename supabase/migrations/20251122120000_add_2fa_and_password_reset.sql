-- =====================================================
-- Migración: Autenticación de Dos Factores (2FA) y 
--            Recuperación de Contraseña
-- =====================================================
-- Fecha: 2025-11-22
-- Descripción: Añade soporte completo para 2FA con TOTP
--              y sistema de recuperación de contraseña
-- =====================================================

-- ==========================================
-- 1. Añadir campos 2FA a la tabla profiles
-- ==========================================

-- Añadir columna para habilitar/deshabilitar 2FA
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;

-- Añadir columna para almacenar el secreto TOTP (Base32)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;

-- Índice para búsquedas rápidas de usuarios con 2FA activado
CREATE INDEX IF NOT EXISTS idx_profiles_2fa_enabled 
ON profiles(two_factor_enabled) 
WHERE two_factor_enabled = TRUE;

-- Comentarios para documentación
COMMENT ON COLUMN profiles.two_factor_enabled IS 'Indica si el usuario tiene activada la autenticación de dos factores';
COMMENT ON COLUMN profiles.two_factor_secret IS 'Secreto TOTP en formato Base32 para generar códigos 2FA (encriptado en aplicación)';

-- ==========================================
-- 2. Crear tabla para tokens de recuperación de contraseña
-- ==========================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT token_not_empty CHECK (char_length(token) >= 32),
  CONSTRAINT expires_after_creation CHECK (expires_at > created_at)
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token 
ON password_reset_tokens(token) 
WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id 
ON password_reset_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at 
ON password_reset_tokens(expires_at) 
WHERE used_at IS NULL;

-- Comentarios
COMMENT ON TABLE password_reset_tokens IS 'Almacena tokens de un solo uso para recuperación de contraseña';
COMMENT ON COLUMN password_reset_tokens.token IS 'Token aleatorio único de 64 caracteres hexadecimales';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Fecha de expiración del token (típicamente 1 hora)';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'Fecha en que se usó el token (NULL si no se ha usado)';

-- ==========================================
-- 3. Función para limpiar tokens expirados (mantenimiento automático)
-- ==========================================

-- Eliminar función existente si existe (para permitir cambios en la firma)
DROP FUNCTION IF EXISTS cleanup_expired_password_reset_tokens();

CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Eliminar tokens expirados o usados hace más de 7 días
  DELETE FROM password_reset_tokens
  WHERE 
    expires_at < NOW() 
    OR (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '7 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Limpiados % tokens de recuperación expirados/usados', deleted_count;
  
  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION cleanup_expired_password_reset_tokens() IS 'Limpia tokens de recuperación expirados o usados hace más de 7 días';

-- ==========================================
-- 4. Políticas RLS (Row Level Security)
-- ==========================================

-- Habilitar RLS en la tabla
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Política: Solo service_role puede leer tokens
CREATE POLICY "Service role puede leer todos los tokens"
ON password_reset_tokens
FOR SELECT
TO service_role
USING (true);

-- Política: Solo service_role puede insertar tokens
CREATE POLICY "Service role puede crear tokens"
ON password_reset_tokens
FOR INSERT
TO service_role
WITH CHECK (true);

-- Política: Solo service_role puede actualizar tokens (marcar como usado)
CREATE POLICY "Service role puede actualizar tokens"
ON password_reset_tokens
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Política: Solo service_role puede eliminar tokens
CREATE POLICY "Service role puede eliminar tokens"
ON password_reset_tokens
FOR DELETE
TO service_role
USING (true);

-- Política RLS para profiles: Los usuarios pueden leer sus propios datos 2FA
DROP POLICY IF EXISTS "Usuarios pueden ver su propia configuración 2FA" ON profiles;
CREATE POLICY "Usuarios pueden ver su propia configuración 2FA"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Política RLS para profiles: Los usuarios pueden actualizar sus propios datos 2FA
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propia configuración 2FA" ON profiles;
CREATE POLICY "Usuarios pueden actualizar su propia configuración 2FA"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ==========================================
-- 5. Triggers y funciones auxiliares
-- ==========================================

-- Función: Notificar cuando se activa 2FA (para logs/auditoría)
DROP FUNCTION IF EXISTS log_2fa_activation() CASCADE;

CREATE OR REPLACE FUNCTION log_2fa_activation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.two_factor_enabled = TRUE AND (OLD.two_factor_enabled IS NULL OR OLD.two_factor_enabled = FALSE) THEN
    RAISE NOTICE 'Usuario % activó 2FA', NEW.id;
  END IF;
  
  IF NEW.two_factor_enabled = FALSE AND OLD.two_factor_enabled = TRUE THEN
    RAISE NOTICE 'Usuario % desactivó 2FA', NEW.id;
    -- Al desactivar 2FA, eliminar el secreto
    NEW.two_factor_secret := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger: Ejecutar log cuando cambia el estado de 2FA
DROP TRIGGER IF EXISTS trigger_log_2fa_changes ON profiles;
CREATE TRIGGER trigger_log_2fa_changes
  BEFORE UPDATE OF two_factor_enabled ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_2fa_activation();

-- ==========================================
-- 6. Grants de permisos
-- ==========================================

-- Permitir a authenticated leer y actualizar sus propios datos de profiles
GRANT SELECT, UPDATE ON profiles TO authenticated;

-- Solo service_role puede acceder directamente a password_reset_tokens
GRANT ALL ON password_reset_tokens TO service_role;

-- ==========================================
-- 7. Datos de ejemplo (solo para desarrollo - comentado)
-- ==========================================

-- DESARROLLO: Descomentar para testing
-- INSERT INTO password_reset_tokens (user_id, token, expires_at)
-- SELECT 
--   id,
--   'test_token_' || gen_random_uuid()::text,
--   NOW() + INTERVAL '1 hour'
-- FROM auth.users
-- LIMIT 1;

-- ==========================================
-- FIN DE MIGRACIÓN
-- ==========================================

-- Verificación final
DO $$
BEGIN
  RAISE NOTICE '✅ Migración completada exitosamente';
  RAISE NOTICE '   - Campos 2FA añadidos a profiles';
  RAISE NOTICE '   - Tabla password_reset_tokens creada';
  RAISE NOTICE '   - Políticas RLS configuradas';
  RAISE NOTICE '   - Triggers y funciones auxiliares instalados';
END $$;
