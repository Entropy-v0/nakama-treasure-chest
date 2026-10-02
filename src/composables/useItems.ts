/**
 * useItems.ts — Composable para gestión de la colección (Data Layer)
 * Implementa el patrón de estado asíncrono: data, isLoading, error.
 * Conecta con items.service.ts aislando completamente las llamadas a Supabase.
 */
import { ref } from 'vue';
import type { Item, ItemInsert, ItemUpdate, ItemFilters } from '../types/items';
import { itemsService } from '../services/supabase/items.service';
import { isSupabaseConfigured } from '../services/supabase/client';
import { authService } from '../services/supabase/auth.service';
import { INITIAL_MOCK_ITEMS } from '../data/mockItems';

// Estado singleton reactivo compartido entre todas las instancias
const items = ref<Item[]>(isSupabaseConfigured ? [] : [...INITIAL_MOCK_ITEMS]);
const totalCount = ref<number>(isSupabaseConfigured ? 0 : INITIAL_MOCK_ITEMS.length);
const isLoading = ref<boolean>(false);
const isLoaded = ref<boolean>(false);
const error = ref<string | null>(null);

export function useItems() {
  /**
   * Carga los elementos desde el servicio aplicando filtros opcionales.
   * Maneja estados reactivos isLoading y error con try/catch.
   */
  const loadItems = async (filters: ItemFilters = {}): Promise<Item[]> => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await itemsService.fetchItems(filters);
      items.value = response.data;
      totalCount.value = response.count;
      isLoaded.value = true;
      return response.data;
    } catch (err: any) {
      const message = err?.message || 'Error al cargar los elementos de la colección';
      error.value = message;
      console.error('[useItems] loadItems error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Agrega un nuevo elemento a la colección.
   */
  const addItem = async (newItem: ItemInsert): Promise<Item> => {
    isLoading.value = true;
    error.value = null;
    try {
      const created = await itemsService.createItem(newItem);
      // Actualización optimista / reactiva local si no está ya presente
      if (!items.value.some(i => i.id === created.id)) {
        items.value.unshift(created);
        totalCount.value += 1;
      }
      return created;
    } catch (err: any) {
      const message = err?.message || 'Error al agregar el elemento';
      error.value = message;
      console.error('[useItems] addItem error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Actualiza un elemento existente.
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
      console.error('[useItems] updateItem error:', err);
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
      totalCount.value = Math.max(0, totalCount.value - 1);
    } catch (err: any) {
      const message = err?.message || `Error al eliminar el elemento #${id}`;
      error.value = message;
      console.error('[useItems] deleteItem error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // Estado reactivo asíncrono
    items,
    data: items, // Alias semántico para el patrón data/isLoading/error
    totalCount,
    isLoading,
    isLoaded,
    error,

    // Operaciones
    loadItems,
    fetchItems: loadItems,
    addItem,
    updateItem,
    deleteItem,
  };
}

// Sincronización automática de ciclo de vida con eventos de sesión
authService.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
    if (isSupabaseConfigured) {
      useItems().loadItems().catch((err) => {
        console.warn('[useItems] Sincronización inicial de items diferida:', err);
      });
    }
  } else if (event === 'SIGNED_OUT') {
    items.value = isSupabaseConfigured ? [] : [...INITIAL_MOCK_ITEMS];
    totalCount.value = items.value.length;
    isLoaded.value = false;
  }
});
