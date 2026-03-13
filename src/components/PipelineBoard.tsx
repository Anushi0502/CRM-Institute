import { PIPELINE_STAGES, type Lead } from '../types/crm'
import { formatDateLabel } from '../utils/formatters'

const stageClasses: Record<Lead['stage'], string> = {
  Inquiry: 'bg-cloud text-ink/70',
  'Tour Booked': 'bg-teal/10 text-teal',
  'Application Started': 'bg-amber/20 text-amber-700',
  Waitlist: 'bg-coral/10 text-coral',
  Enrolled: 'bg-plum/10 text-plum',
}

const priorityDot: Record<Lead['priority'], string> = {
  High: 'bg-coral',
  Medium: 'bg-amber',
  Low: 'bg-teal',
}

export function PipelineBoard({ leads }: { leads: Lead[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-5">
      {PIPELINE_STAGES.map((stage) => {
        const stageLeads = leads.filter((lead) => lead.stage === stage)

        return (
          <div
            key={stage}
            className="rounded-[24px] border border-ink/5 bg-white/75 p-4 shadow-soft"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="font-semibold text-ink">{stage}</p>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stageClasses[stage]}`}
              >
                {stageLeads.length}
              </span>
            </div>

            <div className="space-y-3">
              {stageLeads.map((lead) => (
                <article
                  key={lead.id}
                  className="rounded-[20px] border border-white/80 bg-white/95 p-4 shadow-soft transition duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{lead.childName}</p>
                      <p className="text-sm text-ink/60">{lead.familyName} family</p>
                    </div>
                    <span
                      className={`mt-1 inline-flex h-2.5 w-2.5 rounded-full ${priorityDot[lead.priority]}`}
                    />
                  </div>
                  <p className="mt-3 text-sm text-ink/70">{lead.programInterest}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-ink/45">
                    Follow up {formatDateLabel(lead.followUpDate)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
