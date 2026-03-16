import type { PostgrestError } from '@supabase/supabase-js'
import { createInitialUserPortalState } from './userPortalMock'
import { hasSupabaseConfig, supabase } from './supabase'
import type {
  ApplicationStepStatus,
  AttendanceEntry,
  ChatMessage,
  ContactType,
  ConversationThread,
  DocumentStatus,
  FamilyContact,
  InvoiceStatus,
  MessageChannel,
  ParentChild,
  ParentEvent,
  ParentResource,
  PortalActivity,
  UserApplication,
  UserInvoice,
  UserPortalState,
} from '../types/userPortal'

function isMissingSchema(error: PostgrestError | null) {
  return Boolean(
    error &&
      (error.code === '42P01' ||
        error.code === 'PGRST205' ||
        error.message.toLowerCase().includes('relation')),
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function asNullableString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function normalizeChildren(input: unknown, fallback: ParentChild[]) {
  if (!Array.isArray(input)) {
    return fallback
  }

  return input
    .filter(isRecord)
    .map((child, index) => ({
      id: asString(child.id, fallback[index]?.id ?? `child-${index + 1}`),
      name: asString(child.name, fallback[index]?.name ?? 'Child'),
      program: asString(child.program, fallback[index]?.program ?? 'Program pending'),
      ageBand: asString(child.ageBand, fallback[index]?.ageBand ?? 'Age band pending'),
      teacher: asString(child.teacher, fallback[index]?.teacher ?? 'Teacher pending'),
      attendanceRate: asString(child.attendanceRate, fallback[index]?.attendanceRate ?? '0%'),
      todayStatus: asString(child.todayStatus, fallback[index]?.todayStatus ?? 'Status pending'),
      pickupWindow: asString(child.pickupWindow, fallback[index]?.pickupWindow ?? 'Pickup not set'),
      milestone: asString(child.milestone, fallback[index]?.milestone ?? 'Milestone pending'),
      campus: asString(child.campus, fallback[index]?.campus ?? 'Campus pending'),
      medicalNotes: asString(child.medicalNotes, fallback[index]?.medicalNotes ?? 'No medical notes added yet.'),
      authorizedPickupCount: asNumber(
        child.authorizedPickupCount,
        fallback[index]?.authorizedPickupCount ?? 0,
      ),
    }))
    .slice(0, 20)
}

function normalizeApplications(input: unknown, fallback: UserApplication[], childIds: Set<string>) {
  if (!Array.isArray(input)) {
    return fallback
  }

  return input
    .filter(isRecord)
    .map((application, index) => ({
      id: asString(application.id, fallback[index]?.id ?? `application-${index + 1}`),
      childId: asString(application.childId, fallback[index]?.childId ?? ''),
      campus: asString(application.campus, fallback[index]?.campus ?? 'Campus pending'),
      program: asString(application.program, fallback[index]?.program ?? 'Program pending'),
      submittedAt: asString(application.submittedAt, fallback[index]?.submittedAt ?? 'Draft'),
      stage: asString(application.stage, fallback[index]?.stage ?? 'Draft created'),
      progressLabel: asString(application.progressLabel, fallback[index]?.progressLabel ?? '0 of 0 steps complete'),
      steps: Array.isArray(application.steps)
        ? application.steps.filter(isRecord).map((step, stepIndex) => {
            const status: ApplicationStepStatus =
              step.status === 'Done' || step.status === 'In Progress' || step.status === 'Pending'
                ? step.status
                : 'Pending'

            return {
              id: asString(step.id, `step-${stepIndex + 1}`),
              title: asString(step.title, `Step ${stepIndex + 1}`),
              status,
            }
          })
        : fallback[index]?.steps ?? [],
      documents: Array.isArray(application.documents)
        ? application.documents.filter(isRecord).map((document, documentIndex) => {
            const status: DocumentStatus =
              document.status === 'Missing' || document.status === 'Uploaded' || document.status === 'Verified'
                ? document.status
                : 'Missing'

            return {
              id: asString(document.id, `document-${documentIndex + 1}`),
              title: asString(document.title, `Document ${documentIndex + 1}`),
              status,
              updatedAt: asString(document.updatedAt, 'Pending'),
            }
          })
        : fallback[index]?.documents ?? [],
      tourDate: asNullableString(application.tourDate),
      statusNote: asString(application.statusNote, fallback[index]?.statusNote ?? 'No update yet.'),
    }))
    .filter((application) => childIds.has(application.childId))
}

function normalizeAttendance(input: unknown, fallback: AttendanceEntry[], childIds: Set<string>) {
  if (!Array.isArray(input)) {
    return fallback
  }

  return input
    .filter(isRecord)
    .map((entry, index) => ({
      id: asString(entry.id, fallback[index]?.id ?? `attendance-${index + 1}`),
      childId: asString(entry.childId, fallback[index]?.childId ?? ''),
      day: asString(entry.day, fallback[index]?.day ?? 'Day'),
      dateLabel: asString(entry.dateLabel, fallback[index]?.dateLabel ?? 'Date pending'),
      status: asString(entry.status, fallback[index]?.status ?? 'Pending'),
      checkIn: asString(entry.checkIn, fallback[index]?.checkIn ?? 'Pending'),
      checkOut: asString(entry.checkOut, fallback[index]?.checkOut ?? 'Pending'),
      note: asString(entry.note, fallback[index]?.note ?? 'No note'),
    }))
    .filter((entry) => childIds.has(entry.childId))
}

function normalizeThreads(input: unknown, fallback: ConversationThread[], childIds: Set<string>) {
  if (!Array.isArray(input)) {
    return fallback
  }

  return input
    .filter(isRecord)
    .map((thread, index) => {
      const channel: MessageChannel =
        thread.channel === 'Teacher' ||
        thread.channel === 'Admissions' ||
        thread.channel === 'Billing' ||
        thread.channel === 'Office'
          ? thread.channel
          : 'Office'
      const status: ConversationThread['status'] =
        thread.status === 'Open' ||
        thread.status === 'Waiting on school' ||
        thread.status === 'Waiting on you'
          ? thread.status
          : 'Open'

      return {
        id: asString(thread.id, fallback[index]?.id ?? `thread-${index + 1}`),
        childId:
          thread.childId === null
            ? null
            : typeof thread.childId === 'string' && childIds.has(thread.childId)
              ? thread.childId
              : null,
        name: asString(thread.name, fallback[index]?.name ?? 'School team'),
        role: asString(thread.role, fallback[index]?.role ?? 'Team'),
        channel,
        status,
        lastMessage: asString(thread.lastMessage, fallback[index]?.lastMessage ?? 'No messages yet.'),
        timestamp: asString(thread.timestamp, fallback[index]?.timestamp ?? 'Now'),
        unreadCount: asNumber(thread.unreadCount, fallback[index]?.unreadCount ?? 0),
      }
    })
}

function normalizeMessages(input: unknown, fallback: ChatMessage[], threadIds: Set<string>) {
  if (!Array.isArray(input)) {
    return fallback
  }

  return input
    .filter(isRecord)
    .map((message, index) => {
      const sender: ChatMessage['sender'] = message.sender === 'school' ? 'school' : 'parent'

      return {
        id: asString(message.id, fallback[index]?.id ?? `message-${index + 1}`),
        threadId: asString(message.threadId, fallback[index]?.threadId ?? ''),
        sender,
        author: asString(message.author, fallback[index]?.author ?? 'Unknown sender'),
        body: asString(message.body, fallback[index]?.body ?? 'No message body.'),
        timestamp: asString(message.timestamp, fallback[index]?.timestamp ?? 'Now'),
      }
    })
    .filter((message) => threadIds.has(message.threadId))
}

function normalizeInvoices(input: unknown, fallback: UserInvoice[], childIds: Set<string>) {
  if (!Array.isArray(input)) {
    return fallback
  }

  return input
    .filter(isRecord)
    .map((invoice, index) => {
      const status: InvoiceStatus =
        invoice.status === 'Paid' || invoice.status === 'Due Soon' || invoice.status === 'Pending'
          ? invoice.status
          : 'Pending'

      return {
        id: asString(invoice.id, fallback[index]?.id ?? `invoice-${index + 1}`),
        childId:
          invoice.childId === null
            ? null
            : typeof invoice.childId === 'string' && childIds.has(invoice.childId)
              ? invoice.childId
              : null,
        title: asString(invoice.title, fallback[index]?.title ?? 'Invoice'),
        dueDate: asString(invoice.dueDate, fallback[index]?.dueDate ?? 'Pending'),
        amount: asString(invoice.amount, fallback[index]?.amount ?? '$0'),
        status,
        category: asString(invoice.category, fallback[index]?.category ?? 'General'),
        receiptReady: asBoolean(invoice.receiptReady, fallback[index]?.receiptReady ?? false),
      }
    })
}

function normalizeEvents(input: unknown, fallback: ParentEvent[], childIds: Set<string>) {
  if (!Array.isArray(input)) {
    return fallback
  }

  return input
    .filter(isRecord)
    .map((event, index) => ({
      id: asString(event.id, fallback[index]?.id ?? `event-${index + 1}`),
      childId:
        event.childId === null
          ? null
          : typeof event.childId === 'string' && childIds.has(event.childId)
            ? event.childId
            : null,
      title: asString(event.title, fallback[index]?.title ?? 'Event'),
      dateLabel: asString(event.dateLabel, fallback[index]?.dateLabel ?? 'Date pending'),
      detail: asString(event.detail, fallback[index]?.detail ?? 'No details yet.'),
      category: asString(event.category, fallback[index]?.category ?? 'General'),
    }))
}

function normalizeContacts(input: unknown, fallback: FamilyContact[]) {
  if (!Array.isArray(input)) {
    return fallback
  }

  return input.filter(isRecord).map((contact, index) => {
    const type: ContactType =
      contact.type === 'guardian' || contact.type === 'pickup' || contact.type === 'medical'
        ? contact.type
        : 'guardian'

    return {
      id: asString(contact.id, fallback[index]?.id ?? `contact-${index + 1}`),
      label: asString(contact.label, fallback[index]?.label ?? 'Contact'),
      value: asString(contact.value, fallback[index]?.value ?? 'Pending'),
      type,
    }
  })
}

function normalizeResources(input: unknown, fallback: ParentResource[], childIds: Set<string>) {
  if (!Array.isArray(input)) {
    return fallback
  }

  return input
    .filter(isRecord)
    .map((resource, index) => ({
      id: asString(resource.id, fallback[index]?.id ?? `resource-${index + 1}`),
      title: asString(resource.title, fallback[index]?.title ?? 'Resource'),
      detail: asString(resource.detail, fallback[index]?.detail ?? 'No details yet.'),
      childId:
        resource.childId === null
          ? null
          : typeof resource.childId === 'string' && childIds.has(resource.childId)
            ? resource.childId
            : null,
      category: asString(resource.category, fallback[index]?.category ?? 'General'),
    }))
}

function normalizeActivity(input: unknown, fallback: PortalActivity[]) {
  if (!Array.isArray(input)) {
    return fallback
  }

  return input.filter(isRecord).map((activity, index) => ({
    id: asString(activity.id, fallback[index]?.id ?? `activity-${index + 1}`),
    title: asString(activity.title, fallback[index]?.title ?? 'Activity'),
    detail: asString(activity.detail, fallback[index]?.detail ?? 'No details yet.'),
    timestamp: asString(activity.timestamp, fallback[index]?.timestamp ?? 'Now'),
  }))
}

export function normalizeUserPortalState(candidate: unknown): UserPortalState {
  const fallback = createInitialUserPortalState()

  if (!isRecord(candidate)) {
    return fallback
  }

  const children = normalizeChildren(candidate.children, fallback.children)
  const childIds = new Set(children.map((child) => child.id))
  const applications = normalizeApplications(candidate.applications, fallback.applications, childIds)
  const attendanceEntries = normalizeAttendance(candidate.attendanceEntries, fallback.attendanceEntries, childIds)
  const threads = normalizeThreads(candidate.threads, fallback.threads, childIds)
  const threadIds = new Set(threads.map((thread) => thread.id))
  const messages = normalizeMessages(candidate.messages, fallback.messages, threadIds)
  const invoices = normalizeInvoices(candidate.invoices, fallback.invoices, childIds)
  const events = normalizeEvents(candidate.events, fallback.events, childIds)
  const contacts = normalizeContacts(candidate.contacts, fallback.contacts)
  const resources = normalizeResources(candidate.resources, fallback.resources, childIds)
  const activityFeed = normalizeActivity(candidate.activityFeed, fallback.activityFeed)
  const activeChildId =
    typeof candidate.activeChildId === 'string' && childIds.has(candidate.activeChildId)
      ? candidate.activeChildId
      : children[0]?.id ?? null
  const selectedThreadId =
    typeof candidate.selectedThreadId === 'string' && threadIds.has(candidate.selectedThreadId)
      ? candidate.selectedThreadId
      : threads[0]?.id ?? null

  return {
    activeChildId,
    selectedThreadId,
    children,
    applications,
    attendanceEntries,
    threads,
    messages,
    invoices,
    events,
    contacts,
    resources,
    activityFeed,
    autopayEnabled: asBoolean(candidate.autopayEnabled, fallback.autopayEnabled),
    paymentMethod: asString(candidate.paymentMethod, fallback.paymentMethod),
  }
}

export async function fetchUserPortalState(userId: string, fallbackState: UserPortalState) {
  const normalizedFallback = normalizeUserPortalState(fallbackState)

  if (!hasSupabaseConfig || !supabase) {
    return {
      state: normalizedFallback,
      source: 'device' as const,
      error: null,
    }
  }

  const { data, error } = await supabase
    .from('crm_parent_portal_state')
    .select('portal_state')
    .eq('user_id', userId)
    .maybeSingle<{ portal_state: UserPortalState | null }>()

  if (isMissingSchema(error)) {
    return {
      state: normalizedFallback,
      source: 'device' as const,
      error:
        'Parent portal tables are not initialized yet. Run the SQL in supabase/schema.sql to enable Supabase sync.',
    }
  }

  if (error) {
    return {
      state: normalizedFallback,
      source: 'device' as const,
      error: error.message,
    }
  }

  return {
    state: normalizeUserPortalState(data?.portal_state ?? normalizedFallback),
    source: data?.portal_state ? ('supabase' as const) : ('device' as const),
    error: null,
  }
}

export async function persistUserPortalState(userId: string, state: UserPortalState) {
  if (!hasSupabaseConfig || !supabase) {
    return { source: 'device' as const, error: null }
  }

  const { error } = await supabase.from('crm_parent_portal_state').upsert(
    {
      user_id: userId,
      portal_state: normalizeUserPortalState(state),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  if (isMissingSchema(error)) {
    return {
      source: 'device' as const,
      error:
        'Parent portal tables are not initialized yet. Run the SQL in supabase/schema.sql to enable Supabase sync.',
    }
  }

  if (error) {
    return { source: 'device' as const, error: error.message }
  }

  return { source: 'supabase' as const, error: null }
}
