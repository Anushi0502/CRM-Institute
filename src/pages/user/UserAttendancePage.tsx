import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck2, Clock3, ShieldCheck, Sparkles } from 'lucide-react'
import { UserPanel } from '../../components/UserPanel'
import { useUserPortal } from '../../hooks/useUserPortal'

export function UserAttendancePage() {
  const {
    activeChild,
    state,
    submitAbsenceNote,
    updatePickupWindow,
    visibleAttendanceEntries,
  } = useUserPortal()
  const [absenceNote, setAbsenceNote] = useState('')
  const [pickupWindow, setPickupWindow] = useState(activeChild?.pickupWindow ?? '')

  useEffect(() => {
    setPickupWindow(activeChild?.pickupWindow ?? '')
  }, [activeChild?.id, activeChild?.pickupWindow])

  const householdEntries = state.attendanceEntries.slice(0, 8)
  const submittedNotes = state.attendanceEntries.filter((entry) => entry.status === 'Absence note submitted').length
  const avgAttendance =
    state.children.length > 0
      ? Math.round(
          state.children.reduce((sum, child) => sum + Number(child.attendanceRate.replace('%', '')), 0) /
            state.children.length,
        )
      : 0
  const lateEntries = useMemo(
    () => state.attendanceEntries.filter((entry) => entry.status.toLowerCase().includes('late')).length,
    [state.attendanceEntries],
  )

  function handleAbsenceSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!activeChild || !absenceNote.trim()) {
      return
    }

    submitAbsenceNote(activeChild.id, absenceNote.trim())
    setAbsenceNote('')
  }

  function handlePickupUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!activeChild || !pickupWindow.trim()) {
      return
    }

    updatePickupWindow(activeChild.id, pickupWindow.trim())
  }

  return (
    <div className="space-y-4">
      <UserPanel
        eyebrow="Attendance view"
        title="Attendance center"
        description="Daily attendance, late arrivals, absence notes, and pickup changes all land back on the same child and household records."
      >
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-[22px] border border-teal/25 bg-teal/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-teal">Household avg</p>
            <p className="mt-2 font-display text-3xl text-ink">{avgAttendance}%</p>
          </div>
          <div className="rounded-[22px] border border-coral/25 bg-coral/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-coral">Absence notes</p>
            <p className="mt-2 font-display text-3xl text-ink">{submittedNotes}</p>
          </div>
          <div className="rounded-[22px] border border-amber/35 bg-amber/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-amber-700">Late arrivals</p>
            <p className="mt-2 font-display text-3xl text-ink">{lateEntries}</p>
          </div>
          <div className="rounded-[22px] border border-plum/25 bg-plum/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-plum">Pickup contacts</p>
            <p className="mt-2 font-display text-3xl text-ink">
              {state.contacts.filter((contact) => contact.type === 'pickup').length}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.08fr),minmax(320px,0.92fr)]">
          <div className="rounded-[26px] border border-ink/10 bg-white px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/60">Active child week</p>
                <h3 className="mt-2 font-display text-3xl text-ink">
                  {activeChild ? `${activeChild.name} attendance` : 'Attendance stream'}
                </h3>
              </div>
              {activeChild ? (
                <span className="rounded-full border border-teal/25 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
                  {activeChild.attendanceRate}
                </span>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-5">
              {visibleAttendanceEntries.length > 0 ? (
                visibleAttendanceEntries.map((entry) => (
                  <div key={entry.id} className="rounded-[22px] border border-ink/10 bg-cloud/35 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/60">
                      {entry.day} · {entry.dateLabel}
                    </p>
                    <p className="mt-2 font-semibold text-ink">{entry.status}</p>
                    <p className="mt-2 text-sm text-ink/80">{entry.note}</p>
                    <div className="mt-3 space-y-1 text-xs uppercase tracking-[0.12em] text-ink/60">
                      <p>In: {entry.checkIn}</p>
                      <p>Out: {entry.checkOut}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-ink/15 bg-white px-4 py-8 text-sm text-ink/70 lg:col-span-5">
                  No attendance entries yet for the active child.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[26px] border border-ink/10 bg-ink px-4 py-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/65">Current child operations</p>
            {activeChild ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4">
                  <p className="font-semibold text-white">{activeChild.name}</p>
                  <p className="mt-2 text-sm text-white/75">{activeChild.todayStatus}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4">
                  <p className="text-sm text-white/75">Pickup window</p>
                  <p className="mt-2 font-semibold text-white">{activeChild.pickupWindow}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4">
                  <p className="text-sm text-white/75">Teacher</p>
                  <p className="mt-2 font-semibold text-white">{activeChild.teacher}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-white/75">Add a child profile to start attendance operations.</p>
            )}
          </div>
        </div>
      </UserPanel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr),minmax(360px,0.9fr)]">
        <UserPanel eyebrow="Household roster" title="Attendance across children">
          <div className="grid gap-3 lg:grid-cols-2">
            {state.children.map((child) => {
              const childEntries = householdEntries.filter((entry) => entry.childId === child.id)
              return (
                <div key={child.id} className="rounded-[24px] border border-ink/10 bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-ink">{child.name}</p>
                      <p className="mt-1 text-sm text-ink/75">{child.program}</p>
                    </div>
                    <span className="rounded-full border border-teal/25 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
                      {child.attendanceRate}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-ink/80">
                    <p>Pickup {child.pickupWindow}</p>
                    <p>{child.milestone}</p>
                    <p>{childEntries[0]?.status ?? 'No recent entry logged.'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </UserPanel>

        <UserPanel eyebrow="Actions" title="Attendance controls">
          <form onSubmit={handleAbsenceSubmit} className="space-y-3 rounded-[24px] border border-coral/25 bg-coral/10 px-4 py-4">
            <p className="inline-flex items-center gap-2 font-semibold text-ink">
              <CalendarCheck2 className="h-4 w-4 text-coral" />
              Submit absence note
            </p>
            <textarea
              value={absenceNote}
              onChange={(event) => {
                setAbsenceNote(event.target.value)
              }}
              placeholder="Share the absence reason or classroom note."
              className="h-24 w-full rounded-2xl border border-white/50 bg-white/80 px-3 py-3 text-sm text-ink outline-none"
            />
            <button
              type="submit"
              className="kid-bubble-button inline-flex rounded-full px-4 py-2 text-sm font-semibold text-white"
            >
              Save note
            </button>
          </form>

          <form onSubmit={handlePickupUpdate} className="mt-4 rounded-[24px] border border-amber/35 bg-amber/20 px-4 py-4">
            <p className="inline-flex items-center gap-2 font-semibold text-ink">
              <Clock3 className="h-4 w-4 text-amber-700" />
              Update pickup timing
            </p>
            <input
              value={pickupWindow}
              onChange={(event) => {
                setPickupWindow(event.target.value)
              }}
              className="mt-3 w-full rounded-2xl border border-white/50 bg-white/80 px-3 py-2 text-sm text-ink outline-none"
            />
            <button
              type="submit"
              className="mt-3 kid-ghost-button rounded-full px-4 py-2 text-sm font-semibold text-ink/85"
            >
              Update pickup
            </button>
          </form>

          <div className="mt-4 space-y-3">
            <div className="rounded-[24px] border border-teal/25 bg-teal/10 px-4 py-4">
              <p className="inline-flex items-center gap-2 font-semibold text-ink">
                <ShieldCheck className="h-4 w-4 text-teal" />
                Pickup safety
              </p>
              <p className="mt-2 text-sm text-ink/80">
                Household pickup contacts are managed in the family workspace and sync here automatically.
              </p>
            </div>
            <div className="rounded-[24px] border border-ink/10 bg-white px-4 py-4">
              <p className="inline-flex items-center gap-2 font-semibold text-ink">
                <Sparkles className="h-4 w-4 text-plum" />
                Operating guidance
              </p>
              <p className="mt-2 text-sm text-ink/80">
                Keep attendance notes short and specific. Pickup changes belong on the active child record so staff do not have to reconcile separate parent messages later.
              </p>
            </div>
          </div>
        </UserPanel>
      </div>
    </div>
  )
}
