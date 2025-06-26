-- Script para manejar dependencias de zavic_results y migrar a zavic_tests

-- PASO 1: Identificar todas las dependencias de zavic_results
SELECT 
  schemaname,
  tablename,
  attname,
  typename
FROM pg_attribute 
JOIN pg_type ON pg_attribute.atttypid = pg_type.oid
JOIN pg_class ON pg_attribute.attrelid = pg_class.oid
JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
WHERE typename = 'zavic_results';

-- PASO 2: Ver la función que depende de zavic_results
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_definition LIKE '%zavic_results%';

-- PASO 3: Ver la definición completa de la función save_zavic_results
\df+ save_zavic_results

-- PASO 4: Buscar todas las políticas RLS y triggers relacionados con zavic_results
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'zavic_results';

-- PASO 5: Ver triggers en zavic_results
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'zavic_results';

-- PASO 6: Ver índices en zavic_results
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'zavic_results';

-- PASO 7: Buscar foreign keys que referencien zavic_results
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (ccu.table_name = 'zavic_results' OR tc.table_name = 'zavic_results'); 