import { Flame, Target, Trophy, Zap } from 'lucide-react'
import type { GamificationSummary } from '../types/gamification'

interface GameHudProps {
  summary: GamificationSummary
  compact?: boolean
}

export function GameHud({ summary, compact = false }: GameHudProps) {
  const levelSpan = summary.pointsIntoLevel + summary.pointsToNextLevel
  const progress = levelSpan === 0 ? 0 : Math.round((summary.pointsIntoLevel / levelSpan) * 100)

  return (
    <section className="kid-panel rounded-[26px] border border-ink/10 bg-white/92 p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/60">Play mode</p>
          <h3 className="mt-1 font-display text-2xl text-ink">Level {summary.level}</h3>
        </div>
        <span className="kid-ribbon rounded-full border border-amber/35 bg-amber/20 px-3 py-1.5 text-xs font-semibold text-amber-700">
          <Zap className="h-3.5 w-3.5" />
          {summary.totalPoints} XP
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-ink/65">
          <span>Level progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-ink/10">
          <div
            className="h-2.5 rounded-full bg-[var(--crm-gradient-progress)] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className={`mt-4 grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-3'}`}>
        <article className="rounded-2xl border border-coral/20 bg-coral/10 px-3 py-2 text-ink/85">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em]">
            <Flame className="h-3.5 w-3.5 text-coral" />
            Streak
          </p>
          <p className="mt-1 font-display text-2xl text-ink">{summary.streakDays}</p>
        </article>
        <article className="rounded-2xl border border-teal/20 bg-teal/10 px-3 py-2 text-ink/85">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em]">
            <Target className="h-3.5 w-3.5 text-teal" />
            Quests
          </p>
          <p className="mt-1 font-display text-2xl text-ink">{summary.questsCompletedToday}</p>
        </article>
        {!compact ? (
          <article className="rounded-2xl border border-plum/20 bg-plum/10 px-3 py-2 text-ink/85">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em]">
              <Trophy className="h-3.5 w-3.5 text-plum" />
              Tasks
            </p>
            <p className="mt-1 font-display text-2xl text-ink">{summary.tasksCompleted}</p>
          </article>
        ) : null}
      </div>
    </section>
  )
}
