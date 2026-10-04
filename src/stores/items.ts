import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { Item, ItemInsert, ItemUpdate, ItemFilters, DiaSemana } from '../types/items';
import { itemsService } from '../services/supabase/items.service';
import { isSupabaseConfigured } from '../services/supabase/client';
import { INITIAL_MOCK_ITEMS } from '../data/mockItems';
import { useAuthStore } from './auth';

export const useItemsStore = defineStore('items', () => {
  const items = ref<Item[]>(isSupabaseConfigured ? [] : [...INITIAL_MOCK_ITEMS]);
  const totalCount = ref<number>(isSupabaseConfigured ? 0 : INITIAL_MOCK_ITEMS.length);
  const isLoaded = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const authStore = useAuthStore();

  /**
   * Carga los elementos con soporte de caché.
   * Si ya están cargados y no se fuerza la recarga (force = false) ni se pasan filtros que limiten el alcance,
   * se retorna la memoria sin repetir la petición a la base de datos.
   */
  const loadItems = async (filters: ItemFilters = {}, force = false): Promise<Item[]> => {
    const hasSpecificFilters = Boolean(
      (filters.tipo && filters.tipo !== 'Todos') ||
      (filters.estado && filters.estado !== 'Todos') ||
      (filters.diaSemana && filters.diaSemana !== 'Todos') ||
      filters.search ||
      filters.scope ||
      filters.crewId ||
      filters.page
    );

    if (isLoaded.value && !force && !hasSpecificFilters) {
      return items.value;
    }

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
        totalCount.value += 1;
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
      totalCount.value = Math.max(0, totalCount.value - 1);
    } catch (err: any) {
      const message = err?.message || `Error al eliminar el elemento #${id}`;
      error.value = message;
      console.error('[itemsStore] deleteItem error:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const reset = () => {
    items.value = isSupabaseConfigured ? [] : [...INITIAL_MOCK_ITEMS];
    totalCount.value = items.value.length;
    isLoaded.value = false;
    isLoading.value = false;
    error.value = null;
  };

  /**
   * Elementos agrupados reactivamente por día de la semana.
   */
  const itemsByDay = computed(() => {
    const grouped: Record<DiaSemana, Item[]> = {
      lunes: [],
      martes: [],
      miercoles: [],
      miércoles: [],
      jueves: [],
      viernes: [],
      sabado: [],
      sábado: [],
      domingo: [],
    };
    for (const item of items.value) {
      if (item.dia_semana && grouped[item.dia_semana]) {
        grouped[item.dia_semana].push(item);
      }
    }
    return grouped;
  });

  const getItemsForDay = (dia: DiaSemana): Item[] => {
    return items.value.filter(i => i.dia_semana === dia);
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
    totalCount,
    isLoading,
    isLoaded,
    error,
    itemsByDay,
    getItemsForDay,
    loadItems,
    fetchItems: loadItems,
    addItem,
    updateItem,
    deleteItem,
    reset,
  };
});
