-- Script para asignar rol admin_global a dennis@becamaconsulting.com

-- Primero, obtener el UUID del usuario
DO $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Buscar UUID del usuario por email
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = 'dennis@becamaconsulting.com';

  IF user_uuid IS NULL THEN
    RAISE NOTICE 'Usuario dennis@becamaconsulting.com no encontrado';
  ELSE
    -- Insertar rol admin_global (ignorar si ya existe)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_uuid, 'admin_global')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Rol admin_global asignado correctamente a %', user_uuid;
  END IF;
END $$;

-- Verificar que se asignó correctamente
SELECT u.email, ur.role, ur.created_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'dennis@becamaconsulting.com';
