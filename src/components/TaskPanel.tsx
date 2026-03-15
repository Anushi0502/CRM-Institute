import type { Task } from '../types/crm'
import { formatDateLabel } from '../utils/formatters'

const priorityClasses: Record<Task['priority'], string> = {
  High: 'border-coral/25 bg-coral/10 text-coral',
  Medium: 'border-amber/35 bg-amber/20 text-amber-700',
  Low: 'border-teal/25 bg-teal/10 text-teal',
}

const statusClasses: Record<Task['status'], string> = {
  Today: 'border-coral/25 bg-coral/10 text-coral',
  'This Week': 'border-amber/35 bg-amber/20 text-amber-700',
  Done: 'border-teal/25 bg-teal/10 text-teal',
}

export function TaskPanel({ tasks }: { tasks: Task[] }) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <article
          key={task.id}
          className="kid-panel group relative overflow-hidden rounded-[22px] border border-ink/5 bg-white/92 p-4 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-float"
        >
          <div className="pointer-events-none absolute inset-y-3 left-0 w-1 rounded-r-full bg-[var(--crm-gradient-task-rail)]" />

          <div className="ml-2 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-ink">{task.title}</p>
              <p className="mt-2 text-sm text-ink/70">
                {task.owner} • {task.category}
              </p>
            </div>
            <span
              className={`kid-ribbon rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClasses[task.priority]}`}
            >
              {task.priority}
            </span>
          </div>

          <div className="ml-2 mt-4 flex items-center justify-between gap-3 text-sm text-ink/80">
            <span className={`kid-ribbon rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[task.status]}`}>
              {task.status}
            </span>
            <span className="font-medium">Due {formatDateLabel(task.dueDate)}</span>
          </div>
        </article>
      ))}
    </div>
  )
}
