import type { Student } from '../types/crm'

const tuitionClasses: Record<Student['tuitionStatus'], string> = {
  Current: 'border-teal/25 bg-teal/10 text-teal',
  Review: 'border-amber/35 bg-amber/20 text-amber-700',
}

function toPercent(value: string) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) {
    return 0
  }

  return Math.min(Math.max(parsed, 0), 100)
}

export function StudentTable({ students }: { students: Student[] }) {
  return (
    <div className="kid-panel overflow-hidden rounded-[24px] border border-ink/5 shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-ink/5 text-left">
          <thead className="bg-cloud/80 text-xs uppercase tracking-[0.24em] text-ink/60">
            <tr>
              <th className="px-5 py-4 font-semibold">Student</th>
              <th className="px-5 py-4 font-semibold">Program</th>
              <th className="px-5 py-4 font-semibold">Attendance</th>
              <th className="px-5 py-4 font-semibold">Pickup</th>
              <th className="px-5 py-4 font-semibold">Support focus</th>
              <th className="px-5 py-4 font-semibold">Tuition</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5 bg-white/90">
            {students.map((student) => {
              const attendancePercent = toPercent(student.attendance)

              return (
                <tr key={student.id} className="align-top transition hover:bg-cloud/45">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">{student.name}</p>
                    <p className="text-sm text-ink/70">{student.guardian}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-ink/80">{student.program}</td>
                  <td className="px-5 py-4 text-sm text-ink/80">
                    <p className="font-semibold text-ink">{student.attendance}</p>
                    <div className="mt-2 h-1.5 w-28 rounded-full bg-ink/10">
                      <div
                        className="h-1.5 rounded-full crm-bg-progress"
                        style={{ width: `${attendancePercent}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-ink/80">{student.pickupWindow}</td>
                  <td className="px-5 py-4 text-sm leading-6 text-ink/80">
                    <p>{student.supportFocus}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ink/60">
                      {student.milestone}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`kid-ribbon rounded-full border px-2.5 py-1 text-xs font-semibold ${tuitionClasses[student.tuitionStatus]}`}
                    >
                      {student.tuitionStatus}
                    </span>
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
