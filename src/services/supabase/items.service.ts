import { supabase, isSupabaseConfigured } from './client';
import type { Item, ItemInsert, ItemUpdate } from '../../types/items';
import { INITIAL_MOCK_ITEMS } from '../../data/mockItems';

// Memoria local de respaldo cuando Supabase no está configurado (desarrollo / demo)
let inMemoryItems: Item[] = [...INITIAL_MOCK_ITEMS];

export const itemsService = {
  /**
   * Obtiene la colección completa visible para el usuario (RLS decide qué filas).
   * El filtrado se hace en el cliente con composables/useItemFilters.ts.
   */
  async fetchItems(): Promise<Item[]> {
    if (!isSupabaseConfigured) {
      return [...inMemoryItems];
    }

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      throw new Error(`Error al consultar items: ${error.message}`);
    }

    return (data || []) as Item[];
  },

  /**
   * Crea un nuevo elemento en la base de datos.
   */
  async createItem(item: ItemInsert): Promise<Item> {
    if (!isSupabaseConfigured) {
      const maxId = inMemoryItems.length > 0 ? Math.max(...inMemoryItems.map(i => i.id)) : 0;
      const created: Item = {
        ...item,
        id: maxId + 1,
        created_at: new Date().toISOString(),
      };
      inMemoryItems.unshift(created);
      return created;
    }

    const userRes = await supabase.auth.getUser();
    const currentUserId = userRes?.data?.user?.id;
    const payload = {
      ...item,
      ...(currentUserId ? { user_id: item.user_id || currentUserId } : {}),
    };

    const { data, error } = await supabase
      .from('items')
      .insert(payload as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear item: ${error.message}`);
    }

    return data as Item;
  },

  /**
   * Actualiza un elemento existente.
   */
  async updateItem(id: number, updates: ItemUpdate): Promise<Item> {
    if (!isSupabaseConfigured) {
      const index = inMemoryItems.findIndex(i => i.id === id);
      if (index === -1) {
        throw new Error(`Item #${id} no encontrado`);
      }
      inMemoryItems[index] = {
        ...inMemoryItems[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return inMemoryItems[index];
    }

    const { data, error } = await supabase
      .from('items')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar item #${id}: ${error.message}`);
    }

    return data as Item;
  },

  /**
   * Elimina un elemento por su ID.
   */
  async deleteItem(id: number): Promise<void> {
    if (!isSupabaseConfigured) {
      inMemoryItems = inMemoryItems.filter(i => i.id !== id);
      return;
    }

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar item #${id}: ${error.message}`);
    }
  },
};
