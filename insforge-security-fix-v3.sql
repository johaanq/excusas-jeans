-- InsForge Advisor v3: RLS catálogo acotado + RPC admin solo project_admin

-- ========== SELECT público solo si el producto está activo ==========
DROP POLICY IF EXISTS colores_public_select ON public.colores;
CREATE POLICY colores_public_select ON public.colores
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.productos p
      WHERE p.id = colores.producto_id AND p.estado = 'activo'
    )
  );

DROP POLICY IF EXISTS tallas_public_select ON public.tallas;
CREATE POLICY tallas_public_select ON public.tallas
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.productos p
      WHERE p.id = tallas.producto_id AND p.estado = 'activo'
    )
  );

DROP POLICY IF EXISTS fotos_color_public_select ON public.fotos_color;
CREATE POLICY fotos_color_public_select ON public.fotos_color
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.colores c
      JOIN public.productos p ON p.id = c.producto_id
      WHERE c.id = fotos_color.color_id AND p.estado = 'activo'
    )
  );

DROP POLICY IF EXISTS fotos_medidas_public_select ON public.fotos_medidas;
CREATE POLICY fotos_medidas_public_select ON public.fotos_medidas
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.productos p
      WHERE p.id = fotos_medidas.producto_id AND p.estado = 'activo'
    )
  );

-- ========== RPC admin: sin anon/authenticated ==========
REVOKE EXECUTE ON FUNCTION public.verificar_admin_credenciales(character varying, character varying) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cambiar_password_admin(uuid, character varying, character varying) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.registrar_admin_log(uuid, character varying, text, character varying, uuid, inet, text, jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.verificar_admin_existe(character varying) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.crear_admin(character varying, character varying, character varying, character varying, character varying, character varying) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.obtener_admin_logs(integer, integer, uuid, character varying, character varying, character varying) FROM anon, authenticated;

GRANT EXECUTE ON FUNCTION public.verificar_admin_credenciales(character varying, character varying) TO project_admin;
GRANT EXECUTE ON FUNCTION public.cambiar_password_admin(uuid, character varying, character varying) TO project_admin;
GRANT EXECUTE ON FUNCTION public.registrar_admin_log(uuid, character varying, text, character varying, uuid, inet, text, jsonb) TO project_admin;
GRANT EXECUTE ON FUNCTION public.verificar_admin_existe(character varying) TO project_admin;
GRANT EXECUTE ON FUNCTION public.crear_admin(character varying, character varying, character varying, character varying, character varying, character varying) TO project_admin;
GRANT EXECUTE ON FUNCTION public.obtener_admin_logs(integer, integer, uuid, character varying, character varying, character varying) TO project_admin;

ALTER FUNCTION public.verificar_admin_credenciales(character varying, character varying) SET search_path = public, pg_temp;
ALTER FUNCTION public.cambiar_password_admin(uuid, character varying, character varying) SET search_path = public, pg_temp;
ALTER FUNCTION public.registrar_admin_log(uuid, character varying, text, character varying, uuid, inet, text, jsonb) SET search_path = public, pg_temp;
ALTER FUNCTION public.verificar_admin_existe(character varying) SET search_path = public, pg_temp;
ALTER FUNCTION public.crear_admin(character varying, character varying, character varying, character varying, character varying, character varying) SET search_path = public, pg_temp;
ALTER FUNCTION public.obtener_admin_logs(integer, integer, uuid, character varying, character varying, character varying) SET search_path = public, pg_temp;
REVOKE EXECUTE ON FUNCTION public.crear_perfil_usuario(text, character varying, character varying, character varying) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.crear_perfil_usuario(text, character varying, character varying, character varying) TO project_admin;
ALTER FUNCTION public.crear_perfil_usuario(text, character varying, character varying, character varying) SET search_path = public, pg_temp;

-- Índices FK (ya aplicados; idempotente)
CREATE INDEX IF NOT EXISTS idx_tallas_producto_id ON public.tallas(producto_id);
CREATE INDEX IF NOT EXISTS idx_colores_producto_id ON public.colores(producto_id);
CREATE INDEX IF NOT EXISTS idx_fotos_color_color_id ON public.fotos_color(color_id);
CREATE INDEX IF NOT EXISTS idx_fotos_medidas_producto_id ON public.fotos_medidas(producto_id);
CREATE INDEX IF NOT EXISTS idx_carritos_usuario_id ON public.carritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_carrito_items_carrito_id ON public.carrito_items(carrito_id);
CREATE INDEX IF NOT EXISTS idx_carrito_items_color_id ON public.carrito_items(color_id);
CREATE INDEX IF NOT EXISTS idx_carrito_items_producto_id ON public.carrito_items(producto_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);
