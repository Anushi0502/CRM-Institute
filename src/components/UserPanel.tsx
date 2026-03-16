import type { ReactNode } from 'react'

interface UserPanelProps {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function UserPanel({
  eyebrow,
  title,
  description,
  action,
  children,
  className = '',
}: UserPanelProps) {
  const baseClassName =
    'kid-panel crm-page-reveal overflow-hidden rounded-[30px] border border-white/85 bg-white/95 p-5 shadow-soft'

  return (
    <section className={`${baseClassName} ${className}`.trim()}>
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-coral/35 to-transparent" />
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-2 font-display text-3xl text-ink">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/80">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
