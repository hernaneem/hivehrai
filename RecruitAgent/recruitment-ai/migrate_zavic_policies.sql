-- Script para migrar políticas RLS y otros objetos dependientes de zavic_results

-- PASO 1: Ver todas las políticas de zavic_results
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'zavic_results';

-- PASO 2: Eliminar políticas RLS de zavic_results si existen
DROP POLICY IF EXISTS "Users can insert their own zavic results" ON zavic_results;
DROP POLICY IF EXISTS "Users can view own zavic results" ON zavic_results;
DROP POLICY IF EXISTS "Users can update own zavic results" ON zavic_results;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON zavic_results;
DROP POLICY IF EXISTS "Enable read access for all users" ON zavic_results;

-- PASO 3: Crear políticas RLS equivalentes para zavic_tests (si no existen)
-- Política para que los usuarios puedan ver sus propios tests
CREATE POLICY IF NOT EXISTS "Users can view own zavic tests" 
ON zavic_tests FOR SELECT 
USING (candidate_id = auth.uid() OR recruiter_id = auth.uid());

-- Política para que los recruiters puedan actualizar tests de sus candidatos
CREATE POLICY IF NOT EXISTS "Recruiters can update their tests" 
ON zavic_tests FOR UPDATE 
USING (recruiter_id = auth.uid());

-- Política para insertar tests
CREATE POLICY IF NOT EXISTS "Recruiters can insert zavic tests" 
ON zavic_tests FOR INSERT 
WITH CHECK (recruiter_id = auth.uid());

-- PASO 4: Verificar que las políticas se crearon correctamente
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'zavic_tests';

-- PASO 5: Verificar que RLS está habilitado en zavic_tests
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'zavic_tests';

-- PASO 6: Habilitar RLS en zavic_tests si no está habilitado
ALTER TABLE zavic_tests ENABLE ROW LEVEL SECURITY; 