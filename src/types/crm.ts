export type MetricTone = 'teal' | 'coral' | 'amber' | 'plum'

export type LeadPriority = 'High' | 'Medium' | 'Low'

export type LeadStage =
  | 'Inquiry'
  | 'Tour Booked'
  | 'Application Started'
  | 'Waitlist'
  | 'Enrolled'

export type TaskStatus = 'Today' | 'This Week' | 'Done'

export type ConnectionState = 'demo' | 'schema-pending' | 'live'

export interface OverviewMetric {
  id: string
  label: string
  value: string
  change: string
  detail: string
  tone: MetricTone
}

export interface Lead {
  id: string
  familyName: string
  childName: string
  programInterest: string
  stage: LeadStage
  source: string
  followUpDate: string
  priority: LeadPriority
  campus: string
  ageGroup: string
  nextStep: string
}

export interface Student {
  id: string
  name: string
  guardian: string
  program: string
  attendance: string
  pickupWindow: string
  supportFocus: string
  tuitionStatus: 'Current' | 'Review'
  milestone: string
}

export interface Program {
  id: string
  name: string
  ageRange: string
  capacity: string
  fillRate: number
  leads: number
  waitlist: number
  educators: string[]
  description: string
}

export interface Task {
  id: string
  title: string
  owner: string
  dueDate: string
  status: TaskStatus
  priority: LeadPriority
  category: string
}

export interface Activity {
  id: string
  title: string
  description: string
  time: string
  tag: string
  tone: MetricTone
}

export interface DashboardSnapshot {
  source: ConnectionState
  message: string
  lastSyncedAt: string
  metrics: OverviewMetric[]
  leads: Lead[]
  students: Student[]
  programs: Program[]
  tasks: Task[]
  activities: Activity[]
}

export interface DashboardState {
  data: DashboardSnapshot
  isLoading: boolean
  error: string | null
}

export interface PageStateProps {
  state: DashboardState
}

export const PIPELINE_STAGES: LeadStage[] = [
  'Inquiry',
  'Tour Booked',
  'Application Started',
  'Waitlist',
  'Enrolled',
]
