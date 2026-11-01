import { describe, it, expect } from 'vitest'
import {
  required,
  isEmail,
  minLength,
  maxLength,
  validateField,
  validateForm,
  hasErrors,
} from '@/utils/validators'
import { LOGIN_SCHEMA, REGISTER_SCHEMA } from '@/constants/authValidation'

describe('validators — reglas individuales', () => {
  it('required: rechaza valores vacíos o de puros espacios', () => {
    const rule = required('Requerido')
    expect(rule('')).toBe('Requerido')
    expect(rule('   ')).toBe('Requerido')
    expect(rule(null)).toBe('Requerido')
    expect(rule(undefined)).toBe('Requerido')
    expect(rule('hola')).toBe(true)
  })

  it('isEmail: valida formato básico y tolera vacíos (delegado a required)', () => {
    const rule = isEmail('Email inválido')
    expect(rule('')).toBe(true)
    expect(rule('test@example.com')).toBe(true)
    expect(rule('test.user+tag@domain.co.uk')).toBe(true)
    expect(rule('invalido')).toBe('Email inválido')
    expect(rule('sin-arroba.com')).toBe('Email inválido')
    expect(rule('arroba@sin-punto')).toBe('Email inválido')
  })

  it('minLength y maxLength: controlan límites de caracteres', () => {
    const min6 = minLength(6)
    expect(min6('12345')).toBe('Debe tener al menos 6 caracteres')
    expect(min6('123456')).toBe(true)

    const max10 = maxLength(10)
    expect(max10('12345678901')).toBe('No puede superar los 10 caracteres')
    expect(max10('1234567890')).toBe(true)
  })
})

describe('validators — ejecutores', () => {
  it('validateField: retorna el primer error que encuentra', () => {
    const rules = [required('Obligatorio'), isEmail('Email inválido')]
    expect(validateField('', rules)).toBe('Obligatorio')
    expect(validateField('no-email', rules)).toBe('Email inválido')
    expect(validateField('test@mail.com', rules)).toBe(null)
  })

  it('validateForm y hasErrors: evalúan esquemas de auth', () => {
    const loginErrors = validateForm({ email: '', password: '' }, LOGIN_SCHEMA)
    expect(hasErrors(loginErrors)).toBe(true)
    expect(loginErrors.email).toBe('El correo es obligatorio')
    expect(loginErrors.password).toBe('La contraseña es obligatoria')

    const registerErrors = validateForm(
      { username: 'ab', email: 'correo-malo', password: '123' },
      REGISTER_SCHEMA
    )
    expect(hasErrors(registerErrors)).toBe(true)
    expect(registerErrors.username).toContain('3')
    expect(registerErrors.email).toContain('válido')
    expect(registerErrors.password).toContain('6')

    const validLogin = validateForm(
      { email: 'capitan@nakama.dev', password: 'password123' },
      LOGIN_SCHEMA
    )
    expect(hasErrors(validLogin)).toBe(false)
    expect(Object.keys(validLogin)).toHaveLength(0)
  })
})

