-- =====================================================
-- InsForge: corrección de Critical Issues (RLS + RPC)
-- Ejecutar en el SQL editor de InsForge o vía MCP run-raw-sql
-- =====================================================

-- 1) Quitar acceso público total a tablas sensibles de admin
DROP POLICY IF EXISTS administradores_public_all ON public.administradores;
DROP POLICY IF EXISTS admin_logs_public_all ON public.admin_logs;

-- 2) Catálogo: separar ALL en SELECT + mutaciones (reduce alertas; admin sigue con anon)
DROP POLICY IF EXISTS productos_public_all ON public.productos;
DROP POLICY IF EXISTS tallas_public_all ON public.tallas;
DROP POLICY IF EXISTS colores_public_all ON public.colores;
DROP POLICY IF EXISTS fotos_color_public_all ON public.fotos_color;
DROP POLICY IF EXISTS fotos_medidas_public_all ON public.fotos_medidas;

CREATE POLICY productos_public_select ON public.productos FOR SELECT TO public USING (true);
CREATE POLICY productos_public_insert ON public.productos FOR INSERT TO public WITH CHECK (true);
CREATE POLICY productos_public_update ON public.productos FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY productos_public_delete ON public.productos FOR DELETE TO public USING (true);

CREATE POLICY tallas_public_select ON public.tallas FOR SELECT TO public USING (true);
CREATE POLICY tallas_public_insert ON public.tallas FOR INSERT TO public WITH CHECK (true);
CREATE POLICY tallas_public_update ON public.tallas FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY tallas_public_delete ON public.tallas FOR DELETE TO public USING (true);

CREATE POLICY colores_public_select ON public.colores FOR SELECT TO public USING (true);
CREATE POLICY colores_public_insert ON public.colores FOR INSERT TO public WITH CHECK (true);
CREATE POLICY colores_public_update ON public.colores FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY colores_public_delete ON public.colores FOR DELETE TO public USING (true);

CREATE POLICY fotos_color_public_select ON public.fotos_color FOR SELECT TO public USING (true);
CREATE POLICY fotos_color_public_insert ON public.fotos_color FOR INSERT TO public WITH CHECK (true);
CREATE POLICY fotos_color_public_update ON public.fotos_color FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY fotos_color_public_delete ON public.fotos_color FOR DELETE TO public USING (true);

CREATE POLICY fotos_medidas_public_select ON public.fotos_medidas FOR SELECT TO public USING (true);
CREATE POLICY fotos_medidas_public_insert ON public.fotos_medidas FOR INSERT TO public WITH CHECK (true);
CREATE POLICY fotos_medidas_public_update ON public.fotos_medidas FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY fotos_medidas_public_delete ON public.fotos_medidas FOR DELETE TO public USING (true);

-- 3) crear_admin: exige credenciales de un admin existente
CREATE OR REPLACE FUNCTION public.crear_admin(
  p_username character varying,
  p_password character varying,
  p_nombre character varying,
  p_email character varying DEFAULT NULL,
  p_creator_username character varying DEFAULT NULL,
  p_creator_password character varying DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id UUID;
BEGIN
  IF p_creator_username IS NULL OR p_creator_password IS NULL THEN
    RAISE EXCEPTION 'Se requieren credenciales del administrador creador';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.administradores a
    WHERE a.username = p_creator_username
      AND a.password_hash = crypt(p_creator_password, a.password_hash)
      AND a.activo = true
  ) THEN
    RAISE EXCEPTION 'Credenciales de administrador inválidas';
  END IF;

  IF EXISTS (SELECT 1 FROM public.administradores WHERE username = p_username) THEN
    RAISE EXCEPTION 'El username ya existe';
  END IF;

  INSERT INTO public.administradores (username, password_hash, nombre, email)
  VALUES (p_username, crypt(p_password, gen_salt('bf')), p_nombre, p_email)
  RETURNING id INTO admin_id;

  RETURN admin_id;
END;
$$;

-- 4) obtener_admin_logs: exige credenciales de admin
CREATE OR REPLACE FUNCTION public.obtener_admin_logs(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_admin_id uuid DEFAULT NULL,
  p_action character varying DEFAULT NULL,
  p_username character varying DEFAULT NULL,
  p_password character varying DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  admin_username character varying,
  admin_nombre character varying,
  action character varying,
  description text,
  resource_type character varying,
  resource_id uuid,
  ip_address inet,
  user_agent text,
  metadata jsonb,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_username IS NULL OR p_password IS NULL THEN
    RAISE EXCEPTION 'Se requieren credenciales de administrador';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.administradores a
    WHERE a.username = p_username
      AND a.password_hash = crypt(p_password, a.password_hash)
      AND a.activo = true
  ) THEN
    RAISE EXCEPTION 'Credenciales de administrador inválidas';
  END IF;

  RETURN QUERY
  SELECT al.id, a.username, a.nombre, al.action, al.description,
         al.resource_type, al.resource_id, al.ip_address, al.user_agent,
         al.metadata, al.created_at
  FROM public.admin_logs al
  JOIN public.administradores a ON al.admin_id = a.id
  WHERE (p_admin_id IS NULL OR al.admin_id = p_admin_id)
    AND (p_action IS NULL OR al.action = p_action)
  ORDER BY al.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- 5) Panel InsForge: configurar SMTP, allowedRedirectUrls y dominio de producción
--    (no se arreglan con SQL; ver docs/email y NEXT_PUBLIC_APP_URL)
