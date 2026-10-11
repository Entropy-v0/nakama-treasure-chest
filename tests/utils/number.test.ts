import { describe, it, expect } from 'vitest'
import { safeParseInt, isValidNumber } from '@/utils/number'

describe('safeParseInt', () => {
  it('debe parsear números enteros válidos', () => {
    expect(safeParseInt(10)).toBe(10)
    expect(safeParseInt(0)).toBe(0)
    expect(safeParseInt(-5)).toBe(-5)
  })

  it('debe parsear cadenas numéricas válidas', () => {
    expect(safeParseInt('42')).toBe(42)
    expect(safeParseInt('0')).toBe(0)
    expect(safeParseInt('-10')).toBe(-10)
    expect(safeParseInt('  100  ')).toBe(100)
  })

  it('debe truncar números flotantes a enteros', () => {
    expect(safeParseInt(15.9)).toBe(15)
    expect(safeParseInt('24.7')).toBe(24)
  })

  it('debe retornar null para entradas inválidas o NaN (evitando el bug de Episodio NaN)', () => {
    expect(safeParseInt(NaN)).toBeNull()
    expect(safeParseInt(null)).toBeNull()
    expect(safeParseInt(undefined)).toBeNull()
    expect(safeParseInt('')).toBeNull()
    expect(safeParseInt('   ')).toBeNull()
    expect(safeParseInt('abc')).toBeNull()
    expect(safeParseInt('NaN')).toBeNull()
    expect(safeParseInt(Infinity)).toBeNull()
    expect(safeParseInt(-Infinity)).toBeNull()
    expect(safeParseInt({})).toBeNull()
    expect(safeParseInt([])).toBeNull()
  })
})

describe('isValidNumber', () => {
  it('debe retornar true para números finitos válidos', () => {
    expect(isValidNumber(0)).toBe(true)
    expect(isValidNumber(100)).toBe(true)
    expect(isValidNumber(-1)).toBe(true)
    expect(isValidNumber(42.5)).toBe(true)
  })

  it('debe retornar false para cadenas, NaN, null, undefined o Infinity', () => {
    expect(isValidNumber('15')).toBe(false)
    expect(isValidNumber('0')).toBe(false)
    expect(isValidNumber(NaN)).toBe(false)
    expect(isValidNumber(null)).toBe(false)
    expect(isValidNumber(undefined)).toBe(false)
    expect(isValidNumber('')).toBe(false)
    expect(isValidNumber('   ')).toBe(false)
    expect(isValidNumber('abc')).toBe(false)
    expect(isValidNumber(Infinity)).toBe(false)
    expect(isValidNumber(-Infinity)).toBe(false)
  })
})

