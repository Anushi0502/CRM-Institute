import type { Program } from '../types/crm'

export function ProgramCard({ program }: { program: Program }) {
  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-ink/5 bg-white/90 p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-float">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[var(--crm-gradient-section-top)]" />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-2xl text-ink">{program.name}</p>
            <p className="mt-1 text-sm text-ink/55">{program.ageRange}</p>
          </div>
          <span className="rounded-full bg-teal/10 px-2.5 py-1 text-xs font-semibold text-teal">
            {program.capacity}
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-ink/70">{program.description}</p>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm text-ink/65">
            <span>Capacity fill</span>
            <span>{program.fillRate}%</span>
          </div>
          <div className="h-2 rounded-full bg-ink/10">
            <div
              className="h-2 rounded-full bg-[var(--crm-gradient-progress)]"
              style={{ width: `${program.fillRate}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
            {program.leads} active leads
          </span>
          <span className="rounded-full bg-amber/20 px-3 py-1 text-xs font-semibold text-amber-700">
            {program.waitlist} waitlist
          </span>
        </div>

        <div className="mt-5 space-y-2 text-sm text-ink/70">
          <p className="font-semibold text-ink">Lead educators</p>
          <div className="flex flex-wrap gap-2">
            {program.educators.map((educator) => (
              <span
                key={educator}
                className="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold"
              >
                {educator}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
