import type { Lead } from '../types/crm'
import { formatDateLabel } from '../utils/formatters'

const priorityClasses: Record<Lead['priority'], string> = {
  High: 'bg-coral/10 text-coral border-coral/25',
  Medium: 'bg-amber/20 text-amber-700 border-amber/35',
  Low: 'bg-teal/10 text-teal border-teal/25',
}

export function LeadTable({ leads }: { leads: Lead[] }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-ink/5 shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-ink/5 text-left">
          <thead className="bg-cloud/80 text-xs uppercase tracking-[0.24em] text-ink/45">
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
            {leads.map((lead) => (
              <tr key={lead.id} className="align-top transition hover:bg-cloud/45">
                <td className="px-5 py-4">
                  <p className="font-semibold text-ink">{lead.familyName} family</p>
                  <p className="text-sm text-ink/55">
                    {lead.childName} • {lead.ageGroup} • {lead.source}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm text-ink/70">{lead.programInterest}</td>
                <td className="px-5 py-4 text-sm text-ink/70">{lead.stage}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClasses[lead.priority]}`}
                  >
                    {lead.priority}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-ink/70">
                  {formatDateLabel(lead.followUpDate)}
                </td>
                <td className="px-5 py-4 text-sm leading-6 text-ink/70">
                  {lead.nextStep}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
