import { describe, it, expect } from 'vitest'
import { matchesItemFilters, type ItemFilterCriteria } from '@/composables/useItemFilters'
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

