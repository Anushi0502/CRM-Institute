import { HeartHandshake, ShieldCheck, Wallet } from 'lucide-react'
import kidsCloudStrip from '../assets/kids-cloud-strip.svg'
import kidsPlayLane from '../assets/kids-play-lane.svg'
import { SectionCard } from '../components/SectionCard'
import { StudentTable } from '../components/StudentTable'
import type { PageStateProps } from '../types/crm'

function averageAttendance(values: string[]) {
  if (values.length === 0) {
    return 0
  }

  const total = values.reduce((sum, entry) => sum + Number.parseInt(entry, 10), 0)
  return Math.round(total / values.length)
}

export function StudentsPage({ state }: PageStateProps) {
  const tuitionReviews = state.data.students.filter(
    (student) => student.tuitionStatus === 'Review',
  ).length

  const attendanceWatchCount = state.data.students.filter(
    (student) => Number.parseInt(student.attendance, 10) < 95,
  ).length

  const avgAttendance = averageAttendance(state.data.students.map((student) => student.attendance))

  return (
    <div className="space-y-5">
      <SectionCard
        eyebrow="Student care cockpit"
        title="Family-facing student snapshot"
        description="The roster balances operations details with the softer context teams need before calling families."
      >
        <div className="mb-4 grid gap-3 md:grid-cols-[1.15fr,0.85fr]">
          <div className="overflow-hidden rounded-[20px] border border-sky/30 bg-white/70">
            <img
              src={kidsCloudStrip}
              alt="Student care cloud visual"
              className="h-20 w-full object-cover"
            />
          </div>
          <div className="overflow-hidden rounded-[20px] border border-leaf/30 bg-white/70">
            <img
              src={kidsPlayLane}
              alt="Student care play visual"
              className="h-20 w-full object-cover"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[20px] border border-teal/20 bg-teal/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-teal/80">Total students</p>
            <p className="mt-1 font-display text-3xl text-ink">{state.data.students.length}</p>
          </article>
          <article className="rounded-[20px] border border-amber/30 bg-amber/20 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Attendance watch</p>
            <p className="mt-1 font-display text-3xl text-ink">{attendanceWatchCount}</p>
          </article>
          <article className="rounded-[20px] border border-coral/20 bg-coral/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-coral/80">Tuition review</p>
            <p className="mt-1 font-display text-3xl text-ink">{tuitionReviews}</p>
          </article>
          <article className="rounded-[20px] border border-plum/20 bg-plum/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-plum/80">Avg attendance</p>
            <p className="mt-1 font-display text-3xl text-ink">{avgAttendance}%</p>
          </article>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Roster"
        title="Current students"
        description="Attendance, pickup, tuition, and developmental milestones stay together so staff can respond with full context."
      >
        <StudentTable students={state.data.students} />
      </SectionCard>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard
          eyebrow="Trust"
          title="Family care habits"
          description="Small rituals that prevent larger concerns."
        >
          <div className="space-y-3 text-sm leading-6 text-ink/70">
            <p className="inline-flex items-center gap-2 font-semibold text-ink">
              <HeartHandshake className="h-4 w-4 text-coral" />
              Share milestone wins before discussing concerns.
            </p>
            <p>Keep pickup notes and attendance dips in the same conversation thread.</p>
            <p>For new students, send a day-three check-in and a week-two routine recap.</p>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Safety"
          title="Support visibility"
          description="Simple reminders for classroom-to-family handoffs."
        >
          <div className="space-y-3 text-sm leading-6 text-ink/70">
            <p className="inline-flex items-center gap-2 font-semibold text-ink">
              <ShieldCheck className="h-4 w-4 text-teal" />
              Confirm allergy, medication, and pickup changes every Monday.
            </p>
            <p>Use classroom transitions as the trigger for new support notes.</p>
            <p>Log parent preference details before the first formal conference.</p>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Finance"
          title="Tuition follow-through"
          description="Reduce friction by making the next step explicit."
        >
          <div className="space-y-3 text-sm leading-6 text-ink/70">
            <p className="inline-flex items-center gap-2 font-semibold text-ink">
              <Wallet className="h-4 w-4 text-amber" />
              Tuition reviews in queue: {tuitionReviews}
            </p>
            <p>Offer payment-plan language before a family has to ask for help.</p>
            <p>Pair tuition reminders with classroom updates to keep trust high.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
