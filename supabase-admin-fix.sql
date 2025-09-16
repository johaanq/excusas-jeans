-- Script para corregir el problema de autenticación
-- Ejecutar este script en Supabase SQL Editor

-- Crear función para verificar si un admin existe (sin validar contraseña)
CREATE OR REPLACE FUNCTION verificar_admin_existe(
  p_username VARCHAR(50)
)
RETURNS TABLE(
  id UUID,
  username VARCHAR(50),
  nombre VARCHAR(100),
  email VARCHAR(255)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.username,
    a.nombre,
    a.email
  FROM administradores a
  WHERE a.username = p_username 
    AND a.activo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario: Esta función permite verificar si un admin existe sin validar contraseña
-- Se usa para verificar sesiones activas sin exponer credenciales
