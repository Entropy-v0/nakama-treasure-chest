/**
 * validators.ts — Reglas de validación de campos reutilizables (funciones puras).
 *
 * Cada regla recibe el valor y devuelve `true` si es válido o un mensaje de error.
 * No dependen de Vue ni de la UI: se pueden usar en cualquier formulario y testear aislado.
 *
 * Uso:
 *   const errors = validateForm(
 *     { email: email.value },
 *     { email: [required(), isEmail()] },
 *   )
 *   if (hasErrors(errors)) return
 */

export type ValidationRule = (value: unknown) => true | string
export type ValidationSchema<T extends string = string> = Partial<Record<T, ValidationRule[]>>
export type ValidationErrors<T extends string = string> = Partial<Record<T, string>>

const asTrimmedString = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value).trim()

/* ── Reglas ── */

export const required = (message = 'Este campo es obligatorio'): ValidationRule =>
  value => (asTrimmedString(value) !== '' ? true : message)

// Formato básico usuario@dominio.ext (la verificación real la hace el proveedor de auth)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isEmail = (message = 'Introduce un correo electrónico válido'): ValidationRule =>
  value => {
    const str = asTrimmedString(value)
    if (str === '') return true // vacío lo controla `required`
    return EMAIL_PATTERN.test(str) ? true : message
  }

export const minLength = (min: number, message?: string): ValidationRule =>
  value => {
    const str = asTrimmedString(value)
    if (str === '') return true
    return str.length >= min ? true : (message ?? `Debe tener al menos ${min} caracteres`)
  }

export const maxLength = (max: number, message?: string): ValidationRule =>
  value => {
    const str = asTrimmedString(value)
    return str.length <= max ? true : (message ?? `No puede superar los ${max} caracteres`)
  }

/* ── Ejecutores ── */

/**
 * Ejecuta las reglas en orden y devuelve el primer mensaje de error, o null si todo es válido.
 */
export function validateField(value: unknown, rules: ValidationRule[] = []): string | null {
  for (const rule of rules) {
    const result = rule(value)
    if (result !== true) return result
  }
  return null
}

/**
 * Valida un objeto completo contra un esquema. Devuelve solo los campos con error.
 */
export function validateForm<T extends string>(
  values: Record<T, unknown>,
  schema: ValidationSchema<T>,
): ValidationErrors<T> {
  const errors: ValidationErrors<T> = {}
  for (const field of Object.keys(schema) as T[]) {
    const error = validateField(values[field], schema[field])
    if (error) errors[field] = error
  }
  return errors
}

export const hasErrors = (errors: ValidationErrors): boolean =>
  Object.values(errors).some(Boolean)

