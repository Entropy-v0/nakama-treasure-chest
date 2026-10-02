import type { User, Session } from '@supabase/supabase-js'

export type UserGenero = 'masculino' | 'femenino'

export interface UserProfile {
  id: string
  email?: string
  username?: string
  avatar_url?: string
  genero?: UserGenero
}

export interface UpdateProfileData {
  username?: string
  avatar_url?: string
  genero?: UserGenero
}

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
}
