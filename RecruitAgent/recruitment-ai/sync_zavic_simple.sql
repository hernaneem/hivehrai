-- Script simple para sincronizar 1 registro de zavic_results a zavic_tests

-- PASO 1: Ver los datos actuales lado a lado
SELECT 
  'zavic_tests' as tabla,
  id,
  candidate_id as user_id,
  status,
  factor_a,
  factor_b,
  factor_c,
  factor_d,
  factor_e,
  total_score
FROM zavic_tests

UNION ALL

SELECT 
  'zavic_results' as tabla,
  id,
  user_id,
  'N/A' as status,
  moral_score as factor_a,
  legalidad_score as factor_b,
  indiferencia_score as factor_c,
  corrupcion_score as factor_d,
  economico_score as factor_e,
  (COALESCE(moral_score, 0) + COALESCE(legalidad_score, 0) + COALESCE(indiferencia_score, 0) + COALESCE(corrupcion_score, 0) + COALESCE(economico_score, 0)) as total_score
FROM zavic_results;

-- PASO 2: Verificar si los user_id coinciden
SELECT 
  zt.candidate_id as zavic_tests_candidate_id,
  zr.user_id as zavic_results_user_id,
  CASE 
    WHEN zt.candidate_id = zr.user_id THEN 'COINCIDEN ✅' 
    ELSE 'NO COINCIDEN ❌' 
  END as coincidencia
FROM zavic_tests zt, zavic_results zr;

-- PASO 3: Si coinciden, ejecutar este UPDATE
UPDATE zavic_tests 
SET 
  status = 'completed',
  completed_at = (SELECT created_at FROM zavic_results LIMIT 1),
  factor_a = (SELECT moral_score FROM zavic_results LIMIT 1),
  factor_b = (SELECT legalidad_score FROM zavic_results LIMIT 1),
  factor_c = (SELECT indiferencia_score FROM zavic_results LIMIT 1),
  factor_d = (SELECT corrupcion_score FROM zavic_results LIMIT 1),
  factor_e = (SELECT economico_score FROM zavic_results LIMIT 1),
  total_score = (
    SELECT 
      COALESCE(moral_score, 0) + 
      COALESCE(legalidad_score, 0) + 
      COALESCE(indiferencia_score, 0) + 
      COALESCE(corrupcion_score, 0) + 
      COALESCE(economico_score, 0)
    FROM zavic_results 
    LIMIT 1
  ),
  updated_at = NOW()
WHERE candidate_id = (SELECT user_id FROM zavic_results LIMIT 1);

-- PASO 4: Verificar que se actualizó
SELECT 
  id,
  candidate_id,
  status,
  factor_a,
  factor_b,
  factor_c,
  factor_d,
  factor_e,
  total_score,
  completed_at,
  updated_at
FROM zavic_tests; 