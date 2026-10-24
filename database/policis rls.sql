-- =================================================================================
-- CREACIÓN DE LAS POLÍTICAS DE RLS (Row Level Security) PARA LA TABLA INGREDIENTES
-- =================================================================================

-- 1. SELECT: Solo permite ver los ingredientes que NO están eliminados (isdeleted = false o nulos por seguridad)
DROP POLICY IF EXISTS "Permitir lectura de ingredientes activos" ON ingredientes;
CREATE POLICY "Permitir lectura de ingredientes activos"
ON ingredientes
FOR SELECT
USING (
  auth.role() = 'authenticated' 
  AND (is_deleted = false OR is_deleted IS NULL)
);

-- 2. INSERT: Permite a los usuarios autenticados crear nuevos ingredientes
DROP POLICY IF EXISTS "Permitir insercion a usuarios autenticados" ON ingredientes;
CREATE POLICY "Permitir insercion a usuarios autenticados"
ON ingredientes
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
);

-- 3. UPDATE: Permite a los usuarios autenticados actualizar datos y realizar el soft delete (cambiar isdeleted a true)
DROP POLICY IF EXISTS "Permitir actualizacion a usuarios autenticados" ON ingredientes;
CREATE POLICY "Permitir actualizacion a usuarios autenticados"
ON ingredientes
FOR UPDATE
USING (
  auth.role() = 'authenticated'
)
WITH CHECK (
  auth.role() = 'authenticated'
);