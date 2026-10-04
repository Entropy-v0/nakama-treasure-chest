# FASE 3: Stores de Pinia y Control de Caché

> **Prioridad:** Media (Arquitectura de Estado y Optimización de Red)  
> **Objetivo:** Unificar la gestión de estado de la colección bajo Pinia, eliminar listeners globales huérfanos e incorporar control de caché para no repetir consultas innecesarias en cada navegación.

---

## 1. Problemas que resuelve esta fase

1. **Estado global inconsistente (Hallazgo A6 de la auditoría):**  
   Mientras que `auth` y `crew` son stores oficiales de Pinia, `items` es un `ref` suelto definido a nivel de módulo en `src/composables/useItems.ts`. Esto crea un patrón fragmentado, dificulta la depuración con Vue DevTools y no permite reinicios limpios.
2. **Listener con efectos secundarios en import (Hallazgo A6 de la auditoría):**  
   Al final de `useItems.ts`, se suscribe un listener a `authService.onAuthStateChange` directamente en el cuerpo del módulo. Esto provoca ejecuciones descontroladas al importar el archivo en tests o durante Hot Module Replacement (HMR).
3. **Peticiones redundantes continuas (Hallazgo C7 de la auditoría):**  
   * `loadItems()` se disparaba en cada evento `TOKEN_REFRESHED` (provocando re-descargas periódicas completas).
   * `loadCrewData()` se invocaba en el `onMounted` de `Dashboard.vue`, `ItemList.vue` y `CrewView.vue`, disparando 3 o 4 peticiones a PostgreSQL cada vez que el usuario cambiaba de pestaña en el menú.

---

## 2. Acciones y Pasos de Implementación

### Paso 3.1: Crear `src/stores/items.ts` con Pinia
Mover el estado singleton reactivo de los ítems a un store de Pinia formal:
```ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Item, ItemInsert, ItemUpdate, ItemFilters } from '../types/items'
import { itemsService } from '../services/supabase/items.service'
import { useAuthStore } from './auth'

export const useItemsStore = defineStore('items', () => {
  const items = ref<Item[]>([])
  const totalCount = ref<number>(0)
  const isLoaded = ref<boolean>(false)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

  const loadItems = async (filters: ItemFilters = {}, force = false) => {
    // Si ya están cargados y no se fuerza la recarga ni se aplican filtros específicos, retornar caché
    if (isLoaded.value && !force && Object.keys(filters).length === 0) {
      return items.value
    }

    isLoading.value = true
    error.value = null
    try {
      const res = await itemsService.fetchItems(filters)
      items.value = res.data
      totalCount.value = res.count
      isLoaded.value = true
      return res.data
    } catch (err: any) {
      error.value = err.message || 'Error al cargar colección'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addItem = async (newItem: ItemInsert) => {
    const created = await itemsService.createItem(newItem)
    items.value.unshift(created)
    totalCount.value++
    return created
  }

  const updateItem = async (id: number, updates: ItemUpdate) => {
    const updated = await itemsService.updateItem(id, updates)
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) {
      items.value[idx] = { ...updated }
    }
    return updated
  }

  const deleteItem = async (id: number) => {
    await itemsService.deleteItem(id)
    items.value = items.value.filter(i => i.id !== id)
    totalCount.value = Math.max(0, totalCount.value - 1)
  }

  const reset = () => {
    items.value = []
    totalCount.value = 0
    isLoaded.value = false
    error.value = null
  }

  watch(() => authStore.user?.id, (newId, oldId) => {
    if (newId !== oldId) reset()
  })

  return {
    items,
    totalCount,
    isLoaded,
    isLoading,
    error,
    loadItems,
    addItem,
    updateItem,
    deleteItem,
    reset,
  }
})
```

### Paso 3.2: Mantener `src/composables/useItems.ts` como Fachada (Zero Regression)
Para no romper ningún componente existente, `useItems.ts` simplemente delega a `useItemsStore`:
```ts
import { storeToRefs } from 'pinia'
import { useItemsStore } from '../stores/items'

export function useItems() {
  const store = useItemsStore()
  const { items, totalCount, isLoaded, isLoading, error } = storeToRefs(store)

  return {
    items,
    data: items,
    totalCount,
    isLoaded,
    isLoading,
    error,
    loadItems: store.loadItems,
    fetchItems: store.loadItems,
    addItem: store.addItem,
    updateItem: store.updateItem,
    deleteItem: store.deleteItem,
  }
}
```

### Paso 3.3: Control de Caché en `useCrewStore`
En `src/stores/crew.ts`, agregar la bandera `isLoaded`:
```ts
const isLoaded = ref(false)

const loadCrewData = async (force = false) => {
  if (isLoaded.value && !force) return
  // Ejecutar carga...
  isLoaded.value = true
}
```
Al crear tripulación, aceptar invitaciones o salir, hacer `isLoaded.value = false` o actualizar reactivamente el estado.

---

## 3. Criterios de Aceptación y Verificación

1. Navegar entre **Dashboard**, **Listado** y **Tripulación**: no deben dispararse consultas de red repetidas a la base de datos si los datos ya fueron cargados.
2. Al añadir o editar una obra, el cambio debe verse reflejado instantáneamente en el Dashboard y en el Listado sin necesidad de recargar la página.
3. Verificar que la pestaña de Pinia en las herramientas de desarrollo de Vue muestre los tres stores: `auth`, `crew` e `items`.
