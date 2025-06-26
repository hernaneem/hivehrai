-- Script final de limpieza para eliminar columnas redundantes de zavic_tests
-- Solo ejecutar después de confirmar que todo funciona correctamente

-- PASO 1: Verificar que las nuevas columnas tienen datos
SELECT 
  id,
  candidate_id,
  status,
  moral_score,
  legalidad_score,
  indiferencia_score,
  corrupcion_score,
  economico_score,
  politico_score,
  social_score,
  religioso_score,
  total_score,
  -- Columnas antiguas que se van a eliminar
  factor_a,
  factor_b,
  factor_c,
  factor_d,
  factor_e
FROM zavic_tests
WHERE status = 'completed';

-- PASO 2: Solo ejecutar esto después de confirmar que todo funciona
-- Eliminar las columnas factor_a, factor_b, factor_c, factor_d, factor_e
ALTER TABLE zavic_tests 
DROP COLUMN IF EXISTS factor_a,
DROP COLUMN IF EXISTS factor_b,
DROP COLUMN IF EXISTS factor_c,
DROP COLUMN IF EXISTS factor_d,
DROP COLUMN IF EXISTS factor_e;

-- PASO 3: Verificar la estructura final de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'zavic_tests' 
ORDER BY ordinal_position; 