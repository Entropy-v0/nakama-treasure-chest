import { describe, it, expect } from 'vitest'
import {
  matchesItemFilters,
  compareByEstadoPriority,
  getRecentItems,
  getItemsByEstados,
  type ItemFilterCriteria,
} from '@/composables/useItemFilters'
import type { Item } from '@/types/items'

const sampleBook: Item = {
  id: 1,
  titulo: 'Dune',
  tipo: 'Libro',
  estado: 'Viendo',
  progreso: 120,
  generos: ['Ciencia Ficción', 'Aventura'],
  crew_id: null,
}

const sampleAnime: Item = {
  id: 2,
  titulo: 'Frieren',
  tipo: 'Anime',
  estado: 'Completado',
  progreso: 28,
  generos: ['Fantasía', 'Drama'],
  dia_semana: 'viernes',
  crew_id: 'crew-456',
}

describe('matchesItemFilters', () => {
  it('debe aceptar cualquier item si no hay filtros aplicados', () => {
    const criteria: ItemFilterCriteria = {
      tipo: 'Todos',
      estado: 'Todos',
      scope: 'todos',
    }
    expect(matchesItemFilters(sampleBook, criteria)).toBe(true)
    expect(matchesItemFilters(sampleAnime, criteria)).toBe(true)
  })

  it('debe filtrar correctamente por tipo Libro', () => {
    expect(matchesItemFilters(sampleBook, { tipo: 'Libro' })).toBe(true)
    expect(matchesItemFilters(sampleAnime, { tipo: 'Libro' })).toBe(false)
  })

  it('debe filtrar correctamente por estado Viendo', () => {
    expect(matchesItemFilters(sampleBook, { estado: 'Viendo' })).toBe(true)
    expect(matchesItemFilters(sampleAnime, { estado: 'Viendo' })).toBe(false)
  })

  it('debe buscar texto en título y géneros insensible a mayúsculas', () => {
    expect(matchesItemFilters(sampleBook, { search: 'dune' })).toBe(true)
    expect(matchesItemFilters(sampleBook, { search: 'FICCIÓN' })).toBe(true)
    expect(matchesItemFilters(sampleBook, { search: 'naruto' })).toBe(false)
  })

  it('debe filtrar por pertenencia a tripulación o personal', () => {
    // sampleBook es personal (crew_id null)
    expect(matchesItemFilters(sampleBook, { hasCrew: true, scope: 'personal' })).toBe(true)
    expect(matchesItemFilters(sampleBook, { hasCrew: true, scope: 'compartido' })).toBe(false)

    // sampleAnime es compartido (crew_id 'crew-456')
    expect(matchesItemFilters(sampleAnime, { hasCrew: true, scope: 'personal' })).toBe(false)
    expect(matchesItemFilters(sampleAnime, { hasCrew: true, scope: 'compartido' })).toBe(true)
  })

  it('debe filtrar por día de semana', () => {
    expect(matchesItemFilters(sampleAnime, { diaSemana: 'viernes' })).toBe(true)
    expect(matchesItemFilters(sampleAnime, { diaSemana: 'lunes' })).toBe(false)
  })
})


describe('compareByEstadoPriority', () => {
  const make = (id: number, estado: Item['estado']): Item => ({ id, titulo: `T${id}`, tipo: 'Anime', estado })

  it('ordena por jerarquía Viendo → Pendiente → En Pausa → Completado → Abandonado', () => {
    const items = [
      make(1, 'Completado'),
      make(2, 'Abandonado'),
      make(3, 'En Pausa'),
      make(4, 'Pendiente'),
      make(5, 'Viendo'),
    ]
    expect([...items].sort(compareByEstadoPriority).map(i => i.estado)).toEqual([
      'Viendo', 'Pendiente', 'En Pausa', 'Completado', 'Abandonado',
    ])
  })

  it('en empate de estado, muestra primero el más reciente (id mayor)', () => {
    const items = [make(1, 'Viendo'), make(3, 'Viendo'), make(2, 'Viendo')]
    expect([...items].sort(compareByEstadoPriority).map(i => i.id)).toEqual([3, 2, 1])
  })
})

describe('getRecentItems', () => {
  const make = (id: number): Item => ({ id, titulo: `T${id}`, tipo: 'Anime', estado: 'Viendo' })

  it('devuelve los N más recientes por id descendente sin mutar el original', () => {
    const items = [make(1), make(5), make(3), make(4), make(2)]
    expect(getRecentItems(items, 3).map(i => i.id)).toEqual([5, 4, 3])
    expect(items.map(i => i.id)).toEqual([1, 5, 3, 4, 2])
  })
})

describe('getItemsByEstados', () => {
  const make = (id: number, estado: Item['estado']): Item => ({ id, titulo: `T${id}`, tipo: 'Anime', estado })

  it('devuelve solo los items con estados incluidos en la lista', () => {
    const items = [make(1, 'Viendo'), make(2, 'Completado'), make(3, 'Pendiente'), make(4, 'Abandonado')]
    expect(getItemsByEstados(items, ['Viendo', 'Pendiente']).map(i => i.id)).toEqual([1, 3])
  })

  it('devuelve una lista vacía si ningún estado coincide', () => {
    expect(getItemsByEstados([make(1, 'Completado')], ['Viendo'])).toEqual([])
  })
})
