import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CalendarPlus2, CircleCheckBig, FolderUp, Sparkles } from 'lucide-react'
import { UserPanel } from '../../components/UserPanel'
import { useUserPortal } from '../../hooks/useUserPortal'
import type { UserApplication } from '../../types/userPortal'

const statusTone = {
  Done: 'border-teal/25 bg-teal/10 text-teal',
  'In Progress': 'border-amber/35 bg-amber/20 text-amber-700',
  Pending: 'border-ink/10 bg-cloud/80 text-ink/70',
} as const

function getCompletion(application: UserApplication) {
  const doneCount = application.steps.filter((step) => step.status === 'Done').length
  return Math.round((doneCount / Math.max(application.steps.length, 1)) * 100)
}

export function UserAdmissionsPage() {
  const {
    activeChild,
    createApplication,
    scheduleTour,
    state,
    uploadDocument,
    visibleApplications,
  } = useUserPortal()
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [scope, setScope] = useState<'active' | 'household'>('active')
  const [selectedChildId, setSelectedChildId] = useState(activeChild?.id ?? state.children[0]?.id ?? '')
  const [program, setProgram] = useState(activeChild?.program ?? 'Toddler Explorers')
  const [campus, setCampus] = useState(activeChild?.campus ?? 'Edina Campus')
  const [tourDate, setTourDate] = useState('Mar 26 · 10:30 AM')

  useEffect(() => {
    setSelectedChildId(activeChild?.id ?? state.children[0]?.id ?? '')
    setProgram(activeChild?.program ?? 'Toddler Explorers')
    setCampus(activeChild?.campus ?? 'Edina Campus')
  }, [activeChild?.campus, activeChild?.id, activeChild?.program, state.children])

  const applications = scope === 'household' ? state.applications : visibleApplications
  const missingDocuments = useMemo(
    () =>
      applications.flatMap((application) =>
        application.documents
          .filter((document) => document.status === 'Missing')
          .map((document) => ({
            applicationId: application.id,
            childId: application.childId,
            title: document.title,
            documentId: document.id,
          })),
      ),
    [applications],
  )
  const scheduledTours = applications.filter((application) => application.tourDate)
  const inReviewCount = applications.filter((application) => application.stage.toLowerCase().includes('review')).length

  function handleCreateApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedChildId) {
      return
    }

    createApplication({
      childId: selectedChildId,
      campus,
      program,
    })
    setIsComposerOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr),minmax(340px,0.92fr)]">
        <UserPanel
          eyebrow="Apply for admission"
          title="Admissions workspace"
          description="Run multiple child applications from one household desk. Create drafts, clear document gaps, and lock tours without losing parent context."
          action={(
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setScope('active')
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  scope === 'active'
                    ? 'border border-ink bg-ink text-white'
                    : 'border border-ink/10 bg-white text-ink/80'
                }`}
              >
                Active child
              </button>
              <button
                type="button"
                onClick={() => {
                  setScope('household')
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  scope === 'household'
                    ? 'border border-ink bg-ink text-white'
                    : 'border border-ink/10 bg-white text-ink/80'
                }`}
              >
                Household
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsComposerOpen((current) => !current)
                }}
                className="kid-bubble-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
              >
                New application
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        >
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-[22px] border border-coral/25 bg-coral/10 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-coral">Applications</p>
              <p className="mt-2 font-display text-3xl text-ink">{applications.length}</p>
            </div>
            <div className="rounded-[22px] border border-amber/35 bg-amber/20 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-amber-700">Missing docs</p>
              <p className="mt-2 font-display text-3xl text-ink">{missingDocuments.length}</p>
            </div>
            <div className="rounded-[22px] border border-teal/25 bg-teal/10 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-teal">Tours booked</p>
              <p className="mt-2 font-display text-3xl text-ink">{scheduledTours.length}</p>
            </div>
            <div className="rounded-[22px] border border-plum/25 bg-plum/10 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-plum">In review</p>
              <p className="mt-2 font-display text-3xl text-ink">{inReviewCount}</p>
            </div>
          </div>

          {isComposerOpen ? (
            <form onSubmit={handleCreateApplication} className="mt-4 grid gap-3 rounded-[24px] border border-ink/10 bg-white px-4 py-4 lg:grid-cols-4">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/60">Child</span>
                <select
                  value={selectedChildId}
                  onChange={(event) => {
                    setSelectedChildId(event.target.value)
                  }}
                  className="w-full rounded-2xl border border-ink/10 bg-cloud/70 px-3 py-2 text-sm text-ink outline-none"
                >
                  {state.children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/60">Program</span>
                <input
                  value={program}
                  onChange={(event) => {
                    setProgram(event.target.value)
                  }}
                  className="w-full rounded-2xl border border-ink/10 bg-cloud/70 px-3 py-2 text-sm text-ink outline-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/60">Campus</span>
                <input
                  value={campus}
                  onChange={(event) => {
                    setCampus(event.target.value)
                  }}
                  className="w-full rounded-2xl border border-ink/10 bg-cloud/70 px-3 py-2 text-sm text-ink outline-none"
                />
              </label>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="kid-bubble-button inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white"
                >
                  Create application
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : null}

          <div className="mt-4 space-y-4">
            {applications.length > 0 ? (
              applications.map((application) => {
                const child = state.children.find((entry) => entry.id === application.childId)
                const completion = getCompletion(application)

                return (
                  <article key={application.id} className="rounded-[26px] border border-ink/10 bg-white px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-2xl text-ink">{child?.name ?? 'Child application'}</p>
                          <span className="rounded-full border border-ink/10 bg-cloud px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/70">
                            {application.program}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-ink/75">
                          {application.campus} · {application.submittedAt}
                        </p>
                        <p className="mt-2 text-sm text-ink/80">{application.statusNote}</p>
                      </div>
                      <span className="rounded-full border border-coral/25 bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                        {application.stage}
                      </span>
                    </div>

                    <div className="mt-4 rounded-[22px] border border-ink/10 bg-cloud/40 px-4 py-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">Progress</p>
                        <p className="text-sm text-ink/70">{application.progressLabel}</p>
                      </div>
                      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/90">
                        <div className="h-full rounded-full bg-gradient-to-r from-teal to-coral" style={{ width: `${completion}%` }} />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 md:grid-cols-4">
                      {application.steps.map((step) => (
                        <div key={step.id} className={`rounded-2xl border px-3 py-3 ${statusTone[step.status]}`}>
                          <p className="text-xs uppercase tracking-[0.14em]">{step.status}</p>
                          <p className="mt-2 font-semibold text-ink">{step.title}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.1fr),minmax(280px,0.9fr)]">
                      <div className="rounded-2xl border border-ink/10 bg-cloud/60 px-4 py-4">
                        <p className="inline-flex items-center gap-2 font-semibold text-ink">
                          <FolderUp className="h-4 w-4 text-coral" />
                          Document queue
                        </p>
                        <div className="mt-3 space-y-2">
                          {application.documents.map((document) => (
                            <div key={document.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-3 py-3">
                              <div>
                                <p className="font-semibold text-ink">{document.title}</p>
                                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink/60">
                                  {document.status} · {document.updatedAt}
                                </p>
                              </div>
                              {document.status !== 'Verified' ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    uploadDocument(application.id, document.id)
                                  }}
                                  className="kid-ghost-button rounded-full px-3 py-1.5 text-xs font-semibold text-ink/80"
                                >
                                  {document.status === 'Missing' ? 'Upload now' : 'Re-upload'}
                                </button>
                              ) : (
                                <span className="rounded-full border border-teal/25 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
                                  Verified
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-ink/10 bg-white px-4 py-4">
                        <p className="inline-flex items-center gap-2 font-semibold text-ink">
                          <CalendarPlus2 className="h-4 w-4 text-teal" />
                          Tour planning
                        </p>
                        <p className="mt-2 text-sm text-ink/80">
                          {application.tourDate ? `Tour locked for ${application.tourDate}.` : 'No tour booked yet.'}
                        </p>
                        {!application.tourDate ? (
                          <div className="mt-3 space-y-3">
                            <input
                              value={tourDate}
                              onChange={(event) => {
                                setTourDate(event.target.value)
                              }}
                              className="w-full rounded-2xl border border-ink/10 bg-cloud/70 px-3 py-2 text-sm text-ink outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                scheduleTour(application.id, tourDate)
                              }}
                              className="kid-bubble-button inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white"
                            >
                              Book tour
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="mt-3 rounded-2xl border border-teal/25 bg-teal/10 px-3 py-3 text-sm text-teal">
                            Tour already scheduled.
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="rounded-[24px] border border-dashed border-ink/15 bg-white px-4 py-8 text-sm text-ink/70">
                No applications exist in this scope yet. Create one from this workspace.
              </div>
            )}
          </div>
        </UserPanel>

        <div className="space-y-4">
          <UserPanel eyebrow="Priority queue" title="What needs parent action first">
            <div className="space-y-3">
              {missingDocuments.length > 0 ? (
                missingDocuments.slice(0, 5).map((item) => {
                  const child = state.children.find((entry) => entry.id === item.childId)
                  return (
                    <div key={`${item.applicationId}:${item.documentId}`} className="rounded-[22px] border border-coral/25 bg-coral/10 px-4 py-4">
                      <p className="font-semibold text-ink">{item.title}</p>
                      <p className="mt-2 text-sm text-ink/80">Missing for {child?.name ?? 'child'}.</p>
                      <button
                        type="button"
                        onClick={() => {
                          uploadDocument(item.applicationId, item.documentId)
                        }}
                        className="mt-3 kid-ghost-button rounded-full px-3 py-1.5 text-sm font-semibold text-ink/85"
                      >
                        Upload now
                      </button>
                    </div>
                  )
                })
              ) : (
                <div className="rounded-[22px] border border-teal/25 bg-teal/10 px-4 py-4 text-sm text-teal">
                  No missing documents right now.
                </div>
              )}
            </div>
          </UserPanel>

          <UserPanel eyebrow="Tours" title="Scheduled visits and follow-ups">
            <div className="space-y-3">
              {scheduledTours.length > 0 ? (
                scheduledTours.map((application) => {
                  const child = state.children.find((entry) => entry.id === application.childId)
                  return (
                    <div key={application.id} className="rounded-[22px] border border-amber/35 bg-amber/20 px-4 py-4">
                      <p className="font-semibold text-ink">{child?.name ?? 'Child'}</p>
                      <p className="mt-2 text-sm text-ink/80">{application.program}</p>
                      <p className="mt-2 text-sm text-ink/80">{application.tourDate}</p>
                    </div>
                  )
                })
              ) : (
                <div className="rounded-[22px] border border-dashed border-ink/15 bg-white px-4 py-8 text-sm text-ink/70">
                  No tours have been booked yet.
                </div>
              )}
            </div>
          </UserPanel>

          <UserPanel eyebrow="Readiness" title="Admissions operating notes">
            <div className="space-y-3">
              <div className="rounded-[22px] border border-ink/10 bg-white px-4 py-4">
                <p className="inline-flex items-center gap-2 font-semibold text-ink">
                  <CircleCheckBig className="h-4 w-4 text-teal" />
                  Household admissions strategy
                </p>
                <p className="mt-2 text-sm text-ink/80">
                  Use the active-child scope to work fast on one child, then switch to household scope to catch cross-family document gaps before they become delays.
                </p>
              </div>
              <div className="rounded-[22px] border border-ink/10 bg-white px-4 py-4">
                <p className="inline-flex items-center gap-2 font-semibold text-ink">
                  <Sparkles className="h-4 w-4 text-coral" />
                  Tour planning rule
                </p>
                <p className="mt-2 text-sm text-ink/80">
                  Keep tours close to the admissions document window so enrollment decisions do not stall after the campus visit.
                </p>
              </div>
            </div>
          </UserPanel>
        </div>
      </div>
    </div>
  )
}
