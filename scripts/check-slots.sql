-- Script para verificar slots en Supabase
-- Ejecuta esto en SQL Editor de Supabase para verificar que los slots existen

-- Verificar slots para el 1 de diciembre de 2025
SELECT 
  id,
  date,
  start_time,
  end_time,
  capacity,
  booked,
  enabled,
  agent_id
FROM availability_slots
WHERE date = '2025-12-01'
  AND enabled = TRUE
ORDER BY start_time;

-- Verificar si hay slots alrededor de las 15:15
SELECT 
  date,
  start_time,
  end_time,
  capacity,
  booked,
  enabled
FROM availability_slots
WHERE date = '2025-12-01'
  AND start_time >= '15:00'
  AND start_time <= '16:00'
  AND enabled = TRUE
ORDER BY start_time;

-- Verificar agente por defecto
SELECT * FROM agents WHERE id = '00000000-0000-0000-0000-000000000001';

-- Contar total de slots habilitados
SELECT COUNT(*) as total_slots
FROM availability_slots
WHERE enabled = TRUE
  AND date >= CURRENT_DATE;

