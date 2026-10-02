// useTypeMeta.js — Metadatos centralizados por tipo de contenido y estado
// Los iconos son componentes de @lucide/vue (SVG profesionales)
import {
  Sparkles,      // Anime
  BookOpen,      // Manga
  Tv,            // Serie
  Film,          // Película
  Layers,        // "Todos" (todos los tipos)
  Star,          // Puntuación
  Anchor,        // Marca Nakama / logo de uso general
} from '@lucide/vue';

export const TIPOS = ['Anime', 'Manga', 'Serie', 'Película'];
export const TIPOS_FILTER = ['Todos', 'Anime', 'Manga', 'Serie', 'Película'];

export const ESTADOS = ['Pendiente', 'Viendo', 'Completado', 'Abandonado', 'En Pausa'];
export const ESTADOS_FILTER = ['Todos', 'Viendo', 'Completado', 'Pendiente', 'Abandonado', 'En Pausa'];

export const SCORE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const STATUS_COLORS = {
  'Viendo':     'var(--state-watching)',
  'Completado': 'var(--state-completed)',
  'Pendiente':  'var(--state-pending)',
  'Abandonado': 'var(--state-dropped)',
  'En Pausa':   'var(--state-paused)',
};

export const TYPE_META = {
  'Anime':    { color: '#FFFFFF',  icon: Sparkles, label: 'Anime'    },
  'Manga':    { color: '#FFFFFF',  icon: BookOpen, label: 'Manga'    },
  'Serie':    { color: '#FFFFFF',  icon: Tv,       label: 'Serie'    },
  'Película': { color: '#FFFFFF',  icon: Film,     label: 'Película' },
};

export const TYPE_TABS_META = {
  'Todos':    { color: '#FFFFFF',  icon: Layers   },
  'Anime':    { color: '#FFFFFF',  icon: Sparkles },
  'Manga':    { color: '#FFFFFF',  icon: BookOpen },
  'Serie':    { color: '#FFFFFF',  icon: Tv       },
  'Película': { color: '#FFFFFF',  icon: Film     },
};

export const STATUS_META = {
  'Viendo':     { color: 'var(--state-watching)',  bg: 'rgba(34,197,94,0.12)'    },
  'Completado': { color: 'var(--state-completed)', bg: 'rgba(212,160,23,0.12)'   },
  'Pendiente':  { color: 'var(--state-pending)',   bg: 'rgba(96,165,250,0.12)'   },
  'Abandonado': { color: 'var(--state-dropped)',   bg: 'rgba(248,113,113,0.12)'  },
  'En Pausa':   { color: 'var(--state-paused)',    bg: 'rgba(167,139,250,0.12)'  },
};

export { Anchor, Star };
