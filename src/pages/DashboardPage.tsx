import { ArrowUpRight, Sparkles, Star } from 'lucide-react'
import { ActivityFeed } from '../components/ActivityFeed'
import { LeadTable } from '../components/LeadTable'
import { PipelineBoard } from '../components/PipelineBoard'
import { ProgramCard } from '../components/ProgramCard'
import { SectionCard } from '../components/SectionCard'
import { StatCard } from '../components/StatCard'
import { TaskPanel } from '../components/TaskPanel'
import type { PageStateProps } from '../types/crm'

export function DashboardPage({ state }: PageStateProps) {
  const spotlightPrograms = state.data.programs.slice(0, 2)
  const spotlightLeads = state.data.leads.slice(0, 4)
  const highPriorityLeads = state.data.leads.filter((lead) => lead.priority === 'High').length
  const pendingTasks = state.data.tasks.filter((task) => task.status !== 'Done').length
  const tuitionReviews = state.data.students.filter(
    (student) => student.tuitionStatus === 'Review',
  ).length

  return (
    <div className="space-y-5">
      <SectionCard
        eyebrow="Executive strip"
        title="Today’s operating pulse"
        description="Quick-read metrics so leadership, admissions, and family care teams align in the first minute."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-[20px] border border-teal/20 bg-teal/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-teal/75">High-priority leads</p>
            <p className="mt-1 font-display text-3xl text-ink">{highPriorityLeads}</p>
          </article>
          <article className="rounded-[20px] border border-coral/20 bg-coral/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-coral/80">Pending tasks</p>
            <p className="mt-1 font-display text-3xl text-ink">{pendingTasks}</p>
          </article>
          <article className="rounded-[20px] border border-amber/30 bg-amber/20 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Tuition reviews</p>
            <p className="mt-1 font-display text-3xl text-ink">{tuitionReviews}</p>
          </article>
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[1.35fr,0.85fr]">
        <SectionCard
          eyebrow="Campus pulse"
          title="Warm, parent-friendly operations with CRM clarity"
          description="The dashboard surfaces admissions energy, student care signals, and program capacity in one screen so your team can act faster."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {state.data.metrics.map((metric) => (
              <StatCard key={metric.id} metric={metric} />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Today"
          title="Priority action lane"
          description="The next actions most likely to move enrollment, retention, or family confidence."
          actionLabel="High focus"
        >
          <TaskPanel tasks={state.data.tasks.slice(0, 3)} />
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="Admissions flow"
        title="Family pipeline at a glance"
        description="Inquiry through enrollment, grouped the way an admissions coordinator actually works."
        actionLabel={`${state.data.leads.length} active records`}
      >
        <PipelineBoard leads={state.data.leads} />
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
        <SectionCard
          eyebrow="Programs"
          title="Programs with the most demand"
          description="Capacity, waitlists, and educator ownership stay visible without leaving the dashboard."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {spotlightPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Recent activity"
          title="Signals from the day"
          description="A single feed for admissions, student updates, and retention moments."
        >
          <ActivityFeed activities={state.data.activities} />
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="High-intent families"
        title="Next conversations to protect"
        description="These families are closest to movement. Keep their next step visible and warm."
        actionLabel="Admissions shortlist"
      >
        <LeadTable leads={spotlightLeads} />
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-ink/65">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/20 px-4 py-2 font-semibold text-ink">
            <Star className="h-4 w-4 text-amber" />
            Follow-ups within 48 hours convert better for this pipeline.
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/10 px-4 py-2 font-semibold text-ink/80">
            <ArrowUpRight className="h-4 w-4 text-teal" />
            Pre-k interest is leading this month.
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-plum/20 bg-plum/10 px-4 py-2 font-semibold text-ink/80">
            <Sparkles className="h-4 w-4 text-plum" />
            Family sentiment remains warm after onboarding week.
          </span>
        </div>
      </SectionCard>
    </div>
  )
}
