-- Script para migrar la función save_zavic_results de zavic_results a zavic_tests

-- PASO 1: Ver la función actual (ejecuta esto primero para ver su definición)
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'save_zavic_results';

-- PASO 2: Eliminar la función actual que depende de zavic_results
DROP FUNCTION IF EXISTS save_zavic_results(uuid,jsonb,integer,integer,integer,integer,integer,integer,integer,integer);

-- PASO 3: Crear nueva función que actualice zavic_tests directamente
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

-- PASO 4: Verificar que la función se creó correctamente
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'save_zavic_results';

-- PASO 5: Ahora intentar eliminar zavic_results (debe funcionar)
-- DROP TABLE zavic_results; 