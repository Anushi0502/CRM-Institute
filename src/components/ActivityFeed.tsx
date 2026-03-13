import type { Activity } from '../types/crm'

const toneClasses: Record<Activity['tone'], string> = {
  teal: 'border-teal/20 bg-teal/5 text-teal',
  coral: 'border-coral/20 bg-coral/10 text-coral',
  amber: 'border-amber/30 bg-amber/15 text-amber-700',
  plum: 'border-plum/25 bg-plum/10 text-plum',
}

const glowClasses: Record<Activity['tone'], string> = {
  teal: 'from-teal/18 to-transparent',
  coral: 'from-coral/18 to-transparent',
  amber: 'from-amber/22 to-transparent',
  plum: 'from-plum/18 to-transparent',
}

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <article
          key={activity.id}
          className="group relative overflow-hidden rounded-[22px] border border-ink/5 bg-white/90 p-4 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-float"
        >
          <div className={`pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-r ${glowClasses[activity.tone]}`} />
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-ink">{activity.title}</p>
              <p className="mt-2 text-sm leading-6 text-ink/65">{activity.description}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-ink/45">{activity.time}</p>
            </div>
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClasses[activity.tone]}`}
            >
              {activity.tag}
            </span>
          </div>
        </article>
      ))}
    </div>
  )
}
