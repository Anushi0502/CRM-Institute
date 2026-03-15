import { MessageCircleHeart, Megaphone, Sparkles } from 'lucide-react'
import kidsCloudStrip from '../assets/kids-cloud-strip.svg'
import kidsRainbowBanner from '../assets/kids-rainbow-banner.svg'
import { ActivityFeed } from '../components/ActivityFeed'
import { SectionCard } from '../components/SectionCard'
import { TaskPanel } from '../components/TaskPanel'
import { useGamificationContext } from '../context/GamificationContext'
import type { PageStateProps } from '../types/crm'

export function EngagementPage({ state }: PageStateProps) {
  const { completeTask, completedTaskIds } = useGamificationContext()
  const todayTasks = state.data.tasks.filter((task) => task.status === 'Today').length
  const thisWeekTasks = state.data.tasks.filter((task) => task.status === 'This Week').length
  const highPriorityTasks = state.data.tasks.filter((task) => task.priority === 'High').length

  return (
    <div className="space-y-5">
      <SectionCard
        eyebrow="Engagement radar"
        title="Communication heartbeat"
        description="Keep family touchpoints proactive with a clear mix of immediate, weekly, and high-priority work."
      >
        <div className="mb-4 grid gap-3 md:grid-cols-[1.2fr,0.8fr]">
          <div className="overflow-hidden rounded-[20px] border border-sky/30 bg-white/70">
            <img
              src={kidsCloudStrip}
              alt="Family engagement cloud strip"
              className="h-20 w-full object-cover"
            />
          </div>
          <div className="overflow-hidden rounded-[20px] border border-berry/30 bg-white/70">
            <img
              src={kidsRainbowBanner}
              alt="Family engagement rainbow visual"
              className="h-20 w-full object-cover"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-[20px] border border-coral/20 bg-coral/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-coral/80">Today tasks</p>
            <p className="mt-1 font-display text-3xl text-ink">{todayTasks}</p>
          </article>
          <article className="rounded-[20px] border border-amber/30 bg-amber/20 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700">This week</p>
            <p className="mt-1 font-display text-3xl text-ink">{thisWeekTasks}</p>
          </article>
          <article className="rounded-[20px] border border-teal/20 bg-teal/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-teal/80">High priority</p>
            <p className="mt-1 font-display text-3xl text-ink">{highPriorityTasks}</p>
          </article>
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
        <SectionCard
          eyebrow="Touchpoints"
          title="Conversations that keep families close"
          description="A healthy cadence makes outreach feel deliberate instead of reactive."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-[24px] border border-teal/20 bg-teal/10 p-5">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-teal/80">
                <Megaphone className="h-4 w-4" />
                Before enrollment
              </p>
              <p className="mt-3 font-display text-2xl text-ink">Inquiry cadence</p>
              <p className="mt-3 text-sm leading-6 text-ink/80">
                Day 0 acknowledgement. Day 1 tuition and tour options. Day 3 classroom story. Day 7 decision support.
              </p>
            </article>
            <article className="rounded-[24px] border border-plum/20 bg-plum/10 p-5">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-plum/80">
                <MessageCircleHeart className="h-4 w-4" />
                After enrollment
              </p>
              <p className="mt-3 font-display text-2xl text-ink">Retention cadence</p>
              <p className="mt-3 text-sm leading-6 text-ink/80">
                Day 3 confidence check. Week 2 routine recap. Month 1 milestone note. Quarterly family conversation.
              </p>
            </article>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Action list"
          title="Open communication tasks"
          description="Admissions, family care, and director actions stay visible in one lane."
        >
          <TaskPanel
            tasks={state.data.tasks}
            completedTaskIds={completedTaskIds}
            onCompleteTask={completeTask}
          />
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="Engagement feed"
        title="Recent family and classroom signals"
        description="A single stream keeps the whole team aligned on moments that deserve a response."
      >
        <ActivityFeed activities={state.data.activities} />
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-cloud px-4 py-2 text-sm font-semibold text-ink/75">
          <Sparkles className="h-4 w-4 text-coral" />
          Keep same-day responses for high-sentiment moments to reinforce family trust.
        </div>
      </SectionCard>
    </div>
  )
}
