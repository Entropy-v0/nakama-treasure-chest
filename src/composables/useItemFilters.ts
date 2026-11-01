/**
 * useItemFilters.ts — Motor ÚNICO de filtrado, conteo y paginación de items.
 *
 * Toda vista que necesite filtrar la colección (Colección, Calendario, Dashboard)
 * usa este archivo. No debe existir otro `.filter()` de items en vistas, stores o servicios.
 */
import { ref, computed, watch, isRef, type Ref } from 'vue'
import type { Item, ItemScope, ItemEstado, DiaSemana } from '../types/items'
import { DIAS_SEMANA, DIAS_LABELS, ESTADO_PRIORITY } from '../constants/itemMeta'
export { DIAS_LABELS }

export interface ItemFilterCriteria {
  tipo?: string
  estado?: string
  diaSemana?: string
  search?: string
  scope?: ItemScope
  hasCrew?: boolean
  soloConDia?: boolean
}

// Índice de Date.getDay(): 0 = domingo
const DIAS_POR_INDICE: DiaSemana[] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

export const getDiaActual = (): DiaSemana => DIAS_POR_INDICE[new Date().getDay()]

const isActive = (value?: string) => Boolean(value) && value !== 'Todos'

/**
 * Regla pura: ¿el item cumple los criterios? (testeable sin Vue)
 */
export function matchesItemFilters(item: Item, c: ItemFilterCriteria): boolean {
  if (isActive(c.tipo) && item.tipo !== c.tipo) return false
  if (isActive(c.estado) && item.estado !== c.estado) return false
  if (isActive(c.diaSemana) && item.dia_semana !== c.diaSemana) return false
  if (c.soloConDia && !item.dia_semana) return false

  const q = c.search?.trim().toLowerCase()
  if (q) {
    const enTitulo = item.titulo?.toLowerCase().includes(q)
    const enGeneros = item.generos?.some(g => g.toLowerCase().includes(q))
    if (!enTitulo && !enGeneros) return false
  }

  if (c.hasCrew && c.scope === 'compartido' && !item.crew_id) return false
  if (c.hasCrew && c.scope === 'personal' && item.crew_id) return false

  return true
}

/**
 * Orden puro por jerarquía de estado y, en empate, id descendente (testeable sin Vue)
 */
export function compareByEstadoPriority(a: Item, b: Item): number {
  const pa = ESTADO_PRIORITY[a.estado] ?? Number.MAX_SAFE_INTEGER
  const pb = ESTADO_PRIORITY[b.estado] ?? Number.MAX_SAFE_INTEGER
  if (pa !== pb) return pa - pb
  return b.id - a.id
}

/**
 * Orden puro por recencia: el último añadido (id mayor) primero.
 */
export function compareByRecent(a: Item, b: Item): number {
  return b.id - a.id
}

/**
 * Devuelve los `limit` items añadidos más recientemente (sin mutar la lista original).
 */
export function getRecentItems(items: readonly Item[], limit: number): Item[] {
  return [...items].sort(compareByRecent).slice(0, limit)
}

/**
 * Devuelve solo los items cuyo estado esté en la lista indicada (sin mutar la lista original).
 */
export function getItemsByEstados(items: readonly Item[], estados: readonly ItemEstado[]): Item[] {
  return items.filter(item => estados.includes(item.estado))
}

export interface UseItemFiltersOptions {
  hasCrew?: Ref<boolean> | boolean
  initialFilters?: Partial<ItemFilterCriteria>
  itemsPerPage?: number
}

export function useItemFilters(itemsSource: Ref<Item[]>, options: UseItemFiltersOptions = {}) {
  const initial = {
    tipo: 'Todos',
    estado: 'Todos',
    diaSemana: 'Todos',
    scope: 'personal' as ItemScope,
    search: '',
    ...options.initialFilters,
  }

  // ── Filtros activos ──
  const activeTipo = ref(initial.tipo)
  const activeEstado = ref(initial.estado)
  const activeDia = ref(initial.diaSemana)
  const activeScope = ref<ItemScope>(initial.scope)
  const searchQuery = ref(initial.search)
  const soloConDia = Boolean(initial.soloConDia)

  const hasCrew = computed(() => (isRef(options.hasCrew) ? options.hasCrew.value : Boolean(options.hasCrew)))

  const criteria = computed<ItemFilterCriteria>(() => ({
    tipo: activeTipo.value,
    estado: activeEstado.value,
    diaSemana: activeDia.value,
    search: searchQuery.value,
    scope: activeScope.value,
    hasCrew: hasCrew.value,
    soloConDia,
  }))

  // Filtra y ordena por jerarquía de estado (Viendo → Pendiente → En Pausa → Completado → Abandonado).
  // Dentro del mismo estado, el más reciente (id mayor) primero.
  const filteredItems = computed(() =>
    itemsSource.value
      .filter(item => matchesItemFilters(item, criteria.value))
      .sort(compareByEstadoPriority)
  )

  // ── Conteos ──
  // Cada conteo respeta todos los filtros activos EXCEPTO el de su propio campo,
  // así cada pestaña muestra cuántos resultados tendría si la seleccionas.
  const countBy = (field: 'tipo' | 'estado' | 'dia_semana', omit: keyof ItemFilterCriteria) => {
    const counts: Record<string, number> = { Todos: 0 }
    const base = { ...criteria.value, [omit]: undefined }
    for (const item of itemsSource.value) {
      const key = item[field]
      if (!key || !matchesItemFilters(item, base)) continue
      counts.Todos++
      counts[key] = (counts[key] ?? 0) + 1
    }
    return counts
  }

  const conteoPorTipo = computed(() => countBy('tipo', 'tipo'))
  const conteoPorEstado = computed(() => countBy('estado', 'estado'))
  const conteoPorDia = computed(() => countBy('dia_semana', 'diaSemana'))

  // ── Paginación ──
  const itemsPerPage = options.itemsPerPage ?? 18
  const currentPage = ref(1)
  const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage) || 1)
  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    return filteredItems.value.slice(start, start + itemsPerPage)
  })

  // Cualquier cambio de filtro vuelve a la primera página
  watch(criteria, () => { currentPage.value = 1 })

  // ── Acciones ──
  const setTipo = (tipo: string) => { activeTipo.value = tipo }
  const setEstado = (estado: string) => { activeEstado.value = estado }
  const setDia = (dia: string) => { activeDia.value = dia }

  // Vuelve a los filtros con los que se creó la vista (no rompe reglas fijas como estado 'Viendo')
  const clearFilters = () => {
    activeTipo.value = initial.tipo
    activeEstado.value = initial.estado
    activeDia.value = initial.diaSemana
    searchQuery.value = initial.search
  }

  return {
    activeTipo,
    activeEstado,
    activeDia,
    activeScope,
    searchQuery,

    filteredItems,
    paginatedItems,
    currentPage,
    totalPages,

    conteoPorTipo,
    conteoPorEstado,
    conteoPorDia,

    setTipo,
    setEstado,
    setDia,
    clearFilters,

    diasList: ['Todos', ...DIAS_SEMANA],
    labels: DIAS_LABELS,
  }
}
