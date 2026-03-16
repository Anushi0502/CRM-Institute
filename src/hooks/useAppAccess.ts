import { startTransition, useEffect, useState } from 'react'
import type { PostgrestError } from '@supabase/supabase-js'
import { getBackendAccess } from '../services/backendAdminService'
import { hasSupabaseConfig, supabase } from '../services/supabase'
import type { AppAccessState, AuthState } from '../types/auth'

const initialState: AppAccessState = {
  role: 'guest',
  isLoading: false,
  error: null,
}

export function useAppAccess(authState: AuthState) {
  const [state, setState] = useState<AppAccessState>(initialState)

  useEffect(() => {
    let isCancelled = false

    if (!authState.isConfigured) {
      startTransition(() => {
        setState(initialState)
      })
      return
    }

    if (authState.isLoading) {
      startTransition(() => {
        setState((current) => ({
          ...current,
          isLoading: true,
          error: null,
        }))
      })
      return
    }

    if (!authState.user) {
      startTransition(() => {
        setState(initialState)
      })
      return
    }

    if (!hasSupabaseConfig || !supabase) {
      startTransition(() => {
        setState({
          role: 'parent',
          isLoading: false,
          error: null,
        })
      })
      return
    }

    startTransition(() => {
      setState((current) => ({
        ...current,
        isLoading: true,
        error: null,
      }))
    })

    const userId = authState.user.id

    void (async () => {
      try {
        const { data, error } = await supabase
          .from('crm_backend_users')
          .select('app_role')
          .eq('id', userId)
          .maybeSingle()

        if (isCancelled) {
          return
        }

        const isMissingSchema = Boolean(
          error &&
            ((error as PostgrestError).code === '42P01' ||
              (error as PostgrestError).code === 'PGRST205' ||
              error.message.toLowerCase().includes('relation')),
        )

        if (!error && !data?.app_role) {
          try {
            const access = await getBackendAccess()

            if (isCancelled) {
              return
            }

            startTransition(() => {
              setState({
                role: access.appRole === 'admin' ? 'admin' : 'parent',
                isLoading: false,
                error: null,
              })
            })
            return
          } catch {
            // Fall through to parent-safe default below.
          }
        }

        startTransition(() => {
          setState({
            role: data?.app_role === 'admin' ? 'admin' : 'parent',
            isLoading: false,
            error: isMissingSchema
              ? 'Backend access table is not initialized yet. Defaulting this account to parent access.'
              : error?.message ?? null,
          })
        })
      } catch (error) {
        if (isCancelled) {
          return
        }

        // Fail closed for admin access: authenticated users become parents unless verified as admin.
        startTransition(() => {
          setState({
            role: 'parent',
            isLoading: false,
            error: error instanceof Error ? error.message : 'Access lookup failed.',
          })
        })
      }
    })()

    return () => {
      isCancelled = true
    }
  }, [authState.isConfigured, authState.isLoading, authState.user?.id])

  return state
}
