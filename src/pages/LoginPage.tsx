import { startTransition, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Chrome,
  Clock3,
  Eye,
  EyeOff,
  Fingerprint,
  GraduationCap,
  HeartHandshake,
  Lock,
  Mail,
  MessageSquareHeart,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  CalendarClock,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import heroImage from '../assets/hero.png'
import kidsPlayLane from '../assets/kids-play-lane.svg'
import kidsRainbowBanner from '../assets/kids-rainbow-banner.svg'
import { signInWithGoogle, signInWithPassword } from '../services/authService'
import type { AuthState } from '../types/auth'

interface LoginPageProps {
  authState: AuthState
}

interface HighlightItem {
  title: string
  detail: string
  icon: LucideIcon
  tone: string
}

const highlights: HighlightItem[] = [
  {
    title: 'Admissions command center',
    detail: 'Track inquiries, tours, applications, and waitlist movement with a single family timeline.',
    icon: Users,
    tone: 'border-coral/30 bg-coral/10',
  },
  {
    title: 'Student care visibility',
    detail: 'Attendance, milestones, and support focus stay connected to operations and guardian communication.',
    icon: GraduationCap,
    tone: 'border-teal/30 bg-teal/10',
  },
  {
    title: 'Secure backend controls',
    detail: 'Supabase auth management and role-aware backend actions from one protected interface.',
    icon: ShieldCheck,
    tone: 'border-plum/30 bg-plum/10',
  },
]

const trustStats = [
  {
    label: 'Little learners enrolled',
    value: '128',
    detail: 'Across infant, toddler, and early-years programs',
    icon: HeartHandshake,
    tone: 'border-white/45 bg-[rgba(255,255,255,0.78)] text-ink',
  },
  {
    label: 'Family reply speed',
    value: '18m',
    detail: 'Average response handling for active parent conversations',
    icon: Clock3,
    tone: 'border-coral/30 bg-coral/12 text-ink',
  },
  {
    label: 'Happy retention outlook',
    value: '96%',
    detail: 'Confidence signal from family touchpoints and renewal flow',
    icon: Fingerprint,
    tone: 'border-teal/30 bg-teal/12 text-ink',
  },
]

const ageBandBadges = [
  {
    title: 'Infant nest',
    detail: '6 months to 18 months',
    icon: Sparkles,
    tone: 'border-sky/35 bg-sky/15 text-ink',
  },
  {
    title: 'Toddler explorers',
    detail: '18 months to 3 years',
    icon: Star,
    tone: 'border-berry/30 bg-berry/15 text-ink',
  },
  {
    title: 'Early years launch',
    detail: '3 years to 7 years',
    icon: GraduationCap,
    tone: 'border-leaf/35 bg-leaf/15 text-ink',
  },
]

const heroSignals = [
  {
    label: 'Parent and admin flow',
    value: '/user + /admin',
    detail: 'Role-aware routing keeps family and admin workspaces separate.',
    icon: Route,
    tone: 'border-white/16 bg-[rgba(255,255,255,0.12)] text-white',
  },
  {
    label: 'Family messaging',
    value: '2-way engagement',
    detail: 'Attendance, billing, admissions, and classroom replies stay in one lane.',
    icon: MessageSquareHeart,
    tone: 'border-white/16 bg-[rgba(255,255,255,0.12)] text-white',
  },
]

const heroChips = [
  'Role-aware routing',
  'Multi-child family portal',
  'Supabase auth and sync',
]

export function LoginPage({ authState }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  async function handlePasswordSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim() || !password) {
      setLocalError('Enter your email and password to continue.')
      return
    }

    try {
      setIsSubmitting(true)
      setLocalError(null)
      await signInWithPassword(email.trim(), password)
    } catch (error) {
      startTransition(() => {
        setLocalError(
          error instanceof Error
            ? error.message
            : 'Email sign-in could not complete.',
        )
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleSignIn() {
    try {
      setIsSubmitting(true)
      setLocalError(null)
      await signInWithGoogle()
    } catch (error) {
      startTransition(() => {
        setLocalError(
          error instanceof Error
            ? error.message
            : 'Google sign-in could not start.',
        )
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="crm-readable relative min-h-screen overflow-x-clip px-4 py-4 lg:px-6">
      <div className="crm-orb crm-orb--teal" />
      <div className="crm-orb crm-orb--coral" />
      <div className="crm-orb crm-orb--plum" />
      <div className="kid-sprinkle kid-sprinkle--one" />
      <div className="kid-sprinkle kid-sprinkle--two" />
      <div className="kid-sprinkle kid-sprinkle--three" />

      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1600px] gap-5 xl:grid-cols-[1.35fr,0.75fr]">
        <section className="relative overflow-hidden rounded-[38px] border border-white/90 crm-bg-login-shell p-5 text-ink shadow-float md:p-7">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-sky/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-berry/25 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr),minmax(280px,0.82fr)]">
              <div className="relative overflow-hidden rounded-[34px] border border-white/20 shadow-soft">
                <img
                  src={heroImage}
                  alt="BrightMinds Institute campus and learning atmosphere"
                  className="h-[360px] w-full object-cover md:h-[440px]"
                />
                <div className="absolute inset-0 crm-bg-login-overlay" />
                <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(14,20,33,0.9)_0%,rgba(20,30,48,0.74)_42%,rgba(255,255,255,0.06)_100%)]" />

                <div className="absolute left-5 top-5 kid-ribbon border-white/20 bg-[rgba(14,48,57,0.64)] text-white shadow-soft">
                  <Sparkles className="h-3.5 w-3.5" />
                  BrightMinds CRM
                </div>

                <div className="absolute right-5 top-5 kid-sticker border-sun/50 bg-sun/85 text-ink">
                  <Star className="h-3.5 w-3.5" />
                  Built for ages 6m to 7y
                </div>

                <div className="absolute inset-x-5 bottom-5">
                  <div className="rounded-[32px] border border-white/15 bg-[linear-gradient(145deg,rgba(11,18,32,0.88),rgba(25,35,57,0.68))] p-6 shadow-[0_24px_60px_rgba(var(--crm-shadow-color),0.28)] backdrop-blur-md">
                    <div className="grid gap-5 lg:grid-cols-[530px] lg:items-end">
                      <div className="lg:pr-2">
                        <h3 className="mt-4 max-w-[11ch] font-display text-[clamp(1.6rem,4.5vw,4.28rem)] leading-[0.92] text-white">
                          A joyful CRM login for infant, toddler, and early-years care teams.
                        </h3>
                        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/88 md:text-lg">
                          Unified access to family communication, learning milestones, and admissions flow for children from 6 months to 7 years.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {heroChips.map((chip) => (
                            <span
                              key={chip}
                              className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/92"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1.2fr,0.8fr] xl:grid-cols-1">
                <div className="relative overflow-hidden rounded-[26px] border border-white/35 bg-[rgba(255,255,255,0.72)] p-3 shadow-soft backdrop-blur-md">
                  <div className="grid gap-3 md:grid-cols-[1.3fr,0.7fr] xl:grid-cols-1">
                    <div className="relative overflow-hidden rounded-[22px] border border-white/55 bg-[rgba(255,255,255,0.72)]">
                      <img
                        src={kidsRainbowBanner}
                        alt="Rainbow classroom visual"
                        className="h-28 w-full object-cover"
                      />
                      <div className="absolute inset-0 crm-bg-banner-overlay opacity-65" />
                      <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/12 bg-[rgba(14,48,57,0.56)] px-3 py-2 text-white shadow-soft">
                        <p className="font-kids text-sm md:text-base">Joyful visuals for little learners</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/70">
                          Story-led classrooms and playful parent touchpoints
                        </p>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-[22px] border border-white/55 bg-[rgba(255,255,255,0.72)] p-2">
                      <img
                        src={kidsPlayLane}
                        alt="Play lane themed visual"
                        className="h-28 w-full rounded-[16px] object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-[26px] border border-white/40 bg-[linear-gradient(145deg,rgba(255,255,255,0.78),rgba(255,245,231,0.7))] p-4 shadow-soft backdrop-blur-md">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/58">
                    Product pulse
                  </p>
                  <div className="mt-3 grid gap-2">
                    <div className="rounded-[20px] border border-teal/18 bg-teal/8 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-teal">Parent app</p>
                      <p className="mt-2 text-sm font-semibold text-ink">Admissions, attendance, messaging, billing, and family records in one household workspace.</p>
                    </div>
                    <div className="rounded-[20px] border border-coral/18 bg-coral/8 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-coral">Admin crm</p>
                      <p className="mt-2 text-sm font-semibold text-ink">Lead flow, student operations, theme controls, and role-protected management.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.12fr),minmax(340px,0.88fr)]">
              <div className="grid gap-3 sm:grid-cols-3">
                {trustStats.map((stat) => {
                  const Icon = stat.icon

                  return (
                    <div key={stat.label} className={`kid-panel rounded-[24px] border px-4 py-4 shadow-soft backdrop-blur-md ${stat.tone}`}>
                      <div className="inline-flex rounded-2xl bg-white/65 p-2 text-ink shadow-soft">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-ink/62">{stat.label}</p>
                      <p className="mt-2 font-display text-4xl text-ink">{stat.value}</p>
                      <p className="mt-2 text-sm leading-6 text-ink/78">{stat.detail}</p>
                    </div>
                  )
                })}
              </div>

              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {ageBandBadges.map((band) => {
                  const Icon = band.icon

                  return (
                    <article key={band.title} className={`rounded-[24px] border px-4 py-4 shadow-soft ${band.tone}`}>
                      <div className="inline-flex rounded-2xl bg-white/55 p-2 text-ink">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="mt-4 font-kids text-base leading-none">{band.title}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-ink/80">{band.detail}</p>
                    </article>
                  )
                })}
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon

                return (
                  <article
                    key={item.title}
                    className={`kid-panel rounded-[24px] border p-5 shadow-soft backdrop-blur-md ${item.tone}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex rounded-2xl bg-white/70 p-2 text-ink shadow-soft">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="rounded-full border border-white/55 bg-white/55 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/62">
                        Core
                      </span>
                    </div>
                    <p className="mt-4 text-lg font-semibold text-ink">{item.title}</p>
                    <p className="mt-3 text-sm leading-7 text-ink/80">{item.detail}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="kid-panel relative rounded-[38px] border border-white/90 bg-white/95 p-6 shadow-soft backdrop-blur-xl md:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/60">
              Secure sign in
            </p>
            <h2 className="font-display text-4xl leading-tight text-ink md:text-5xl">
              Welcome back, care team
            </h2>
            <p className="text-sm leading-6 text-ink/80">
              Continue into your kid-focused CRM workspace.
            </p>
            <div className="kid-sticker bg-sky/20 text-ink">
              <Sparkles className="h-3.5 w-3.5" />
              Infant to age 7 family journey
            </div>
          </div>

          <div className="mt-5 grid gap-2 rounded-[22px] border border-ink/10 bg-cloud/90 p-3 text-xs text-ink/80 backdrop-blur-md sm:grid-cols-2">
            <div className="inline-flex items-center gap-2 font-semibold">
              <BarChart3 className="h-3.5 w-3.5 text-teal" />
              Growth dashboards
            </div>
            <div className="inline-flex items-center gap-2 font-semibold">
              <CalendarClock className="h-3.5 w-3.5 text-coral" />
              Daily classroom sync
            </div>
          </div>

          <form onSubmit={handlePasswordSignIn} className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink/70">Email address</span>
              <span className="kid-ghost-button flex items-center gap-2 rounded-2xl border border-ink/10 bg-white px-3 py-2.5 shadow-soft">
                <Mail className="h-4 w-4 text-ink/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                  }}
                  placeholder="you@institute.com"
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/55"
                  autoComplete="email"
                />
              </span>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink/70">Password</span>
              <span className="kid-ghost-button flex items-center gap-2 rounded-2xl border border-ink/10 bg-white px-3 py-2.5 shadow-soft">
                <Lock className="h-4 w-4 text-ink/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                  }}
                  placeholder="Enter password"
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/55"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword((previous) => !previous)
                  }}
                  className="rounded-lg p-1 text-ink/60 transition hover:bg-cloud hover:text-ink"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-ink/80">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(event) => {
                  setRememberDevice(event.target.checked)
                }}
                className="h-4 w-4 rounded border-ink/20 text-teal focus:ring-teal"
              />
              Remember this device
            </label>

            <button
              type="submit"
              disabled={!authState.isConfigured || isSubmitting}
              className="kid-bubble-button inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowRight className="h-4 w-4" />
              {isSubmitting ? 'Signing in...' : 'Sign in with email'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-ink/35">
            <div className="h-px flex-1 bg-ink/10" />
            or
            <div className="h-px flex-1 bg-ink/10" />
          </div>

          <button
            type="button"
            onClick={() => {
              void handleGoogleSignIn()
            }}
            disabled={!authState.isConfigured || isSubmitting}
            className="kid-ghost-button inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-cloud disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Chrome className="h-4 w-4" />
            Continue with Google
          </button>

          <div className="mt-6 rounded-[22px] border border-ink/10 bg-cloud/80 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink/82">
              <CheckCircle2 className="h-4 w-4 text-teal" />
              Secure auth pipeline ready
            </div>
            <p className="mt-2 text-sm text-ink/80">
              Supabase session handling is active for email/password and Google OAuth.
            </p>
            <p className="mt-2 text-sm text-ink/75">
              Verified staff are routed into the admin CRM, while parent accounts land in the family app at `/user`.
            </p>
          </div>

          {!authState.isConfigured ? (
            <p className="mt-4 rounded-2xl border border-amber/40 bg-amber/15 px-4 py-3 text-sm text-ink/75">
              Supabase auth is not configured yet. Add the URL and anon key in
              environment variables to enable sign in.
            </p>
          ) : null}

          {authState.error || localError ? (
            <p className="mt-4 rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
              {localError ?? authState.error}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  )
}
