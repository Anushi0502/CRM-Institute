export type ApplicationStepStatus = 'Done' | 'In Progress' | 'Pending'
export type DocumentStatus = 'Missing' | 'Uploaded' | 'Verified'
export type InvoiceStatus = 'Paid' | 'Due Soon' | 'Pending'
export type ContactType = 'guardian' | 'pickup' | 'medical'
export type MessageChannel = 'Teacher' | 'Admissions' | 'Billing' | 'Office'
export type ThreadStatus = 'Open' | 'Waiting on school' | 'Waiting on you'

export interface ParentChild {
  id: string
  name: string
  program: string
  ageBand: string
  teacher: string
  attendanceRate: string
  todayStatus: string
  pickupWindow: string
  milestone: string
  campus: string
  medicalNotes: string
  authorizedPickupCount: number
}

export interface ParentQuickStat {
  label: string
  value: string
  tone: string
}

export interface ApplicationStep {
  id: string
  title: string
  status: ApplicationStepStatus
}

export interface ApplicationDocument {
  id: string
  title: string
  status: DocumentStatus
  updatedAt: string
}

export interface UserApplication {
  id: string
  childId: string
  campus: string
  program: string
  submittedAt: string
  stage: string
  progressLabel: string
  steps: ApplicationStep[]
  documents: ApplicationDocument[]
  tourDate: string | null
  statusNote: string
}

export interface AttendanceEntry {
  id: string
  childId: string
  day: string
  dateLabel: string
  status: string
  checkIn: string
  checkOut: string
  note: string
}

export interface ConversationThread {
  id: string
  childId: string | null
  name: string
  role: string
  channel: MessageChannel
  status: ThreadStatus
  lastMessage: string
  timestamp: string
  unreadCount: number
}

export interface ChatMessage {
  id: string
  threadId: string
  sender: 'school' | 'parent'
  author: string
  body: string
  timestamp: string
}

export interface UserInvoice {
  id: string
  childId: string | null
  title: string
  dueDate: string
  amount: string
  status: InvoiceStatus
  category: string
  receiptReady: boolean
}

export interface ParentEvent {
  id: string
  childId: string | null
  title: string
  dateLabel: string
  detail: string
  category: string
}

export interface FamilyContact {
  id: string
  label: string
  value: string
  type: ContactType
}

export interface ParentResource {
  id: string
  title: string
  detail: string
  childId: string | null
  category: string
}

export interface PortalActivity {
  id: string
  title: string
  detail: string
  timestamp: string
}

export interface PortalAlert {
  id: string
  title: string
  detail: string
  tone: string
}

export interface UserPortalState {
  activeChildId: string | null
  selectedThreadId: string | null
  children: ParentChild[]
  applications: UserApplication[]
  attendanceEntries: AttendanceEntry[]
  threads: ConversationThread[]
  messages: ChatMessage[]
  invoices: UserInvoice[]
  events: ParentEvent[]
  contacts: FamilyContact[]
  resources: ParentResource[]
  activityFeed: PortalActivity[]
  autopayEnabled: boolean
  paymentMethod: string
}

export interface CreateChildInput {
  name: string
  program: string
  ageBand: string
  teacher: string
  campus: string
  medicalNotes: string
}

export interface CreateApplicationInput {
  childId: string
  campus: string
  program: string
  stage?: string
}

export interface UpdateChildInput {
  name?: string
  program?: string
  ageBand?: string
  teacher?: string
  campus?: string
  medicalNotes?: string
  milestone?: string
  pickupWindow?: string
}

export interface UserPortalContextValue {
  state: UserPortalState
  activeChild: ParentChild | null
  visibleThreads: ConversationThread[]
  selectedThread: ConversationThread | null
  selectedThreadMessages: ChatMessage[]
  visibleApplications: UserApplication[]
  visibleAttendanceEntries: AttendanceEntry[]
  visibleResources: ParentResource[]
  visibleInvoices: UserInvoice[]
  quickStats: ParentQuickStat[]
  alerts: PortalAlert[]
  totalDueAmountLabel: string
  syncSource: 'device' | 'supabase'
  isHydrating: boolean
  syncError: string | null
  addChild: (input: CreateChildInput) => void
  removeChild: (childId: string) => void
  updateChild: (childId: string, input: UpdateChildInput) => void
  selectChild: (childId: string | null) => void
  createApplication: (input: CreateApplicationInput) => void
  uploadDocument: (applicationId: string, documentId: string) => void
  scheduleTour: (applicationId: string, dateLabel: string) => void
  submitAbsenceNote: (childId: string, note: string) => void
  updatePickupWindow: (childId: string, pickupWindow: string) => void
  selectThread: (threadId: string) => void
  sendMessage: (threadId: string, body: string) => void
  escalateToOffice: (body: string) => void
  toggleAutopay: () => void
  updatePaymentMethod: (paymentMethod: string) => void
  markInvoicePaid: (invoiceId: string) => void
  downloadReceipt: (invoiceId: string) => void
  updateContact: (contactId: string, value: string) => void
  addContact: (label: string, value: string, type: ContactType) => void
  removeContact: (contactId: string) => void
}
