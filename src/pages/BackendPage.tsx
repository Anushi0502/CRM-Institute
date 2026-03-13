import { startTransition, useEffect, useState } from 'react'
import {
  GraduationCap,
  Paintbrush,
  Server,
  ShieldUser,
  ToggleLeft,
  ToggleRight,
  Trash2,
  UserPlus,
} from 'lucide-react'
import { SectionCard } from '../components/SectionCard'
import {
  backendEndpointLabel,
  createBackendStudent,
  createBackendUser,
  deleteBackendStudent,
  deleteBackendUser,
  listBackendStudents,
  listBackendUsers,
  updateBackendUserSignIn,
  type BackendStudent,
  type BackendStudentTuitionStatus,
  type BackendUser,
} from '../services/backendAdminService'

interface StudentFormState {
  name: string
  guardian: string
  program: string
  attendance: string
  pickupWindow: string
  supportFocus: string
  tuitionStatus: BackendStudentTuitionStatus
  milestone: string
}

const initialStudentForm: StudentFormState = {
  name: '',
  guardian: '',
  program: '',
  attendance: '',
  pickupWindow: '',
  supportFocus: '',
  tuitionStatus: 'Current',
  milestone: '',
}

const paletteSwatches = [
  { name: 'Ink', className: 'bg-ink', hex: '#18353d' },
  { name: 'Teal', className: 'bg-teal', hex: '#1f766e' },
  { name: 'Mint', className: 'bg-mint', hex: '#b7ddd7' },
  { name: 'Coral', className: 'bg-coral', hex: '#f27b64' },
  { name: 'Amber', className: 'bg-amber', hex: '#f0b45b' },
  { name: 'Plum', className: 'bg-plum', hex: '#72507d' },
]

export function BackendPage() {
  const [users, setUsers] = useState<BackendUser[]>([])
  const [students, setStudents] = useState<BackendStudent[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isLoadingStudents, setIsLoadingStudents] = useState(true)
  const [isSavingUser, setIsSavingUser] = useState(false)
  const [isSavingStudent, setIsSavingStudent] = useState(false)
  const [togglingUserIds, setTogglingUserIds] = useState<Record<string, boolean>>({})
  const [deletingStudentIds, setDeletingStudentIds] = useState<Record<string, boolean>>({})
  const [userError, setUserError] = useState<string | null>(null)
  const [studentError, setStudentError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [allowSignIn, setAllowSignIn] = useState(true)
  const [studentForm, setStudentForm] = useState<StudentFormState>(initialStudentForm)

  async function loadUsers() {
    try {
      setUserError(null)
      const nextUsers = await listBackendUsers()
      startTransition(() => {
        setUsers(nextUsers)
      })
    } catch (loadError) {
      setUserError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to fetch backend users.',
      )
    } finally {
      setIsLoadingUsers(false)
    }
  }

  async function loadStudents() {
    try {
      setStudentError(null)
      const nextStudents = await listBackendStudents()
      startTransition(() => {
        setStudents(nextStudents)
      })
    } catch (loadError) {
      setStudentError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to fetch students from backend.',
      )
    } finally {
      setIsLoadingStudents(false)
    }
  }

  useEffect(() => {
    void Promise.all([loadUsers(), loadStudents()])
  }, [])

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim() || password.length < 8) {
      setUserError('Provide a valid email and a password with at least 8 characters.')
      return
    }

    try {
      setIsSavingUser(true)
      setUserError(null)

      await createBackendUser({
        email: email.trim(),
        password,
        allowSignIn,
      })

      setEmail('')
      setPassword('')
      setAllowSignIn(true)
      await loadUsers()
    } catch (createError) {
      setUserError(
        createError instanceof Error
          ? createError.message
          : 'User could not be created.',
      )
    } finally {
      setIsSavingUser(false)
    }
  }

  async function handleToggleUserSignIn(user: BackendUser) {
    const nextAllowSignIn = Boolean(user.bannedUntil)

    try {
      setUserError(null)
      setTogglingUserIds((previous) => ({
        ...previous,
        [user.id]: true,
      }))
      await updateBackendUserSignIn(user.id, nextAllowSignIn)
      await loadUsers()
    } catch (toggleError) {
      setUserError(
        toggleError instanceof Error
          ? toggleError.message
          : 'Signin toggle failed.',
      )
    } finally {
      setTogglingUserIds((previous) => ({
        ...previous,
        [user.id]: false,
      }))
    }
  }

  async function handleDeleteUser(userId: string) {
    try {
      setUserError(null)
      await deleteBackendUser(userId)
      await loadUsers()
    } catch (deleteError) {
      setUserError(
        deleteError instanceof Error
          ? deleteError.message
          : 'User deletion failed.',
      )
    }
  }

  function updateStudentField<K extends keyof StudentFormState>(
    field: K,
    value: StudentFormState[K],
  ) {
    setStudentForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  async function handleCreateStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload = {
      name: studentForm.name.trim(),
      guardian: studentForm.guardian.trim(),
      program: studentForm.program.trim(),
      attendance: studentForm.attendance.trim(),
      pickupWindow: studentForm.pickupWindow.trim(),
      supportFocus: studentForm.supportFocus.trim(),
      tuitionStatus: studentForm.tuitionStatus,
      milestone: studentForm.milestone.trim(),
    }

    if (
      !payload.name ||
      !payload.guardian ||
      !payload.program ||
      !payload.attendance ||
      !payload.pickupWindow ||
      !payload.supportFocus ||
      !payload.milestone
    ) {
      setStudentError('All student fields are required before creating a student record.')
      return
    }

    try {
      setIsSavingStudent(true)
      setStudentError(null)
      await createBackendStudent(payload)
      setStudentForm(initialStudentForm)
      await loadStudents()
    } catch (createError) {
      setStudentError(
        createError instanceof Error
          ? createError.message
          : 'Student could not be created.',
      )
    } finally {
      setIsSavingStudent(false)
    }
  }

  async function handleDeleteStudent(studentId: string) {
    try {
      setStudentError(null)
      setDeletingStudentIds((previous) => ({
        ...previous,
        [studentId]: true,
      }))
      await deleteBackendStudent(studentId)
      await loadStudents()
    } catch (deleteError) {
      setStudentError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Student deletion failed.',
      )
    } finally {
      setDeletingStudentIds((previous) => ({
        ...previous,
        [studentId]: false,
      }))
    }
  }

  return (
    <div className="space-y-5">
      <SectionCard
        title="Supabase backend controls"
        description="Manage authenticated users through the secured backend API."
        actionLabel={`${users.length} user records`}
      >
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
          API endpoint: {backendEndpointLabel}
        </p>

        <form onSubmit={handleCreateUser} className="grid gap-3 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
              }}
              placeholder="new.user@institute.com"
              className="w-full rounded-2xl border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-teal/60"
              autoComplete="email"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
              Temporary password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
              }}
              placeholder="Minimum 8 characters"
              className="w-full rounded-2xl border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-teal/60"
              autoComplete="new-password"
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSavingUser}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/30"
            >
              <UserPlus className="h-4 w-4" />
              Create user
            </button>
          </div>

          <label className="md:col-span-3 flex items-center gap-3 rounded-2xl border border-ink/10 bg-cloud px-3 py-2.5 text-sm text-ink/80">
            <input
              type="checkbox"
              checked={allowSignIn}
              onChange={(event) => {
                setAllowSignIn(event.target.checked)
              }}
              className="h-4 w-4 rounded border-ink/20 text-teal focus:ring-teal"
            />
            Allow new user to sign in immediately
          </label>
        </form>

        {userError ? (
          <p className="mt-4 rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
            {userError}
          </p>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Student backend controls"
        description="Create new students in crm_students through the secured backend API."
        actionLabel={`${students.length} student records`}
      >
        <form onSubmit={handleCreateStudent} className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
              Student name
            </span>
            <input
              type="text"
              value={studentForm.name}
              onChange={(event) => {
                updateStudentField('name', event.target.value)
              }}
              placeholder="Harper Walker"
              className="w-full rounded-2xl border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-teal/60"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
              Guardian
            </span>
            <input
              type="text"
              value={studentForm.guardian}
              onChange={(event) => {
                updateStudentField('guardian', event.target.value)
              }}
              placeholder="Sofia Walker"
              className="w-full rounded-2xl border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-teal/60"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
              Program
            </span>
            <input
              type="text"
              value={studentForm.program}
              onChange={(event) => {
                updateStudentField('program', event.target.value)
              }}
              placeholder="Preschool Discovery"
              className="w-full rounded-2xl border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-teal/60"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
              Attendance
            </span>
            <input
              type="text"
              value={studentForm.attendance}
              onChange={(event) => {
                updateStudentField('attendance', event.target.value)
              }}
              placeholder="98%"
              className="w-full rounded-2xl border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-teal/60"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
              Pickup window
            </span>
            <input
              type="text"
              value={studentForm.pickupWindow}
              onChange={(event) => {
                updateStudentField('pickupWindow', event.target.value)
              }}
              placeholder="5:15 PM"
              className="w-full rounded-2xl border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-teal/60"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
              Tuition status
            </span>
            <select
              value={studentForm.tuitionStatus}
              onChange={(event) => {
                updateStudentField(
                  'tuitionStatus',
                  event.target.value as BackendStudentTuitionStatus,
                )
              }}
              className="w-full rounded-2xl border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-teal/60"
            >
              <option value="Current">Current</option>
              <option value="Review">Review</option>
            </select>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
              Support focus
            </span>
            <input
              type="text"
              value={studentForm.supportFocus}
              onChange={(event) => {
                updateStudentField('supportFocus', event.target.value)
              }}
              placeholder="Social confidence in group play"
              className="w-full rounded-2xl border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-teal/60"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
              Milestone
            </span>
            <input
              type="text"
              value={studentForm.milestone}
              onChange={(event) => {
                updateStudentField('milestone', event.target.value)
              }}
              placeholder="Leading circle-time storytelling."
              className="w-full rounded-2xl border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-teal/60"
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSavingStudent}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/30"
            >
              <GraduationCap className="h-4 w-4" />
              Add student
            </button>
          </div>
        </form>

        {studentError ? (
          <p className="mt-4 rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
            {studentError}
          </p>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Theme palette flair"
        description="Campus brand swatches for quick visual checks while adjusting UI."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paletteSwatches.map((swatch) => (
            <div key={swatch.name} className="rounded-2xl border border-ink/10 bg-white p-3 shadow-soft">
              <div
                className={`mb-3 h-12 rounded-xl ${swatch.className}`}
                aria-label={`${swatch.name} swatch`}
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-ink">{swatch.name}</span>
                <span className="font-mono text-xs text-ink/55">{swatch.hex}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-teal/20 bg-teal/10 px-4 py-3 text-sm text-ink/75">
          <Paintbrush className="h-4 w-4 text-teal" />
          Use these tones for cards, states, and CTA accents to keep the design aligned.
        </div>
      </SectionCard>

      <SectionCard
        title="Auth users"
        description="These users are loaded with service-role access from your backend API."
      >
        {isLoadingUsers ? (
          <div className="flex items-center gap-2 rounded-2xl bg-cloud px-4 py-3 text-sm text-ink/65">
            <Server className="h-4 w-4" />
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center gap-2 rounded-2xl bg-cloud px-4 py-3 text-sm text-ink/65">
            <ShieldUser className="h-4 w-4" />
            No users found in auth yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-ink/10 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.12em] text-ink/45">
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Last sign in</th>
                  <th className="px-3 py-2">Signin</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {users.map((user) => {
                  const isToggling = togglingUserIds[user.id]
                  const isBlocked = Boolean(user.bannedUntil)

                  return (
                    <tr key={user.id}>
                      <td className="px-3 py-2.5 text-ink/75">{user.email ?? 'No email'}</td>
                      <td className="px-3 py-2.5 text-ink/65">
                        {new Date(user.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-ink/65">
                        {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-3 py-2.5 text-ink/65">
                        {isBlocked ? (
                          <span className="rounded-full bg-coral/10 px-2 py-1 text-xs font-semibold text-coral">
                            Blocked
                          </span>
                        ) : (
                          <span className="rounded-full bg-teal/10 px-2 py-1 text-xs font-semibold text-teal">
                            Allowed
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => {
                              void handleToggleUserSignIn(user)
                            }}
                            disabled={isToggling}
                            className="inline-flex items-center gap-1 rounded-xl border border-ink/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-cloud disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isBlocked ? (
                              <ToggleRight className="h-3.5 w-3.5 text-teal" />
                            ) : (
                              <ToggleLeft className="h-3.5 w-3.5 text-coral" />
                            )}
                            {isBlocked ? 'Allow' : 'Block'}
                          </button>
                          <button
                            onClick={() => {
                              void handleDeleteUser(user.id)
                            }}
                            className="inline-flex items-center gap-1 rounded-xl border border-coral/20 bg-coral/10 px-3 py-1.5 text-xs font-semibold text-coral transition hover:bg-coral hover:text-white"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Student records"
        description="Students loaded directly from crm_students using service-role access."
      >
        {isLoadingStudents ? (
          <div className="flex items-center gap-2 rounded-2xl bg-cloud px-4 py-3 text-sm text-ink/65">
            <Server className="h-4 w-4" />
            Loading students...
          </div>
        ) : students.length === 0 ? (
          <div className="flex items-center gap-2 rounded-2xl bg-cloud px-4 py-3 text-sm text-ink/65">
            <ShieldUser className="h-4 w-4" />
            No students found yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-ink/10 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.12em] text-ink/45">
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">Guardian</th>
                  <th className="px-3 py-2">Program</th>
                  <th className="px-3 py-2">Attendance</th>
                  <th className="px-3 py-2">Tuition</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-3 py-2.5 text-ink/75">{student.name}</td>
                    <td className="px-3 py-2.5 text-ink/65">{student.guardian}</td>
                    <td className="px-3 py-2.5 text-ink/65">{student.program}</td>
                    <td className="px-3 py-2.5 text-ink/65">{student.attendance}</td>
                    <td className="px-3 py-2.5 text-ink/65">{student.tuitionStatus}</td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={() => {
                          void handleDeleteStudent(student.id)
                        }}
                        disabled={Boolean(deletingStudentIds[student.id])}
                        className="inline-flex items-center gap-1 rounded-xl border border-coral/20 bg-coral/10 px-3 py-1.5 text-xs font-semibold text-coral transition hover:bg-coral hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
