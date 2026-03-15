import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useDashboardData } from './hooks/useDashboardData'
import { useSupabaseAuth } from './hooks/useSupabaseAuth'
import { AppShell } from './layouts/AppShell'
import { AdmissionsPage } from './pages/AdmissionsPage'
import { BackendPage } from './pages/BackendPage'
import { DashboardPage } from './pages/DashboardPage'
import { EngagementPage } from './pages/EngagementPage'
import { LoginPage } from './pages/LoginPage'
import { ProgramsPage } from './pages/ProgramsPage'
import { StudentsPage } from './pages/StudentsPage'
import { initializeCrmTheme } from './services/themeService'
import type { AuthState } from './types/auth'
import type { DashboardState } from './types/crm'

interface ProtectedLayoutProps {
  authState: AuthState
  dashboardState: DashboardState
}

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-[28px] border border-white/70 bg-white/80 px-6 py-5 text-center shadow-soft backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/50">
          Authentication
        </p>
        <p className="mt-2 text-sm text-ink/70">Checking your session...</p>
      </div>
    </div>
  )
}

function ProtectedLayout({ authState, dashboardState }: ProtectedLayoutProps) {
  if (authState.isConfigured && authState.isLoading) {
    return <AuthLoadingScreen />
  }

  if (authState.isConfigured && !authState.user) {
    return <Navigate to="/login" replace />
  }

  return (
    <AppShell authState={authState} dashboardState={dashboardState}>
      <Routes>
        <Route index element={<DashboardPage state={dashboardState} />} />
        <Route path="/admissions" element={<AdmissionsPage state={dashboardState} />} />
        <Route path="/students" element={<StudentsPage state={dashboardState} />} />
        <Route path="/programs" element={<ProgramsPage state={dashboardState} />} />
        <Route path="/engagement" element={<EngagementPage state={dashboardState} />} />
        <Route path="/backend" element={<BackendPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

function App() {
  const authState = useSupabaseAuth()
  const dashboardState = useDashboardData(authState.user?.id)

  useEffect(() => {
    initializeCrmTheme()
  }, [])

  return (
    <Routes>
      <Route
        path="/login"
        element={
          authState.isConfigured && authState.isLoading ? (
            <AuthLoadingScreen />
          ) : authState.isConfigured && authState.user ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage authState={authState} />
          )
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedLayout authState={authState} dashboardState={dashboardState} />
        }
      />
    </Routes>
  )
}

export default App
