import type { User } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  isConfigured: boolean
}

export type AppRole = 'guest' | 'parent' | 'admin'

export interface AppAccessState {
  role: AppRole
  isLoading: boolean
  error: string | null
}
