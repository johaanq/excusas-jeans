-- =====================================================
-- EXCUSAS JEANS - Schema completo para InsForge
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper: ID del usuario autenticado (InsForge JWT sub)
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claims', true), '')::json->>'sub',
    auth.uid()::text
  );
$$;

-- =====================================================
-- PRODUCTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  descripcion TEXT DEFAULT '',
  precio DECIMAL(10, 2),
  precio_mayor DECIMAL(10, 2),
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  foto_principal TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tallas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  talla VARCHAR(10) NOT NULL,
  en_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(producto_id, talla)
);

CREATE TABLE IF NOT EXISTS colores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  hex VARCHAR(7) DEFAULT '#000000',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fotos_color (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  color_id UUID NOT NULL REFERENCES colores(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fotos_medidas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USUARIOS Y CARRITO
-- =====================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(50),
  dni VARCHAR(20),
  provincia VARCHAR(100),
  distrito VARCHAR(100),
  direccion TEXT,
  referencia TEXT,
  codigo_postal VARCHAR(20),
  empresa_envio VARCHAR(100),
  sede_envio VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carritos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id)
);

CREATE TABLE IF NOT EXISTS carrito_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  carrito_id UUID NOT NULL REFERENCES carritos(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  color_id UUID NOT NULL REFERENCES colores(id) ON DELETE CASCADE,
  talla VARCHAR(10) NOT NULL,
  cantidad INTEGER DEFAULT 1 CHECK (cantidad > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADMIN
-- =====================================================

CREATE TABLE IF NOT EXISTS administradores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES administradores(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50),
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRIGGERS updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_productos_updated_at ON productos;
CREATE TRIGGER update_productos_updated_at
  BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_carritos_updated_at ON carritos;
CREATE TRIGGER update_carritos_updated_at
  BEFORE UPDATE ON carritos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_carrito_items_updated_at ON carrito_items;
CREATE TRIGGER update_carrito_items_updated_at
  BEFORE UPDATE ON carrito_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_administradores_updated_at ON administradores;
CREATE TRIGGER update_administradores_updated_at
  BEFORE UPDATE ON administradores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIONES ADMIN Y PERFIL
-- Funciones RPC aplicadas en InsForge (ver historial del proyecto / panel MCP).
-- =====================================================

-- crear_perfil_usuario, verificar_admin_credenciales, crear_admin,
-- registrar_admin_log, obtener_admin_logs, etc. se aplican vía MCP/InsForge.

-- Admin inicial: usuario `admin` / contraseña `excusas2025`

-- Buckets de storage: `productos` (público)
