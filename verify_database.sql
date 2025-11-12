-- Script para verificar todas las tablas del proyecto EcoCero

-- 1. Listar todas las tablas en el schema public
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar estructura de tabla profiles
\echo '\n=== TABLA: profiles ==='
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Verificar estructura de tabla user_roles
\echo '\n=== TABLA: user_roles ==='
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- 4. Verificar estructura de tabla production_lines
\echo '\n=== TABLA: production_lines ==='
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'production_lines'
ORDER BY ordinal_position;

-- 5. Verificar estructura de tabla fabrication_orders
\echo '\n=== TABLA: fabrication_orders ==='
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'fabrication_orders'
ORDER BY ordinal_position;

-- 6. Verificar estructura de tabla production_steps
\echo '\n=== TABLA: production_steps ==='
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'production_steps'
ORDER BY ordinal_position;

-- 7. Verificar estructura de tabla quality_checks
\echo '\n=== TABLA: quality_checks ==='
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'quality_checks'
ORDER BY ordinal_position;

-- 8. Verificar estructura de tabla activity_log
\echo '\n=== TABLA: activity_log ==='
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'activity_log'
ORDER BY ordinal_position;

-- 9. Verificar ENUMs
\echo '\n=== TIPOS ENUM ==='
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
ORDER BY t.typname, e.enumsortorder;

-- 10. Verificar RLS Policies
\echo '\n=== POLÍTICAS RLS ==='
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 11. Verificar datos iniciales - Líneas de producción
\echo '\n=== LÍNEAS DE PRODUCCIÓN ==='
SELECT * FROM production_lines ORDER BY name;

-- 12. Verificar usuarios y roles
\echo '\n=== USUARIOS Y ROLES ==='
SELECT 
    u.email,
    ur.role,
    p.departamento,
    ur.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.email;

-- 13. Verificar Storage Buckets
\echo '\n=== STORAGE BUCKETS ==='
SELECT 
    id,
    name,
    public,
    created_at
FROM storage.buckets
ORDER BY name;

-- 14. Verificar Functions
\echo '\n=== FUNCTIONS ==='
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 15. Conteo de registros por tabla
\echo '\n=== CONTEO DE REGISTROS ==='
SELECT 'profiles' as tabla, COUNT(*) as registros FROM profiles
UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles
UNION ALL
SELECT 'production_lines', COUNT(*) FROM production_lines
UNION ALL
SELECT 'fabrication_orders', COUNT(*) FROM fabrication_orders
UNION ALL
SELECT 'production_steps', COUNT(*) FROM production_steps
UNION ALL
SELECT 'quality_checks', COUNT(*) FROM quality_checks
UNION ALL
SELECT 'activity_log', COUNT(*) FROM activity_log;
