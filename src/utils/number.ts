/**
 * number.ts — Utilidades de sanitización y validación numérica segura
 * Previene errores de parseo como NaN, undefined o cadenas vacías.
 */

/**
 * Convierte cualquier valor a un entero válido o null si es inválido/vacío.
 * Protege contra cadenas como '', '  ', 'NaN', undefined, null, etc.
 */
export function safeParseInt(val: unknown): number | null {
  if (val === null || val === undefined) return null
  if (typeof val === 'string' && val.trim() === '') return null
  if (typeof val !== 'number' && typeof val !== 'string') return null
  const parsed = Number(val)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null
}

/**
 * Comprueba si un valor es un número finito real (excluye NaN, Infinity y no-números).
 */
export function isValidNumber(val: unknown): val is number {
  return typeof val === 'number' && Number.isFinite(val)
}

