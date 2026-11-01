/**
 * useCollectionData.ts — Acceso y carga inicial de la colección para las vistas.
 *
 * Centraliza lo que Colección, Calendario y Dashboard repetían:
 *  - Refs reactivas de los stores de items y tripulación (storeToRefs).
 *  - Carga al montar: datos de tripulación + items (los stores ya cachean, no repiten peticiones).
 *
 * Debe llamarse dentro de `<script setup>` (registra un onMounted).
 */
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useItemsStore } from '../stores/items'
import { useCrewStore } from '../stores/crew'

export function useCollectionData(context = 'Vista') {
  const itemsStore = useItemsStore()
  const crewStore = useCrewStore()

  const { items, isLoading, isLoaded } = storeToRefs(itemsStore)
  const { crew, hasCrew } = storeToRefs(crewStore)

  onMounted(async () => {
    // La tripulación se carga en paralelo; no bloquea la carga de items
    crewStore.loadCrewData()

    if (!isLoaded.value) {
      try {
        await itemsStore.loadItems()
      } catch (e) {
        console.warn(`[${context}] Error cargando items:`, e)
      }
    }
  })

  return {
    items,
    isLoading,
    isLoaded,
    crew,
    hasCrew,
  }
}

