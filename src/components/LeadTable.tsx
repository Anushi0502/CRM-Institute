import { LEAD_REVIEW_POINTS } from '../services/gamificationService'
import type { Lead } from '../types/crm'
import { formatDateLabel } from '../utils/formatters'

const priorityClasses: Record<Lead['priority'], string> = {
  High: 'bg-coral/10 text-coral border-coral/25',
  Medium: 'bg-amber/20 text-amber-700 border-amber/35',
  Low: 'bg-teal/10 text-teal border-teal/25',
}

interface LeadTableProps {
  leads: Lead[]
  reviewedLeadIds?: string[]
  onReviewLead?: (leadId: string) => void
}

export function LeadTable({
  leads,
  reviewedLeadIds = [],
  onReviewLead,
}: LeadTableProps) {
  const reviewedLeadSet = new Set(reviewedLeadIds)

  return (
    <div className="kid-panel overflow-hidden rounded-[24px] border border-ink/5 shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-ink/5 text-left">
          <thead className="bg-cloud/80 text-xs uppercase tracking-[0.24em] text-ink/60">
            <tr>
              <th className="px-5 py-4 font-semibold">Family</th>
              <th className="px-5 py-4 font-semibold">Program</th>
              <th className="px-5 py-4 font-semibold">Stage</th>
              <th className="px-5 py-4 font-semibold">Priority</th>
              <th className="px-5 py-4 font-semibold">Follow up</th>
              <th className="px-5 py-4 font-semibold">Next step</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5 bg-white/90">
            {leads.map((lead) => {
              const isReviewed = reviewedLeadSet.has(lead.id)

              return (
                <tr key={lead.id} className="align-top transition hover:bg-cloud/45">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">{lead.familyName} family</p>
                    <p className="text-sm text-ink/70">
                      {lead.childName} • {lead.ageGroup} • {lead.source}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm text-ink/80">{lead.programInterest}</td>
                  <td className="px-5 py-4 text-sm text-ink/80">{lead.stage}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`kid-ribbon rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClasses[lead.priority]}`}
                    >
                      {lead.priority}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-ink/80">
                    {formatDateLabel(lead.followUpDate)}
                  </td>
                  <td className="px-5 py-4 text-sm leading-6 text-ink/80">
                    <p>{lead.nextStep}</p>
                    {onReviewLead ? (
                      <button
                        type="button"
                        disabled={isReviewed}
                        onClick={() => onReviewLead(lead.id)}
                        className={`mt-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                          isReviewed
                            ? 'cursor-not-allowed border border-teal/25 bg-teal/10 text-teal'
                            : 'kid-ghost-button hover:bg-white'
                        }`}
                      >
                        {isReviewed
                          ? 'Touchpoint logged'
                          : `Log touchpoint (+${LEAD_REVIEW_POINTS} XP)`}
                      </button>
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
