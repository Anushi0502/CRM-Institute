import {
  ArrowRight,
  BookHeart,
  CalendarClock,
  CheckCircle2,
  MessageSquareText,
  ReceiptText,
  School,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { UserPanel } from '../../components/UserPanel'
import { useUserPortal } from '../../hooks/useUserPortal'

export function UserHomePage() {
  const {
    activeChild,
    alerts,
    quickStats,
    selectChild,
    state,
    totalDueAmountLabel,
    visibleApplications,
    visibleResources,
    visibleThreads,
  } = useUserPortal()

  const openThreads = visibleThreads.filter((thread) => thread.status !== 'Open').length
  const nextEvents = state.events
    .filter((event) => !activeChild || event.childId === activeChild.id || event.childId === null)
    .slice(0, 4)

  return (
    <div className="space-y-4">
      <UserPanel
        eyebrow="Today at a glance"
        title="Family command center"
        description="This is the parent operating layer for the whole household. Move between children without losing the shared record for admissions, attendance, messaging, and billing."
        action={(
          <Link
            to="/user/messages"
            className="kid-bubble-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
          >
            Open messages
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      >
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr),minmax(340px,0.85fr)]">
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-4">
              {quickStats.map((stat) => (
                <article key={stat.label} className={`rounded-[24px] border px-4 py-4 ${stat.tone}`}>
                  <p className="text-xs uppercase tracking-[0.14em]">{stat.label}</p>
                  <p className="mt-2 font-display text-3xl text-ink">{stat.value}</p>
                </article>
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr),minmax(280px,0.9fr)]">
              <div className="rounded-[26px] border border-ink/10 bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/60">Focus board</p>
                    <h3 className="mt-2 font-display text-3xl text-ink">
                      {activeChild ? activeChild.name : 'Household setup'}
                    </h3>
                  </div>
                  <span className="rounded-full border border-teal/25 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
                    {activeChild ? activeChild.attendanceRate : 'Ready to configure'}
                  </span>
                </div>

                {activeChild ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[22px] border border-coral/20 bg-coral/8 px-4 py-4">
                      <p className="inline-flex items-center gap-2 font-semibold text-ink">
                        <School className="h-4 w-4 text-coral" />
                        Classroom signal
                      </p>
                      <p className="mt-3 text-sm text-ink/80">{activeChild.todayStatus}</p>
                      <p className="mt-2 text-sm text-ink/80">{activeChild.teacher}</p>
                      <p className="mt-2 text-sm text-ink/80">Milestone: {activeChild.milestone}</p>
                    </div>
                    <div className="rounded-[22px] border border-teal/20 bg-teal/8 px-4 py-4">
                      <p className="inline-flex items-center gap-2 font-semibold text-ink">
                        <CalendarClock className="h-4 w-4 text-teal" />
                        Operations signal
                      </p>
                      <p className="mt-3 text-sm text-ink/80">Pickup window {activeChild.pickupWindow}</p>
                      <p className="mt-2 text-sm text-ink/80">Campus {activeChild.campus}</p>
                      <p className="mt-2 text-sm text-ink/80">Medical notes tracked and synced</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-[22px] border border-dashed border-ink/15 bg-cloud/35 px-4 py-5 text-sm text-ink/75">
                    Add your first child profile from the family page to unlock attendance, admissions, and messaging workflows.
                  </div>
                )}
              </div>

              <div className="rounded-[26px] border border-ink/10 bg-ink px-4 py-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">Immediate actions</p>
                <div className="mt-4 space-y-2">
                  <Link
                    to="/user/admissions"
                    className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    Review admissions lane
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/user/attendance"
                    className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    Submit attendance update
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/user/billing"
                    className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    Resolve household billing
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-4">
                  <p className="text-sm text-white/70">Family due amount</p>
                  <p className="mt-2 font-display text-4xl text-white">{totalDueAmountLabel}</p>
                  <p className="mt-2 text-sm text-white/70">
                    {openThreads} active school follow-up lane{openThreads === 1 ? '' : 's'} right now.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-[26px] border border-ink/10 bg-white px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/60">Household roster</p>
                  <h3 className="mt-2 font-display text-3xl text-ink">Children on account</h3>
                </div>
                <Link to="/user/profile" className="text-sm font-semibold text-teal">
                  Manage
                </Link>
              </div>
              <div className="mt-4 space-y-2">
                {state.children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => {
                      selectChild(child.id)
                    }}
                    className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                      activeChild?.id === child.id
                        ? 'border-ink bg-ink text-white'
                        : 'border-ink/10 bg-cloud/35 text-ink hover:border-teal/30 hover:bg-cloud/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{child.name}</p>
                        <p className="mt-1 text-sm opacity-80">{child.program}</p>
                      </div>
                      <span className="rounded-full border border-current/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] opacity-80">
                        {child.authorizedPickupCount} pickup
                      </span>
                    </div>
                    <p className="mt-3 text-sm opacity-80">{child.milestone}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] border border-ink/10 bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/60">Attention queue</p>
              <div className="mt-3 space-y-2">
                {alerts.length > 0 ? (
                  alerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className={`rounded-2xl border px-4 py-4 ${alert.tone}`}>
                      <p className="font-semibold">{alert.title}</p>
                      <p className="mt-2 text-sm text-ink/80">{alert.detail}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-teal/25 bg-teal/10 px-4 py-4 text-sm text-teal">
                    Household account is in a clean state. No urgent parent action is pending.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </UserPanel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr),minmax(340px,0.92fr)]">
        <UserPanel
          eyebrow="Timeline"
          title="Household runway"
          description="Upcoming school events, application movement, and family operations stay visible in one stream."
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {nextEvents.length > 0 ? (
              nextEvents.map((event) => (
                <div key={event.id} className="rounded-[24px] border border-ink/10 bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-ink">{event.title}</p>
                    <span className="rounded-full border border-ink/10 bg-cloud px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/70">
                      {event.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink/75">{event.dateLabel}</p>
                  <p className="mt-2 text-sm text-ink/80">{event.detail}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-ink/15 bg-white px-4 py-8 text-sm text-ink/70 lg:col-span-2">
                No events scheduled yet.
              </div>
            )}
          </div>
        </UserPanel>

        <UserPanel
          eyebrow="Resources"
          title="Current parent desk"
          description="Recent classroom resources and operational notices stay child-aware."
        >
          <div className="space-y-3">
            {visibleResources.slice(0, 4).map((resource) => (
              <div key={resource.id} className="rounded-[22px] border border-ink/10 bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{resource.title}</p>
                  <span className="rounded-full border border-ink/10 bg-cloud px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/70">
                    {resource.category}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink/80">{resource.detail}</p>
              </div>
            ))}
          </div>
        </UserPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr),minmax(360px,0.92fr)]">
        <UserPanel
          eyebrow="Signals"
          title="Communication and admissions pulse"
          description="See which lanes need a reply or a parent decision without switching pages."
        >
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] border border-ink/10 bg-white px-4 py-4">
              <p className="inline-flex items-center gap-2 font-semibold text-ink">
                <Sparkles className="h-4 w-4 text-coral" />
                Open applications
              </p>
              <p className="mt-3 font-display text-4xl text-ink">{visibleApplications.length}</p>
            </div>
            <div className="rounded-[24px] border border-ink/10 bg-white px-4 py-4">
              <p className="inline-flex items-center gap-2 font-semibold text-ink">
                <MessageSquareText className="h-4 w-4 text-teal" />
                Visible threads
              </p>
              <p className="mt-3 font-display text-4xl text-ink">{visibleThreads.length}</p>
            </div>
            <div className="rounded-[24px] border border-ink/10 bg-white px-4 py-4">
              <p className="inline-flex items-center gap-2 font-semibold text-ink">
                <ReceiptText className="h-4 w-4 text-plum" />
                Due amount
              </p>
              <p className="mt-3 font-display text-4xl text-ink">{totalDueAmountLabel}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Link
              to="/user/admissions"
              className="rounded-[22px] border border-coral/20 bg-coral/8 px-4 py-4 transition hover:border-coral/35"
            >
              <p className="font-semibold text-ink">Admissions lane</p>
              <p className="mt-2 text-sm text-ink/80">Upload missing documents, start a new child application, or lock a tour date.</p>
            </Link>
            <Link
              to="/user/billing"
              className="rounded-[22px] border border-teal/20 bg-teal/8 px-4 py-4 transition hover:border-teal/35"
            >
              <p className="font-semibold text-ink">Billing lane</p>
              <p className="mt-2 text-sm text-ink/80">Pay invoices, prepare receipts, and update the family payment method.</p>
            </Link>
          </div>
        </UserPanel>

        <UserPanel
          eyebrow="Activity feed"
          title="What changed recently"
          description="Every action updates the same family record immediately."
        >
          <div className="space-y-3">
            {state.activityFeed.slice(0, 5).map((activity) => (
              <div key={activity.id} className="rounded-[22px] border border-ink/10 bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{activity.title}</p>
                  <span className="text-xs uppercase tracking-[0.12em] text-ink/60">{activity.timestamp}</span>
                </div>
                <p className="mt-2 text-sm text-ink/80">{activity.detail}</p>
              </div>
            ))}
          </div>
        </UserPanel>
      </div>

      <UserPanel
        eyebrow="Family standards"
        title="Why the parent app is wired this way"
        description="The portal is designed around one household record. Each child keeps their own admissions and attendance data, while messages, billing, and core contacts stay coordinated for the parent account."
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[24px] border border-ink/10 bg-white px-4 py-4">
            <p className="inline-flex items-center gap-2 font-semibold text-ink">
              <CheckCircle2 className="h-4 w-4 text-teal" />
              Child-aware routing
            </p>
            <p className="mt-2 text-sm text-ink/80">Switch the active child once and the app narrows admissions, attendance, and resources automatically.</p>
          </div>
          <div className="rounded-[24px] border border-ink/10 bg-white px-4 py-4">
            <p className="inline-flex items-center gap-2 font-semibold text-ink">
              <BookHeart className="h-4 w-4 text-coral" />
              Shared family memory
            </p>
            <p className="mt-2 text-sm text-ink/80">Billing, contacts, pickup rules, and activity history stay unified across the full household account.</p>
          </div>
          <div className="rounded-[24px] border border-ink/10 bg-white px-4 py-4">
            <p className="inline-flex items-center gap-2 font-semibold text-ink">
              <School className="h-4 w-4 text-plum" />
              Parent-safe admin separation
            </p>
            <p className="mt-2 text-sm text-ink/80">Parent users stay on `/user` while admin tools remain isolated under `/admin` and role-gated by Supabase data.</p>
          </div>
        </div>
      </UserPanel>
    </div>
  )
}
