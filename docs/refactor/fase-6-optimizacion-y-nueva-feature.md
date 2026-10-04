# FASE 6: Optimización de Rendimiento y Construcción del Módulo de Calendario

> **Prioridad:** Expansión (Rendimiento Web y Entrega de Valor)  
> **Objetivo:** Optimizar el peso de los assets y la carga de imágenes, y construir la nueva funcionalidad del **Calendario de Emisiones** sobre la base arquitectónica ya limpia y saneada.

---

## 1. Optimizaciones de Rendimiento Previas

Antes de escribir el código de la nueva funcionalidad, aplicar las optimizaciones de peso identificadas en la auditoría:

### Paso 6.1: Optimizar Imágenes Hero (Hallazgo C8 de la auditoría)
* Convertir `src/assets/fondo_login.jpg` (6,28 MB) y `src/assets/fondo_registro.png` (1,74 MB) a formato **WebP** o **AVIF** con resolución máxima de 1920x1080 y compresión al 80%.
  * Peso estimado objetivo: **< 200 KB** cada una (ahorro de más de 7,5 MB en la primera carga).
* Eliminar el archivo huérfano `src/assets/logo.png` (232 KB) que no se utiliza.

### Paso 6.2: Lazy Loading y Atributos de Rendimiento en Imágenes
En `ItemCard.vue`, `RecentItemCard.vue` y `CoverPreview.vue`:
* Añadir `loading="lazy"` y `decoding="async"` a todas las etiquetas `<img>`.
* Especificar dimensiones fijas de relación de aspecto (`aspect-[2/3]`) para evitar cambios bruscos de diseño (*Cumulative Layout Shift - CLS*).

### Paso 6.3: Optimizar Importación de Fuentes Web
* En lugar de `@import url('https://fonts.googleapis.com/css2...')` en `src/style.css` (que bloquea el renderizado inicial del CSS), mover la precarga a `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
```

---

## 2. Construcción de la Nueva Funcionalidad: Módulo de Calendario

Con la deuda técnica saldada en las Fases 0 a 5, implementar el Calendario de Emisiones siguiendo la guía arquitectónica de [`docs/02-GUIA-COMPONENTES.md`](../02-GUIA-COMPONENTES.md):

### Paso 6.4: Contrato de Tipos (`src/types/calendar.ts`)
```ts
export type DiaSemana = 1 | 2 | 3 | 4 | 5 | 6 | 7 // 1 = Lunes, 7 = Domingo

export interface EmisionItem {
  id: string
  itemId?: number
  titulo: string
  portada?: string
  tipo: 'Anime' | 'Manga' | 'Serie'
  diaSemana: DiaSemana
  horaEstreno?: string // "14:00"
  plataforma?: string  // "Crunchyroll", "Netflix", etc.
  proximoCapitulo?: number
}
```

### Paso 6.5: Servicio y Mock (`src/services/api/calendar.service.ts`)
* Proveer emisiones semanales mock cuando `isSupabaseConfigured` sea `false`.
* Mapear animes y series que el usuario tenga actualmente en estado `'Viendo'` para poblar el calendario automáticamente.

### Paso 6.6: Store de Calendario (`src/stores/calendar.ts`)
* Manejar `emisiones = ref<EmisionItem[]>([])`, `isLoading`, `error`.
* Acciones: `loadSchedule()`, `marcarCapituloVisto()`.

### Paso 6.7: Dumb Components del Calendario (`src/components/calendar/`)
1. **`DayColumn.vue`**: Columna presentacional de un día específico (Lunes, Martes, etc.) con badge de "Hoy".
2. **`BroadcastCard.vue`**: Tarjeta compacta del estreno con portada, hora, plataforma y botón rápido para incrementar el episodio visto en la colección.
3. Si un día no tiene estrenos programados, reutilizar `<EmptyState message="Sin estrenos este día" />`.

### Paso 6.8: Vista Smart (`src/views/CalendarView.vue` o `src/components/Calendar.vue`)
* Grid responsivo de 7 días (en móvil vista de tabs o scroll horizontal).
* Filtro para ver estrenos personales o de toda la tripulación.
* Integrado al menú lateral `Sidebar.vue` y verificado en `pnpm run build`.

---

## 3. Criterios de Aceptación y Verificación

1. El peso total del bundle inicial descargado por el navegador se reduce drásticamente (comprobado en la pestaña Network de DevTools).
2. El Calendario muestra las obras en emisión correspondientes a los días de la semana.
3. Al marcar un capítulo como visto desde el calendario, se sincroniza inmediatamente con el progreso de la obra en el Listado y Dashboard.
4. `pnpm run build` y `pnpm run type-check` completan con 0 errores.
