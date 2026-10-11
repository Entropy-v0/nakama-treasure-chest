-- ==============================================================================
-- MIGRACIÓN 02: Habilitar tipo 'Libro' en tabla items sin pérdida de datos
-- ==============================================================================
-- Esta migración es 100% segura e incremental. NO altera ni elimina datos existentes.

-- 1. Eliminar la restricción check previa
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_tipo_check;

-- 2. Aplicar la nueva restricción que incluye 'Libro'
ALTER TABLE public.items ADD CONSTRAINT items_tipo_check 
  CHECK (tipo IN ('Anime', 'Manga', 'Serie', 'Película', 'Libro'));

