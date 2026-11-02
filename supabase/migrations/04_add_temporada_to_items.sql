-- ==============================================================================
-- Migración 04: Agregar columnas temporada y fecha_terminado a la tabla items
-- Permite registrar el número de temporada y la fecha de finalización opcional.
-- ==============================================================================

alter table public.items 
add column if not exists temporada integer,
add column if not exists fecha_terminado date;

comment on column public.items.temporada is 'Número de temporada actual para series y animes';
comment on column public.items.fecha_terminado is 'Fecha en la que se completó la obra (opcional)';


