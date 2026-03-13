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
  Users,
  CalendarClock,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import heroImage from '../assets/hero.png'
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
  { label: 'Families in pipeline', value: '128' },
  { label: 'Response turnaround', value: '18m' },
  { label: 'Retention outlook', value: '96%' },
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

      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1600px] gap-5 xl:grid-cols-[1.35fr,0.75fr]">
        <section className="relative overflow-hidden rounded-[38px] border border-white/80 bg-[linear-gradient(150deg,rgba(10,48,46,0.95),rgba(24,53,61,0.92))] p-5 text-white shadow-float md:p-7">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-teal/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-coral/18 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col">
            <div className="relative overflow-hidden rounded-[30px] border border-white/20 shadow-soft">
              <img
                src={heroImage}
                alt="BrightMinds Institute campus and learning atmosphere"
                className="h-[280px] w-full object-cover md:h-[360px]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(8,39,38,0.74),rgba(11,55,52,0.24),rgba(24,53,61,0.72))]" />

              <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-mint/95 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                BrightMinds CRM
              </div>

              <div className="absolute bottom-5 left-5 right-5 space-y-3 md:right-auto md:max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-mint/90">
                  Institute operations suite
                </p>
                <h1 className="font-display text-3xl leading-tight text-white md:text-5xl">
                  Full-page login built for admissions and family care teams.
                </h1>
                <p className="text-sm leading-6 text-white/80 md:text-base">
                  Unified access to pipeline management, student operations, and Supabase-backed backend controls.
                </p>
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
              Welcome back
            </h2>
            <p className="text-sm leading-6 text-ink/65">
              Continue to your full-page CRM workspace.
            </p>
          </div>

          <div className="mt-5 grid gap-2 rounded-[22px] border border-ink/10 bg-cloud/70 p-3 text-xs text-ink/65 sm:grid-cols-2">
            <div className="inline-flex items-center gap-2 font-semibold">
              <BarChart3 className="h-3.5 w-3.5 text-teal" />
              Admissions dashboards
            </div>
            <div className="inline-flex items-center gap-2 font-semibold">
              <CalendarClock className="h-3.5 w-3.5 text-coral" />
              Daily operations sync
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
