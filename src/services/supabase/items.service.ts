import { supabase, isSupabaseConfigured } from './client';
import type { Item, ItemInsert, ItemUpdate, ItemFilters } from '../../types/items';
import { INITIAL_MOCK_ITEMS } from '../../data/mockItems';

// Memoria local de respaldo cuando Supabase no está configurado (desarrollo / demo)
let inMemoryItems: Item[] = [...INITIAL_MOCK_ITEMS];

export const itemsService = {
  /**
   * Obtiene la lista de elementos aplicando filtros opcionales.
   */
  async fetchItems(filters: ItemFilters = {}): Promise<{ data: Item[]; count: number }> {
    if (!isSupabaseConfigured) {
      let filtered = [...inMemoryItems];

      if (filters.tipo && filters.tipo !== 'Todos') {
        filtered = filtered.filter(i => i.tipo === filters.tipo);
      }
      if (filters.estado && filters.estado !== 'Todos') {
        filtered = filtered.filter(i => i.estado === filters.estado);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(i => i.titulo.toLowerCase().includes(query));
      }

      if (filters.crewId) {
        filtered = filtered.filter(i => i.crew_id === filters.crewId);
      } else if (filters.scope === 'personal') {
        filtered = filtered.filter(i => !i.crew_id);
      } else if (filters.scope === 'tripulacion') {
        filtered = filtered.filter(i => !!i.crew_id);
      }

      return {
        data: filtered,
        count: filtered.length,
      };
    }

    let query = supabase
      .from('items')
      .select('*', { count: 'exact' });

    if (filters.tipo && filters.tipo !== 'Todos') {
      query = query.eq('tipo', filters.tipo);
    }
    if (filters.estado && filters.estado !== 'Todos') {
      query = query.eq('estado', filters.estado);
    }
    if (filters.search) {
      query = query.ilike('titulo', `%${filters.search}%`);
    }
    if (filters.crewId) {
      query = query.eq('crew_id', filters.crewId);
    } else if (filters.scope === 'personal') {
      query = query.is('crew_id', null);
    } else if (filters.scope === 'tripulacion') {
      query = query.not('crew_id', 'is', null);
    }

    query = query.order('id', { ascending: false });

    if (filters.page && filters.perPage) {
      const from = (filters.page - 1) * filters.perPage;
      const to = from + filters.perPage - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error al consultar items: ${error.message}`);
    }

    return {
      data: (data || []) as Item[],
      count: count ?? (data?.length || 0),
    };
  },

  /**
   * Obtiene un único elemento por su ID.
   */
  async fetchItemById(id: number): Promise<Item | null> {
    if (!isSupabaseConfigured) {
      const item = inMemoryItems.find(i => i.id === id);
      return item ? { ...item } : null;
    }

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Error al consultar item #${id}: ${error.message}`);
    }

    return data as Item;
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
