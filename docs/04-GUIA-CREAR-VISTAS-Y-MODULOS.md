# Guía: cómo agregar vistas y funcionalidades en Nakama

Esta guía explica **dónde vive cada cosa** y **cómo agregar algo nuevo sin duplicar código**. Si al abrir un archivo no sabes en qué capa estás, empieza por la sección 1.

---

## 1. Las capas (de abajo hacia arriba)

```
Supabase / AniList
      │
      ▼
services/      → Hablan con el exterior (SQL, APIs). Sin estado, sin Vue.
      │
      ▼
stores/        → Guardan los datos en memoria (Pinia) y llaman a los servicios.
      │
      ▼
composables/   → Lógica reutilizable sobre esos datos (filtros, alertas, portapapeles…).
      │
      ▼
views/         → Orquestan una pantalla: leen stores, usan composables, pasan props.
      │
      ▼
components/    → Pintan UI. Reciben props, emiten eventos. No conocen stores ni Supabase.
```

**Regla:** cada capa solo llama a la de abajo. Una vista nunca llama a un servicio directamente; un componente nunca llama a un store.

---

## 2. Qué hace cada archivo `.ts` (una responsabilidad cada uno)

| Archivo | Única responsabilidad |
| :--- | :--- |
| `types/items.ts`, `types/crew.ts`, `types/auth.ts`, `types/database.ts` | Contratos de datos. Si cambias una columna en Supabase, cambias aquí. |
| `services/supabase/client.ts` | Crear el cliente de Supabase y saber si está configurado. |
| `services/supabase/items.service.ts` | CRUD de la tabla `items` (o mocks en memoria si no hay Supabase). |
| `services/supabase/crew.service.ts` | Tripulaciones, miembros e invitaciones. |
| `services/supabase/auth.service.ts` | Login, registro, OAuth (Google/Discord) y perfil. |
| `services/api/mediaSearch.service.ts` | Buscar portadas/sinopsis en AniList. |
| `stores/items.ts` | Guardar la colección en memoria con caché y sincronizar el CRUD. **No filtra.** |
| `stores/crew.ts` | Estado de la tripulación del usuario. |
| `stores/auth.ts` | Sesión y usuario actual. |
| `composables/useItemFilters.ts` | **El único lugar donde se filtran, cuentan y paginan items.** |
| `composables/useAlert.ts` | Modal de alerta/confirmación global. |
| `composables/useClipboard.ts` | Copiar al portapapeles con estado "copiado". |
| `composables/useMediaSearch.ts` | Búsqueda con debounce contra AniList para el formulario. |
| `composables/useTypeMeta.js` | Constantes visuales: tipos, estados, colores, iconos. |
| `data/mockItems.ts`, `mocks/mockUser.ts` | Datos de prueba cuando no hay Supabase configurado. |
| `router/index.ts` | Rutas y guardas de autenticación. |

> [!IMPORTANT]
> Si te encuentras escribiendo `items.filter(...)` en una vista, un store o un servicio, para: esa lógica va en `useItemFilters.ts`.

---

## 3. El motor de filtros: `useItemFilters.ts`

Tiene dos piezas:

- **`matchesItemFilters(item, criterios)`** — función pura que decide si un item pasa. Es la regla de negocio.
- **`useItemFilters(items, opciones)`** — composable que guarda los filtros activos (reactivos) y te devuelve los resultados.

### Lo que te devuelve

| Grupo | Propiedades |
| :--- | :--- |
| Filtros activos (`ref`, sirven con `v-model`) | `activeTipo`, `activeEstado`, `activeDia`, `activeScope`, `searchQuery` |
| Resultados | `filteredItems`, `paginatedItems`, `currentPage`, `totalPages` |
| Conteos | `conteoPorTipo`, `conteoPorEstado`, `conteoPorDia` |
| Acciones | `setTipo`, `setEstado`, `setDia`, `clearFilters` |
| Constantes | `diasList`, `labels` |

Comportamientos que ya vienen incluidos:
- Cambiar cualquier filtro **vuelve a la página 1** automáticamente.
- `clearFilters()` vuelve a los **filtros iniciales de la vista**, no a "Todos". Así el Calendario nunca pierde su regla de `estado: 'Viendo'`.
- Cada conteo respeta todos los filtros activos **menos el suyo**: el badge de "Martes" dice cuántos verías si eliges martes.

### Cómo lo usa cada vista hoy

```ts
// Colección: filtros libres + paginación
useItemFilters(items, { hasCrew, itemsPerPage: 18 })

// Calendario: reglas fijas de emisión
useItemFilters(items, {
  hasCrew,
  initialFilters: { estado: 'Viendo', diaSemana: getDiaActual(), soloConDia: true },
})

// Dashboard: solo ámbito + conteos
const { activeScope, filteredItems, conteoPorTipo, conteoPorEstado } = useItemFilters(items, { hasCrew })
```

Cada vista **solo destructura lo que usa**. No hace falta crear un composable nuevo por vista.

---

## 4. Receta: agregar una vista nueva

Ejemplo: una vista "Favoritos" que muestre los items con puntuación 9 o más.

### Paso 1 — ¿El filtro ya existe?
Revisa `ItemFilterCriteria` en `useItemFilters.ts`. Si no existe un criterio de puntuación, agrégalo (ver sección 5).

### Paso 2 — Crea `src/views/FavoritosView.vue`

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useItemsStore } from '../stores/items'
import { useCrewStore } from '../stores/crew'
import { useItemFilters } from '../composables/useItemFilters'
import { TYPE_META, STATUS_COLORS } from '../composables/useTypeMeta'

import PageContainer from '../components/layout/PageContainer.vue'
import ItemCard from '../components/collection/ItemCard.vue'
import EmptyState from '../components/ui/EmptyState.vue'

// 1. Datos: directo del store
const itemsStore = useItemsStore()
const { items, isLoading, isLoaded } = storeToRefs(itemsStore)
const { hasCrew } = storeToRefs(useCrewStore())

onMounted(() => {
  if (!isLoaded.value) itemsStore.loadItems()
})

// 2. Lógica: el motor centralizado con la regla de esta vista
const { filteredItems } = useItemFilters(items, {
  hasCrew,
  initialFilters: { puntuacionMin: 9 },
})
</script>

<template>
  <!-- 3. Presentación: solo componentes y datos ya calculados -->
  <PageContainer title="Favoritos" subtitle="Lo mejor de tu colección" :loading="isLoading">
    <div v-if="filteredItems.length" class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 max-md:grid-cols-2">
      <ItemCard
        v-for="item in filteredItems"
        :key="item.id"
        :item="item"
        :type-meta="TYPE_META[item.tipo] || {}"
        :status-color="STATUS_COLORS[item.estado]"
      />
    </div>
    <EmptyState v-else message="Aún no tienes favoritos." />
  </PageContainer>
</template>
```

Fíjate en la estructura del `<script>`: **1. datos → 2. lógica → 3. (template) presentación**. Mantén ese orden en todas las vistas.

### Paso 3 — Registra la ruta en `src/router/index.ts`

```ts
{
  path: '/favoritos',
  name: 'favoritos',
  component: () => import('../views/FavoritosView.vue'),
  meta: { requiresAuth: true },
},
```

### Paso 4 — Agrega el enlace en `src/components/Sidebar.vue`
(escritorio y barra inferior móvil).

---

## 5. Receta: agregar un filtro nuevo

Siguiendo el ejemplo de `puntuacionMin`. Solo se toca **un archivo**: `useItemFilters.ts`.

1. Añade el campo al contrato:
   ```ts
   export interface ItemFilterCriteria {
     // ...
     puntuacionMin?: number
   }
   ```
2. Añade la regla en `matchesItemFilters`:
   ```ts
   if (c.puntuacionMin && (item.puntuacion ?? 0) < c.puntuacionMin) return false
   ```
3. Pásalo dentro de `criteria` en `useItemFilters` (si quieres que sea reactivo, crea un `ref` como los demás; si es una regla fija, léelo de `initial` como hace `soloConDia`).

Listo: Colección, Calendario y Dashboard pueden usarlo sin cambios extra.

---

## 6. Receta: agregar un campo nuevo a los items

Ejemplo real: así se agregó `dia_semana`.

1. **Base de datos:** `alter table` en Supabase y reflejarlo en `supabase/schema.sql`.
2. **Tipo:** añadir el campo en `types/items.ts` (`Item`).
3. **Mocks:** añadirlo en `data/mockItems.ts` para que funcione sin Supabase.
4. **Formulario:** añadir el input en `AddItemView.vue` y en el modo edición de `ItemDetailsModal.vue`.
5. **¿Se filtra por él?** → sección 5.

El servicio y el store **no cambian**: trabajan con `Item` completo.

---

## 7. Qué NO hacer (y dónde va en su lugar)

| ❌ En la vista | ✅ Dónde va |
| :--- | :--- |
| `items.filter(i => i.estado === 'Viendo')` | Criterio en `useItemFilters` (`initialFilters`) |
| Contar items por tipo/estado/día a mano | `conteoPorTipo` / `conteoPorEstado` / `conteoPorDia` |
| `:class` con ternarios de 3+ líneas | Un componente en `components/` con prop `active` |
| Un modal o formulario de 80+ líneas dentro del template | Su propio componente en `components/<modulo>/` |
| Llamar a `itemsService` desde la vista | Acción en el store (`itemsStore.addItem`, etc.) |
| Crear `useMiVista.ts` que solo reenvía datos del store | Usar el store directamente con `storeToRefs` |

---

## 8. Checklist antes de hacer commit

1. ¿Mi vista tiene algún `.filter()` de items? → muévelo a `useItemFilters.ts`.
2. ¿El `<template>` pasa de ~100 líneas? → extrae secciones a componentes.
3. ¿Creé un `.ts` que solo reenvía otro? → bórralo y usa el original.
4. Compila sin errores:
   ```bash
   pnpm run type-check
   pnpm run build
   ```

---

## 9. Pendientes conocidos

Estas vistas todavía no cumplen del todo esta guía y se refactorizarán aparte:

- **`CrewView.vue`** (~720 líneas): mezcla 7 secciones en un solo archivo. Dividir en `components/crew/`.
- **`DashboardView.vue`**: el modal "¿Qué vemos hoy?" sigue incrustado en el template; extraer a `components/dashboard/RandomPickerModal.vue`.
- **`ItemListView.vue`**: el paginador está escrito en el template; extraer a `components/ui/PaginationBar.vue`.
- **`AddItemView.vue`**: selector de días y autocompletado incrustados; extraer a componentes.
