-- Script para limpiar completamente el sistema de administradores
-- ⚠️ ADVERTENCIA: Este script eliminará TODOS los datos de administradores y logs
-- Solo ejecutar si quieres empezar completamente de nuevo

-- 1. Eliminar políticas de seguridad
DROP POLICY IF EXISTS "Admins can view other admins" ON administradores;
DROP POLICY IF EXISTS "Admins can update own profile" ON administradores;
DROP POLICY IF EXISTS "Admins can view logs" ON admin_logs;
DROP POLICY IF EXISTS "System can insert logs" ON admin_logs;

-- 2. Eliminar triggers
DROP TRIGGER IF EXISTS update_administradores_updated_at ON administradores;

-- 3. Eliminar funciones
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS verificar_admin_credenciales(VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS crear_admin(VARCHAR, VARCHAR, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS cambiar_password_admin(UUID, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS registrar_admin_log(UUID, VARCHAR, TEXT, VARCHAR, UUID, INET, TEXT, JSONB);
DROP FUNCTION IF EXISTS obtener_admin_logs(INTEGER, INTEGER, UUID, VARCHAR);

-- 4. Eliminar tablas (en orden correcto por las foreign keys)
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS administradores CASCADE;

-- 5. Eliminar índices si existen
DROP INDEX IF EXISTS idx_administradores_username;
DROP INDEX IF EXISTS idx_administradores_activo;
DROP INDEX IF EXISTS idx_admin_logs_admin_id;
DROP INDEX IF EXISTS idx_admin_logs_action;
DROP INDEX IF EXISTS idx_admin_logs_created_at;
DROP INDEX IF EXISTS idx_admin_logs_resource;

-- Mensaje de confirmación
SELECT 'Sistema de administradores eliminado completamente. Puedes ejecutar supabase-admin-setup-fixed.sql para recrear todo.' as message;
