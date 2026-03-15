import { startTransition, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Chrome,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
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
}

const highlights: HighlightItem[] = [
  {
    title: 'Admissions command center',
    detail: 'Track inquiries, tours, applications, and waitlist movement with a single family timeline.',
    icon: Users,
  },
  {
    title: 'Student care visibility',
    detail: 'Attendance, milestones, and support focus stay connected to operations and guardian communication.',
    icon: GraduationCap,
  },
  {
    title: 'Secure backend controls',
    detail: 'Supabase auth management and role-aware backend actions from one protected interface.',
    icon: ShieldCheck,
  },
]

const trustStats = [
  { label: 'Little learners enrolled', value: '128' },
  { label: 'Family reply speed', value: '18m' },
  { label: 'Happy retention outlook', value: '96%' },
]

const ageBandBadges = [
  {
    title: 'Infant nest',
    detail: '6 months to 18 months',
    tone: 'border-sky/35 bg-sky/15 text-ink',
  },
  {
    title: 'Toddler explorers',
    detail: '18 months to 3 years',
    tone: 'border-berry/30 bg-berry/15 text-ink',
  },
  {
    title: 'Early years launch',
    detail: '3 years to 7 years',
    tone: 'border-leaf/35 bg-leaf/15 text-ink',
  },
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
    <div className="relative min-h-screen overflow-x-clip px-4 py-4 lg:px-6">
      <div className="crm-orb crm-orb--teal" />
      <div className="crm-orb crm-orb--coral" />
      <div className="crm-orb crm-orb--plum" />
      <div className="kid-sprinkle kid-sprinkle--one" />
      <div className="kid-sprinkle kid-sprinkle--two" />
      <div className="kid-sprinkle kid-sprinkle--three" />

      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1600px] gap-5 xl:grid-cols-[1.35fr,0.75fr]">
        <section className="relative overflow-hidden rounded-[38px] border border-white/80 bg-[var(--crm-gradient-login-shell)] p-5 text-white shadow-float md:p-7">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-sky/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-berry/25 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col">
            <div className="relative overflow-hidden rounded-[30px] border border-white/20 shadow-soft">
              <img
                src={heroImage}
                alt="BrightMinds Institute campus and learning atmosphere"
                className="h-[280px] w-full object-cover md:h-[360px]"
              />
              <div className="absolute inset-0 bg-[var(--crm-gradient-login-overlay)]" />

              <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-mint/95 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                BrightMinds CRM
              </div>

              <div className="absolute right-5 top-5 kid-sticker bg-sun/25 text-white">
                <Star className="h-3.5 w-3.5" />
                Built for ages 6m to 7y
              </div>

              <div className="absolute bottom-5 left-5 right-5 space-y-3 md:right-auto md:max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-mint/90">
                  Little learners operations suite
                </p>
                <h1 className="font-display text-3xl leading-tight text-white md:text-5xl">
                  A joyful CRM login for infant, toddler, and early-years care teams.
                </h1>
                <p className="text-sm leading-6 text-white/80 md:text-base">
                  Unified access to family communication, learning milestones, and admissions flow for children from 6 months to 7 years.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1.3fr,0.7fr]">
              <div className="relative overflow-hidden rounded-[22px] border border-white/20 bg-white/8">
                <img
                  src={kidsRainbowBanner}
                  alt="Rainbow classroom visual"
                  className="h-24 w-full object-cover"
                />
                <div className="absolute inset-0 bg-[var(--crm-gradient-banner-overlay)]" />
                <p className="absolute left-3 top-1/2 -translate-y-1/2 font-kids text-sm text-white md:text-base">
                  Joyful visuals for little learners
                </p>
              </div>

              <div className="overflow-hidden rounded-[22px] border border-white/20 bg-white/8 p-2">
                <img
                  src={kidsPlayLane}
                  alt="Play lane themed visual"
                  className="h-24 w-full rounded-[16px] object-cover"
                />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {trustStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[22px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-white/65">{stat.label}</p>
                  <p className="mt-2 font-display text-3xl text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {ageBandBadges.map((band) => (
                <article key={band.title} className={`rounded-[20px] border px-4 py-3 ${band.tone}`}>
                  <p className="font-kids text-sm leading-none">{band.title}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-ink/65">{band.detail}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon

                return (
                  <article
                    key={item.title}
                    className="rounded-[22px] border border-white/15 bg-white/10 p-4 backdrop-blur"
                  >
                    <div className="inline-flex rounded-xl bg-white/15 p-2 text-mint">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-xs leading-5 text-white/72">{item.detail}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="relative rounded-[38px] border border-white/80 bg-white/92 p-6 shadow-soft backdrop-blur md:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/45">
              Secure sign in
            </p>
            <h2 className="font-display text-4xl leading-tight text-ink md:text-5xl">
              Welcome back, care team
            </h2>
            <p className="text-sm leading-6 text-ink/65">
              Continue into your kid-focused CRM workspace.
            </p>
            <div className="kid-sticker bg-sky/20 text-ink">
              <Sparkles className="h-3.5 w-3.5" />
              Infant to age 7 family journey
            </div>
          </div>

          <div className="mt-5 grid gap-2 rounded-[22px] border border-ink/10 bg-cloud/70 p-3 text-xs text-ink/65 sm:grid-cols-2">
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
              <span className="text-sm font-semibold text-ink/72">Email address</span>
              <span className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-white px-3 py-2.5 shadow-soft">
                <Mail className="h-4 w-4 text-ink/45" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                  }}
                  placeholder="you@institute.com"
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/35"
                  autoComplete="email"
                />
              </span>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink/72">Password</span>
              <span className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-white px-3 py-2.5 shadow-soft">
                <Lock className="h-4 w-4 text-ink/45" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                  }}
                  placeholder="Enter password"
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/35"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword((previous) => !previous)
                  }}
                  className="rounded-lg p-1 text-ink/45 transition hover:bg-cloud hover:text-ink"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-ink/70">
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/30"
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-cloud disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Chrome className="h-4 w-4" />
            Continue with Google
          </button>

          <div className="mt-6 rounded-[22px] border border-ink/10 bg-cloud/80 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink/82">
              <CheckCircle2 className="h-4 w-4 text-teal" />
              Secure auth pipeline ready
            </div>
            <p className="mt-2 text-sm text-ink/65">
              Supabase session handling is active for email/password and Google OAuth.
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
