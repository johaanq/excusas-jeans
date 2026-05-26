-- Pedidos online (Culqi)
-- Incluido en insforge-schema.sql | RLS en insforge-pedidos-rls.sql
-- Ya aplicado en InsForge (marzo 2026)

CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_pedido VARCHAR(32) UNIQUE NOT NULL,
  usuario_id TEXT REFERENCES usuarios(id) ON DELETE SET NULL,
  estado VARCHAR(32) NOT NULL DEFAULT 'pendiente_pago'
    CHECK (estado IN (
      'pendiente_pago', 'pagado', 'en_preparacion', 'enviado', 'entregado', 'cancelado'
    )),
  tipo_envio VARCHAR(20) NOT NULL CHECK (tipo_envio IN ('lima', 'provincia')),
  nombre_cliente VARCHAR(255) NOT NULL,
  email_cliente VARCHAR(255) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  dni VARCHAR(20),
  provincia VARCHAR(100) NOT NULL,
  distrito VARCHAR(100),
  direccion TEXT,
  referencia TEXT,
  empresa_envio VARCHAR(100),
  sede_envio VARCHAR(255),
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  costo_envio DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  moneda VARCHAR(3) NOT NULL DEFAULT 'PEN',
  stripe_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  notas TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedido_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  color_id UUID NOT NULL REFERENCES colores(id) ON DELETE RESTRICT,
  producto_nombre VARCHAR(255) NOT NULL,
  color_nombre VARCHAR(100) NOT NULL,
  talla VARCHAR(10) NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_tipo_envio ON pedidos(tipo_envio);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON pedidos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_stripe_session ON pedidos(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario_id ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido ON pedido_items(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_items_producto_id ON pedido_items(producto_id);
CREATE INDEX IF NOT EXISTS idx_pedido_items_color_id ON pedido_items(color_id);

DROP TRIGGER IF EXISTS update_pedidos_updated_at ON pedidos;
CREATE TRIGGER update_pedidos_updated_at
  BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
