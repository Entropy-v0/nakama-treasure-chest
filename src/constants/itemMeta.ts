/**
 * itemMeta.ts — Metadatos y constantes de UI por tipo de contenido, estado y calendario.
 * Centraliza iconos (Lucide), colores CSS tokens, límites numéricos y listas de opciones tipadas.
 */
import {
  Sparkles,      // Anime
  BookOpen,      // Manga
  Tv,            // Serie
  Film,          // Película
  BookText,      // Libro
  Layers,        // "Todos" (todos los tipos)
  Star,          // Puntuación
  Anchor,        // Marca Nakama / logo general
} from '@lucide/vue'
import type { Component } from 'vue'
import type { ItemTipo, ItemEstado, DiaSemana } from '../types/items'

/* ── Tipos de contenido ── */
export const TIPOS: ItemTipo[] = ['Anime', 'Manga', 'Serie', 'Película', 'Libro']
export const TIPOS_FILTER: Array<ItemTipo | 'Todos'> = ['Todos', 'Anime', 'Manga', 'Serie', 'Película', 'Libro']

/* ── Estados de seguimiento ── */
// Orden jerárquico: Viendo → Pendiente → En Pausa → Completado → Abandonado
export const ESTADOS: ItemEstado[] = ['Viendo', 'Pendiente', 'En Pausa', 'Completado', 'Abandonado']
export const ESTADOS_FILTER: Array<ItemEstado | 'Todos'> = ['Todos', 'Viendo', 'Pendiente', 'En Pausa', 'Completado', 'Abandonado']

/* ── Prioridad de estado para ordenar la colección (menor = aparece primero) ── */
export const ESTADO_PRIORITY: Record<ItemEstado, number> = {
  'Viendo': 1,
  'Pendiente': 2,
  'En Pausa': 3,
  'Completado': 4,
  'Abandonado': 5,
}

/* ── Estados "activos": lo que estás siguiendo o tienes pendiente (sorteo "¿Qué vemos hoy?") ── */
export const ESTADOS_ACTIVOS: readonly ItemEstado[] = ['Viendo', 'Pendiente']

/* ── Puntuaciones ── */
export const SCORE_OPTIONS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

/* ── Días de emisión semanal (Calendario) ── */
export const DIAS_SEMANA: DiaSemana[] = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
]

export const DIAS_FILTER: Array<DiaSemana | 'Todos'> = [
  'Todos',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
]

export const DIAS_LABELS: Record<string, string> = {
  Todos: 'Todos',
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
}

/* ── Límites de año para registro ── */
export const ITEM_YEAR_LIMITS = {
  MIN: 1800,
  MAX: 2099,
} as const

/* ── Géneros populares sugeridos ── */
export const POPULAR_GENRES: string[] = [
  'Acción',
  'Aventura',
  'Comedia',
  'Drama',
  'Fantasía',
  'Romance',
  'Ciencia Ficción',
  'Suspense',
  'Misterio',
  'Sobrenatural',
]

/* ── Colores de estado ── */
export const STATUS_COLORS: Record<ItemEstado, string> = {
  'Viendo':     'var(--state-watching)',
  'Completado': 'var(--state-completed)',
  'Pendiente':  'var(--state-pending)',
  'Abandonado': 'var(--state-dropped)',
  'En Pausa':   'var(--state-paused)',
}

export interface TypeFormConfig {
  label: string
  color: string
  icon: Component
  hasProgress: boolean
  progressLabel?: string
  progressShortLabel?: string
  progressPlaceholder?: string
  creatorLabel?: string
  creatorPlaceholder?: string
  publisherLabel?: string
  publisherPlaceholder?: string
  hasBroadcastDay: boolean
}

export type TypeMetaEntry = TypeFormConfig

export const TYPE_CONFIG: Record<ItemTipo, TypeFormConfig> = {
  'Anime': {
    label: 'Anime',
    color: '#FFFFFF',
    icon: Sparkles,
    hasProgress: true,
    progressLabel: 'Episodio actual',
    progressShortLabel: 'Ep.',
    progressPlaceholder: 'ej: 24',
    publisherLabel: 'Estudio de animación',
    publisherPlaceholder: 'ej: MAPPA, Ufotable',
    hasBroadcastDay: true,
  },
  'Manga': {
    label: 'Manga',
    color: '#FFFFFF',
    icon: BookOpen,
    hasProgress: true,
    progressLabel: 'Capítulo actual',
    progressShortLabel: 'Cap.',
    progressPlaceholder: 'ej: 1045',
    creatorLabel: 'Autor / Mangaka',
    creatorPlaceholder: 'ej: Eiichiro Oda, Kentaro Miura',
    publisherLabel: 'Editorial / Revista',
    publisherPlaceholder: 'ej: Shueisha, Shonen Jump',
    hasBroadcastDay: true,
  },
  'Serie': {
    label: 'Serie',
    color: '#FFFFFF',
    icon: Tv,
    hasProgress: true,
    progressLabel: 'Episodio actual',
    progressShortLabel: 'Ep.',
    progressPlaceholder: 'ej: 12',
    creatorLabel: 'Creador / Showrunner',
    creatorPlaceholder: 'ej: Vince Gilligan',
    publisherLabel: 'Cadena / Plataforma',
    publisherPlaceholder: 'ej: HBO, Netflix',
    hasBroadcastDay: true,
  },
  'Película': {
    label: 'Película',
    color: '#FFFFFF',
    icon: Film,
    hasProgress: false,
    creatorLabel: 'Director',
    creatorPlaceholder: 'ej: Christopher Nolan, Hayao Miyazaki',
    publisherLabel: 'Distribuidora / Estudio',
    publisherPlaceholder: 'ej: Warner Bros, Studio Ghibli',
    hasBroadcastDay: false,
  },
  'Libro': {
    label: 'Libro',
    color: '#FFFFFF',
    icon: BookText,
    hasProgress: true,
    progressLabel: 'Página actual',
    progressShortLabel: 'Pág.',
    progressPlaceholder: 'ej: 340',
    creatorLabel: 'Autor / Escritor',
    creatorPlaceholder: 'ej: Gabriel García Márquez, Brandon Sanderson',
    publisherLabel: 'Editorial',
    publisherPlaceholder: 'ej: Planeta, Penguin, Nova',
    hasBroadcastDay: false,
  },
}

export const TYPE_META: Record<ItemTipo, TypeFormConfig> = TYPE_CONFIG

export const TYPE_TABS_META: Record<ItemTipo | 'Todos', { color: string; icon: Component }> = {
  'Todos':    { color: '#FFFFFF',  icon: Layers   },
  'Anime':    { color: '#FFFFFF',  icon: Sparkles },
  'Manga':    { color: '#FFFFFF',  icon: BookOpen },
  'Serie':    { color: '#FFFFFF',  icon: Tv       },
  'Película': { color: '#FFFFFF',  icon: Film     },
  'Libro':    { color: '#FFFFFF',  icon: BookText },
}

export interface StatusMetaEntry {
  color: string
  bg: string
}

export const STATUS_META: Record<ItemEstado, StatusMetaEntry> = {
  'Viendo':     { color: 'var(--state-watching)',  bg: 'rgba(34,197,94,0.12)'    },
  'Completado': { color: 'var(--state-completed)', bg: 'rgba(212,160,23,0.12)'   },
  'Pendiente':  { color: 'var(--state-pending)',   bg: 'rgba(96,165,250,0.12)'   },
  'Abandonado': { color: 'var(--state-dropped)',   bg: 'rgba(248,113,113,0.12)'  },
  'En Pausa':   { color: 'var(--state-paused)',    bg: 'rgba(167,139,250,0.12)'  },
}

export { Anchor, Star }
