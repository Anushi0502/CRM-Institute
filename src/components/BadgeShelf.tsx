import {
  Compass,
  Flag,
  Flame,
  Rocket,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import type { GamificationBadge, GamificationBadgeIcon } from '../types/gamification'

const iconMap: Record<GamificationBadgeIcon, LucideIcon> = {
  sparkles: Sparkles,
  flag: Flag,
  compass: Compass,
  shield: ShieldCheck,
  flame: Flame,
  rocket: Rocket,
}

interface BadgeShelfProps {
  badges: GamificationBadge[]
}

export function BadgeShelf({ badges }: BadgeShelfProps) {
  return (
    <section className="kid-panel rounded-[26px] border border-ink/10 bg-white/92 p-4 shadow-soft">
      <h3 className="font-display text-2xl text-ink">Badge shelf</h3>
      <p className="mt-1 text-sm text-ink/75">Unlock long-term milestones while running daily CRM workflows.</p>

      <div className="mt-4 space-y-3">
        {badges.map((badge) => {
          const Icon = iconMap[badge.icon]
          const unlocked = Boolean(badge.unlockedAt)
          const progressPercent = Math.round((badge.progress / badge.target) * 100)

          return (
            <article
              key={badge.id}
              className={`rounded-[18px] border px-3 py-3 ${
                unlocked
                  ? 'border-plum/25 bg-plum/10'
                  : 'border-ink/10 bg-cloud/70'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 font-semibold text-ink">
                    <Icon className={`h-4 w-4 ${unlocked ? 'text-plum' : 'text-ink/60'}`} />
                    {badge.title}
                  </p>
                  <p className="mt-1 text-sm text-ink/75">{badge.description}</p>
                </div>
                <span className="rounded-full border border-amber/30 bg-amber/20 px-2 py-1 text-xs font-semibold text-amber-700">
                  +{badge.rewardPoints} XP
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-ink/60">
                <span>
                  {badge.progress}/{badge.target}
                </span>
                <span>{unlocked ? 'Unlocked' : 'Locked'}</span>
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
