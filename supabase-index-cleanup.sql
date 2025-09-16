-- =====================================================
-- SUPABASE INDEX CLEANUP - ÍNDICES NO UTILIZADOS
-- =====================================================
-- Script para eliminar índices que no han sido utilizados
-- según el análisis del linter de Supabase

-- =====================================================
-- ANÁLISIS DE ÍNDICES NO UTILIZADOS
-- =====================================================
-- Los siguientes índices han sido identificados como no utilizados:
-- 1. idx_carrito_items_color_id (acabamos de crear este, pero no se ha usado aún)
-- 2. idx_usuarios_email (no se usa en consultas)
-- 3. idx_productos_foto_principal (no se usa en consultas)
-- 4. idx_usuarios_provincia (no se usa en consultas)
-- 5. idx_usuarios_distrito (no se usa en consultas)
-- 6. idx_usuarios_dni (no se usa en consultas)

-- =====================================================
-- VERIFICACIÓN ANTES DE ELIMINAR
-- =====================================================
-- Verificar qué índices existen actualmente
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname IN (
    'idx_carrito_items_color_id',
    'idx_usuarios_email', 
    'idx_productos_foto_principal',
    'idx_usuarios_provincia',
    'idx_usuarios_distrito',
    'idx_usuarios_dni'
)
ORDER BY tablename, indexname;

-- =====================================================
-- ELIMINACIÓN DE ÍNDICES NO UTILIZADOS
-- =====================================================
-- ⚠️ IMPORTANTE: Ejecuta solo los DROP que necesites
-- Algunos índices pueden ser útiles en el futuro

-- 1. Eliminar índice de color_id en carrito_items
-- (Este lo acabamos de crear pero no se ha usado)
-- DESCOMENTAR SOLO SI ESTÁS SEGURO:
-- DROP INDEX IF EXISTS idx_carrito_items_color_id;

-- 2. Eliminar índice de email en usuarios
-- ⚠️ CUIDADO: Este podría ser útil para búsquedas de usuarios por email
-- DROP INDEX IF EXISTS idx_usuarios_email;

-- 3. Eliminar índice de foto_principal en productos  
-- ⚠️ CUIDADO: Este podría ser útil para filtrar productos con/sin foto
-- DROP INDEX IF EXISTS idx_productos_foto_principal;

-- 4. Eliminar índices geográficos en usuarios
-- ⚠️ CUIDADO: Estos podrían ser útiles para filtros por ubicación
-- DROP INDEX IF EXISTS idx_usuarios_provincia;
-- DROP INDEX IF EXISTS idx_usuarios_distrito;

-- 5. Eliminar índice de DNI en usuarios
-- ⚠️ CUIDADO: Este podría ser útil para búsquedas por DNI
-- DROP INDEX IF EXISTS idx_usuarios_dni;

-- =====================================================
-- RECOMENDACIÓN: ANÁLISIS DE USO ANTES DE ELIMINAR
-- =====================================================
-- Antes de eliminar índices, analiza si realmente no los necesitas:

-- 1. ¿Tu aplicación hace búsquedas por email de usuario?
-- 2. ¿Filtra productos por foto_principal?
-- 3. ¿Permite búsquedas por provincia/distrito?
-- 4. ¿Busca usuarios por DNI?

-- Si la respuesta es NO a todas, entonces puedes eliminar estos índices.

-- =====================================================
-- SCRIPT SEGURO: ELIMINAR SOLO LOS CLARAMENTE INNECESARIOS
-- =====================================================
-- Este script elimina solo los índices que probablemente no necesitas

-- Eliminar índice de color_id (lo acabamos de crear pero no se usa)
DROP INDEX IF EXISTS idx_carrito_items_color_id;

-- Mantener los demás índices comentados por seguridad
-- Descomenta solo los que estés seguro de que no necesitas:

-- DROP INDEX IF EXISTS idx_usuarios_email;
-- DROP INDEX IF EXISTS idx_productos_foto_principal;
-- DROP INDEX IF EXISTS idx_usuarios_provincia;
-- DROP INDEX IF EXISTS idx_usuarios_distrito;
-- DROP INDEX IF EXISTS idx_usuarios_dni;

-- =====================================================
-- VERIFICACIÓN POST-ELIMINACIÓN
-- =====================================================
-- Verificar que los índices se eliminaron correctamente
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname IN (
    'idx_carrito_items_color_id',
    'idx_usuarios_email', 
    'idx_productos_foto_principal',
    'idx_usuarios_provincia',
    'idx_usuarios_distrito',
    'idx_usuarios_dni'
)
ORDER BY tablename, indexname;

-- =====================================================
-- RECOMENDACIONES PARA EL FUTURO
-- =====================================================
-- 1. Monitorea el uso de índices regularmente
-- 2. Crea índices solo cuando los necesites
-- 3. Elimina índices que no se usan después de un tiempo
-- 4. Considera índices compuestos para consultas complejas

-- =====================================================
-- COMANDOS ÚTILES PARA MONITOREO
-- =====================================================

-- Ver todos los índices en la base de datos
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Ver estadísticas de uso de índices (requiere habilitar pg_stat_statements)
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     idx_scan,
--     idx_tup_read,
--     idx_tup_fetch
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;
