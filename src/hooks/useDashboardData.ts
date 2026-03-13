import { startTransition, useEffect, useState } from 'react'
import { getDashboardSnapshot } from '../services/crmService'
import { crmDemoData } from '../services/mockDashboard'
import type { DashboardState } from '../types/crm'

const initialState: DashboardState = {
  data: crmDemoData,
  isLoading: true,
  error: null,
}

export function useDashboardData(userId?: string) {
  const [state, setState] = useState<DashboardState>(initialState)

  useEffect(() => {
    let isCancelled = false

    async function loadDashboard() {
      try {
        const nextSnapshot = await getDashboardSnapshot()

        if (isCancelled) {
          return
        }

        startTransition(() => {
          setState({
            data: nextSnapshot,
            isLoading: false,
            error: null,
          })
        })
      } catch (error) {
        if (isCancelled) {
          return
        }

        const message =
          error instanceof Error
            ? error.message
            : 'The CRM could not reach Supabase. Demo data is still available locally.'

        startTransition(() => {
          setState({
            data: {
              ...crmDemoData,
              message:
                'Supabase request failed, so the CRM stayed on demo data. Check your project URL, anon key, and auth configuration.',
              lastSyncedAt: new Date().toISOString(),
            },
            isLoading: false,
            error: message,
          })
        })
      }
    }

    loadDashboard()

    return () => {
      isCancelled = true
    }
  }, [userId])

  return state
}
