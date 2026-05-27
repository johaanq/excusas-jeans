-- RLS usuarios: cada cliente lee/actualiza solo su fila (id = sub del JWT).
-- Ejecutar en InsForge después de insforge-schema.sql

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS usuarios_select_own ON public.usuarios;
DROP POLICY IF EXISTS usuarios_update_own ON public.usuarios;

CREATE POLICY usuarios_select_own ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (id = (auth.uid())::text);

CREATE POLICY usuarios_update_own ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (id = (auth.uid())::text)
  WITH CHECK (id = (auth.uid())::text);
