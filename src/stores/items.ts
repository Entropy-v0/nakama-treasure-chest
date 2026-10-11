import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { Item, ItemInsert, ItemUpdate } from '../types/items';
import { itemsService } from '../services/supabase/items.service';
import { isSupabaseConfigured } from '../services/supabase/client';
import { INITIAL_MOCK_ITEMS } from '../data/mockItems';
import { useAuthStore } from './auth';

/**
 * Store de items: SOLO guarda la colección en memoria y sincroniza con el servicio.
 * El filtrado, conteo y paginación viven en composables/useItemFilters.ts.
 */
export const useItemsStore = defineStore('items', () => {
  const items = ref<Item[]>(isSupabaseConfigured ? [] : [...INITIAL_MOCK_ITEMS]);
  const isLoaded = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const authStore = useAuthStore();

  /**
   * Carga la colección completa con caché: si ya está cargada y no se fuerza, no repite la petición.
   */
  const loadItems = async (force = false): Promise<Item[]> => {
    if (isLoaded.value && !force) {
      return items.value;
    }

    isLoading.value = true;
    error.value = null;
    try {
      items.value = await itemsService.fetchItems();
      isLoaded.value = true;
      return items.value;
    } catch (err: any) {
      const message = err?.message || 'Error al cargar los elementos de la colección';
      error.value = message;
      console.error('[itemsStore] loadItems error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Agrega un nuevo elemento a la colección y actualiza el store.
   */
  const addItem = async (newItem: ItemInsert): Promise<Item> => {
    isLoading.value = true;
    error.value = null;
    try {
      const created = await itemsService.createItem(newItem);
      if (!items.value.some(i => i.id === created.id)) {
        items.value.unshift(created);
      }
      return created;
    } catch (err: any) {
      const message = err?.message || 'Error al agregar el elemento';
      error.value = message;
      console.error('[itemsStore] addItem error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Actualiza un elemento existente de forma reactiva.
   */
  const updateItem = async (id: number, updates: ItemUpdate): Promise<Item> => {
    isLoading.value = true;
    error.value = null;
    try {
      const updated = await itemsService.updateItem(id, updates);
      const index = items.value.findIndex(i => i.id === id);
      if (index !== -1) {
        items.value[index] = { ...updated };
      }
      return updated;
    } catch (err: any) {
      const message = err?.message || `Error al actualizar el elemento #${id}`;
      error.value = message;
      console.error('[itemsStore] updateItem error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Elimina un elemento de la colección por su ID.
   */
  const deleteItem = async (id: number): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      await itemsService.deleteItem(id);
      items.value = items.value.filter(i => i.id !== id);
    } catch (err: any) {
      const message = err?.message || `Error al eliminar el elemento #${id}`;
      error.value = message;
      console.error('[itemsStore] deleteItem error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Modifica el progreso (capítulo o episodio) de un elemento de forma atómica.
   * Evita valores negativos y actualiza tanto el backend como el estado reactivo en memoria.
   */
  const advanceProgress = async (id: number, delta: number): Promise<Item | undefined> => {
    const item = items.value.find(i => i.id === id);
    if (!item) return undefined;

    const currentProgress = typeof item.progreso === 'number' && Number.isFinite(item.progreso) ? item.progreso : 0;
    const nextProgress = Math.max(0, currentProgress + delta);

    if (nextProgress === currentProgress && delta < 0) {
      return item;
    }

    return await updateItem(id, { progreso: nextProgress });
  };

  const reset = () => {
    items.value = isSupabaseConfigured ? [] : [...INITIAL_MOCK_ITEMS];
    isLoaded.value = false;
    isLoading.value = false;
    error.value = null;
  };

  // Limpiar estado automáticamente si el usuario cierra sesión o cambia de cuenta
  watch(
    () => authStore.user?.id,
    (newId, oldId) => {
      if (newId !== oldId) {
        reset();
      }
    }
  );

  return {
    items,
    isLoading,
    isLoaded,
    error,
    loadItems,
    addItem,
    updateItem,
    advanceProgress,
    deleteItem,
    reset,
  };
});
