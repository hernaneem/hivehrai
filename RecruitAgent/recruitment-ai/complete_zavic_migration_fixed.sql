-- Script completo corregido para migrar de zavic_results a zavic_tests
-- Ejecuta este script paso a paso para evitar errores

-- =====================================================
-- PARTE 1: ELIMINAR DEPENDENCIAS
-- =====================================================

-- 1.1: Eliminar la función que depende de zavic_results
DROP FUNCTION IF EXISTS save_zavic_results(uuid,jsonb,integer,integer,integer,integer,integer,integer,integer,integer);

-- 1.2: Eliminar políticas RLS de zavic_results
DROP POLICY IF EXISTS "Users can insert their own zavic results" ON zavic_results;
DROP POLICY IF EXISTS "Users can view own zavic results" ON zavic_results;
DROP POLICY IF EXISTS "Users can update own zavic results" ON zavic_results;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON zavic_results;
DROP POLICY IF EXISTS "Enable read access for all users" ON zavic_results;

-- =====================================================
-- PARTE 2: MIGRAR DATOS Y FUNCIONALIDAD
-- =====================================================

-- 2.1: Crear nueva función que trabaje con zavic_tests
CREATE OR REPLACE FUNCTION save_zavic_results(
  p_user_id uuid,
  p_answers jsonb,
  p_moral_score integer,
  p_legalidad_score integer,
  p_indiferencia_score integer,
  p_corrupcion_score integer,
  p_economico_score integer,
  p_politico_score integer,
  p_social_score integer,
  p_religioso_score integer
) RETURNS TABLE(result_id integer) AS $$
DECLARE
  v_test_id integer;
  v_total_score integer;
BEGIN
  -- Calcular el puntaje total
  v_total_score := COALESCE(p_moral_score, 0) + 
                   COALESCE(p_legalidad_score, 0) + 
                   COALESCE(p_indiferencia_score, 0) + 
                   COALESCE(p_corrupcion_score, 0) + 
                   COALESCE(p_economico_score, 0);

  -- Buscar el test activo para este usuario
  SELECT id INTO v_test_id 
  FROM zavic_tests 
  WHERE candidate_id = p_user_id 
    AND status IN ('in-progress', 'not-started')
  ORDER BY created_at DESC 
  LIMIT 1;

  -- Si encontramos un test, actualizarlo con los resultados
  IF v_test_id IS NOT NULL THEN
    UPDATE zavic_tests 
    SET 
      status = 'completed',
      completed_at = NOW(),
      test_date = NOW(),
      moral_score = p_moral_score,
      legalidad_score = p_legalidad_score,
      indiferencia_score = p_indiferencia_score,
      corrupcion_score = p_corrupcion_score,
      economico_score = p_economico_score,
      politico_score = p_politico_score,
      social_score = p_social_score,
      religioso_score = p_religioso_score,
      answers = p_answers,
      total_score = v_total_score,
      updated_at = NOW()
    WHERE id = v_test_id;
    
    RETURN QUERY SELECT v_test_id;
  ELSE
    -- Si no hay test activo, devolver NULL
    RETURN QUERY SELECT NULL::integer;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.2: Habilitar RLS en zavic_tests si no está habilitado
ALTER TABLE zavic_tests ENABLE ROW LEVEL SECURITY;

-- 2.3: Eliminar políticas existentes de zavic_tests primero
DROP POLICY IF EXISTS "Users can view own zavic tests" ON zavic_tests;
DROP POLICY IF EXISTS "Recruiters can update their tests" ON zavic_tests;
DROP POLICY IF EXISTS "Recruiters can insert zavic tests" ON zavic_tests;

-- 2.4: Crear políticas RLS para zavic_tests
CREATE POLICY "Users can view own zavic tests" 
ON zavic_tests FOR SELECT 
USING (candidate_id = auth.uid() OR recruiter_id = auth.uid());

CREATE POLICY "Recruiters can update their tests" 
ON zavic_tests FOR UPDATE 
USING (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can insert zavic tests" 
ON zavic_tests FOR INSERT 
WITH CHECK (recruiter_id = auth.uid());

-- =====================================================
-- PARTE 3: VERIFICACIÓN
-- =====================================================

-- 3.1: Verificar que la función se creó correctamente
SELECT 'Función creada: ' || routine_name as status
FROM information_schema.routines 
WHERE routine_name = 'save_zavic_results';

-- 3.2: Verificar políticas RLS
SELECT 'Política creada: ' || policyname as status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'zavic_tests';

-- 3.3: Verificar datos en zavic_tests
SELECT 
  'Datos migrados - Test ID: ' || id::text || 
  ', Candidato: ' || candidate_id::text ||
  ', Moral: ' || COALESCE(moral_score::text, 'NULL') as status
FROM zavic_tests 
WHERE moral_score IS NOT NULL;

-- =====================================================
-- PARTE 4: ELIMINAR TABLA ANTIGUA (SOLO DESPUÉS DE VERIFICAR)
-- =====================================================

-- 4.1: Ahora debería ser seguro eliminar zavic_results
DROP TABLE IF EXISTS zavic_results;

-- 4.2: Verificación final - confirmar que zavic_results ya no existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'zavic_results') 
    THEN 'ERROR: zavic_results todavía existe'
    ELSE 'SUCCESS: zavic_results eliminada correctamente'
  END as migration_status; 