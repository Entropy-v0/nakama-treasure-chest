import { describe, it, expect } from 'vitest'
import { formatBytes } from '@/utils/imageCompressor'

describe('formatBytes', () => {
  it('debe formatear 0 bytes correctamente', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(-100)).toBe('0 B')
  })

  it('debe formatear bytes a KB correctamente', () => {
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(51200)).toBe('50 KB')
    expect(formatBytes(75500, 1)).toBe('73.7 KB')
  })

  it('debe formatear bytes a MB correctamente', () => {
    expect(formatBytes(1048576)).toBe('1 MB')
    expect(formatBytes(5242880)).toBe('5 MB')
    expect(formatBytes(2621440, 2)).toBe('2.5 MB')
  })
})

