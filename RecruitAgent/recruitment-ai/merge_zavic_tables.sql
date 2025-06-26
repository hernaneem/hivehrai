-- Script para fusionar zavic_results con zavic_tests
-- Vamos a agregar las columnas de zavic_results a zavic_tests y eliminar las redundantes

-- PASO 1: Agregar las columnas de zavic_results a zavic_tests
ALTER TABLE zavic_tests 
ADD COLUMN IF NOT EXISTS moral_score INTEGER,
ADD COLUMN IF NOT EXISTS legalidad_score INTEGER,
ADD COLUMN IF NOT EXISTS indiferencia_score INTEGER,
ADD COLUMN IF NOT EXISTS corrupcion_score INTEGER,
ADD COLUMN IF NOT EXISTS economico_score INTEGER,
ADD COLUMN IF NOT EXISTS politico_score INTEGER,
ADD COLUMN IF NOT EXISTS social_score INTEGER,
ADD COLUMN IF NOT EXISTS religioso_score INTEGER,
ADD COLUMN IF NOT EXISTS answers JSONB,
ADD COLUMN IF NOT EXISTS test_date TIMESTAMP WITH TIME ZONE;

-- PASO 2: Copiar los datos de zavic_results a zavic_tests (corrigiendo la relación de usuario)
-- Como sabemos que el resultado 5d937c6f-c08e-46af-a6af-9937fcb5479f corresponde al candidato 2c1a161c-3f4d-499f-8b56-251216509f3d
UPDATE zavic_tests 
SET 
  status = 'completed',
  completed_at = (SELECT created_at FROM zavic_results WHERE user_id = '5d937c6f-c08e-46af-a6af-9937fcb5479f'),
  test_date = (SELECT test_date FROM zavic_results WHERE user_id = '5d937c6f-c08e-46af-a6af-9937fcb5479f'),
  moral_score = (SELECT moral_score FROM zavic_results WHERE user_id = '5d937c6f-c08e-46af-a6af-9937fcb5479f'),
  legalidad_score = (SELECT legalidad_score FROM zavic_results WHERE user_id = '5d937c6f-c08e-46af-a6af-9937fcb5479f'),
  indiferencia_score = (SELECT indiferencia_score FROM zavic_results WHERE user_id = '5d937c6f-c08e-46af-a6af-9937fcb5479f'),
  corrupcion_score = (SELECT corrupcion_score FROM zavic_results WHERE user_id = '5d937c6f-c08e-46af-a6af-9937fcb5479f'),
  economico_score = (SELECT economico_score FROM zavic_results WHERE user_id = '5d937c6f-c08e-46af-a6af-9937fcb5479f'),
  politico_score = (SELECT politico_score FROM zavic_results WHERE user_id = '5d937c6f-c08e-46af-a6af-9937fcb5479f'),
  social_score = (SELECT social_score FROM zavic_results WHERE user_id = '5d937c6f-c08e-46af-a6af-9937fcb5479f'),
  religioso_score = (SELECT religioso_score FROM zavic_results WHERE user_id = '5d937c6f-c08e-46af-a6af-9937fcb5479f'),
  answers = (SELECT answers FROM zavic_results WHERE user_id = '5d937c6f-c08e-46af-a6af-9937fcb5479f'),
  total_score = (
    SELECT 
      COALESCE(moral_score, 0) + 
      COALESCE(legalidad_score, 0) + 
      COALESCE(indiferencia_score, 0) + 
      COALESCE(corrupcion_score, 0) + 
      COALESCE(economico_score, 0)
    FROM zavic_results 
    WHERE user_id = '5d937c6f-c08e-46af-a6af-9937fcb5479f'
  ),
  updated_at = NOW()
WHERE candidate_id = '2c1a161c-3f4d-499f-8b56-251216509f3d';

-- PASO 3: Verificar que se copiaron los datos correctamente
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
  completed_at,
  test_date
FROM zavic_tests
WHERE candidate_id = '2c1a161c-3f4d-499f-8b56-251216509f3d';

-- PASO 4: Eliminar las columnas redundantes (factor_a, factor_b, etc.)
-- CUIDADO: Solo ejecutar esto después de verificar que el PASO 3 muestra los datos correctos
-- ALTER TABLE zavic_tests 
-- DROP COLUMN IF EXISTS factor_a,
-- DROP COLUMN IF EXISTS factor_b,
-- DROP COLUMN IF EXISTS factor_c,
-- DROP COLUMN IF EXISTS factor_d,
-- DROP COLUMN IF EXISTS factor_e;

-- PASO 5: Opcional - Eliminar la tabla zavic_results si ya no la necesitas
-- DROP TABLE zavic_results; 