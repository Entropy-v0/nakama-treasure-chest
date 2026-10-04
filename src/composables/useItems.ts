/**
 * useItems.ts — Composable Fachada para la colección de ítems (Data Layer)
 * Conecta directamente con useItemsStore de Pinia para mantener retrocompatibilidad
 * y garantizar el flujo unidireccional y control de caché.
 */
import { storeToRefs } from 'pinia';
import { useItemsStore } from '../stores/items';

export function useItems() {
  const store = useItemsStore();
  const { items, totalCount, isLoading, isLoaded, error } = storeToRefs(store);

  return {
    // Estado reactivo sincronizado con Pinia
    items,
    data: items,
    totalCount,
    isLoading,
    isLoaded,
    error,

    // Operaciones
    loadItems: store.loadItems,
    fetchItems: store.loadItems,
    addItem: store.addItem,
    updateItem: store.updateItem,
    deleteItem: store.deleteItem,
    reset: store.reset,
  };
}
