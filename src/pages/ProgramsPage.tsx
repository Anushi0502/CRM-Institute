import { BookOpen, Building2, Users } from 'lucide-react'
import kidsPlayLane from '../assets/kids-play-lane.svg'
import kidsRainbowBanner from '../assets/kids-rainbow-banner.svg'
import { ProgramCard } from '../components/ProgramCard'
import { SectionCard } from '../components/SectionCard'
import { useGamificationContext } from '../context/GamificationContext'
import type { PageStateProps } from '../types/crm'

export function ProgramsPage({ state }: PageStateProps) {
  const { inspectProgram, inspectedProgramIds } = useGamificationContext()
  const averageFill =
    state.data.programs.length === 0
      ? 0
      : Math.round(
          state.data.programs.reduce((sum, program) => sum + program.fillRate, 0) /
            state.data.programs.length,
        )

  const highDemandPrograms = state.data.programs.filter((program) => program.waitlist >= 4).length

  const totalSeats = state.data.programs.reduce(
    (sum, program) => sum + Number.parseInt(program.capacity, 10),
    0,
  )

  return (
    <div className="space-y-5">
      <SectionCard
        eyebrow="Program command center"
        title="Programs designed for capacity and confidence"
        description="Balance seats, staffing, and waitlist pressure without losing the human story families care about."
      >
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr,1fr]">
          <div className="overflow-hidden rounded-[20px] border border-berry/30 bg-white/70">
            <img
              src={kidsRainbowBanner}
              alt="Programs rainbow visual"
              className="h-20 w-full object-cover"
            />
          </div>
          <div className="overflow-hidden rounded-[20px] border border-leaf/30 bg-white/70">
            <img
              src={kidsPlayLane}
              alt="Programs play visual"
              className="h-20 w-full object-cover"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-[20px] border border-teal/20 bg-teal/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-teal/80">Total seats</p>
            <p className="mt-1 font-display text-3xl text-ink">{totalSeats}</p>
          </article>
          <article className="rounded-[20px] border border-amber/30 bg-amber/20 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Average fill</p>
            <p className="mt-1 font-display text-3xl text-ink">{averageFill}%</p>
          </article>
          <article className="rounded-[20px] border border-coral/20 bg-coral/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-coral/80">High demand</p>
            <p className="mt-1 font-display text-3xl text-ink">{highDemandPrograms}</p>
          </article>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Classroom story"
        title="Programs and demand distribution"
        description="Each card balances seats, waitlists, and educator ownership for clear enrollment planning."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {state.data.programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              inspectedProgramIds={inspectedProgramIds}
              onInspectProgram={inspectProgram}
            />
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard
          eyebrow="Capacity"
          title="When to open seats"
          description="Keep waitlist communication proactive."
        >
          <div className="space-y-3 text-sm leading-6 text-ink/80">
            <p className="inline-flex items-center gap-2 font-semibold text-ink">
              <Building2 className="h-4 w-4 text-teal" />
              Toddler and pre-k are the tightest programs right now.
            </p>
            <p>Trigger early calls when a family is likely to graduate to the next room.</p>
            <p>Reserve sensory and schedule accommodations before confirmed start dates.</p>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Staffing"
          title="Educator coverage"
          description="Tie staffing decisions to demand data and tour timing."
        >
          <div className="space-y-3 text-sm leading-6 text-ink/80">
            <p className="inline-flex items-center gap-2 font-semibold text-ink">
              <Users className="h-4 w-4 text-coral" />
              Pair educator visibility with waitlist pressure.
            </p>
            <p>Programs with waitlists above four should keep backup coverage mapped weekly.</p>
            <p>Highlight educator strengths during tours to improve conversion confidence.</p>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Curriculum"
          title="Program positioning"
          description="Keep CRM language aligned to the institute’s developmental tone."
        >
          <div className="space-y-3 text-sm leading-6 text-ink/80">
            <p className="inline-flex items-center gap-2 font-semibold text-ink">
              <BookOpen className="h-4 w-4 text-amber" />
              Phrase programs around growth, confidence, and trust.
            </p>
            <p>Admissions scripts should mention care quality and developmental outcomes together.</p>
            <p>Program summaries can reuse this language for brochures and parent packets.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
