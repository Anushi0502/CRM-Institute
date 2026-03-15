import type { ReactNode } from 'react'

interface SectionCardProps {
  eyebrow?: string
  title: string
  description?: string
  actionLabel?: string
  children: ReactNode
}

export function SectionCard({
  eyebrow,
  title,
  description,
  actionLabel,
  children,
}: SectionCardProps) {
  return (
    <section className="group relative overflow-hidden rounded-[32px] border border-white/80 bg-[linear-gradient(165deg,rgba(255,255,255,0.96),rgba(255,245,239,0.94))] p-6 shadow-soft backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-float">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(90deg,rgba(158,216,255,0.28),rgba(255,255,255,0),rgba(255,143,171,0.24))]" />
      <div className="pointer-events-none absolute -right-6 top-4 h-16 w-16 rounded-full bg-sun/25 blur-md" />
      <div className="pointer-events-none absolute bottom-4 left-5 h-10 w-10 rounded-full bg-leaf/25 blur-sm" />
      <div className="kid-confetti kid-confetti--one" />
      <div className="kid-confetti kid-confetti--two" />
      <div className="relative z-10">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-coral/80">
                {eyebrow}
              </p>
            ) : null}
            <div>
              <h2 className="font-display text-2xl text-ink">{title}</h2>
              {description ? (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {actionLabel ? (
            <span className="rounded-full border border-berry/20 bg-berry/10 px-3 py-1 text-xs font-semibold text-ink/75">
              {actionLabel}
            </span>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  )
}
