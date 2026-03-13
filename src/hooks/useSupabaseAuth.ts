import { startTransition, useEffect, useState } from 'react'
import type { AuthState } from '../types/auth'
import { hasSupabaseConfig, supabase } from '../services/supabase'

const initialState: AuthState = {
  user: null,
  isLoading: hasSupabaseConfig,
  error: null,
  isConfigured: hasSupabaseConfig,
}

export function useSupabaseAuth() {
  const [state, setState] = useState<AuthState>(initialState)

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      return
    }

    let isCancelled = false

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (isCancelled) {
          return
        }

        startTransition(() => {
          setState({
            user: data.session?.user ?? null,
            isLoading: false,
            error: error?.message ?? null,
            isConfigured: true,
          })
        })
      })
      .catch((error: Error) => {
        if (isCancelled) {
          return
        }

        startTransition(() => {
          setState({
            user: null,
            isLoading: false,
            error: error.message,
            isConfigured: true,
          })
        })
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isCancelled) {
        return
      }

      startTransition(() => {
        setState((current) => ({
          ...current,
          user: session?.user ?? null,
          isLoading: false,
        }))
      })
    })

    return () => {
      isCancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return state
}
