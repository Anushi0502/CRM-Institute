import { useMemo, useState } from 'react'
import {
  BellRing,
  CalendarDays,
  ChevronDown,
  Cloud,
  FilePenLine,
  LayoutGrid,
  MessageCircleMore,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import kidsRainbowBanner from '../assets/kids-rainbow-banner.svg'
import { MobileBottomNav } from '../components/MobileBottomNav'
import { useUserPortal } from '../hooks/useUserPortal'
import { signOutUser } from '../services/authService'
import type { AuthState } from '../types/auth'

interface UserNavItem {
  path: string
  label: string
  icon: LucideIcon
}

interface ShellAction {
  label: string
  path: string
}

const navItems: UserNavItem[] = [
  { path: '/user', label: 'Home', icon: LayoutGrid },
  { path: '/user/admissions', label: 'Admissions', icon: FilePenLine },
  { path: '/user/attendance', label: 'Attendance', icon: CalendarDays },
  { path: '/user/messages', label: 'Messages', icon: MessageCircleMore },
  { path: '/user/billing', label: 'Billing', icon: ReceiptText },
  { path: '/user/profile', label: 'Family', icon: UserRound },
]

const pageMeta: Record<
  string,
  { title: string; description: string; badge: string; actions: ShellAction[] }
> = {
  '/user': {
    title: 'Parent home',
    description: 'Operate the full household account from one synced parent workspace with children, conversations, billing, and admissions in one place.',
    badge: 'Household overview',
    actions: [
      { label: 'Open messages', path: '/user/messages' },
      { label: 'Review attendance', path: '/user/attendance' },
      { label: 'Manage family', path: '/user/profile' },
    ],
  },
  '/user/admissions': {
    title: 'Admissions workspace',
    description: 'Start and advance applications per child, track missing documents, and keep every tour or enrollment update inside the same household account.',
    badge: 'Admissions desk',
    actions: [
      { label: 'View home', path: '/user' },
      { label: 'Open attendance', path: '/user/attendance' },
      { label: 'Open family profile', path: '/user/profile' },
    ],
  },
  '/user/attendance': {
    title: 'Attendance center',
    description: 'Monitor attendance across children, submit absence notes quickly, and keep pickup instructions aligned with the current family record.',
    badge: 'Attendance operations',
    actions: [
      { label: 'Open admissions', path: '/user/admissions' },
      { label: 'Open messages', path: '/user/messages' },
      { label: 'Manage family', path: '/user/profile' },
    ],
  },
  '/user/messages': {
    title: 'School conversations',
    description: 'Handle two-way teacher, admissions, billing, and office communication without leaving the household account context.',
    badge: 'Family inbox',
    actions: [
      { label: 'Open home', path: '/user' },
      { label: 'Review billing', path: '/user/billing' },
      { label: 'Open attendance', path: '/user/attendance' },
    ],
  },
  '/user/billing': {
    title: 'Billing and receipts',
    description: 'Track every due amount, receipt, and autopay action across the household while keeping invoices tied to the right child or family account lane.',
    badge: 'Billing center',
    actions: [
      { label: 'Open messages', path: '/user/messages' },
      { label: 'Open admissions', path: '/user/admissions' },
      { label: 'Manage family', path: '/user/profile' },
    ],
  },
  '/user/profile': {
    title: 'Family profile',
    description: 'Maintain the full household roster, contacts, care notes, and child records for a single parent account with up to 20 children.',
    badge: 'Household records',
    actions: [
      { label: 'Open home', path: '/user' },
      { label: 'Review attendance', path: '/user/attendance' },
      { label: 'Review billing', path: '/user/billing' },
    ],
  },
}

interface UserShellProps {
  authState: AuthState
}

function formatCount(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

export function UserShell({ authState }: UserShellProps) {
  const location = useLocation()
  const [actionError, setActionError] = useState<string | null>(null)
  const [isChildMenuOpen, setIsChildMenuOpen] = useState(false)
  const {
    activeChild,
    alerts,
    isHydrating,
    quickStats,
    selectChild,
    state,
    syncError,
    syncSource,
    totalDueAmountLabel,
    visibleInvoices,
    visibleResources,
    visibleThreads,
  } = useUserPortal()

  const page = pageMeta[location.pathname] ?? pageMeta['/user']
  const visibleEvents = useMemo(
    () =>
      activeChild
        ? state.events.filter((event) => event.childId === activeChild.id || event.childId === null)
        : state.events,
    [activeChild, state.events],
  )
  const nextEvent = visibleEvents[0] ?? null
  const unreadThreads = visibleThreads.filter((thread) => thread.unreadCount > 0).length
  const openInvoices = visibleInvoices.filter((invoice) => invoice.status !== 'Paid').length

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
    <div className="crm-readable relative min-h-screen overflow-x-clip px-4 py-4 pb-24 lg:px-6 xl:pb-6">
      <div className="crm-orb crm-orb--teal" />
      <div className="crm-orb crm-orb--coral" />
      <div className="crm-orb crm-orb--plum" />

      <div className="mx-auto w-full max-w-[1760px] space-y-4">
        <header className="kid-panel overflow-visible rounded-[36px] border border-white/90 bg-white/95 p-5 shadow-float backdrop-blur-xl md:p-6">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-ink/10 bg-white/90 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/65">
                <ShieldCheck className="h-3.5 w-3.5 text-coral" />
                BrightMinds family app
              </p>
              <span className="rounded-full border border-teal/25 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
                {page.badge}
              </span>
              <span className="rounded-full border border-ink/10 bg-cloud px-3 py-1 text-xs font-semibold text-ink/70">
                {state.children.length}/20 children onboarded
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  syncSource === 'supabase'
                    ? 'border border-teal/20 bg-teal/10 text-teal'
                    : 'border border-amber/20 bg-amber/15 text-amber-700'
                }`}
              >
                <Cloud className="h-3.5 w-3.5" />
                {isHydrating ? 'Syncing account' : syncSource === 'supabase' ? 'Supabase sync active' : 'Device cache mode'}
              </span>

              {authState.user ? (
                <div className="flex items-center gap-2 rounded-full bg-cloud px-3 py-1.5 text-xs text-ink sm:text-sm">
                  <span className="max-w-44 truncate font-semibold">{authState.user.email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      void handleSignOut()
                    }}
                    className="kid-ghost-button rounded-full px-3 py-1 font-semibold text-ink transition hover:bg-ink hover:text-white"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  to="/"
                  className="kid-ghost-button inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-ink/80 transition hover:bg-cloud"
                >
                  Back to login
                </Link>
              )}
            </div>
          </div>

          {actionError ? (
            <p className="mt-3 rounded-2xl border border-coral/25 bg-coral/10 px-4 py-2 text-sm text-coral">
              {actionError}
            </p>
          ) : null}

          {syncError ? (
            <p className="mt-3 rounded-2xl border border-amber/35 bg-amber/20 px-4 py-2 text-sm text-amber-700">
              {syncError}
            </p>
          ) : null}

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.48fr),minmax(320px,0.52fr)]">
            <section className="relative z-20 overflow-visible rounded-[28px] border border-white/40 crm-bg-brand p-5 text-white shadow-soft md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center rounded-full border border-slate-300/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-900 shadow-sm backdrop-blur-sm">
                    Single account, multi-child parent workspace
                  </p>
                  <h1 className="mt-3 max-w-4xl font-display text-4xl leading-tight text-slate-950 md:text-5xl">
                    {page.title}
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-800 md:text-base">
                    {page.description}
                  </p>
                </div>

                <div className="relative z-40 isolate min-w-[220px] rounded-[24px] border border-white/60 bg-[rgba(255,255,255,0.9)] p-4 text-slate-900 shadow-sm backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    Active child focus
                  </p>
                  {activeChild ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsChildMenuOpen((current) => !current)
                        }}
                        className="mt-3 inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-300/70 bg-white/90 px-3 py-2 text-left text-sm font-semibold text-slate-900"
                      >
                        <span className="truncate">{activeChild.name}</span>
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <p className="mt-3 text-sm text-slate-700">
                        {activeChild.program} · {activeChild.campus}
                      </p>
                      <p className="mt-2 text-sm text-slate-700">{activeChild.todayStatus}</p>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-slate-700">Add a child in the family page to unlock the full parent workspace.</p>
                  )}

                  {isChildMenuOpen ? (
                    <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[80] w-full rounded-[24px] border border-slate-300/80 bg-[rgba(255,255,255,0.995)] p-3 shadow-[0_24px_60px_rgba(var(--crm-shadow-color),0.22)] backdrop-blur-sm">
                      <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                        Household children
                      </p>
                      <div className="mt-2 space-y-2">
                        {state.children.length > 0 ? (
                          state.children.map((child) => (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => {
                                selectChild(child.id)
                                setIsChildMenuOpen(false)
                              }}
                              className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                                activeChild?.id === child.id
                                  ? 'border-ink bg-ink text-white'
                                  : 'border-ink/10 bg-white text-ink hover:border-teal/30 hover:bg-cloud'
                              }`}
                            >
                              <p className="font-semibold">{child.name}</p>
                              <p className="mt-1 text-sm opacity-80">{child.program}</p>
                            </button>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-ink/15 px-3 py-4 text-sm text-ink/70">
                            No children added yet.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-4">
                {quickStats.map((stat) => (
                  <div key={stat.label} className={`rounded-[22px] border px-3 py-3 shadow-sm ${stat.tone}`}>
                    <p className="text-xs uppercase tracking-[0.14em]">{stat.label}</p>
                    <p className="mt-2 font-display text-3xl text-ink">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.2fr),minmax(280px,0.8fr)]">
                <div className="relative overflow-hidden rounded-[26px] border border-white/35">
                  <img
                    src={kidsRainbowBanner}
                    alt="Parent portal visual"
                    className="h-28 w-full object-cover md:h-32"
                  />
                  <div className="absolute inset-0 crm-bg-brand-overlay opacity-25" />
                  <div className="absolute inset-0 flex items-end justify-between gap-4 px-4 py-4">
                    <p className="max-w-xl font-kids text-base text-slate-900 md:text-lg">
                      One parent account. Up to 20 children. Shared admissions, attendance, billing, and chat.
                    </p>
                    <div className="hidden rounded-2xl border border-white/40 bg-white/75 px-4 py-3 text-right text-slate-900 shadow-sm backdrop-blur-sm md:block">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Current load</p>
                      <p className="mt-2 text-sm font-semibold">{formatCount(unreadThreads, 'thread')}</p>
                      <p className="mt-1 text-sm font-semibold">{formatCount(openInvoices, 'open invoice')}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[26px] border border-slate-300/70 bg-white/78 p-4 text-slate-900 shadow-sm backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Quick launch</p>
                  <div className="mt-3 grid gap-2">
                    {page.actions.map((action) => (
                      <Link
                        key={action.path}
                        to={action.path}
                        className="kid-ghost-button rounded-2xl px-4 py-2.5 text-sm font-semibold text-ink/85 transition hover:border-teal/35 hover:bg-cloud/90"
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-ink/20 bg-ink/95 p-5 text-white shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Family status board</p>
                  <h2 className="mt-2 font-display text-3xl text-white">
                    {activeChild ? activeChild.name : 'Household ready'}
                  </h2>
                  <p className="mt-2 text-sm text-white/80">
                    {activeChild
                      ? `${activeChild.program} · ${activeChild.ageBand} · ${activeChild.teacher}`
                      : 'Set up children, contacts, and workflows from the family profile.'}
                  </p>
                </div>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                  {syncSource === 'supabase' ? 'Synced' : 'Cached'}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white/90">
                  {formatCount(state.children.length, 'child', 'children')}
                </div>
                <div className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white/90">
                  {formatCount(unreadThreads, 'unread thread')}
                </div>
                <div className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white/90">
                  {totalDueAmountLabel} pending
                </div>
                <div className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white/90">
                  {alerts.length > 0 ? formatCount(alerts.length, 'attention item') : 'No urgent alerts'}
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-white/15 bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Next visible event</p>
                {nextEvent ? (
                  <>
                    <p className="mt-2 font-semibold text-white">{nextEvent.title}</p>
                    <p className="mt-2 text-sm text-white/80">{nextEvent.dateLabel}</p>
                    <p className="mt-2 text-sm text-white/75">{nextEvent.detail}</p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-white/75">No events are scheduled yet.</p>
                )}
              </div>
            </section>
          </div>

          <nav className="mt-4 hidden flex-wrap gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/user'}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'border-ink bg-ink text-white shadow-soft'
                        : 'border-ink/10 bg-white/90 text-ink/80 hover:border-teal/30 hover:bg-cloud/90'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </header>

        <div className="grid gap-4 xl:grid-cols-[300px,minmax(0,1fr),340px]">
          <aside className="hidden xl:block">
            <div className="sticky top-4 space-y-4">
              <section className="kid-panel rounded-[28px] border border-ink/10 bg-white/95 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">Children roster</p>
                  <Link to="/user/profile" className="text-xs font-semibold text-teal">
                    Manage family
                  </Link>
                </div>
                <div className="mt-3 space-y-2">
                  {state.children.length > 0 ? (
                    state.children.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => {
                          selectChild(child.id)
                        }}
                        className={`w-full rounded-[22px] border px-3 py-3 text-left transition ${
                          activeChild?.id === child.id
                            ? 'border-ink bg-ink text-white'
                            : 'border-ink/10 bg-white text-ink hover:border-teal/30 hover:bg-cloud/90'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{child.name}</p>
                            <p className="mt-1 text-sm opacity-80">{child.program}</p>
                          </div>
                          <span className="rounded-full border border-current/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] opacity-80">
                            {child.attendanceRate}
                          </span>
                        </div>
                        <p className="mt-2 text-xs uppercase tracking-[0.12em] opacity-70">{child.milestone}</p>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-ink/15 px-3 py-4 text-sm text-ink/70">
                      No children added yet.
                    </div>
                  )}
                </div>
              </section>

              <section className="kid-panel rounded-[28px] border border-ink/10 bg-white/95 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">Quick launch</p>
                <div className="mt-3 space-y-2">
                  <Link
                    to="/user/attendance"
                    className="kid-ghost-button block w-full rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-ink/80"
                  >
                    Submit absence note
                  </Link>
                  <Link
                    to="/user/admissions"
                    className="kid-ghost-button block w-full rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-ink/80"
                  >
                    Upload admission document
                  </Link>
                  <Link
                    to="/user/messages"
                    className="kid-ghost-button block w-full rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-ink/80"
                  >
                    Send a school message
                  </Link>
                  <Link
                    to="/user/billing"
                    className="kid-ghost-button block w-full rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-ink/80"
                  >
                    Review family billing
                  </Link>
                </div>
              </section>

              <section className="kid-panel rounded-[28px] border border-ink/10 bg-white/95 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">Attention queue</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-coral">
                    <Sparkles className="h-3.5 w-3.5" />
                    {alerts.length}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <div key={alert.id} className={`rounded-2xl border px-3 py-3 ${alert.tone}`}>
                        <p className="font-semibold">{alert.title}</p>
                        <p className="mt-2 text-sm text-ink/80">{alert.detail}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-teal/25 bg-teal/10 px-3 py-3 text-sm text-teal">
                      No urgent family actions right now.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </aside>

          <main className="min-w-0">
            <Outlet />
          </main>

          <aside className="hidden xl:block">
            <div className="sticky top-4 space-y-4">
              <section className="kid-panel rounded-[28px] border border-ink/10 bg-white/95 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink/85">
                  <BellRing className="h-4 w-4 text-coral" />
                  Upcoming
                </p>
                <div className="mt-3 space-y-2">
                  {visibleEvents.length > 0 ? (
                    visibleEvents.map((event) => (
                      <div key={event.id} className="rounded-2xl border border-ink/10 bg-white px-3 py-3">
                        <p className="font-semibold text-ink">{event.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink/60">
                          {event.dateLabel}
                        </p>
                        <p className="mt-2 text-sm text-ink/80">{event.detail}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-ink/15 bg-white px-3 py-4 text-sm text-ink/70">
                      No upcoming events yet.
                    </div>
                  )}
                </div>
              </section>

              <section className="kid-panel rounded-[28px] border border-ink/10 bg-white/95 p-4">
                <p className="text-sm font-semibold text-ink/85">Recent activity</p>
                <div className="mt-3 space-y-2">
                  {state.activityFeed.slice(0, 6).map((activity) => (
                    <div key={activity.id} className="rounded-2xl border border-ink/10 bg-white px-3 py-3">
                      <p className="font-semibold text-ink">{activity.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink/60">
                        {activity.timestamp}
                      </p>
                      <p className="mt-2 text-sm text-ink/80">{activity.detail}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="kid-panel rounded-[28px] border border-ink/10 bg-white/95 p-4">
                <p className="text-sm font-semibold text-ink/85">Resource shelf</p>
                <div className="mt-3 space-y-2">
                  {visibleResources.slice(0, 4).map((resource) => (
                    <div key={resource.id} className="rounded-2xl border border-ink/10 bg-white px-3 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-ink">{resource.title}</p>
                        <span className="rounded-full border border-ink/10 bg-cloud px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/70">
                          {resource.category}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-ink/80">{resource.detail}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>

      <MobileBottomNav items={navItems} />
    </div>
  )
}
