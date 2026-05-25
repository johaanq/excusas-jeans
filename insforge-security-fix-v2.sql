-- InsForge Advisor: RLS + RPC + índices FK (v2)

-- ========== RLS: quitar escritura pública en catálogo ==========
DROP POLICY IF EXISTS productos_public_insert ON public.productos;
DROP POLICY IF EXISTS productos_public_update ON public.productos;
DROP POLICY IF EXISTS productos_public_delete ON public.productos;
DROP POLICY IF EXISTS productos_public_all ON public.productos;

DROP POLICY IF EXISTS tallas_public_insert ON public.tallas;
DROP POLICY IF EXISTS tallas_public_update ON public.tallas;
DROP POLICY IF EXISTS tallas_public_delete ON public.tallas;
DROP POLICY IF EXISTS tallas_public_all ON public.tallas;

DROP POLICY IF EXISTS colores_public_insert ON public.colores;
DROP POLICY IF EXISTS colores_public_update ON public.colores;
DROP POLICY IF EXISTS colores_public_delete ON public.colores;
DROP POLICY IF EXISTS colores_public_all ON public.colores;

DROP POLICY IF EXISTS fotos_color_public_insert ON public.fotos_color;
DROP POLICY IF EXISTS fotos_color_public_update ON public.fotos_color;
DROP POLICY IF EXISTS fotos_color_public_delete ON public.fotos_color;
DROP POLICY IF EXISTS fotos_color_public_all ON public.fotos_color;

DROP POLICY IF EXISTS fotos_medidas_public_insert ON public.fotos_medidas;
DROP POLICY IF EXISTS fotos_medidas_public_update ON public.fotos_medidas;
DROP POLICY IF EXISTS fotos_medidas_public_delete ON public.fotos_medidas;
DROP POLICY IF EXISTS fotos_medidas_public_all ON public.fotos_medidas;

DROP POLICY IF EXISTS administradores_public_all ON public.administradores;
DROP POLICY IF EXISTS admin_logs_public_all ON public.admin_logs;

-- Lectura pública del catálogo (tienda)
DROP POLICY IF EXISTS productos_public_select ON public.productos;
CREATE POLICY productos_public_select ON public.productos
  FOR SELECT TO public USING (estado = 'activo');

DROP POLICY IF EXISTS tallas_public_select ON public.tallas;
CREATE POLICY tallas_public_select ON public.tallas
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS colores_public_select ON public.colores;
CREATE POLICY colores_public_select ON public.colores
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS fotos_color_public_select ON public.fotos_color;
CREATE POLICY fotos_color_public_select ON public.fotos_color
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS fotos_medidas_public_select ON public.fotos_medidas;
CREATE POLICY fotos_medidas_public_select ON public.fotos_medidas
  FOR SELECT TO public USING (true);

-- Admin panel: lectura completa vía project_admin (API key en servidor)
DROP POLICY IF EXISTS productos_admin_select ON public.productos;
CREATE POLICY productos_admin_select ON public.productos
  FOR SELECT TO project_admin USING (true);

DROP POLICY IF EXISTS productos_admin_write ON public.productos;
CREATE POLICY productos_admin_all ON public.productos
  FOR ALL TO project_admin USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS tallas_admin_write ON public.tallas;
CREATE POLICY tallas_admin_all ON public.tallas
  FOR ALL TO project_admin USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS colores_admin_write ON public.colores;
CREATE POLICY colores_admin_all ON public.colores
  FOR ALL TO project_admin USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS fotos_color_admin_write ON public.fotos_color;
CREATE POLICY fotos_color_admin_all ON public.fotos_color
  FOR ALL TO project_admin USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS fotos_medidas_admin_write ON public.fotos_medidas;
CREATE POLICY fotos_medidas_admin_all ON public.fotos_medidas
  FOR ALL TO project_admin USING (true) WITH CHECK (true);

-- ========== RPC endurecidas ==========
CREATE OR REPLACE FUNCTION public.registrar_admin_log(
  p_admin_id uuid,
  p_action character varying,
  p_description text DEFAULT NULL,
  p_resource_type character varying DEFAULT NULL,
  p_resource_id uuid DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE log_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.administradores
    WHERE id = p_admin_id AND activo = true
  ) THEN
    RAISE EXCEPTION 'Administrador no válido';
  END IF;

  INSERT INTO public.admin_logs (
    admin_id, action, description, resource_type,
    resource_id, ip_address, user_agent, metadata
  ) VALUES (
    p_admin_id, p_action, p_description, p_resource_type,
    p_resource_id, p_ip_address, p_user_agent, p_metadata
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;

-- ========== Permisos EXECUTE (no PUBLIC) ==========
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO postgres, service_role, project_admin;

REVOKE EXECUTE ON FUNCTION public.verificar_admin_credenciales(character varying, character varying) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verificar_admin_credenciales(character varying, character varying) TO anon, authenticated, project_admin;

REVOKE EXECUTE ON FUNCTION public.crear_admin(character varying, character varying, character varying, character varying, character varying, character varying) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.crear_admin(character varying, character varying, character varying, character varying, character varying, character varying) TO anon, authenticated, project_admin;

DROP FUNCTION IF EXISTS public.crear_admin(character varying, character varying, character varying, character varying);

REVOKE EXECUTE ON FUNCTION public.cambiar_password_admin(uuid, character varying, character varying) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cambiar_password_admin(uuid, character varying, character varying) TO anon, authenticated, project_admin;

REVOKE EXECUTE ON FUNCTION public.registrar_admin_log(uuid, character varying, text, character varying, uuid, inet, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registrar_admin_log(uuid, character varying, text, character varying, uuid, inet, text, jsonb) TO anon, authenticated, project_admin;

REVOKE EXECUTE ON FUNCTION public.obtener_admin_logs(integer, integer, uuid, character varying, character varying, character varying) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.obtener_admin_logs(integer, integer, uuid, character varying, character varying, character varying) TO anon, authenticated, project_admin;

DROP FUNCTION IF EXISTS public.obtener_admin_logs(integer, integer, uuid, character varying);

REVOKE EXECUTE ON FUNCTION public.verificar_admin_existe(character varying) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verificar_admin_existe(character varying) TO anon, authenticated, project_admin;

REVOKE EXECUTE ON FUNCTION public.crear_perfil_usuario(text, character varying, character varying, character varying) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.crear_perfil_usuario(text, character varying, character varying, character varying) TO anon, authenticated, project_admin;

ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.verificar_admin_credenciales(character varying, character varying) SET search_path = public;
ALTER FUNCTION public.crear_admin(character varying, character varying, character varying, character varying, character varying, character varying) SET search_path = public;
ALTER FUNCTION public.cambiar_password_admin(uuid, character varying, character varying) SET search_path = public;
ALTER FUNCTION public.registrar_admin_log(uuid, character varying, text, character varying, uuid, inet, text, jsonb) SET search_path = public;
ALTER FUNCTION public.obtener_admin_logs(integer, integer, uuid, character varying, character varying, character varying) SET search_path = public;
ALTER FUNCTION public.verificar_admin_existe(character varying) SET search_path = public;
ALTER FUNCTION public.crear_perfil_usuario(text, character varying, character varying, character varying) SET search_path = public;

-- ========== Índices FK ==========
CREATE INDEX IF NOT EXISTS idx_tallas_producto_id ON public.tallas(producto_id);
CREATE INDEX IF NOT EXISTS idx_colores_producto_id ON public.colores(producto_id);
CREATE INDEX IF NOT EXISTS idx_fotos_color_color_id ON public.fotos_color(color_id);
CREATE INDEX IF NOT EXISTS idx_fotos_medidas_producto_id ON public.fotos_medidas(producto_id);
CREATE INDEX IF NOT EXISTS idx_carritos_usuario_id ON public.carritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_carrito_items_carrito_id ON public.carrito_items(carrito_id);
CREATE INDEX IF NOT EXISTS idx_carrito_items_color_id ON public.carrito_items(color_id);
CREATE INDEX IF NOT EXISTS idx_carrito_items_producto_id ON public.carrito_items(producto_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);
