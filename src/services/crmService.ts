import type { PostgrestError } from '@supabase/supabase-js'
import type {
  Activity,
  DashboardSnapshot,
  Lead,
  OverviewMetric,
  Student,
  Task,
} from '../types/crm'
import { crmDemoData } from './mockDashboard'
import { hasSupabaseConfig, supabase } from './supabase'

interface MetricRow {
  id: string
  label: string
  value: string
  change: string
  detail: string
  tone: OverviewMetric['tone']
}

interface LeadRow {
  id: string
  family_name: string
  child_name: string
  program_interest: string
  stage: Lead['stage']
  source: string
  follow_up_date: string
  priority: Lead['priority']
  campus: string
  age_group: string
  next_step: string
}

interface StudentRow {
  id: string
  name: string
  guardian: string
  program: string
  attendance: string
  pickup_window: string
  support_focus: string
  tuition_status: Student['tuitionStatus']
  milestone: string
}

interface ProgramRow {
  id: string
  name: string
  age_range: string
  capacity: string
  fill_rate: number
  leads: number
  waitlist: number
  educator_names: string[]
  description: string
}

interface TaskRow {
  id: string
  title: string
  owner: string
  due_date: string
  status: Task['status']
  priority: Task['priority']
  category: string
}

interface ActivityRow {
  id: string
  title: string
  description: string
  time: string
  tag: string
  tone: Activity['tone']
}

function isMissingSchema(error: PostgrestError | null) {
  return Boolean(
    error &&
      (error.code === '42P01' ||
        error.code === 'PGRST205' ||
        error.message.toLowerCase().includes('relation')),
  )
}

function withFallback<T>(rows: T[] | null, fallback: T[]) {
  return rows && rows.length > 0 ? rows : fallback
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  if (!hasSupabaseConfig || !supabase) {
    return crmDemoData
  }

  const [metricsResult, leadsResult, studentsResult, programsResult, tasksResult, activitiesResult] =
    await Promise.all([
      supabase.from('crm_overview_metrics').select('*').order('sort_order'),
      supabase.from('crm_leads').select('*').order('follow_up_date'),
      supabase.from('crm_students').select('*').order('name'),
      supabase.from('crm_programs').select('*').order('fill_rate', { ascending: false }),
      supabase.from('crm_tasks').select('*').order('due_date'),
      supabase.from('crm_activity').select('*').order('created_at', { ascending: false }),
    ])

  const results = [
    metricsResult,
    leadsResult,
    studentsResult,
    programsResult,
    tasksResult,
    activitiesResult,
  ]

  if (results.some((result) => isMissingSchema(result.error))) {
    return {
      ...crmDemoData,
      source: 'schema-pending',
      message:
        'Supabase credentials are connected, but the CRM tables are not initialized yet. Run the SQL in supabase/schema.sql to switch from demo data to your project data.',
      lastSyncedAt: new Date().toISOString(),
    }
  }

  const authError = results.find((result) => result.error?.code === '42501')?.error

  if (authError) {
    return {
      ...crmDemoData,
      source: 'schema-pending',
      message:
        'Supabase is connected, but live CRM data is protected. Sign in with Google after the provider is configured to unlock the project data.',
      lastSyncedAt: new Date().toISOString(),
    }
  }

  const firstError = results.find((result) => result.error)?.error

  if (firstError) {
    throw firstError
  }

  const metrics =
    (metricsResult.data as MetricRow[] | null)?.map((row) => ({
      id: row.id,
      label: row.label,
      value: row.value,
      change: row.change,
      detail: row.detail,
      tone: row.tone,
    })) ?? []

  const leads =
    (leadsResult.data as LeadRow[] | null)?.map((row) => ({
      id: row.id,
      familyName: row.family_name,
      childName: row.child_name,
      programInterest: row.program_interest,
      stage: row.stage,
      source: row.source,
      followUpDate: row.follow_up_date,
      priority: row.priority,
      campus: row.campus,
      ageGroup: row.age_group,
      nextStep: row.next_step,
    })) ?? []

  const students =
    (studentsResult.data as StudentRow[] | null)?.map((row) => ({
      id: row.id,
      name: row.name,
      guardian: row.guardian,
      program: row.program,
      attendance: row.attendance,
      pickupWindow: row.pickup_window,
      supportFocus: row.support_focus,
      tuitionStatus: row.tuition_status,
      milestone: row.milestone,
    })) ?? []

  const programs =
    (programsResult.data as ProgramRow[] | null)?.map((row) => ({
      id: row.id,
      name: row.name,
      ageRange: row.age_range,
      capacity: row.capacity,
      fillRate: row.fill_rate,
      leads: row.leads,
      waitlist: row.waitlist,
      educators: row.educator_names ?? [],
      description: row.description,
    })) ?? []

  const tasks =
    (tasksResult.data as TaskRow[] | null)?.map((row) => ({
      id: row.id,
      title: row.title,
      owner: row.owner,
      dueDate: row.due_date,
      status: row.status,
      priority: row.priority,
      category: row.category,
    })) ?? []

  const activities =
    (activitiesResult.data as ActivityRow[] | null)?.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      time: row.time,
      tag: row.tag,
      tone: row.tone,
    })) ?? []

  const hasSeedData =
    metrics.length > 0 &&
    leads.length > 0 &&
    students.length > 0 &&
    programs.length > 0 &&
    tasks.length > 0 &&
    activities.length > 0

  return {
    source: 'live',
    message: hasSeedData
      ? 'Supabase is live. This CRM is reading institute data from the connected project.'
      : 'Supabase is connected. Seed records are still empty, so the interface is showing local examples until you run the included SQL seed.',
    lastSyncedAt: new Date().toISOString(),
    metrics: withFallback(metrics, crmDemoData.metrics),
    leads: withFallback(leads, crmDemoData.leads),
    students: withFallback(students, crmDemoData.students),
    programs: withFallback(programs, crmDemoData.programs),
    tasks: withFallback(tasks, crmDemoData.tasks),
    activities: withFallback(activities, crmDemoData.activities),
  }
}
