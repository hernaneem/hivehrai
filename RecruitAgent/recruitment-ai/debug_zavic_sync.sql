-- Script de diagnóstico para entender el estado de las tablas ZAVIC
-- Ejecuta estas consultas una por una para entender qué está pasando

-- 1. Verificar cuántos registros hay en cada tabla
SELECT 'zavic_results' as tabla, COUNT(*) as total_registros FROM zavic_results
UNION ALL
SELECT 'zavic_tests' as tabla, COUNT(*) as total_registros FROM zavic_tests;

-- 2. Ver los datos en zavic_results
SELECT 
  id,
  user_id,
  moral_score,
  legalidad_score,
  indiferencia_score,
  corrupcion_score,
  economico_score,
  created_at
FROM zavic_results
ORDER BY created_at DESC
LIMIT 5;

-- 3. Ver los datos en zavic_tests
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
  created_at
FROM zavic_tests
ORDER BY created_at DESC
LIMIT 5;

-- 4. Buscar coincidencias entre candidate_id y user_id
SELECT 
  zt.id as test_id,
  zt.candidate_id,
  zt.status as test_status,
  zt.factor_a as current_factor_a,
  zr.id as result_id,
  zr.user_id,
  zr.moral_score,
  zr.created_at as result_created
FROM zavic_tests zt
LEFT JOIN zavic_results zr ON zt.candidate_id = zr.user_id
ORDER BY zt.created_at DESC;

-- 5. Contar cuántos tests tienen resultados correspondientes
SELECT 
  COUNT(CASE WHEN zr.id IS NOT NULL THEN 1 END) as tests_con_resultados_disponibles,
  COUNT(CASE WHEN zr.id IS NULL THEN 1 END) as tests_sin_resultados_disponibles,
  COUNT(CASE WHEN zt.factor_a IS NOT NULL THEN 1 END) as tests_ya_sincronizados,
  COUNT(*) as total_tests
FROM zavic_tests zt
LEFT JOIN zavic_results zr ON zt.candidate_id = zr.user_id; 