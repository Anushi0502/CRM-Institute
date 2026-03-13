import type { OverviewMetric } from '../types/crm'

const toneClasses: Record<OverviewMetric['tone'], string> = {
  teal: 'bg-teal/10 text-teal border-teal/20',
  coral: 'bg-coral/10 text-coral border-coral/20',
  amber: 'bg-amber/20 text-amber-700 border-amber/35',
  plum: 'bg-plum/10 text-plum border-plum/25',
}

const glowClasses: Record<OverviewMetric['tone'], string> = {
  teal: 'from-teal/18 to-transparent',
  coral: 'from-coral/18 to-transparent',
  amber: 'from-amber/22 to-transparent',
  plum: 'from-plum/18 to-transparent',
}

export function StatCard({ metric }: { metric: OverviewMetric }) {
  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-ink/5 bg-white/85 p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-float">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r ${glowClasses[metric.tone]}`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink/70">{metric.label}</p>
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClasses[metric.tone]}`}
          >
            {metric.change}
          </span>
        </div>
        <p className="mt-5 font-display text-4xl text-ink">{metric.value}</p>
        <p className="mt-3 text-sm leading-6 text-ink/65">{metric.detail}</p>
      </div>
    </article>
  )
}
