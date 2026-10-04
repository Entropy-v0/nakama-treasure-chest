import { supabase, isSupabaseConfigured } from './client'
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import type { UpdateProfileData } from '../../types/auth'
import type { Database } from '../../types/database'
import { MOCK_USER_ID, getMockUser } from '../../mocks/mockUser'

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends AuthCredentials {
  username?: string
  genero?: 'masculino' | 'femenino'
}

const MOCK_STORAGE_KEY = 'nakama_mock_session'

const getStoredMockUser = (): User | null => {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

const setStoredMockUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(MOCK_STORAGE_KEY)
  }
}

// Emisor de eventos mock para cuando no hay credenciales de Supabase
type AuthListener = (event: AuthChangeEvent, session: Session | null) => void
const mockListeners: Set<AuthListener> = new Set()

const notifyMockListeners = (event: AuthChangeEvent, user: User | null) => {
  const session: Session | null = user
    ? ({
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh',
        user,
      } as Session)
    : null

  mockListeners.forEach(listener => {
    try {
      listener(event, session)
    } catch (e) {
      console.error('Error in mock auth listener:', e)
    }
  })
}

export const authService = {
  /**
   * Obtiene la sesión activa
   */
  async getSession(): Promise<{ session: Session | null; user: User | null }> {
    if (!isSupabaseConfigured) {
      const mockUser = getStoredMockUser()
      if (!mockUser) return { session: null, user: null }
      const mockSession = {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh',
        user: mockUser,
      } as Session
      return { session: mockSession, user: mockUser }
    }

    // Limpiar residuos de mock
    localStorage.removeItem(MOCK_STORAGE_KEY)

    const { data, error } = await supabase.auth.getSession()
    if (error || !data.session) {
      return { session: null, user: null }
    }

    // Validar en el servidor de Supabase si el usuario sigue existiendo
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        // El usuario ya no existe en Supabase (fue eliminado en el dashboard)
        await supabase.auth.signOut().catch(() => {})
        return { session: null, user: null }
      }
      return { session: data.session, user: userData.user }
    } catch {
      return { session: null, user: null }
    }
  },

  /**
   * Iniciar sesión con email y contraseña
   */
  async signIn({ email, password }: AuthCredentials): Promise<{ user: User | null; session: Session | null }> {
    if (!isSupabaseConfigured) {
      // Autenticación mock para desarrollo
      const mockUser = getMockUser({
        email,
        user_metadata: {
          username: email.split('@')[0] || 'Capitán Nakama',
          genero: 'masculino',
        },
      })
      setStoredMockUser(mockUser)
      notifyMockListeners('SIGNED_IN', mockUser)
      return {
        user: mockUser,
        session: {
          access_token: 'mock-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh',
          user: mockUser,
        } as Session,
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return { user: data.user, session: data.session }
  },

  /**
   * Iniciar sesión / Registro con proveedor OAuth (Discord, Google, etc.)
   */
  async signInWithOAuth(provider: 'discord' | 'google' = 'discord'): Promise<void> {
    if (!isSupabaseConfigured) {
      // Mock OAuth para desarrollo local sin Supabase
      const mockUser = getMockUser({
        app_metadata: { provider },
        user_metadata: { username: 'Capitán Discord', avatar_url: null, genero: 'masculino' },
        email: 'nakama@discord.gg',
      })
      setStoredMockUser(mockUser)
      notifyMockListeners('SIGNED_IN', mockUser)
      return
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) throw error
  },

  /**
   * Registro con email, contraseña, nombre de usuario y género
   */
  async signUp({ email, password, username, genero = 'femenino' }: RegisterCredentials): Promise<{ user: User | null; session: Session | null }> {
    if (!isSupabaseConfigured) {
      const mockUser = getMockUser({
        email,
        user_metadata: {
          username: username || email.split('@')[0] || (genero === 'masculino' ? 'Capitán' : 'Capitana'),
          genero,
        },
      })
      setStoredMockUser(mockUser)
      notifyMockListeners('SIGNED_IN', mockUser)
      return {
        user: mockUser,
        session: {
          access_token: 'mock-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh',
          user: mockUser,
        } as Session,
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || '',
          genero: genero || 'femenino',
        },
      },
    })

    if (error) throw error
    return { user: data.user, session: data.session }
  },

  /**
   * Actualiza el perfil del usuario (nombre, avatar, género)
   */
  async updateProfile(updates: UpdateProfileData): Promise<User | null> {
    if (!isSupabaseConfigured) {
      const mockUser = getStoredMockUser()
      if (!mockUser) return null
      mockUser.user_metadata = {
        ...mockUser.user_metadata,
        ...updates,
      }
      setStoredMockUser(mockUser)
      notifyMockListeners('USER_UPDATED', mockUser)
      return mockUser
    }

    // 1. Actualizar metadatos en Supabase Auth
    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...updates,
      },
    })
    if (error) throw error

    // 2. Sincronizar en la tabla public.profiles
    if (data.user) {
      const profileUpdates: Database['public']['Tables']['profiles']['Update'] = {
        updated_at: new Date().toISOString(),
      }
      if (updates.username !== undefined) profileUpdates.username = updates.username
      if (updates.avatar_url !== undefined) profileUpdates.avatar_url = updates.avatar_url
      if (updates.genero !== undefined) profileUpdates.genero = updates.genero

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', data.user.id)

      if (profileError) {
        console.warn('Error sincronizando public.profiles:', profileError.message)
      }
    }

    return data.user
  },

  /**
   * Obtiene el perfil del usuario desde public.profiles
   */
  async getProfile(userId: string): Promise<UpdateProfileData | null> {
    if (!isSupabaseConfigured) {
      const mockUser = getStoredMockUser()
      if (!mockUser) return null
      return {
        username: mockUser.user_metadata?.username,
        avatar_url: mockUser.user_metadata?.avatar_url,
        genero: mockUser.user_metadata?.genero || 'femenino',
      }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url, genero')
        .eq('id', userId)
        .single()

      if (error || !data) return null
      return data as UpdateProfileData
    } catch {
      return null
    }
  },

  /**
   * Cerrar sesión
   */
  async signOut(): Promise<void> {
    setStoredMockUser(null)
    localStorage.removeItem(MOCK_STORAGE_KEY)

    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.warn('Error en supabase.auth.signOut:', err)
      }
    } else {
      notifyMockListeners('SIGNED_OUT', null)
    }
  },
  /**
   * Elimina la cuenta y perfil del usuario actual permanentemente
   */
  async deleteAccount(): Promise<void> {
    if (!isSupabaseConfigured) {
      setStoredMockUser(null)
      localStorage.removeItem(MOCK_STORAGE_KEY)
      notifyMockListeners('SIGNED_OUT', null)
      return
    }

    try {
      const { error } = await supabase.rpc('delete_user_account')
      if (error) {
        console.warn('RPC delete_user_account error, intentando borrado directo de profile:', error.message)
        const { data } = await supabase.auth.getUser()
        if (data?.user?.id) {
          await supabase.from('profiles').delete().eq('id', data.user.id)
        }
      }
    } catch (e) {
      console.warn('Error eliminando cuenta:', e)
    }

    await this.signOut()
  },

  /**
   * Listener global de cambios en el estado de autenticación
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): { unsubscribe: () => void } {
    if (!isSupabaseConfigured) {
      mockListeners.add(callback)
      return {
        unsubscribe: () => {
          mockListeners.delete(callback)
        },
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
    return {
      unsubscribe: () => {
        subscription.unsubscribe()
      },
    }
  },
}
