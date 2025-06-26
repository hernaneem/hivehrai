-- Script de sincronización mejorado para zavic_results -> zavic_tests
-- Ejecuta este script paso a paso

-- PASO 1: Mostrar qué se va a actualizar (solo consulta, no actualiza nada)
SELECT 
  zt.id as test_id,
  zt.candidate_id,
  zt.status as estado_actual,
  zt.factor_a as factor_a_actual,
  zr.id as result_id,
  zr.moral_score as nuevo_factor_a,
  zr.legalidad_score as nuevo_factor_b,
  zr.indiferencia_score as nuevo_factor_c,
  zr.corrupcion_score as nuevo_factor_d,
  zr.economico_score as nuevo_factor_e,
  (COALESCE(zr.moral_score, 0) + 
   COALESCE(zr.legalidad_score, 0) + 
   COALESCE(zr.indiferencia_score, 0) + 
   COALESCE(zr.corrupcion_score, 0) + 
   COALESCE(zr.economico_score, 0)) as nuevo_total_score
FROM zavic_tests zt
INNER JOIN zavic_results zr ON zt.candidate_id = zr.user_id
WHERE zr.moral_score IS NOT NULL;

-- PASO 2: Si la consulta anterior muestra datos que quieres sincronizar, ejecuta este UPDATE
UPDATE zavic_tests 
SET 
  status = 'completed',
  completed_at = COALESCE(zavic_tests.completed_at, zavic_results.created_at),
  factor_a = zavic_results.moral_score,
  factor_b = zavic_results.legalidad_score,
  factor_c = zavic_results.indiferencia_score,
  factor_d = zavic_results.corrupcion_score,
  factor_e = zavic_results.economico_score,
  total_score = (COALESCE(zavic_results.moral_score, 0) + 
                COALESCE(zavic_results.legalidad_score, 0) + 
                COALESCE(zavic_results.indiferencia_score, 0) + 
                COALESCE(zavic_results.corrupcion_score, 0) + 
                COALESCE(zavic_results.economico_score, 0)),
  updated_at = NOW()
FROM zavic_results
WHERE zavic_tests.candidate_id = zavic_results.user_id
  AND zavic_results.moral_score IS NOT NULL;

-- PASO 3: Verificar los resultados después de la actualización
SELECT 
  zt.id as test_id,
  zt.candidate_id,
  zt.status,
  zt.factor_a,
  zt.factor_b,
  zt.factor_c,
  zt.factor_d,
  zt.factor_e,
  zt.total_score,
  zt.completed_at,
  zt.updated_at
FROM zavic_tests zt
WHERE zt.factor_a IS NOT NULL
ORDER BY zt.updated_at DESC; 