import type { User } from '@supabase/supabase-js'

export const MOCK_USER_ID = 'mock-user-nakama-1'
export const MOCK_USER_EMAIL = 'nakama@local.dev'

export function getMockUser(overrides: Partial<User> = {}): User {
  return {
    id: MOCK_USER_ID,
    aud: 'authenticated',
    email: MOCK_USER_EMAIL,
    user_metadata: {
      username: 'Capitán Nakama',
      genero: 'masculino',
      avatar_url: null,
    },
    app_metadata: {},
    created_at: new Date().toISOString(),
    ...overrides,
  } as User
}
