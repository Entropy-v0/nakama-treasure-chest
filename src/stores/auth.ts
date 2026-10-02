import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { authService, type AuthCredentials, type RegisterCredentials } from '../services/supabase/auth.service'
import type { UpdateProfileData } from '../types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const profile = ref<UpdateProfileData | null>(null)
  const isLoading = ref<boolean>(true)
  const isInitialized = ref<boolean>(false)
  const error = ref<string | null>(null)

  let authSubscription: { unsubscribe: () => void } | null = null

  const isAuthenticated = computed(() => Boolean(session.value && user.value))

  const userName = computed(() => {
    if (profile.value?.username && profile.value.username.trim()) {
      return profile.value.username.trim()
    }
    if (user.value?.user_metadata?.username && user.value.user_metadata.username.trim()) {
      return user.value.user_metadata.username.trim()
    }
    if (user.value?.email) {
      return user.value.email.split('@')[0]
    }
    return 'Capitana'
  })

  const userGenero = computed<'masculino' | 'femenino'>(() => {
    if (profile.value?.genero) {
      return profile.value.genero
    }
    return (user.value?.user_metadata?.genero as 'masculino' | 'femenino') || 'femenino'
  })

  const userTitle = computed(() => {
    return userGenero.value === 'masculino' ? 'Capitán' : 'Capitana'
  })

  const welcomeGreeting = computed(() => {
    return userGenero.value === 'masculino' ? '¡Bienvenido, Capitán!' : '¡Bienvenida, Capitana!'
  })

  const userEmail = computed(() => user.value?.email || '')

  const avatarUrl = computed(() => {
    return profile.value?.avatar_url || user.value?.user_metadata?.avatar_url || ''
  })

  const fetchProfile = async (userId: string) => {
    try {
      const p = await authService.getProfile(userId)
      if (p) {
        profile.value = p
      }
    } catch (e) {
      console.warn('Error fetching profile from DB:', e)
    }
  }

  /**
   * Inicializa la sesión y configura el listener de cambios de auth
   */
  const initialize = async () => {
    if (isInitialized.value) return

    isLoading.value = true
    error.value = null

    try {
      const { session: currentSession, user: currentUser } = await authService.getSession()
      session.value = currentSession
      user.value = currentUser

      if (currentUser?.id) {
        await fetchProfile(currentUser.id)
      }

      // Registrar listener global si aún no está activo
      if (!authSubscription) {
        authSubscription = authService.onAuthStateChange(
          async (event: AuthChangeEvent, newSession: Session | null) => {
            session.value = newSession
            user.value = newSession?.user ?? null
            if (newSession?.user?.id) {
              await fetchProfile(newSession.user.id)
            } else {
              profile.value = null
            }
            isLoading.value = false
          }
        )
      }
    } catch (err: any) {
      console.error('Error inicializando autenticación:', err)
      error.value = err.message || 'Error al verificar la sesión'
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  /**
   * Iniciar sesión
   */
  const signIn = async (credentials: AuthCredentials) => {
    isLoading.value = true
    error.value = null
    try {
      const { user: loggedUser, session: loggedSession } = await authService.signIn(credentials)
      user.value = loggedUser
      session.value = loggedSession
      if (loggedUser?.id) {
        await fetchProfile(loggedUser.id)
      }
      return { user: loggedUser, session: loggedSession }
    } catch (err: any) {
      error.value = err.message || 'Error al iniciar sesión'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Iniciar sesión o registrarse con OAuth (Discord, Google, etc.)
   */
  const signInWithOAuth = async (provider: 'discord' | 'google' = 'discord') => {
    isLoading.value = true
    error.value = null
    try {
      await authService.signInWithOAuth(provider)
    } catch (err: any) {
      error.value = err.message || `Error al conectar con ${provider}`
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Registrar nuevo usuario
   */
  const signUp = async (credentials: RegisterCredentials) => {
    isLoading.value = true
    error.value = null
    try {
      const { user: newUser, session: newSession } = await authService.signUp(credentials)
      user.value = newUser
      session.value = newSession
      if (newUser?.id) {
        await fetchProfile(newUser.id)
      }
      return { user: newUser, session: newSession }
    } catch (err: any) {
      error.value = err.message || 'Error al registrar usuario'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cerrar sesión
   */
  const signOut = async () => {
    isLoading.value = true
    error.value = null
    try {
      await authService.signOut()
      user.value = null
      session.value = null
      profile.value = null
    } catch (err: any) {
      error.value = err.message || 'Error al cerrar sesión'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  const updateProfile = async (updates: UpdateProfileData) => {
    isLoading.value = true
    error.value = null
    try {
      const updatedUser = await authService.updateProfile(updates)
      if (updatedUser) {
        user.value = updatedUser
      }
      if (profile.value) {
        profile.value = {
          ...profile.value,
          ...updates,
        }
      } else if (user.value?.id) {
        await fetchProfile(user.value.id)
      }
      return updatedUser
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar el perfil'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Eliminar cuenta y perfil permanentemente
   */
  const deleteAccount = async () => {
    isLoading.value = true
    error.value = null
    try {
      await authService.deleteAccount()
      user.value = null
      session.value = null
      profile.value = null
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar la cuenta'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    user,
    session,
    profile,
    isLoading,
    isInitialized,
    error,
    isAuthenticated,
    userName,
    userGenero,
    userTitle,
    welcomeGreeting,
    userEmail,
    avatarUrl,
    initialize,
    signIn,
    signInWithOAuth,
    signUp,
    signOut,
    updateProfile,
    deleteAccount,
    clearError,
  }
})
