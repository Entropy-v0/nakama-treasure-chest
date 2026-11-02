import { describe, it, expect } from 'vitest'
import {
  TIPOS,
  TIPOS_FILTER,
  ESTADOS,
  TYPE_CONFIG,
  STATUS_COLORS,
  ITEM_YEAR_LIMITS,
} from '@/constants/itemMeta'

describe('itemMeta configuration', () => {
  it('debe contener exactamente los 5 tipos válidos y no contener Música', () => {
    expect(TIPOS).toEqual(['Anime', 'Manga', 'Serie', 'Película', 'Libro'])
    expect(TIPOS).not.toContain('Música')
    expect(TIPOS_FILTER).toContain('Libro')
    expect(TIPOS_FILTER).not.toContain('Música')
  })

  it('debe contener los 5 estados de seguimiento', () => {
    expect(ESTADOS).toEqual(['Viendo', 'Pendiente', 'En Pausa', 'Completado', 'Abandonado'])
  })

  it('debe configurar correctamente el tipo Libro', () => {
    const libroConfig = TYPE_CONFIG['Libro']
    expect(libroConfig).toBeDefined()
    expect(libroConfig.hasProgress).toBe(true)
    expect(libroConfig.progressShortLabel).toBe('Pág.')
    expect(libroConfig.creatorLabel).toBe('Autor / Escritor')
    expect(libroConfig.publisherLabel).toBe('Editorial')
    expect(libroConfig.hasBroadcastDay).toBe(false)
    expect(libroConfig.hasSeason).toBe(false)
  })

  it('debe configurar correctamente Anime con día de emisión', () => {
    const animeConfig = TYPE_CONFIG['Anime']
    expect(animeConfig).toBeDefined()
    expect(animeConfig.hasProgress).toBe(true)
    expect(animeConfig.progressShortLabel).toBe('Ep.')
    expect(animeConfig.hasBroadcastDay).toBe(true)
    expect(animeConfig.hasSeason).toBe(true)
  })

  it('debe mapear colores CSS para cada uno de los estados', () => {
    ESTADOS.forEach((estado) => {
      expect(STATUS_COLORS[estado]).toBeDefined()
      expect(STATUS_COLORS[estado]).toMatch(/^var\(--state-/)
    })
  })

  it('debe tener límites de años lógicos', () => {
    expect(ITEM_YEAR_LIMITS.MIN).toBe(1800)
    expect(ITEM_YEAR_LIMITS.MAX).toBe(2099)
  })
})

