-- Script para configurar sistema de administradores en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Crear tabla de administradores
CREATE TABLE IF NOT EXISTS administradores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Crear trigger para updated_at
CREATE TRIGGER update_administradores_updated_at 
    BEFORE UPDATE ON administradores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Crear función para verificar credenciales de admin
CREATE OR REPLACE FUNCTION verificar_admin_credenciales(
  p_username VARCHAR(50),
  p_password VARCHAR(255)
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
    AND a.password_hash = crypt(p_password, a.password_hash)
    AND a.activo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Crear función para crear admin (solo para setup inicial)
CREATE OR REPLACE FUNCTION crear_admin(
  p_username VARCHAR(50),
  p_password VARCHAR(255),
  p_nombre VARCHAR(100),
  p_email VARCHAR(255) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Verificar si ya existe el username
  IF EXISTS (SELECT 1 FROM administradores WHERE username = p_username) THEN
    RAISE EXCEPTION 'El username ya existe';
  END IF;
  
  -- Insertar nuevo admin
  INSERT INTO administradores (username, password_hash, nombre, email)
  VALUES (p_username, crypt(p_password, gen_salt('bf')), p_nombre, p_email)
  RETURNING id INTO admin_id;
  
  RETURN admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Crear función para cambiar contraseña
CREATE OR REPLACE FUNCTION cambiar_password_admin(
  p_admin_id UUID,
  p_old_password VARCHAR(255),
  p_new_password VARCHAR(255)
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar contraseña actual
  IF NOT EXISTS (
    SELECT 1 FROM administradores 
    WHERE id = p_admin_id 
      AND password_hash = crypt(p_old_password, password_hash)
      AND activo = true
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Actualizar contraseña
  UPDATE administradores 
  SET password_hash = crypt(p_new_password, gen_salt('bf'))
  WHERE id = p_admin_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Configurar políticas de seguridad (RLS)
ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;

-- Política para que solo los admins puedan ver otros admins
CREATE POLICY "Admins can view other admins" ON administradores
  FOR SELECT USING (true);

-- Política para que solo los admins puedan actualizar su propio perfil
CREATE POLICY "Admins can update own profile" ON administradores
  FOR UPDATE USING (true);

-- 8. Insertar admin inicial (cambiar las credenciales)
-- Username: admin, Password: excusas2025
SELECT crear_admin('admin', 'excusas2025', 'Administrador Principal', 'admin@excusas.com');

-- 9. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_administradores_username ON administradores(username);
CREATE INDEX IF NOT EXISTS idx_administradores_activo ON administradores(activo);

-- 8. Crear tabla de logs de administradores
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES administradores(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50), -- 'producto', 'admin', 'usuario', etc.
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Crear trigger para updated_at en administradores
CREATE TRIGGER update_administradores_updated_at 
    BEFORE UPDATE ON administradores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Crear función para registrar logs
CREATE OR REPLACE FUNCTION registrar_admin_log(
  p_admin_id UUID,
  p_action VARCHAR(100),
  p_description TEXT DEFAULT NULL,
  p_resource_type VARCHAR(50) DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO admin_logs (
    admin_id, action, description, resource_type, resource_id,
    ip_address, user_agent, metadata
  ) VALUES (
    p_admin_id, p_action, p_description, p_resource_type, p_resource_id,
    p_ip_address, p_user_agent, p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Crear función para obtener logs con información del admin
CREATE OR REPLACE FUNCTION obtener_admin_logs(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_admin_id UUID DEFAULT NULL,
  p_action VARCHAR(100) DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  admin_username VARCHAR(50),
  admin_nombre VARCHAR(100),
  action VARCHAR(100),
  description TEXT,
  resource_type VARCHAR(50),
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    a.username,
    a.nombre,
    al.action,
    al.description,
    al.resource_type,
    al.resource_id,
    al.ip_address,
    al.user_agent,
    al.metadata,
    al.created_at
  FROM admin_logs al
  JOIN administradores a ON al.admin_id = a.id
  WHERE (p_admin_id IS NULL OR al.admin_id = p_admin_id)
    AND (p_action IS NULL OR al.action = p_action)
  ORDER BY al.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Configurar políticas de seguridad para logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Política para que solo los admins puedan ver logs
CREATE POLICY "Admins can view logs" ON admin_logs
  FOR SELECT USING (true);

-- Política para que solo el sistema pueda insertar logs
CREATE POLICY "System can insert logs" ON admin_logs
  FOR INSERT WITH CHECK (true);

-- 13. Crear índices para mejor rendimiento en logs
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_resource ON admin_logs(resource_type, resource_id);

-- 14. Comentarios para documentación
COMMENT ON TABLE administradores IS 'Tabla de administradores del sistema';
COMMENT ON COLUMN administradores.username IS 'Nombre de usuario único para login';
COMMENT ON COLUMN administradores.password_hash IS 'Hash de la contraseña usando bcrypt';
COMMENT ON COLUMN administradores.activo IS 'Indica si el admin está activo';
COMMENT ON TABLE admin_logs IS 'Logs de acciones de administradores';
COMMENT ON COLUMN admin_logs.action IS 'Tipo de acción realizada (login, create_producto, etc.)';
COMMENT ON COLUMN admin_logs.resource_type IS 'Tipo de recurso afectado (producto, admin, usuario)';
COMMENT ON COLUMN admin_logs.metadata IS 'Información adicional en formato JSON';
COMMENT ON FUNCTION verificar_admin_credenciales IS 'Verifica las credenciales de un administrador';
COMMENT ON FUNCTION crear_admin IS 'Crea un nuevo administrador (solo para setup inicial)';
COMMENT ON FUNCTION cambiar_password_admin IS 'Permite cambiar la contraseña de un admin';
COMMENT ON FUNCTION registrar_admin_log IS 'Registra una acción en el log de administradores';
COMMENT ON FUNCTION obtener_admin_logs IS 'Obtiene logs de administradores con filtros';
