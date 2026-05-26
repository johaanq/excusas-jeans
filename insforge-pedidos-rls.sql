-- RLS: pedidos y libro de reclamaciones (solo API servidor / project_admin)

ALTER TABLE IF EXISTS public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.libro_reclamaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pedidos_admin_all ON public.pedidos;
CREATE POLICY pedidos_admin_all ON public.pedidos
  FOR ALL TO project_admin
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS pedido_items_admin_all ON public.pedido_items;
CREATE POLICY pedido_items_admin_all ON public.pedido_items
  FOR ALL TO project_admin
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS libro_reclamaciones_admin_all ON public.libro_reclamaciones;
CREATE POLICY libro_reclamaciones_admin_all ON public.libro_reclamaciones
  FOR ALL TO project_admin
  USING (true) WITH CHECK (true);

-- Sin acceso directo anon/authenticated (checkout y libro vía rutas API con admin key)
REVOKE ALL ON public.pedidos FROM anon, authenticated;
REVOKE ALL ON public.pedido_items FROM anon, authenticated;
REVOKE ALL ON public.libro_reclamaciones FROM anon, authenticated;

GRANT ALL ON public.pedidos TO project_admin;
GRANT ALL ON public.pedido_items TO project_admin;
GRANT ALL ON public.libro_reclamaciones TO project_admin;
