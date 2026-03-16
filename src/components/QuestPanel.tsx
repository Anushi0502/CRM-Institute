import { CheckCircle2, Circle } from 'lucide-react'
import type { GamificationQuest } from '../types/gamification'

interface QuestPanelProps {
  quests: GamificationQuest[]
}

export function QuestPanel({ quests }: QuestPanelProps) {
  return (
    <section className="kid-panel rounded-[26px] border border-ink/10 bg-white/92 p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-2xl text-ink">Daily quests</h3>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">Refreshes daily</span>
      </div>

      <div className="space-y-3">
        {quests.map((quest) => {
          const progressPercent = Math.round((quest.progress / quest.target) * 100)

          return (
            <article
              key={quest.id}
              className={`rounded-[18px] border px-3 py-3 ${
                quest.completed
                  ? 'border-teal/25 bg-teal/10'
                  : 'border-ink/10 bg-cloud/70'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{quest.title}</p>
                  <p className="mt-1 text-sm text-ink/75">{quest.description}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-amber/30 bg-amber/20 px-2 py-1 text-xs font-semibold text-amber-700">
                  +{quest.rewardPoints} XP
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-ink/60">
                <span>
                  {quest.progress}/{quest.target}
                </span>
                <span>
                  {quest.completed ? (
                    <span className="inline-flex items-center gap-1 text-teal">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Complete
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Circle className="h-3.5 w-3.5" />
                      In progress
                    </span>
                  )}
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-ink/10">
                <div
                  className="h-2 rounded-full crm-bg-progress transition-[width] duration-300"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
