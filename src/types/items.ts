/**
 * Contratos y tipos de datos para los elementos de la colección (Items).
 * Mapeo estricto con la tabla 'items' en PostgreSQL / Supabase.
 */

export type ItemTipo = 'Anime' | 'Manga' | 'Serie' | 'Película';

export type ItemEstado =
  | 'Pendiente'
  | 'Viendo'
  | 'Completado'
  | 'Abandonado'
  | 'En Pausa';

import type { ProfileSummary } from './crew';

export interface Item {
  id: number;
  user_id?: string | null;
  crew_id?: string | null;
  titulo: string;
  tipo: ItemTipo;
  portada?: string | null;
  estado: ItemEstado;
  puntuacion?: number | null;
  generos?: string[] | null;
  nota?: string | null;
  anio?: number | null;
  autor?: string | null;
  estudio?: string | null;
  categoria?: string | null;
  etiquetas?: string[] | null;
  link?: string | null;
  progreso?: number | null;
  created_at?: string;
  updated_at?: string;
  creator_profile?: ProfileSummary | null;
}

export type ItemInsert = Omit<Item, 'id' | 'created_at' | 'updated_at'> & {
  id?: number;
};

export type ItemUpdate = Partial<ItemInsert>;

export interface ItemFilters {
  tipo?: ItemTipo | 'Todos';
  estado?: ItemEstado | 'Todos';
  search?: string;
  scope?: 'todos' | 'personal' | 'tripulacion';
  crewId?: string | null;
  page?: number;
  perPage?: number;
}
