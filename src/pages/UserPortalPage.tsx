import {
  ArrowRight,
  BellRing,
  CalendarCheck2,
  FileSignature,
  MessageCircleHeart,
  ReceiptText,
  School,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import kidsPlayLane from '../assets/kids-play-lane.svg'
import kidsRainbowBanner from '../assets/kids-rainbow-banner.svg'

const weeklyAttendance = [
  { day: 'Mon', status: 'Present' },
  { day: 'Tue', status: 'Present' },
  { day: 'Wed', status: 'Late check-in' },
  { day: 'Thu', status: 'Present' },
  { day: 'Fri', status: 'Holiday activity' },
]

const chatPreview = [
  {
    author: 'Teacher Amara',
    message: 'Aarav enjoyed phonics circle and shared story cards today.',
    tone: 'teacher',
    time: '09:40 AM',
  },
  {
    author: 'You',
    message: 'Great update, thank you. Please share if he needs extra reading practice.',
    tone: 'parent',
    time: '09:44 AM',
  },
  {
    author: 'Teacher Amara',
    message: 'Will do. I have sent a short home activity in resources.',
    tone: 'teacher',
    time: '09:47 AM',
  },
]

const parentFeatures = [
  {
    icon: FileSignature,
    title: 'Apply for admission',
    detail: 'Submit child profile, documents, and preferred campus slots in one guided form.',
  },
  {
    icon: CalendarCheck2,
    title: 'Attendance timeline',
    detail: 'Track daily attendance, check-in windows, and absence notes per child.',
  },
  {
    icon: MessageCircleHeart,
    title: 'Two-way engagement chat',
    detail: 'Secure conversation with teachers and office team with instant alerts.',
  },
  {
    icon: ReceiptText,
    title: 'Fees and invoices',
    detail: 'View dues, download receipts, and see payment history from a single wallet.',
  },
  {
    icon: BellRing,
    title: 'Event reminders',
    detail: 'Receive upcoming event prompts, pickup alerts, and classroom announcements.',
  },
  {
    icon: ShieldCheck,
    title: 'Consent and safety forms',
    detail: 'Approve digital consent forms and emergency details with e-sign status.',
  },
]

export function UserPortalPage() {
  return (
    <div className="crm-readable relative min-h-screen overflow-x-clip px-4 py-4 lg:px-6">
      <div className="crm-orb crm-orb--teal" />
      <div className="crm-orb crm-orb--coral" />
      <div className="crm-orb crm-orb--plum" />

      <div className="mx-auto w-full max-w-[1700px] space-y-4">
        <header className="kid-panel overflow-hidden rounded-[34px] border border-white/90 bg-white/95 p-5 shadow-float backdrop-blur-xl md:p-6">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-ink/10 bg-white/90 px-4 py-2.5">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/65">
              <Sparkles className="h-3.5 w-3.5 text-coral" />
              Parent companion portal
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/"
                className="kid-ghost-button inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-ink/80 transition hover:bg-cloud"
              >
                Parent login
              </Link>
              <Link
                to="/admin"
                className="kid-bubble-button inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-white"
              >
                Admin
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr),minmax(280px,0.55fr)]">
            <section className="overflow-hidden rounded-[24px] border border-white/40 crm-bg-brand p-5 text-white shadow-soft md:p-6">
              <p className="inline-flex items-center rounded-full border border-slate-300/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-900 shadow-sm backdrop-blur-sm">
                Family-first experience
              </p>
              <h1 className="mt-3 font-display text-4xl leading-tight text-slate-950 md:text-5xl">
                One place for admissions, attendance, and school communication.
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-800 md:text-base">
                Parents can apply, track daily attendance, chat with teachers, review invoices, and keep every child journey visible.
              </p>

              <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/35">
                <img
                  src={kidsRainbowBanner}
                  alt="Parent portal visual"
                  className="h-24 w-full object-cover"
                />
                <div className="absolute inset-0 crm-bg-banner-overlay opacity-25" />
                <p className="absolute left-4 top-1/2 -translate-y-1/2 font-kids text-base text-slate-900">
                  Built for transparent parent-school collaboration
                </p>
              </div>
            </section>

            <section className="rounded-[24px] border border-ink/20 bg-ink/95 p-4 text-white shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Portal pulse</p>
              <div className="mt-3 space-y-2">
                <p className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-semibold">
                  2 active applications
                </p>
                <p className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-semibold">
                  96% attendance this month
                </p>
                <p className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-semibold">
                  3 unread teacher messages
                </p>
                <p className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-semibold">
                  1 upcoming payment reminder
                </p>
              </div>
            </section>
          </div>
        </header>

        <main className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr),minmax(320px,0.65fr)]">
          <section className="space-y-4">
            <article className="kid-panel rounded-[28px] border border-ink/10 bg-white/95 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">Apply for admission</p>
                  <h2 className="mt-2 font-display text-3xl text-ink">Admission wizard</h2>
                </div>
                <button
                  type="button"
                  className="kid-bubble-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
                >
                  Start application
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-teal/25 bg-teal/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-teal">Step 1</p>
                  <p className="mt-2 font-semibold text-ink">Child profile</p>
                </div>
                <div className="rounded-2xl border border-amber/35 bg-amber/20 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-amber-700">Step 2</p>
                  <p className="mt-2 font-semibold text-ink">Documents + consent</p>
                </div>
                <div className="rounded-2xl border border-coral/25 bg-coral/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-coral">Step 3</p>
                  <p className="mt-2 font-semibold text-ink">Tour + final submit</p>
                </div>
              </div>
            </article>

            <article className="kid-panel rounded-[28px] border border-ink/10 bg-white/95 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">Attendance view</p>
                  <h2 className="mt-2 font-display text-3xl text-ink">Weekly tracker</h2>
                </div>
                <span className="rounded-full border border-teal/25 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
                  Child: Aarav N.
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-5">
                {weeklyAttendance.map((entry) => (
                  <div key={entry.day} className="rounded-2xl border border-ink/10 bg-white px-3 py-3 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/60">{entry.day}</p>
                    <p className="mt-2 text-sm font-semibold text-ink">{entry.status}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="kid-panel rounded-[28px] border border-ink/10 bg-white/95 p-5">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">Two-way engagement chat</p>
                <h2 className="mt-2 font-display text-3xl text-ink">Teacher conversation</h2>
              </div>

              <div className="space-y-2">
                {chatPreview.map((message) => (
                  <div
                    key={`${message.author}-${message.time}`}
                    className={`rounded-2xl border px-4 py-3 ${
                      message.tone === 'teacher'
                        ? 'border-teal/25 bg-teal/10'
                        : 'border-plum/25 bg-plum/10'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">{message.author}</p>
                      <p className="text-xs uppercase tracking-[0.12em] text-ink/60">{message.time}</p>
                    </div>
                    <p className="text-sm text-ink/85">{message.message}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <aside className="space-y-4">
            <article className="kid-panel overflow-hidden rounded-[28px] border border-ink/10 bg-white/95 p-4">
              <img src={kidsPlayLane} alt="Portal spotlight" className="h-32 w-full rounded-[20px] object-cover" />
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ink/85">
                <School className="h-4 w-4 text-teal" />
                Parent dashboard spotlight
              </p>
            </article>

            <article className="kid-panel rounded-[28px] border border-ink/10 bg-white/95 p-4">
              <h3 className="font-display text-2xl text-ink">Other parent features</h3>
              <div className="mt-3 space-y-2">
                {parentFeatures.map((feature) => {
                  const Icon = feature.icon

                  return (
                    <div key={feature.title} className="rounded-2xl border border-ink/10 bg-white px-3 py-3">
                      <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                        <Icon className="h-4 w-4 text-coral" />
                        {feature.title}
                      </p>
                      <p className="mt-1 text-sm text-ink/80">{feature.detail}</p>
                    </div>
                  )
                })}
              </div>
            </article>

            <article className="kid-panel rounded-[28px] border border-ink/10 bg-white/95 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink/85">
                <UserRoundCheck className="h-4 w-4 text-teal" />
                Family account status
              </p>
              <p className="mt-2 text-sm text-ink/80">
                Profile complete. Emergency contact and medical consent are up to date.
              </p>
            </article>
          </aside>
        </main>
      </div>
    </div>
  )
}
