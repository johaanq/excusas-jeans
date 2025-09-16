-- =====================================================
-- SUPABASE SECURITY & PERFORMANCE FIXES
-- =====================================================
-- Script para corregir problemas de seguridad y rendimiento
-- identificados por el linter de Supabase

-- =====================================================
-- 1. SEGURIDAD CRÍTICA: Fix Function Search Path Mutable
-- =====================================================
-- Problema: La función update_updated_at_column tiene search_path mutable
-- Solución: Establecer search_path fijo para prevenir inyección SQL

-- Primero, vamos a ver la función actual
-- (Esto es solo para referencia, no se ejecuta)
/*
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
*/

-- Corregir la función con search_path fijo
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

-- =====================================================
-- 2. RENDIMIENTO: Optimizar Políticas RLS
-- =====================================================
-- Problema: auth.uid() se re-evalúa para cada fila
-- Solución: Usar (select auth.uid()) para evaluación única

-- Tabla: usuarios
-- Política: "Permitir lectura de propio usuario"
DROP POLICY IF EXISTS "Permitir lectura de propio usuario" ON usuarios;
CREATE POLICY "Permitir lectura de propio usuario" ON usuarios
    FOR SELECT USING ((select auth.uid()) = id);

-- Política: "Permitir actualización de propio usuario"  
DROP POLICY IF EXISTS "Permitir actualización de propio usuario" ON usuarios;
CREATE POLICY "Permitir actualización de propio usuario" ON usuarios
    FOR UPDATE USING ((select auth.uid()) = id);

-- Tabla: carritos
-- Política: "Permitir lectura de propio carrito"
DROP POLICY IF EXISTS "Permitir lectura de propio carrito" ON carritos;
CREATE POLICY "Permitir lectura de propio carrito" ON carritos
    FOR SELECT USING ((select auth.uid()) = usuario_id);

-- Política: "Permitir inserción de carrito"
DROP POLICY IF EXISTS "Permitir inserción de carrito" ON carritos;
CREATE POLICY "Permitir inserción de carrito" ON carritos
    FOR INSERT WITH CHECK ((select auth.uid()) = usuario_id);

-- Tabla: carrito_items
-- Política: "Permitir lectura de items de propio carrito"
DROP POLICY IF EXISTS "Permitir lectura de items de propio carrito" ON carrito_items;
CREATE POLICY "Permitir lectura de items de propio carrito" ON carrito_items
    FOR SELECT USING (
        carrito_id IN (
            SELECT id FROM carritos WHERE usuario_id = (select auth.uid())
        )
    );

-- Política: "Permitir inserción de items en carrito"
DROP POLICY IF EXISTS "Permitir inserción de items en carrito" ON carrito_items;
CREATE POLICY "Permitir inserción de items en carrito" ON carrito_items
    FOR INSERT WITH CHECK (
        carrito_id IN (
            SELECT id FROM carritos WHERE usuario_id = (select auth.uid())
        )
    );

-- Política: "Permitir actualización de items de carrito"
DROP POLICY IF EXISTS "Permitir actualización de items de carrito" ON carrito_items;
CREATE POLICY "Permitir actualización de items de carrito" ON carrito_items
    FOR UPDATE USING (
        carrito_id IN (
            SELECT id FROM carritos WHERE usuario_id = (select auth.uid())
        )
    );

-- Política: "Permitir eliminación de items de carrito"
DROP POLICY IF EXISTS "Permitir eliminación de items de carrito" ON carrito_items;
CREATE POLICY "Permitir eliminación de items de carrito" ON carrito_items
    FOR DELETE USING (
        carrito_id IN (
            SELECT id FROM carritos WHERE usuario_id = (select auth.uid())
        )
    );

-- =====================================================
-- 3. RENDIMIENTO: Consolidar Políticas Múltiples
-- =====================================================
-- Problema: Múltiples políticas permisivas para el mismo rol/acción
-- Solución: Consolidar en una sola política más específica

-- Tabla: colores
-- Eliminar políticas redundantes y crear una consolidada
DROP POLICY IF EXISTS "Permitir lectura pública de colores" ON colores;
DROP POLICY IF EXISTS "Permitir todas las operaciones en colores" ON colores;

CREATE POLICY "Política consolidada para colores" ON colores
    FOR ALL USING (true);

-- Tabla: fotos_color
DROP POLICY IF EXISTS "Permitir lectura pública de fotos_color" ON fotos_color;
DROP POLICY IF EXISTS "Permitir todas las operaciones en fotos_color" ON fotos_color;

CREATE POLICY "Política consolidada para fotos_color" ON fotos_color
    FOR ALL USING (true);

-- Tabla: fotos_medidas
DROP POLICY IF EXISTS "Permitir lectura pública de fotos_medidas" ON fotos_medidas;
DROP POLICY IF EXISTS "Permitir todas las operaciones en fotos_medidas" ON fotos_medidas;

CREATE POLICY "Política consolidada para fotos_medidas" ON fotos_medidas
    FOR ALL USING (true);

-- Tabla: productos
DROP POLICY IF EXISTS "Permitir lectura pública de productos activos" ON productos;
DROP POLICY IF EXISTS "Permitir todas las operaciones en productos" ON productos;

CREATE POLICY "Política consolidada para productos" ON productos
    FOR ALL USING (true);

-- Tabla: tallas
DROP POLICY IF EXISTS "Permitir lectura pública de tallas" ON tallas;
DROP POLICY IF EXISTS "Permitir todas las operaciones en tallas" ON tallas;

CREATE POLICY "Política consolidada para tallas" ON tallas
    FOR ALL USING (true);

-- =====================================================
-- 4. RENDIMIENTO: Agregar Índices Faltantes
-- =====================================================
-- Problema: Clave foránea sin índice
-- Solución: Agregar índice para mejorar rendimiento

-- Índice para carrito_items.color_id
CREATE INDEX IF NOT EXISTS idx_carrito_items_color_id ON carrito_items(color_id);

-- =====================================================
-- 5. RENDIMIENTO: Eliminar Índices No Utilizados
-- =====================================================
-- Problema: Índices que no se han usado nunca
-- Solución: Eliminar para reducir overhead

-- Eliminar índices no utilizados (comentados para seguridad)
-- Descomenta solo si estás seguro de que no los necesitas

-- DROP INDEX IF EXISTS idx_usuarios_email;
-- DROP INDEX IF EXISTS idx_productos_foto_principal;
-- DROP INDEX IF EXISTS idx_usuarios_provincia;
-- DROP INDEX IF EXISTS idx_usuarios_distrito;
-- DROP INDEX IF EXISTS idx_usuarios_dni;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
-- Comandos para verificar que los cambios se aplicaron correctamente

-- Verificar que la función tiene search_path fijo
SELECT proname, proconfig 
FROM pg_proc 
WHERE proname = 'update_updated_at_column';

-- Verificar políticas RLS optimizadas
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename IN ('usuarios', 'carritos', 'carrito_items')
ORDER BY tablename, policyname;

-- Verificar índices
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename = 'carrito_items' 
AND indexname LIKE '%color_id%';
