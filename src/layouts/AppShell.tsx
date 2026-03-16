import { useEffect, useState, type ReactNode } from 'react'
import {
  BookOpenCheck,
  CalendarClock,
  Flame,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquareHeart,
  ServerCog,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { BadgeShelf } from '../components/BadgeShelf'
import { GameHud } from '../components/GameHud'
import { MobileBottomNav } from '../components/MobileBottomNav'
import { QuestPanel } from '../components/QuestPanel'
import { ThemeSwitcher } from '../components/ThemeSwitcher'
import kidsRainbowBanner from '../assets/kids-rainbow-banner.svg'
import { useGamificationContext } from '../context/GamificationContext'
import { signOutUser } from '../services/authService'
import {
  applyCrmTheme,
  getStoredCrmTheme,
  saveCrmTheme,
  type CrmThemeKey,
} from '../services/themeService'
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

const adminBasePath = '/admin'

const navigation: NavigationItem[] = [
  { path: adminBasePath, label: 'Dashboard', icon: LayoutDashboard },
  { path: `${adminBasePath}/admissions`, label: 'Admissions', icon: Users },
  { path: `${adminBasePath}/students`, label: 'Students', icon: GraduationCap },
  { path: `${adminBasePath}/programs`, label: 'Programs', icon: BookOpenCheck },
  { path: `${adminBasePath}/engagement`, label: 'Engagement', icon: MessageSquareHeart },
  { path: `${adminBasePath}/backend`, label: 'Backend', icon: ServerCog },
]

const pageTitles: Record<string, { title: string; description: string }> = {
  '/admin': {
    title: 'Institute overview',
    description:
      'A family-friendly CRM for admissions movement, family trust, and student care from 6 months to 7 years.',
  },
  '/admin/admissions': {
    title: 'Admissions pipeline',
    description:
      'Track inquiries, tours, applications, and waitlist movement without losing warm family context.',
  },
  '/admin/students': {
    title: 'Student success',
    description:
      'Keep attendance, pickup, tuition, and developmental touchpoints readable for every family.',
  },
  '/admin/programs': {
    title: 'Programs and staffing',
    description:
      'Balance capacity, waitlists, and classroom storytelling across infant to pre-k programs.',
  },
  '/admin/engagement': {
    title: 'Family engagement',
    description:
      'Surface the conversations, reminders, and next actions that keep enrollment and retention healthy.',
  },
  '/admin/backend': {
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

export function AppShell({ authState, dashboardState, children }: AppShellProps) {
  const location = useLocation()
  const [actionError, setActionError] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<CrmThemeKey>(() => getStoredCrmTheme())
  const [clockLabel, setClockLabel] = useState(() =>
    new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
  )

  const {
    badges,
    clearCelebration,
    latestCelebration,
    quests,
    summary,
    visitPage,
  } = useGamificationContext()

  const pageMeta = pageTitles[location.pathname] ?? pageTitles[adminBasePath]
  const highPriorityLeads = dashboardState.data.leads.filter((lead) => lead.priority === 'High').length
  const reviewStudents = dashboardState.data.students.filter(
    (student) => student.tuitionStatus === 'Review',
  ).length
  const pendingTasks = dashboardState.data.tasks.filter((task) => task.status !== 'Done').length
  const spotlightBadges = badges.slice(0, 3)

  const quickNavigation = [
    {
      path: `${adminBasePath}/admissions`,
      label: 'Admissions lane',
      detail: `${highPriorityLeads} high-priority families`,
      icon: Users,
      style: 'border-coral/25 bg-coral/10 text-coral',
    },
    {
      path: `${adminBasePath}/students`,
      label: 'Student support',
      detail: `${reviewStudents} tuition reviews`,
      icon: GraduationCap,
      style: 'border-amber/35 bg-amber/20 text-amber-700',
    },
    {
      path: `${adminBasePath}/engagement`,
      label: 'Care follow-up',
      detail: `${pendingTasks} active tasks`,
      icon: MessageSquareHeart,
      style: 'border-teal/25 bg-teal/10 text-teal',
    },
  ]

  const quickActions = navigation.filter((item) => item.path !== location.pathname)

  useEffect(() => {
    visitPage(location.pathname)
  }, [location.pathname, visitPage])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClockLabel(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
    }, 60_000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  function handleThemeSelect(theme: CrmThemeKey) {
    setSelectedTheme(theme)
    applyCrmTheme(theme)
    saveCrmTheme(theme)
  }

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
    <div className="crm-readable relative min-h-screen overflow-x-clip">
      <div className="crm-orb crm-orb--teal" />
      <div className="crm-orb crm-orb--coral" />
      <div className="crm-orb crm-orb--plum" />
      <div className="kid-sprinkle kid-sprinkle--one" />
      <div className="kid-sprinkle kid-sprinkle--two" />
      <div className="kid-sprinkle kid-sprinkle--three" />

      <div className="relative mx-auto max-w-[1720px] px-4 pb-24 pt-4 lg:px-6 xl:pb-8">
        <header className="crm-command-shell rounded-[34px] border border-white/90 bg-white/95 p-4 shadow-float backdrop-blur-xl md:p-6">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-ink/10 bg-white/90 px-4 py-2.5 backdrop-blur-md">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/65">
              <Sparkles className="h-3.5 w-3.5 text-coral" />
              BrightMinds command deck
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="kid-ribbon border-teal/20 bg-teal/10 text-teal">
                <CalendarClock className="h-3.5 w-3.5" />
                {clockLabel}
              </span>
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[dashboardState.data.source]}`}
              >
                {dashboardState.isLoading ? 'Syncing dashboard' : statusLabels[dashboardState.data.source]}
              </span>
              {authState.user ? (
                <div className="flex items-center gap-2 rounded-full bg-cloud px-3 py-1.5 text-xs text-ink sm:text-sm">
                  <span className="max-w-44 truncate font-semibold">{authState.user.email}</span>
                  <button
                    onClick={() => {
                      void handleSignOut()
                    }}
                    className="kid-ghost-button inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold text-ink transition hover:bg-ink hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="rounded-full bg-cloud px-4 py-2 text-xs font-semibold text-ink/80 sm:text-sm">
                  {authState.isConfigured ? 'User session not found' : 'Demo mode'}
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.45fr),minmax(240px,0.82fr)]">
              <div className="overflow-hidden rounded-[24px] border border-white/35 crm-bg-brand p-5 text-white shadow-soft md:p-6">
  <div className="relative z-10">
  <p className="inline-flex items-center rounded-full border border-slate-300/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-900 shadow-sm backdrop-blur-sm">
    Hybrid command bento split
  </p>

  <h1 className="mt-4 font-display text-4xl leading-tight text-slate-950 drop-shadow-sm md:text-5xl">
    {pageMeta.title}
  </h1>

  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-800 md:text-base">
    {pageMeta.description}
  </p>
</div>

  <div className="relative z-10 mt-4 overflow-hidden rounded-2xl border border-white/30">
    <img
      src={kidsRainbowBanner}
      alt="Colorful early-learning visual"
      className="h-20 w-full object-cover"
    />
    <div className="absolute inset-0 z-0 bg-white/20" />
    <p className="absolute left-4 top-1/2 z-10 -translate-y-1/2 font-kids text-sm text-slate-900 md:text-base">
      Master workspace for infant, toddler, and early-years teams
    </p>
  </div>
</div>
            <div className="grid gap-2 rounded-[24px] border border-ink/20 bg-ink/95 p-4 text-white shadow-soft backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Executive pulse</p>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                  {highPriorityLeads} high-priority leads
                </span>
                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                  {reviewStudents} tuition reviews
                </span>
                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                  {pendingTasks} active tasks
                </span>
                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                  <Trophy className="mr-1 inline-flex h-3.5 w-3.5 text-sun" />
                  Level {summary.level}
                </span>
                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                  <Flame className="mr-1 inline-flex h-3.5 w-3.5 text-coral" />
                  {summary.streakDays} day streak
                </span>
              </div>
            </div>
          </div>

          <div className="crm-command-nav mt-4">
            {navigation.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `crm-command-nav__item ${isActive ? 'crm-command-nav__item--active' : ''}`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </div>
        </header>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.38fr),minmax(300px,0.62fr)]">
          <section className="min-w-0 space-y-4">
            <div className="kid-panel rounded-[28px] border border-ink/10 bg-white/95 p-4 md:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">Command strip</p>
                  <h2 className="mt-2 font-display text-2xl text-ink">Executive pulse and quick route cards</h2>
                </div>
                <span className="rounded-full border border-ink/10 bg-cloud px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
                  Split focus lane
                </span>
              </div>

              <div className="mt-4 grid gap-2.5 md:grid-cols-3">
                {quickNavigation.map((item) => {
                  const Icon = item.icon

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className="rounded-[18px] border border-white/90 bg-white/95 px-3 py-3 transition hover:-translate-y-0.5 hover:shadow-soft"
                    >
                      <p className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${item.style}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-ink/80">{item.detail}</p>
                    </NavLink>
                  )
                })}
              </div>
            </div>

            <div className="kid-panel rounded-[28px] border border-ink/10 bg-white/95 p-4 md:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">Primary workspace</p>
                  <h2 className="mt-2 font-display text-2xl text-ink">Route mission board</h2>
                </div>
                <span className="rounded-full border border-teal/25 bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal">
                  {dashboardState.isLoading
                    ? 'Syncing now'
                    : formatSyncTimestamp(dashboardState.data.lastSyncedAt)}
                </span>
              </div>

              {dashboardState.error ? (
                <div className="mt-4 rounded-[20px] border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
                  {dashboardState.error}
                </div>
              ) : null}

              {authState.error || actionError ? (
                <div className="mt-3 rounded-[20px] border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
                  {actionError ?? authState.error}
                </div>
              ) : null}

              {latestCelebration ? (
                <div className="mt-3 rounded-[20px] border border-amber/35 bg-amber/20 px-4 py-3 text-sm text-ink shadow-soft">
                  <p className="font-semibold">
                    {latestCelebration.title}: {latestCelebration.message}
                    {latestCelebration.points ? ` (+${latestCelebration.points} XP)` : ''}
                  </p>
                  <button
                    onClick={clearCelebration}
                    className="mt-2 rounded-full border border-ink/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink/70 transition hover:bg-white"
                  >
                    Dismiss
                  </button>
                </div>
              ) : null}

              <div key={location.pathname} className="crm-page-reveal mt-4 rounded-[22px] border border-white/90 bg-white/95 p-2 md:p-3 backdrop-blur-md">
                {children}
              </div>
            </div>

            <div className="kid-panel rounded-[28px] border border-ink/10 bg-white/95 p-4 md:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">Quick actions</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {quickActions.map((item) => {
                  const Icon = item.icon

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className="inline-flex items-center justify-between rounded-[16px] border border-ink/10 bg-white/95 px-3 py-2.5 text-sm font-semibold text-ink/80 transition hover:border-teal/30 hover:bg-cloud/90"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </span>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          </section>

          <aside className="hidden xl:block">
            <div className="sticky top-4 flex max-h-[calc(100vh-2rem)] flex-col gap-4 overflow-y-auto pr-1">
              <div className="kid-panel rounded-[28px] border border-ink/10 bg-white/95 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/60">Learning stages</p>
                <div className="mt-3 space-y-2">
                  {learningStages.map((stage) => (
                    <p key={stage.label} className={`rounded-2xl border px-3 py-2 text-sm font-semibold text-ink/75 ${stage.style}`}>
                      {stage.label}
                    </p>
                  ))}
                </div>
              </div>

              <div className="kid-panel rounded-[28px] border border-ink/10 bg-white/95 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/60">Data pulse</p>
                <p className="mt-3 text-sm leading-6 text-ink/80">{dashboardState.data.message}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-ink/60">
                  {dashboardState.isLoading
                    ? 'Syncing now...'
                    : formatSyncTimestamp(dashboardState.data.lastSyncedAt)}
                </p>
              </div>

              <GameHud summary={summary} />
              <QuestPanel quests={quests} />
              <BadgeShelf badges={spotlightBadges} />
              <ThemeSwitcher selectedTheme={selectedTheme} onThemeSelect={handleThemeSelect} />
            </div>
          </aside>
        </div>

        <div className="mt-5 space-y-4 xl:hidden">
          <div className="kid-panel rounded-[26px] border border-ink/10 bg-white/95 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/60">Learning stages</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {learningStages.map((stage) => (
                <p key={stage.label} className={`rounded-2xl border px-3 py-2 text-sm font-semibold text-ink/75 ${stage.style}`}>
                  {stage.label}
                </p>
              ))}
            </div>
          </div>
          <GameHud summary={summary} compact />
          <ThemeSwitcher selectedTheme={selectedTheme} onThemeSelect={handleThemeSelect} compact />
        </div>
      </div>

      <MobileBottomNav items={navigation} />
    </div>
  )
}
