/**
 * authValidation.ts — Esquemas de validación de los formularios de autenticación.
 * Las reglas genéricas viven en utils/validators.ts; aquí solo se combinan para Login y Registro.
 */
import { required, isEmail, minLength, maxLength, type ValidationSchema } from '../utils/validators'

// Supabase Auth exige por defecto un mínimo de 6 caracteres
export const PASSWORD_MIN_LENGTH = 6
export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 30

export type LoginField = 'email' | 'password'
export type RegisterField = 'username' | 'email' | 'password'

export const LOGIN_SCHEMA: ValidationSchema<LoginField> = {
  email: [required('El correo es obligatorio'), isEmail()],
  // En login no se exige longitud mínima: solo que no esté vacío
  password: [required('La contraseña es obligatoria')],
}

export const REGISTER_SCHEMA: ValidationSchema<RegisterField> = {
  username: [
    required('El nombre de usuario es obligatorio'),
    minLength(USERNAME_MIN_LENGTH),
    maxLength(USERNAME_MAX_LENGTH),
  ],
  email: [required('El correo es obligatorio'), isEmail()],
  password: [
    required('La contraseña es obligatoria'),
    minLength(PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`),
  ],
}

