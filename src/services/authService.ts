import { hasSupabaseConfig, supabase } from './supabase'

export async function signInWithGoogle() {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error('Supabase is not configured yet.')
  }

  const redirectTo =
    import.meta.env.VITE_SUPABASE_REDIRECT_URL ?? window.location.origin

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    throw error
  }
}

export async function signInWithPassword(email: string, password: string) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error('Supabase is not configured yet.')
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }
}

export async function signOutUser() {
  if (!supabase) {
    return
  }

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}
