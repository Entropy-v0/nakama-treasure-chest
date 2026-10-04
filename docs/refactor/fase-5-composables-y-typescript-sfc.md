# FASE 5: Migración a TypeScript en SFC y Composables de Utilidad

> **Prioridad:** Media (Calidad de Código y Clean Architecture)  
> **Objetivo:** Migrar los Single File Components (.vue) a `<script setup lang="ts">` de forma ordenada (de las hojas hacia la raíz) y extraer lógica repetida en composables especializados.

---

## 1. Problemas que resuelve esta fase

1. **Componentes sin tipar en JavaScript (Hallazgo C2 de la auditoría):**  
   Actualmente los 27 archivos `.vue` usan `<script setup>` sin `lang="ts"`. Los props se definen mediante validadores de runtime de Vue (`type: Object`), perdiendo autocompletado y verificación estricta.
2. **Duplicación de lógica utilitaria (Hallazgo A4 de la auditoría):**  
   * `copyLink` se encuentra copiado textualmente en 3 componentes distintos (`ItemCard`, `RecentItemCard`, `ItemDetailsModal`).
   * Búsqueda asíncrona con autocompletado en `AddItem.vue` sufre de posibles condiciones de carrera (falta `AbortController`).
   * Patrón repetitivo de `try / catch / showAlert / finally { isActionLoading = false }` duplicado en más de 15 funciones de la tripulación y formularios.

---

## 2. Acciones y Pasos de Implementación

### Paso 5.1: Crear Composables de Utilidad Reutilizables

#### 1. `src/composables/useClipboard.ts`
Centralizar la copia al portapapeles con temporizador de feedback:
```ts
import { ref, onScopeDispose } from 'vue'

export function useClipboard(timeout = 1800) {
  const copied = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  const copy = async (text: string | null | undefined): Promise<boolean> => {
    if (!text) return false
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      clearTimeout(timer)
      timer = setTimeout(() => { copied.value = false }, timeout)
      return true
    } catch {
      return false
    }
  }

  onScopeDispose(() => clearTimeout(timer))

  return { copied, copy }
}
```

#### 2. `src/composables/useMediaSearch.ts`
Autocompletado con *debounce* y cancelación mediante `AbortController` (resuelve Hallazgo A11):
```ts
import { ref, onScopeDispose } from 'vue'
import { mediaSearchService, type MediaSearchResult } from '../services/api/mediaSearch.service'
import type { ItemTipo } from '../types/items'

export function useMediaSearch(delay = 450) {
  const results = ref<MediaSearchResult[]>([])
  const isSearching = ref(false)
  let timeout: ReturnType<typeof setTimeout> | undefined
  let abortController: AbortController | null = null

  const search = (query: string, tipo: ItemTipo) => {
    clearTimeout(timeout)
    abortController?.abort()

    if (!query || query.trim().length < 2) {
      results.value = []
      return
    }

    timeout = setTimeout(async () => {
      abortController = new AbortController()
      isSearching.value = true
      try {
        const data = await mediaSearchService.search(query, tipo, abortController.signal)
        results.value = data
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Error en búsqueda de medios:', err)
        }
      } finally {
        isSearching.value = false
      }
    }, delay)
  }

  onScopeDispose(() => {
    clearTimeout(timeout)
    abortController?.abort()
  })

  return { results, isSearching, search }
}
```

### Paso 5.2: Migración Progresiva a `lang="ts"`
Seguir estrictamente el orden de hojas hacia la raíz:
1. **Primitivas UI:** `src/components/ui/` (`EmptyState.vue`, `LoadingScreen.vue`).
2. **Micro-selectores:** `src/components/items/` (`TypeSelector.vue`, `StatusSelector.vue`, `ScoreSelector.vue`, `CoverPreview.vue`).
3. **Colección y Dashboard:** `src/components/collection/` (`ItemCard.vue`, `FilterTabs.vue`, `StatusFilter.vue`, `SearchBar.vue`) y `src/components/dashboard/` (`StatCard.vue`, `StatusPillBar.vue`, `RecentItemCard.vue`).
4. **Vistas principales:** `src/views/`.

Ejemplo de componente tipado estricto:
```vue
<script setup lang="ts">
import type { Item } from '@/types/items'
import { useClipboard } from '@/composables/useClipboard'

interface Props {
  item: Item
  statusColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  statusColor: 'var(--zoro-green)',
})

const emit = defineEmits<{
  select: [item: Item]
}>()

const { copied, copy } = useClipboard()
</script>
```

---

## 3. Criterios de Aceptación y Verificación

1. `pnpm run type-check` pasa con 0 errores y 0 advertencias en los componentes migrados.
2. Búsqueda en `AddItem`: escribir rápidamente palabras diferentes debe cancelar las peticiones pendientes sin congelar la interfaz ni mostrar resultados de búsquedas anteriores.
3. Copiar enlaces desde el grid de colección debe seguir funcionando con el mensaje de "copiado" temporal.
