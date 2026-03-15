import { BarChart3, Search, Sparkles } from 'lucide-react'
import { useDeferredValue, useEffect, useState } from 'react'
import kidsCloudStrip from '../assets/kids-cloud-strip.svg'
import kidsRainbowBanner from '../assets/kids-rainbow-banner.svg'
import { LeadTable } from '../components/LeadTable'
import { PipelineBoard } from '../components/PipelineBoard'
import { SectionCard } from '../components/SectionCard'
import { useGamificationContext } from '../context/GamificationContext'
import type { PageStateProps } from '../types/crm'

export function AdmissionsPage({ state }: PageStateProps) {
  const { logAdmissionsSearch, reviewLead, reviewedLeadIds } = useGamificationContext()
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())

  const filteredLeads = deferredQuery
    ? state.data.leads.filter((lead) =>
        [
          lead.familyName,
          lead.childName,
          lead.programInterest,
          lead.source,
          lead.campus,
        ]
          .join(' ')
          .toLowerCase()
          .includes(deferredQuery),
      )
    : state.data.leads

  const highPriorityCount = filteredLeads.filter((lead) => lead.priority === 'High').length
  const toursBooked = filteredLeads.filter((lead) => lead.stage === 'Tour Booked').length
  const enrolledCount = filteredLeads.filter((lead) => lead.stage === 'Enrolled').length

  useEffect(() => {
    if (deferredQuery.length >= 2) {
      logAdmissionsSearch(deferredQuery)
    }
  }, [deferredQuery, logAdmissionsSearch])

  return (
    <div className="space-y-5">
      <SectionCard
        eyebrow="Admissions cockpit"
        title="Search, scan, and move families forward"
        description="Use one command surface to find families quickly, balance the stage mix, and focus team attention."
        actionLabel={`${filteredLeads.length} visible records`}
      >
        <div className="mb-4 overflow-hidden rounded-[22px] border border-sky/30 bg-white/70">
          <img
            src={kidsCloudStrip}
            alt="Admissions visual cloud strip"
            className="h-20 w-full object-cover"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.25fr,0.75fr]">
          <div className="space-y-4">
            <label className="flex items-center gap-3 rounded-[22px] border border-ink/10 bg-cloud/80 px-4 py-3">
              <Search className="h-4 w-4 text-ink/60" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search family, child, program, or source"
                className="w-full border-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink/60"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-[20px] border border-coral/20 bg-coral/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-coral/80">High priority</p>
                <p className="mt-1 font-display text-3xl text-ink">{highPriorityCount}</p>
              </article>
              <article className="rounded-[20px] border border-teal/20 bg-teal/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-teal/80">Tours booked</p>
                <p className="mt-1 font-display text-3xl text-ink">{toursBooked}</p>
              </article>
              <article className="rounded-[20px] border border-plum/20 bg-plum/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-plum/80">Enrolled</p>
                <p className="mt-1 font-display text-3xl text-ink">{enrolledCount}</p>
              </article>
            </div>
          </div>

          <article className="rounded-[22px] border border-ink/10 bg-white/85 p-4 shadow-soft">
            <div className="mb-3 overflow-hidden rounded-xl border border-white/70">
              <img
                src={kidsRainbowBanner}
                alt="Colorful admissions guidance banner"
                className="h-16 w-full object-cover"
              />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal">
              <BarChart3 className="h-3.5 w-3.5" />
              Focus guidance
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/80">
              Keep high-priority families on a 48-hour follow-up rhythm and batch calls by stage to avoid context switching.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink/75">
              <Sparkles className="h-4 w-4 text-coral" />
              Use the board below to coordinate handoffs between admissions and director calls.
            </p>
          </article>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Admissions board"
        title="Current pipeline by stage"
        description="The board view keeps handoffs visible for tours, applications, waitlists, and enrollments."
      >
        <PipelineBoard leads={filteredLeads} />
      </SectionCard>

      <SectionCard
        eyebrow="Detail view"
        title="All admissions records"
        description="A structured follow-up table for coordinators, directors, and family care staff."
      >
        <LeadTable
          leads={filteredLeads}
          reviewedLeadIds={reviewedLeadIds}
          onReviewLead={reviewLead}
        />
      </SectionCard>
    </div>
  )
}
