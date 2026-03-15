import { useState, type ReactNode } from 'react'
import {
  BookOpenCheck,
  CalendarClock,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquareHeart,
  ServerCog,
  Sparkles,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import kidsRainbowBanner from '../assets/kids-rainbow-banner.svg'
import { signOutUser } from '../services/authService'
import type { AuthState } from '../types/auth'
import type { ConnectionState, DashboardState } from '../types/crm'
import { formatSyncTimestamp } from '../utils/formatters'

interface AppShellProps {
  authState: AuthState
  dashboardState: DashboardState
  children: ReactNode
}

interface NavigationItem {
  path: string
  label: string
  icon: LucideIcon
}

const navigation: NavigationItem[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admissions', label: 'Admissions', icon: Users },
  { path: '/students', label: 'Students', icon: GraduationCap },
  { path: '/programs', label: 'Programs', icon: BookOpenCheck },
  { path: '/engagement', label: 'Engagement', icon: MessageSquareHeart },
  { path: '/backend', label: 'Backend', icon: ServerCog },
]

const pageTitles: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Institute overview',
    description:
      'A family-friendly CRM for admissions movement, family trust, and student care from 6 months to 7 years.',
  },
  '/admissions': {
    title: 'Admissions pipeline',
    description:
      'Track inquiries, tours, applications, and waitlist movement without losing warm family context.',
  },
  '/students': {
    title: 'Student success',
    description:
      'Keep attendance, pickup, tuition, and developmental touchpoints readable for every family.',
  },
  '/programs': {
    title: 'Programs and staffing',
    description:
      'Balance capacity, waitlists, and classroom storytelling across infant to pre-k programs.',
  },
  '/engagement': {
    title: 'Family engagement',
    description:
      'Surface the conversations, reminders, and next actions that keep enrollment and retention healthy.',
  },
  '/backend': {
    title: 'Backend administration',
    description:
      'Control Supabase auth and data operations from a secured backend path, including user sign-in toggles and student management.',
  },
}

const learningStages = [
  {
    label: 'Infant care · 6 to 18 months',
    style: 'border-sky/35 bg-sky/15',
  },
  {
    label: 'Toddler play · 18 months to 3 years',
    style: 'border-berry/30 bg-berry/15',
  },
  {
    label: 'Early years · 3 to 7 years',
    style: 'border-leaf/35 bg-leaf/15',
  },
]

const statusStyles: Record<ConnectionState, string> = {
  demo: 'bg-amber/20 text-amber-700',
  'schema-pending': 'bg-coral/10 text-coral',
  live: 'bg-teal/10 text-teal',
}

const statusLabels: Record<ConnectionState, string> = {
  demo: 'Demo mode',
  'schema-pending': 'Schema pending',
  live: 'Supabase live',
}

function isActivePath(currentPath: string, itemPath: string) {
  return itemPath === '/' ? currentPath === '/' : currentPath.startsWith(itemPath)
}

export function AppShell({ authState, dashboardState, children }: AppShellProps) {
  const location = useLocation()
  const [actionError, setActionError] = useState<string | null>(null)
  const pageMeta = pageTitles[location.pathname] ?? pageTitles['/']
  const highPriorityLeads = dashboardState.data.leads.filter((lead) => lead.priority === 'High').length
  const reviewStudents = dashboardState.data.students.filter(
    (student) => student.tuitionStatus === 'Review',
  ).length
  const pendingTasks = dashboardState.data.tasks.filter((task) => task.status !== 'Done').length

  async function handleSignOut() {
    try {
      setActionError(null)
      await signOutUser()
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Sign out could not complete.',
      )
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="crm-orb crm-orb--teal" />
      <div className="crm-orb crm-orb--coral" />
      <div className="crm-orb crm-orb--plum" />
      <div className="kid-sprinkle kid-sprinkle--one" />
      <div className="kid-sprinkle kid-sprinkle--two" />
      <div className="kid-sprinkle kid-sprinkle--three" />

      <div className="relative mx-auto flex max-w-[1600px] gap-5 px-4 py-4 lg:px-6">
        <aside className="hidden w-[320px] shrink-0 flex-col gap-6 rounded-[34px] border border-white/75 bg-[var(--crm-gradient-sidebar)] p-6 shadow-float backdrop-blur xl:flex">
          <BrandMark />

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-[var(--crm-gradient-nav-active)] text-white shadow-soft'
                        : 'text-ink/70 hover:bg-cloud/90'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="rounded-[28px] border border-sun/40 bg-[var(--crm-gradient-warm-card)] p-5">
            <div className="flex items-center gap-3 text-sm font-semibold text-ink">
              <Sparkles className="h-4 w-4 text-amber" />
              Kids-first visual direction
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/65">
              Colors, rounded cards, and sticker-style chips are tuned for
              families and staff supporting little learners ages 6 months to 7 years.
            </p>
          </div>

          <div className="rounded-[28px] border border-ink/5 bg-white/90 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/45">
              Learning stages
            </p>
            <div className="mt-3 space-y-2">
              {learningStages.map((stage) => (
                <p
                  key={stage.label}
                  className={`rounded-2xl border px-3 py-2 text-sm font-semibold text-ink/75 ${stage.style}`}
                >
                  {stage.label}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-ink/5 bg-white/90 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/45">
              Sync status
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[dashboardState.data.source]}`}
              >
                {statusLabels[dashboardState.data.source]}
              </span>
              <span className="text-sm text-ink/55">
                {dashboardState.isLoading
                  ? 'Syncing now...'
                  : formatSyncTimestamp(dashboardState.data.lastSyncedAt)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/65">{dashboardState.data.message}</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-5">
          <header className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/88 p-5 shadow-soft backdrop-blur md:p-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[var(--crm-gradient-header-top)]" />
            <div className="pointer-events-none absolute right-6 top-8 h-12 w-12 rounded-full bg-sun/35 blur-md" />

            <div className="relative z-10 mb-4 overflow-hidden rounded-[22px] border border-white/70 bg-white/60">
              <img
                src={kidsRainbowBanner}
                alt="Colorful early-learning visual"
                className="h-20 w-full object-cover"
              />
              <div className="absolute inset-0 bg-[var(--crm-gradient-banner-overlay)]" />
              <p className="absolute left-4 top-1/2 -translate-y-1/2 font-kids text-sm text-white md:text-base">
                Designed for infant, toddler, and early-years teams
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-cloud px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-ink/55">
                    <CalendarClock className="h-3.5 w-3.5 text-coral" />
                    Edina Campus CRM
                  </span>
                  <span className="kid-sticker bg-sun/30 text-ink">
                    <Sparkles className="h-3.5 w-3.5" />
                    Ages 6 months to 7 years
                  </span>
                </div>
                <div>
                  <h1 className="font-display text-4xl leading-tight text-ink md:text-5xl">
                    {pageMeta.title}
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/65 md:text-base">
                    {pageMeta.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-full border border-teal/25 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
                    {highPriorityLeads} high-priority leads
                  </span>
                  <span className="rounded-full border border-coral/25 bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                    {reviewStudents} tuition reviews
                  </span>
                  <span className="rounded-full border border-amber/30 bg-amber/20 px-3 py-1 text-xs font-semibold text-amber-700">
                    {pendingTasks} active tasks
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[dashboardState.data.source]}`}
                >
                  {dashboardState.isLoading ? 'Syncing dashboard' : statusLabels[dashboardState.data.source]}
                </span>
                {authState.user ? (
                  <div className="flex items-center gap-3 rounded-full bg-cloud px-3 py-2 text-sm text-ink">
                    <span className="max-w-40 truncate font-semibold">
                      {authState.user.email}
                    </span>
                    <button
                      onClick={() => {
                        void handleSignOut()
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 font-semibold text-ink transition hover:bg-ink hover:text-white"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="rounded-full bg-cloud px-4 py-2 text-sm font-semibold text-ink/70">
                    {authState.isConfigured ? 'User session not found' : 'Demo mode'}
                  </div>
                )}
              </div>
            </div>

            <div className="relative z-10 mt-5 flex gap-3 overflow-x-auto pb-1 xl:hidden">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = isActivePath(location.pathname, item.path)

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-ink text-white'
                        : 'bg-cloud text-ink/70 hover:bg-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                )
              })}
            </div>

            {dashboardState.error ? (
              <div className="relative z-10 mt-5 rounded-[24px] border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
                {dashboardState.error}
              </div>
            ) : null}

            {authState.error || actionError ? (
              <div className="relative z-10 mt-3 rounded-[24px] border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
                {actionError ?? authState.error}
              </div>
            ) : null}
          </header>

          {children}
        </main>
      </div>
    </div>
  )
}
