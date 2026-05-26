-- Libro de reclamaciones (INDECOPI)
-- Incluido en insforge-schema.sql | RLS en insforge-pedidos-rls.sql
-- Ya aplicado en InsForge (marzo 2026)
CREATE TABLE IF NOT EXISTS libro_reclamaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_hoja VARCHAR(32) NOT NULL UNIQUE,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tipo_documento VARCHAR(16) NOT NULL CHECK (tipo_documento IN ('reclamo', 'queja')),
  nombres_apellidos VARCHAR(255) NOT NULL,
  tipo_doc_identidad VARCHAR(8) NOT NULL,
  numero_doc_identidad VARCHAR(20) NOT NULL,
  domicilio VARCHAR(500) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  email VARCHAR(255) NOT NULL,
  es_menor_edad BOOLEAN NOT NULL DEFAULT FALSE,
  nombre_padre_tutor VARCHAR(255),
  bien_contratado VARCHAR(500) NOT NULL,
  monto_reclamado NUMERIC(12, 2),
  descripcion TEXT NOT NULL,
  pedido_consumidor TEXT NOT NULL,
  detalle_pedido TEXT,
  estado VARCHAR(32) NOT NULL DEFAULT 'registrado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_libro_reclamos_fecha ON libro_reclamaciones(fecha_registro DESC);
