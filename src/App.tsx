import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { GamificationProvider } from './context/GamificationContext'
import { UserPortalProvider } from './context/UserPortalContext'
import { useAppAccess } from './hooks/useAppAccess'
import { useDashboardData } from './hooks/useDashboardData'
import { useGamification } from './hooks/useGamification'
import { useSupabaseAuth } from './hooks/useSupabaseAuth'
import { AppShell } from './layouts/AppShell'
import { UserShell } from './layouts/UserShell'
import { AdmissionsPage } from './pages/AdmissionsPage'
import { BackendPage } from './pages/BackendPage'
import { DashboardPage } from './pages/DashboardPage'
import { EngagementPage } from './pages/EngagementPage'
import { LoginPage } from './pages/LoginPage'
import { ProgramsPage } from './pages/ProgramsPage'
import { StudentsPage } from './pages/StudentsPage'
import { UserAdmissionsPage } from './pages/user/UserAdmissionsPage'
import { UserAttendancePage } from './pages/user/UserAttendancePage'
import { UserBillingPage } from './pages/user/UserBillingPage'
import { UserHomePage } from './pages/user/UserHomePage'
import { UserMessagesPage } from './pages/user/UserMessagesPage'
import { UserProfilePage } from './pages/user/UserProfilePage'
import { initializeCrmTheme } from './services/themeService'
import type { AppAccessState, AuthState } from './types/auth'
import type { DashboardState } from './types/crm'
import type { GamificationContextValue } from './types/gamification'

interface ProtectedAdminLayoutProps {
  accessState: AppAccessState
  authState: AuthState
  dashboardState: DashboardState
  gamification: GamificationContextValue
}

interface ProtectedUserLayoutProps {
  accessState: AppAccessState
  authState: AuthState
}

interface LoadingScreenProps {
  detail: string
}

function AuthLoadingScreen({ detail }: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-[28px] border border-white/70 bg-white/85 px-6 py-5 text-center shadow-soft backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/50">
          Authentication
        </p>
        <p className="mt-2 text-sm text-ink/80">{detail}</p>
      </div>
    </div>
  )
}

function hasPendingRoleResolution(authState: AuthState, accessState: AppAccessState) {
  return (
    authState.isConfigured &&
    Boolean(authState.user) &&
    (authState.isLoading || accessState.isLoading || accessState.role === 'guest')
  )
}

function ProtectedAdminLayout({
  accessState,
  authState,
  dashboardState,
  gamification,
}: ProtectedAdminLayoutProps) {
  if (!authState.isConfigured) {
    return (
      <GamificationProvider value={gamification}>
        <AppShell authState={authState} dashboardState={dashboardState}>
          <Outlet />
        </AppShell>
      </GamificationProvider>
    )
  }

  if (hasPendingRoleResolution(authState, accessState)) {
    return <AuthLoadingScreen detail="Checking your admin workspace..." />
  }

  if (!authState.user) {
    return <Navigate to="/" replace />
  }

  if (accessState.role !== 'admin') {
    return <Navigate to="/user" replace />
  }

  return (
    <GamificationProvider value={gamification}>
      <AppShell authState={authState} dashboardState={dashboardState}>
        <Outlet />
      </AppShell>
    </GamificationProvider>
  )
}

function ProtectedUserLayout({ accessState, authState }: ProtectedUserLayoutProps) {
  const portalStorageKey = authState.user?.id ?? 'demo-parent'

  if (!authState.isConfigured) {
    return (
      <UserPortalProvider authUserId={null} storageKeySeed={portalStorageKey}>
        <UserShell authState={authState} />
      </UserPortalProvider>
    )
  }

  if (hasPendingRoleResolution(authState, accessState)) {
    return <AuthLoadingScreen detail="Preparing your family workspace..." />
  }

  if (!authState.user) {
    return <Navigate to="/" replace />
  }

  if (accessState.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return (
    <UserPortalProvider authUserId={authState.user.id} storageKeySeed={portalStorageKey}>
      <UserShell authState={authState} />
    </UserPortalProvider>
  )
}

function App() {
  const authState = useSupabaseAuth()
  const accessState = useAppAccess(authState)
  const dashboardState = useDashboardData(authState.user?.id)
  const gamification = useGamification()

  useEffect(() => {
    initializeCrmTheme()
  }, [])

  const isRolePending = hasPendingRoleResolution(authState, accessState)

  return (
    <Routes>
      <Route
        path="/"
        element={
          !authState.isConfigured ? (
            <LoginPage authState={authState} />
          ) : isRolePending ? (
            <AuthLoadingScreen detail="Preparing your workspace..." />
          ) : authState.user ? (
            <Navigate to={accessState.role === 'admin' ? '/admin' : '/user'} replace />
          ) : (
            <LoginPage authState={authState} />
          )
        }
      />
      <Route path="/login" element={<Navigate to="/" replace />} />

      <Route path="/user" element={<ProtectedUserLayout authState={authState} accessState={accessState} />}>
        <Route index element={<UserHomePage />} />
        <Route path="admissions" element={<UserAdmissionsPage />} />
        <Route path="attendance" element={<UserAttendancePage />} />
        <Route path="messages" element={<UserMessagesPage />} />
        <Route path="billing" element={<UserBillingPage />} />
        <Route path="profile" element={<UserProfilePage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedAdminLayout
            accessState={accessState}
            authState={authState}
            dashboardState={dashboardState}
            gamification={gamification}
          />
        }
      >
        <Route index element={<DashboardPage state={dashboardState} />} />
        <Route path="admissions" element={<AdmissionsPage state={dashboardState} />} />
        <Route path="students" element={<StudentsPage state={dashboardState} />} />
        <Route path="programs" element={<ProgramsPage state={dashboardState} />} />
        <Route path="engagement" element={<EngagementPage state={dashboardState} />} />
        <Route path="backend" element={<BackendPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
