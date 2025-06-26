-- Script para sincronizar resultados de zavic_results a zavic_tests
-- Este script copia los resultados existentes de zavic_results a los registros correspondientes en zavic_tests

-- PASO 1: Verificar qué datos tenemos (ejecuta estas consultas primero para revisar)
-- SELECT COUNT(*) as total_zavic_results FROM zavic_results;
-- SELECT COUNT(*) as total_zavic_tests FROM zavic_tests;
-- SELECT COUNT(*) as tests_sin_resultados FROM zavic_tests WHERE factor_a IS NULL;

-- PASO 2: Ver qué candidatos tienen resultados pero no están sincronizados
-- SELECT 
--   zt.id as test_id,
--   zt.candidate_id,
--   zt.status as test_status,
--   zt.factor_a as current_factor_a,
--   zr.moral_score as result_moral_score,
--   zr.created_at as result_date
-- FROM zavic_tests zt
-- INNER JOIN zavic_results zr ON zt.candidate_id = zr.user_id
-- WHERE zt.factor_a IS NULL AND zr.moral_score IS NOT NULL;

-- PASO 3: Actualizar los registros (ejecuta esto después de verificar los datos arriba)
UPDATE zavic_tests 
SET 
  status = 'completed',
  completed_at = COALESCE(zavic_tests.completed_at, zavic_results.created_at),
  factor_a = zavic_results.moral_score,
  factor_b = zavic_results.legalidad_score,
  factor_c = zavic_results.indiferencia_score,
  factor_d = zavic_results.corrupcion_score,
  factor_e = zavic_results.economico_score,
  total_score = COALESCE(zavic_results.moral_score, 0) + 
                COALESCE(zavic_results.legalidad_score, 0) + 
                COALESCE(zavic_results.indiferencia_score, 0) + 
                COALESCE(zavic_results.corrupcion_score, 0) + 
                COALESCE(zavic_results.economico_score, 0),
  updated_at = NOW()
FROM zavic_results
WHERE zavic_tests.candidate_id = zavic_results.user_id
  AND zavic_results.moral_score IS NOT NULL; -- Solo si hay resultados válidos

-- PASO 4: Verificar que se actualizaron correctamente
-- SELECT 
--   COUNT(*) as tests_con_resultados,
--   AVG(total_score) as promedio_total_score
-- FROM zavic_tests 
-- WHERE factor_a IS NOT NULL; 