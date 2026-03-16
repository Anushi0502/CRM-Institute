import { useEffect, useMemo, useState } from 'react'
import { HeartPulse, Plus, ShieldCheck, Trash2, UserRoundCheck } from 'lucide-react'
import { UserPanel } from '../../components/UserPanel'
import { useUserPortal } from '../../hooks/useUserPortal'
import type { ContactType } from '../../types/userPortal'

export function UserProfilePage() {
  const {
    activeChild,
    addChild,
    addContact,
    removeChild,
    removeContact,
    state,
    updateChild,
    updateContact,
  } = useUserPortal()
  const [pendingRemoveChildId, setPendingRemoveChildId] = useState<string | null>(null)
  const [childDraft, setChildDraft] = useState({
    name: '',
    program: 'Toddler Explorers',
    ageBand: '',
    teacher: '',
    campus: 'Edina Campus',
    medicalNotes: '',
  })
  const [contactDraft, setContactDraft] = useState({
    label: '',
    value: '',
    type: 'guardian' as ContactType,
  })
  const [contactDrafts, setContactDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(state.contacts.map((contact) => [contact.id, contact.value])),
  )
  const [activeChildDraft, setActiveChildDraft] = useState({
    name: activeChild?.name ?? '',
    program: activeChild?.program ?? '',
    ageBand: activeChild?.ageBand ?? '',
    teacher: activeChild?.teacher ?? '',
    campus: activeChild?.campus ?? '',
    pickupWindow: activeChild?.pickupWindow ?? '',
    milestone: activeChild?.milestone ?? '',
    medicalNotes: activeChild?.medicalNotes ?? '',
  })
  const isAtChildLimit = state.children.length >= 20

  useEffect(() => {
    setActiveChildDraft({
      name: activeChild?.name ?? '',
      program: activeChild?.program ?? '',
      ageBand: activeChild?.ageBand ?? '',
      teacher: activeChild?.teacher ?? '',
      campus: activeChild?.campus ?? '',
      pickupWindow: activeChild?.pickupWindow ?? '',
      milestone: activeChild?.milestone ?? '',
      medicalNotes: activeChild?.medicalNotes ?? '',
    })
  }, [activeChild])

  useEffect(() => {
    setContactDrafts(Object.fromEntries(state.contacts.map((contact) => [contact.id, contact.value])))
  }, [state.contacts])

  const pendingRemovalSummary = useMemo(() => {
    if (!pendingRemoveChildId) {
      return null
    }

    return {
      applications: state.applications.filter((application) => application.childId === pendingRemoveChildId).length,
      attendanceEntries: state.attendanceEntries.filter((entry) => entry.childId === pendingRemoveChildId).length,
      threads: state.threads.filter((thread) => thread.childId === pendingRemoveChildId).length,
      invoices: state.invoices.filter((invoice) => invoice.childId === pendingRemoveChildId).length,
    }
  }, [pendingRemoveChildId, state.applications, state.attendanceEntries, state.invoices, state.threads])

  function handleChildSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!childDraft.name.trim()) {
      return
    }

    addChild({
      name: childDraft.name.trim(),
      program: childDraft.program.trim(),
      ageBand: childDraft.ageBand.trim() || 'New age band',
      teacher: childDraft.teacher.trim() || 'Pending assignment',
      campus: childDraft.campus.trim(),
      medicalNotes: childDraft.medicalNotes.trim(),
    })

    setChildDraft({
      name: '',
      program: 'Toddler Explorers',
      ageBand: '',
      teacher: '',
      campus: 'Edina Campus',
      medicalNotes: '',
    })
  }

  function handleContactSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!contactDraft.label.trim() || !contactDraft.value.trim()) {
      return
    }

    addContact(contactDraft.label.trim(), contactDraft.value.trim(), contactDraft.type)
    setContactDraft({
      label: '',
      value: '',
      type: 'guardian',
    })
  }

  function handleActiveChildSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!activeChild) {
      return
    }

    updateChild(activeChild.id, {
      name: activeChildDraft.name.trim(),
      program: activeChildDraft.program.trim(),
      ageBand: activeChildDraft.ageBand.trim(),
      teacher: activeChildDraft.teacher.trim(),
      campus: activeChildDraft.campus.trim(),
      pickupWindow: activeChildDraft.pickupWindow.trim(),
      milestone: activeChildDraft.milestone.trim(),
      medicalNotes: activeChildDraft.medicalNotes.trim(),
    })
  }

  return (
    <div className="space-y-4">
      <UserPanel
        eyebrow="Family profile"
        title="Household records"
        description="One parent account can manage up to 20 children, each with their own admissions and attendance records while sharing household contacts and billing context."
      >
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-[22px] border border-teal/25 bg-teal/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-teal">Children</p>
            <p className="mt-2 font-display text-3xl text-ink">{state.children.length}</p>
          </div>
          <div className="rounded-[22px] border border-coral/25 bg-coral/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-coral">Pickup contacts</p>
            <p className="mt-2 font-display text-3xl text-ink">
              {state.contacts.filter((contact) => contact.type === 'pickup').length}
            </p>
          </div>
          <div className="rounded-[22px] border border-amber/35 bg-amber/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-amber-700">Guardians</p>
            <p className="mt-2 font-display text-3xl text-ink">
              {state.contacts.filter((contact) => contact.type === 'guardian').length}
            </p>
          </div>
          <div className="rounded-[22px] border border-plum/25 bg-plum/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-plum">Remaining seats</p>
            <p className="mt-2 font-display text-3xl text-ink">{20 - state.children.length}</p>
          </div>
        </div>
      </UserPanel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.02fr),minmax(360px,0.98fr)]">
        <UserPanel
          eyebrow="Roster"
          title="Children on this account"
          description="Removing a child clears linked child-specific records from the parent portal, so the delete flow is explicit and confirmed."
        >
          <div className="space-y-3">
            {state.children.map((child) => {
              const isPendingRemoval = pendingRemoveChildId === child.id
              return (
                <div key={child.id} className="rounded-[24px] border border-ink/10 bg-white px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-2xl text-ink">{child.name}</p>
                        {activeChild?.id === child.id ? (
                          <span className="rounded-full border border-ink/10 bg-cloud px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/70">
                            Active child
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-ink/75">
                        {child.program} · {child.ageBand} · {child.campus}
                      </p>
                      <p className="mt-2 text-sm text-ink/80">Teacher: {child.teacher}</p>
                      <p className="mt-2 text-sm text-ink/80">Medical: {child.medicalNotes}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPendingRemoveChildId((current) => (current === child.id ? null : child.id))
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-coral/25 bg-coral/10 px-3 py-1.5 text-sm font-semibold text-coral"
                      >
                        <Trash2 className="h-4 w-4" />
                        {isPendingRemoval ? 'Cancel remove' : 'Remove child'}
                      </button>
                    </div>
                  </div>

                  {isPendingRemoval && pendingRemovalSummary ? (
                    <div className="mt-4 rounded-[22px] border border-coral/25 bg-coral/10 px-4 py-4">
                      <p className="font-semibold text-ink">Confirm removal of {child.name}</p>
                      <p className="mt-2 text-sm text-ink/80">
                        This will remove {pendingRemovalSummary.applications} applications, {pendingRemovalSummary.attendanceEntries} attendance entries, {pendingRemovalSummary.threads} threads, and {pendingRemovalSummary.invoices} child-linked invoices from the portal state.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          removeChild(child.id)
                          setPendingRemoveChildId(null)
                        }}
                        className="mt-3 kid-bubble-button inline-flex rounded-full px-4 py-2 text-sm font-semibold text-white"
                      >
                        Confirm removal
                      </button>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </UserPanel>

        <div className="space-y-4">
          <UserPanel eyebrow="Add child" title="Create a new child profile">
            <form onSubmit={handleChildSubmit} className="space-y-3">
              <input
                value={childDraft.name}
                onChange={(event) => {
                  setChildDraft((current) => ({ ...current, name: event.target.value }))
                }}
                placeholder="Child name"
                className="w-full rounded-2xl border border-ink/10 bg-cloud/80 px-3 py-2 text-sm text-ink outline-none"
              />
              <input
                value={childDraft.program}
                onChange={(event) => {
                  setChildDraft((current) => ({ ...current, program: event.target.value }))
                }}
                placeholder="Program"
                className="w-full rounded-2xl border border-ink/10 bg-cloud/80 px-3 py-2 text-sm text-ink outline-none"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={childDraft.ageBand}
                  onChange={(event) => {
                    setChildDraft((current) => ({ ...current, ageBand: event.target.value }))
                  }}
                  placeholder="Age band"
                  className="w-full rounded-2xl border border-ink/10 bg-cloud/80 px-3 py-2 text-sm text-ink outline-none"
                />
                <input
                  value={childDraft.teacher}
                  onChange={(event) => {
                    setChildDraft((current) => ({ ...current, teacher: event.target.value }))
                  }}
                  placeholder="Teacher or classroom lead"
                  className="w-full rounded-2xl border border-ink/10 bg-cloud/80 px-3 py-2 text-sm text-ink outline-none"
                />
              </div>
              <input
                value={childDraft.campus}
                onChange={(event) => {
                  setChildDraft((current) => ({ ...current, campus: event.target.value }))
                }}
                placeholder="Campus"
                className="w-full rounded-2xl border border-ink/10 bg-cloud/80 px-3 py-2 text-sm text-ink outline-none"
              />
              <textarea
                value={childDraft.medicalNotes}
                onChange={(event) => {
                  setChildDraft((current) => ({ ...current, medicalNotes: event.target.value }))
                }}
                placeholder="Medical or care notes"
                className="h-24 w-full rounded-2xl border border-ink/10 bg-cloud/80 px-3 py-3 text-sm text-ink outline-none"
              />
              <button
                type="submit"
                disabled={isAtChildLimit}
                className="kid-bubble-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add child
              </button>
              {isAtChildLimit ? (
                <p className="text-sm text-coral">
                  This household has reached the 20-child account limit.
                </p>
              ) : null}
            </form>
          </UserPanel>

          <UserPanel eyebrow="Account health" title="Operational status">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 text-sm text-ink/80">
                <UserRoundCheck className="h-4 w-4 text-plum" />
                Multi-child profile, admissions, attendance, chat, and billing are synced through one parent account record.
              </p>
              <p className="inline-flex items-center gap-2 text-sm text-ink/80">
                <ShieldCheck className="h-4 w-4 text-teal" />
                Pickup contacts work at the household level and support every child linked to this parent account.
              </p>
              <p className="inline-flex items-center gap-2 text-sm text-ink/80">
                <HeartPulse className="h-4 w-4 text-coral" />
                Medical notes should stay current so staff see the same care instructions across attendance and classroom communication.
              </p>
            </div>
          </UserPanel>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr),minmax(360px,0.92fr)]">
        <UserPanel
          eyebrow="Active child editor"
          title={activeChild ? `Edit ${activeChild.name}` : 'Select a child to edit'}
          description="Use the active-child editor for direct updates to the record the rest of the parent app is currently referencing."
        >
          {activeChild ? (
            <form onSubmit={handleActiveChildSave} className="grid gap-3 lg:grid-cols-2">
              <input
                value={activeChildDraft.name}
                onChange={(event) => {
                  setActiveChildDraft((current) => ({ ...current, name: event.target.value }))
                }}
                placeholder="Child name"
                className="w-full rounded-2xl border border-ink/10 bg-cloud/80 px-3 py-2 text-sm text-ink outline-none"
              />
              <input
                value={activeChildDraft.program}
                onChange={(event) => {
                  setActiveChildDraft((current) => ({ ...current, program: event.target.value }))
                }}
                placeholder="Program"
                className="w-full rounded-2xl border border-ink/10 bg-cloud/80 px-3 py-2 text-sm text-ink outline-none"
              />
              <input
                value={activeChildDraft.ageBand}
                onChange={(event) => {
                  setActiveChildDraft((current) => ({ ...current, ageBand: event.target.value }))
                }}
                placeholder="Age band"
                className="w-full rounded-2xl border border-ink/10 bg-cloud/80 px-3 py-2 text-sm text-ink outline-none"
              />
              <input
                value={activeChildDraft.teacher}
                onChange={(event) => {
                  setActiveChildDraft((current) => ({ ...current, teacher: event.target.value }))
                }}
                placeholder="Teacher"
                className="w-full rounded-2xl border border-ink/10 bg-cloud/80 px-3 py-2 text-sm text-ink outline-none"
              />
              <input
                value={activeChildDraft.campus}
                onChange={(event) => {
                  setActiveChildDraft((current) => ({ ...current, campus: event.target.value }))
                }}
                placeholder="Campus"
                className="w-full rounded-2xl border border-ink/10 bg-cloud/80 px-3 py-2 text-sm text-ink outline-none"
              />
              <input
                value={activeChildDraft.pickupWindow}
                onChange={(event) => {
                  setActiveChildDraft((current) => ({ ...current, pickupWindow: event.target.value }))
                }}
                placeholder="Pickup window"
                className="w-full rounded-2xl border border-ink/10 bg-cloud/80 px-3 py-2 text-sm text-ink outline-none"
              />
              <input
                value={activeChildDraft.milestone}
                onChange={(event) => {
                  setActiveChildDraft((current) => ({ ...current, milestone: event.target.value }))
                }}
                placeholder="Current milestone"
                className="w-full rounded-2xl border border-ink/10 bg-cloud/80 px-3 py-2 text-sm text-ink outline-none lg:col-span-2"
              />
              <textarea
                value={activeChildDraft.medicalNotes}
                onChange={(event) => {
                  setActiveChildDraft((current) => ({ ...current, medicalNotes: event.target.value }))
                }}
                className="h-28 w-full rounded-2xl border border-ink/10 bg-cloud/80 px-3 py-3 text-sm text-ink outline-none lg:col-span-2"
              />
              <div className="lg:col-span-2">
                <button
                  type="submit"
                  className="kid-bubble-button rounded-full px-4 py-2 text-sm font-semibold text-white"
                >
                  Save child record
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-[24px] border border-dashed border-ink/15 bg-white px-4 py-8 text-sm text-ink/70">
              No active child selected.
            </div>
          )}
        </UserPanel>

        <UserPanel
          eyebrow="Contacts"
          title="Guardians, pickup, and medical records"
          description="Contact changes sync across attendance, pickup, and messaging workflows."
        >
          <div className="space-y-3">
            {state.contacts.map((contact) => (
              <div key={contact.id} className="rounded-[22px] border border-ink/10 bg-white px-4 py-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/60">{contact.label}</p>
                      <span className="rounded-full border border-ink/10 bg-cloud px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/70">
                        {contact.type}
                      </span>
                    </div>
                    <input
                      value={contactDrafts[contact.id] ?? contact.value}
                      onChange={(event) => {
                        const nextValue = event.target.value
                        setContactDrafts((current) => ({
                          ...current,
                          [contact.id]: nextValue,
                        }))
                      }}
                      className="mt-2 w-full rounded-2xl border border-ink/10 bg-cloud/70 px-3 py-2 text-sm text-ink outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateContact(contact.id, contactDrafts[contact.id] ?? contact.value)
                    }}
                    className="kid-ghost-button rounded-full px-3 py-1.5 text-sm font-semibold text-ink/85"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      removeContact(contact.id)
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-coral/25 bg-coral/10 px-3 py-1.5 text-sm font-semibold text-coral"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleContactSubmit} className="mt-4 grid gap-3 rounded-[24px] border border-ink/10 bg-white px-4 py-4 md:grid-cols-[0.9fr,1.2fr,0.6fr,0.6fr]">
            <input
              value={contactDraft.label}
              onChange={(event) => {
                setContactDraft((current) => ({ ...current, label: event.target.value }))
              }}
              placeholder="Label"
              className="w-full rounded-2xl border border-ink/10 bg-cloud/80 px-3 py-2 text-sm text-ink outline-none"
            />
            <input
              value={contactDraft.value}
              onChange={(event) => {
                setContactDraft((current) => ({ ...current, value: event.target.value }))
              }}
              placeholder="Contact details"
              className="w-full rounded-2xl border border-ink/10 bg-cloud/80 px-3 py-2 text-sm text-ink outline-none"
            />
            <select
              value={contactDraft.type}
              onChange={(event) => {
                setContactDraft((current) => ({ ...current, type: event.target.value as ContactType }))
              }}
              className="w-full rounded-2xl border border-ink/10 bg-cloud/80 px-3 py-2 text-sm text-ink outline-none"
            >
              <option value="guardian">Guardian</option>
              <option value="pickup">Pickup</option>
              <option value="medical">Medical</option>
            </select>
            <button
              type="submit"
              className="kid-bubble-button rounded-2xl px-4 py-2 text-sm font-semibold text-white"
            >
              Add
            </button>
          </form>
        </UserPanel>
      </div>
    </div>
  )
}
