import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from 'react'
import { createInitialUserPortalState } from '../services/userPortalMock'
import {
  fetchUserPortalState,
  normalizeUserPortalState,
  persistUserPortalState,
} from '../services/userPortalService'
import type {
  ContactType,
  ConversationThread,
  CreateApplicationInput,
  CreateChildInput,
  ParentChild,
  ParentQuickStat,
  PortalAlert,
  UserApplication,
  UserPortalContextValue,
  UserPortalState,
} from '../types/userPortal'

const STORAGE_PREFIX = 'crm-user-portal'
const UserPortalContext = createContext<UserPortalContextValue | null>(null)

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function nowTimeLabel() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function todayLabel() {
  return new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function loadPersistedState(storageKey: string) {
  if (typeof window === 'undefined') {
    return createInitialUserPortalState()
  }

  const raw = window.localStorage.getItem(storageKey)

  if (!raw) {
    return createInitialUserPortalState()
  }

  try {
    return normalizeUserPortalState(JSON.parse(raw))
  } catch {
    return createInitialUserPortalState()
  }
}

function savePersistedState(storageKey: string, state: UserPortalState) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(storageKey, JSON.stringify(normalizeUserPortalState(state)))
}

function parseMoneyLabel(amountLabel: string) {
  return Number(amountLabel.replace(/[^0-9.]/g, '')) || 0
}

function averageAttendanceLabel(children: ParentChild[]) {
  if (children.length === 0) {
    return '0%'
  }

  const average = Math.round(
    children.reduce((sum, child) => sum + (Number(child.attendanceRate.replace('%', '')) || 0), 0) /
      children.length,
  )

  return `${average}%`
}

function buildProgressLabel(application: UserApplication) {
  const doneCount = application.steps.filter((step) => step.status === 'Done').length
  return `${doneCount} of ${application.steps.length} steps complete`
}

function syncApplicationFromDocuments(application: UserApplication) {
  const allDocumentsReady = application.documents.every((document) => document.status !== 'Missing')
  const allDocumentsVerified = application.documents.every((document) => document.status === 'Verified')

  const steps = application.steps.map((step) => {
    if (step.id === 'step-docs') {
      if (allDocumentsVerified) {
        return { ...step, status: 'Done' as const }
      }

      if (allDocumentsReady) {
        return { ...step, status: 'In Progress' as const }
      }

      return { ...step, status: 'Pending' as const }
    }

    if (step.id === 'step-tour' && application.tourDate) {
      return { ...step, status: 'Done' as const }
    }

    return step
  })

  const nextStage = application.tourDate
    ? 'Tour scheduled'
    : allDocumentsReady
      ? 'In review'
      : 'Awaiting documents'

  const nextApplication = {
    ...application,
    steps,
    stage: nextStage,
  }

  return {
    ...nextApplication,
    progressLabel: buildProgressLabel(nextApplication),
  }
}

function pushActivity(state: UserPortalState, title: string, detail: string) {
  return [
    {
      id: createId('activity'),
      title,
      detail,
      timestamp: nowTimeLabel(),
    },
    ...state.activityFeed,
  ].slice(0, 8)
}

function getVisibleThreads(state: UserPortalState, activeChildId: string | null) {
  if (!activeChildId) {
    return state.threads
  }

  return state.threads.filter((thread) => thread.childId === activeChildId || thread.childId === null)
}

function getNextSelectedThreadId(state: UserPortalState, activeChildId: string | null) {
  const visibleThreads = getVisibleThreads(state, activeChildId)
  return visibleThreads[0]?.id ?? null
}

function buildQuickStats(
  state: UserPortalState,
  visibleThreads: ConversationThread[],
  visibleApplications: UserApplication[],
): ParentQuickStat[] {
  const openApplications = visibleApplications.filter((application) => application.stage !== 'Seat confirmed').length
  const unreadMessages = visibleThreads.reduce((sum, thread) => sum + thread.unreadCount, 0)
  const dueInvoices = state.invoices.filter((invoice) => invoice.status !== 'Paid').length

  return [
    {
      label: 'Open applications',
      value: String(openApplications),
      tone: 'border-coral/25 bg-coral/10 text-coral',
    },
    {
      label: 'Unread messages',
      value: String(unreadMessages),
      tone: 'border-teal/25 bg-teal/10 text-teal',
    },
    {
      label: 'Invoices due',
      value: String(dueInvoices),
      tone: 'border-amber/35 bg-amber/20 text-amber-700',
    },
    {
      label: 'Attendance avg',
      value: averageAttendanceLabel(state.children),
      tone: 'border-plum/25 bg-plum/10 text-plum',
    },
  ]
}

function buildAlerts(state: UserPortalState, visibleApplications: UserApplication[], visibleThreads: ConversationThread[]): PortalAlert[] {
  const alerts: PortalAlert[] = []
  const missingDocuments = visibleApplications.flatMap((application) =>
    application.documents.filter((document) => document.status === 'Missing'),
  )

  if (missingDocuments.length > 0) {
    alerts.push({
      id: 'alert-documents',
      title: 'Documents still missing',
      detail: `${missingDocuments.length} required admission documents still need to be uploaded.`,
      tone: 'border-coral/25 bg-coral/10 text-coral',
    })
  }

  const dueInvoices = state.invoices.filter((invoice) => invoice.status === 'Due Soon')

  if (dueInvoices.length > 0) {
    alerts.push({
      id: 'alert-billing',
      title: 'Upcoming billing action',
      detail: `${dueInvoices.length} invoice is ready for review before the due date.`,
      tone: 'border-amber/35 bg-amber/20 text-amber-700',
    })
  }

  const unreadMessages = visibleThreads.reduce((sum, thread) => sum + thread.unreadCount, 0)

  if (unreadMessages > 0) {
    alerts.push({
      id: 'alert-messages',
      title: 'Unread conversations',
      detail: `${unreadMessages} unread message${unreadMessages === 1 ? '' : 's'} still need attention.`,
      tone: 'border-teal/25 bg-teal/10 text-teal',
    })
  }

  return alerts
}

interface UserPortalProviderProps {
  authUserId: string | null
  storageKeySeed: string
  children: ReactNode
}

export function UserPortalProvider({
  authUserId,
  storageKeySeed,
  children,
}: UserPortalProviderProps) {
  const storageKey = `${STORAGE_PREFIX}:${storageKeySeed}`
  const [state, setState] = useState<UserPortalState>(() => loadPersistedState(storageKey))
  const [isHydrating, setIsHydrating] = useState(Boolean(authUserId))
  const [syncSource, setSyncSource] = useState<'device' | 'supabase'>('device')
  const [syncError, setSyncError] = useState<string | null>(null)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    let isCancelled = false
    const localState = loadPersistedState(storageKey)

    hasLoadedRef.current = false
    setState(localState)
    setSyncSource('device')
    setSyncError(null)

    if (!authUserId) {
      setIsHydrating(false)
      hasLoadedRef.current = true
      return
    }

    setIsHydrating(true)

    void fetchUserPortalState(authUserId, localState).then((result) => {
      if (isCancelled) {
        return
      }

      setState(result.state)
      setSyncSource(result.source)
      setSyncError(result.error)
      setIsHydrating(false)
      hasLoadedRef.current = true
    })

    return () => {
      isCancelled = true
    }
  }, [authUserId, storageKey])

  useEffect(() => {
    savePersistedState(storageKey, state)
  }, [state, storageKey])

  useEffect(() => {
    if (!authUserId || !hasLoadedRef.current) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      void persistUserPortalState(authUserId, state).then((result) => {
        setSyncSource(result.source)
        setSyncError(result.error)
      })
    }, 450)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [authUserId, state])

  const activeChild = useMemo(
    () => state.children.find((child) => child.id === state.activeChildId) ?? state.children[0] ?? null,
    [state.activeChildId, state.children],
  )

  const visibleApplications = useMemo(
    () =>
      activeChild
        ? state.applications.filter((application) => application.childId === activeChild.id)
        : state.applications,
    [activeChild, state.applications],
  )

  const visibleAttendanceEntries = useMemo(
    () =>
      activeChild
        ? state.attendanceEntries.filter((entry) => entry.childId === activeChild.id)
        : state.attendanceEntries,
    [activeChild, state.attendanceEntries],
  )

  const visibleThreads = useMemo(
    () => getVisibleThreads(state, activeChild?.id ?? null),
    [activeChild, state],
  )

  const selectedThread =
    visibleThreads.find((thread) => thread.id === state.selectedThreadId) ?? visibleThreads[0] ?? null

  const selectedThreadMessages = useMemo(
    () =>
      selectedThread
        ? state.messages.filter((message) => message.threadId === selectedThread.id)
        : [],
    [selectedThread, state.messages],
  )

  const visibleResources = useMemo(
    () =>
      activeChild
        ? state.resources.filter((resource) => resource.childId === activeChild.id || resource.childId === null)
        : state.resources,
    [activeChild, state.resources],
  )

  const visibleInvoices = useMemo(
    () =>
      activeChild
        ? state.invoices.filter((invoice) => invoice.childId === activeChild.id || invoice.childId === null)
        : state.invoices,
    [activeChild, state.invoices],
  )

  const quickStats = useMemo(
    () => buildQuickStats(state, visibleThreads, visibleApplications),
    [state, visibleApplications, visibleThreads],
  )

  const alerts = useMemo(
    () => buildAlerts(state, visibleApplications, visibleThreads),
    [state, visibleApplications, visibleThreads],
  )

  const totalDueAmountLabel = useMemo(() => {
    const totalDue = visibleInvoices
      .filter((invoice) => invoice.status !== 'Paid')
      .reduce((sum, invoice) => sum + parseMoneyLabel(invoice.amount), 0)

    return `$${totalDue}`
  }, [visibleInvoices])

  function selectChild(childId: string | null) {
    setState((current) => ({
      ...current,
      activeChildId: childId,
      selectedThreadId: getNextSelectedThreadId(current, childId),
    }))
  }

  function addChild(input: CreateChildInput) {
    setState((current) => {
      if (current.children.length >= 20) {
        setSyncError('A parent account can manage up to 20 children in the portal.')
        return current
      }

      const childId = createId('child')
      const nextChild: ParentChild = {
        id: childId,
        name: input.name,
        program: input.program,
        ageBand: input.ageBand,
        teacher: input.teacher,
        attendanceRate: '0%',
        todayStatus: 'Not checked in yet',
        pickupWindow: 'Update pickup preference',
        milestone: 'New child profile created',
        campus: input.campus,
        medicalNotes: input.medicalNotes || 'No medical notes added yet.',
        authorizedPickupCount: 1,
      }

      return {
        ...current,
        activeChildId: childId,
        selectedThreadId: current.selectedThreadId,
        children: [nextChild, ...current.children],
        activityFeed: pushActivity(
          current,
          'Child profile added',
          `${input.name} is now available across admissions, attendance, and billing.`,
        ),
      }
    })
  }

  function removeChild(childId: string) {
    setState((current) => {
      const child = current.children.find((entry) => entry.id === childId)
      const nextChildren = current.children.filter((entry) => entry.id !== childId)
      const removedThreadIds = current.threads
        .filter((thread) => thread.childId === childId)
        .map((thread) => thread.id)

      const nextState: UserPortalState = {
        ...current,
        children: nextChildren,
        applications: current.applications.filter((application) => application.childId !== childId),
        attendanceEntries: current.attendanceEntries.filter((entry) => entry.childId !== childId),
        threads: current.threads.filter((thread) => thread.childId !== childId),
        messages: current.messages.filter((message) => !removedThreadIds.includes(message.threadId)),
        invoices: current.invoices.filter((invoice) => invoice.childId !== childId),
        events: current.events.filter((event) => event.childId !== childId),
        resources: current.resources.filter((resource) => resource.childId !== childId),
        activeChildId: nextChildren[0]?.id ?? null,
        selectedThreadId: null,
        activityFeed: pushActivity(
          current,
          'Child removed',
          child ? `${child.name} and linked parent records were removed from the portal.` : 'Child removed.',
        ),
        contacts: current.contacts,
        autopayEnabled: current.autopayEnabled,
        paymentMethod: current.paymentMethod,
      }

      return {
        ...nextState,
        selectedThreadId: getNextSelectedThreadId(nextState, nextState.activeChildId),
      }
    })
  }

  function updateChild(
    childId: string,
    input: {
      name?: string
      program?: string
      ageBand?: string
      teacher?: string
      campus?: string
      medicalNotes?: string
      milestone?: string
      pickupWindow?: string
    },
  ) {
    setState((current) => ({
      ...current,
      children: current.children.map((child) =>
        child.id === childId
          ? {
              ...child,
              ...(input.name !== undefined ? { name: input.name } : {}),
              ...(input.program !== undefined ? { program: input.program } : {}),
              ...(input.ageBand !== undefined ? { ageBand: input.ageBand } : {}),
              ...(input.teacher !== undefined ? { teacher: input.teacher } : {}),
              ...(input.campus !== undefined ? { campus: input.campus } : {}),
              ...(input.medicalNotes !== undefined ? { medicalNotes: input.medicalNotes } : {}),
              ...(input.milestone !== undefined ? { milestone: input.milestone } : {}),
              ...(input.pickupWindow !== undefined ? { pickupWindow: input.pickupWindow } : {}),
            }
          : child,
      ),
      activityFeed: pushActivity(current, 'Child profile updated', 'Child information was saved to the household record.'),
    }))
  }

  function createApplication(input: CreateApplicationInput) {
    setState((current) => {
      const nextApplication: UserApplication = {
        id: createId('application'),
        childId: input.childId,
        campus: input.campus,
        program: input.program,
        submittedAt: `Started ${todayLabel()}`,
        stage: input.stage ?? 'Draft created',
        progressLabel: '1 of 4 steps complete',
        steps: [
          { id: 'step-profile', title: 'Child profile', status: 'Done' },
          { id: 'step-docs', title: 'Documents uploaded', status: 'Pending' },
          { id: 'step-tour', title: 'Tour booking', status: 'Pending' },
          { id: 'step-review', title: 'Final review', status: 'Pending' },
        ],
        documents: [
          { id: createId('document'), title: 'Birth certificate', status: 'Missing', updatedAt: 'Pending' },
          { id: createId('document'), title: 'Immunization form', status: 'Missing', updatedAt: 'Pending' },
        ],
        tourDate: null,
        statusNote: 'New parent-side application draft created.',
      }

      const child = current.children.find((entry) => entry.id === input.childId)

      return {
        ...current,
        activeChildId: input.childId,
        applications: [nextApplication, ...current.applications],
        activityFeed: pushActivity(
          current,
          'Application created',
          `${child?.name ?? 'Child'} now has a new admissions lane in progress.`,
        ),
      }
    })
  }

  function uploadDocument(applicationId: string, documentId: string) {
    setState((current) => {
      const applications = current.applications.map((application) => {
        if (application.id !== applicationId) {
          return application
        }

        const documents = application.documents.map((document) =>
          document.id === documentId
            ? { ...document, status: 'Uploaded' as const, updatedAt: todayLabel() }
            : document,
        )

        return syncApplicationFromDocuments({
          ...application,
          documents,
          statusNote: 'Parent uploaded a requested document.',
        })
      })

      return {
        ...current,
        applications,
        activityFeed: pushActivity(
          current,
          'Document uploaded',
          'Admissions documents were updated from the parent portal.',
        ),
      }
    })
  }

  function scheduleTour(applicationId: string, dateLabel: string) {
    setState((current) => {
      const applications = current.applications.map((application) => {
        if (application.id !== applicationId) {
          return application
        }

        return syncApplicationFromDocuments({
          ...application,
          tourDate: dateLabel,
          statusNote: `Tour booked for ${dateLabel}.`,
          steps: application.steps.map((step) =>
            step.id === 'step-tour' ? { ...step, status: 'Done' as const } : step,
          ),
        })
      })

      return {
        ...current,
        applications,
        events: [
          {
            id: createId('event'),
            childId: current.applications.find((application) => application.id === applicationId)?.childId ?? null,
            title: 'Parent booked a tour',
            dateLabel,
            detail: 'Tour booked directly from the admissions workspace.',
            category: 'Visit',
          },
          ...current.events,
        ],
        activityFeed: pushActivity(current, 'Tour scheduled', `Tour booked for ${dateLabel}.`),
      }
    })
  }

  function submitAbsenceNote(childId: string, note: string) {
    setState((current) => {
      const child = current.children.find((entry) => entry.id === childId)

      return {
        ...current,
        attendanceEntries: [
          {
            id: createId('attendance'),
            childId,
            day: 'Note',
            dateLabel: todayLabel(),
            status: 'Absence note submitted',
            checkIn: 'Pending',
            checkOut: 'Pending',
            note,
          },
          ...current.attendanceEntries,
        ],
        activityFeed: pushActivity(
          current,
          'Absence note submitted',
          `${child?.name ?? 'Child'} now has a new attendance note on file.`,
        ),
      }
    })
  }

  function updatePickupWindow(childId: string, pickupWindow: string) {
    setState((current) => {
      const child = current.children.find((entry) => entry.id === childId)

      return {
        ...current,
        children: current.children.map((entry) =>
          entry.id === childId
            ? {
                ...entry,
                pickupWindow,
                todayStatus: `Pickup window updated to ${pickupWindow}`,
              }
            : entry,
        ),
        activityFeed: pushActivity(
          current,
          'Pickup window updated',
          `${child?.name ?? 'Child'} now has a new pickup window.`,
        ),
      }
    })
  }

  function selectThread(threadId: string) {
    setState((current) => ({
      ...current,
      selectedThreadId: threadId,
      threads: current.threads.map((thread) =>
        thread.id === threadId ? { ...thread, unreadCount: 0 } : thread,
      ),
    }))
  }

  function sendMessage(threadId: string, body: string) {
    setState((current) => {
      const thread = current.threads.find((entry) => entry.id === threadId)

      return {
        ...current,
        messages: [
          ...current.messages,
          {
            id: createId('message'),
            threadId,
            sender: 'parent',
            author: 'You',
            body,
            timestamp: nowTimeLabel(),
          },
        ],
        threads: current.threads.map((entry) =>
          entry.id === threadId
            ? {
                ...entry,
                status: 'Waiting on school',
                lastMessage: body,
                timestamp: nowTimeLabel(),
                unreadCount: 0,
              }
            : entry,
        ),
        activityFeed: pushActivity(
          current,
          'Message sent',
          `New parent message sent to ${thread?.name ?? 'school team'}.`,
        ),
      }
    })
  }

  function escalateToOffice(body: string) {
    setState((current) => {
      const officeThread =
        current.threads.find(
          (thread) =>
            thread.channel === 'Office' &&
            (thread.childId === current.activeChildId || thread.childId === null),
        ) ?? null

      const threadId = officeThread?.id ?? createId('thread')
      const activeChildId = current.activeChildId

      const nextThreads = officeThread
        ? current.threads.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  lastMessage: body,
                  timestamp: nowTimeLabel(),
                  status: 'Waiting on school' as const,
                }
              : thread,
          )
        : [
            {
              id: threadId,
              childId: activeChildId,
              name: 'Front Office',
              role: 'Operations',
              channel: 'Office' as const,
              status: 'Waiting on school' as const,
              lastMessage: body,
              timestamp: nowTimeLabel(),
              unreadCount: 0,
            },
            ...current.threads,
          ]

      return {
        ...current,
        selectedThreadId: threadId,
        threads: nextThreads,
        messages: [
          ...current.messages,
          {
            id: createId('message'),
            threadId,
            sender: 'parent',
            author: 'You',
            body,
            timestamp: nowTimeLabel(),
          },
        ],
        activityFeed: pushActivity(
          current,
          'Office escalation sent',
          'A new operations thread is now active in the parent app.',
        ),
      }
    })
  }

  function toggleAutopay() {
    setState((current) => ({
      ...current,
      autopayEnabled: !current.autopayEnabled,
      activityFeed: pushActivity(
        current,
        current.autopayEnabled ? 'Autopay disabled' : 'Autopay enabled',
        `Billing autopay is now ${current.autopayEnabled ? 'off' : 'on'} for eligible invoices.`,
      ),
    }))
  }

  function updatePaymentMethod(paymentMethod: string) {
    setState((current) => ({
      ...current,
      paymentMethod,
      activityFeed: pushActivity(current, 'Payment method updated', `${paymentMethod} is now the stored payment method.`),
    }))
  }

  function markInvoicePaid(invoiceId: string) {
    setState((current) => ({
      ...current,
      invoices: current.invoices.map((invoice) =>
        invoice.id === invoiceId
          ? {
              ...invoice,
              status: 'Paid' as const,
              dueDate: `Paid ${todayLabel()}`,
              receiptReady: true,
            }
          : invoice,
      ),
      activityFeed: pushActivity(current, 'Invoice paid', 'Billing state updated from the parent portal.'),
    }))
  }

  function downloadReceipt(invoiceId: string) {
    setState((current) => {
      const invoice = current.invoices.find((entry) => entry.id === invoiceId)

      return {
        ...current,
        activityFeed: pushActivity(
          current,
          'Receipt prepared',
          `${invoice?.title ?? 'Invoice'} receipt was prepared for download.`,
        ),
      }
    })
  }

  function updateContact(contactId: string, value: string) {
    setState((current) => ({
      ...current,
      contacts: current.contacts.map((contact) =>
        contact.id === contactId ? { ...contact, value } : contact,
      ),
      activityFeed: pushActivity(current, 'Contact updated', 'Family contact details were saved.'),
    }))
  }

  function addContact(label: string, value: string, type: ContactType) {
    setState((current) => ({
      ...current,
      children:
        type === 'pickup'
          ? current.children.map((child) => ({
              ...child,
              authorizedPickupCount: child.authorizedPickupCount + 1,
            }))
          : current.children,
      contacts: [
        {
          id: createId('contact'),
          label,
          value,
          type,
        },
        ...current.contacts,
      ],
      activityFeed: pushActivity(current, 'Contact added', `${label} was added to the family profile.`),
    }))
  }

  function removeContact(contactId: string) {
    setState((current) => {
      const contact = current.contacts.find((entry) => entry.id === contactId)

      return {
        ...current,
        children:
          contact?.type === 'pickup'
            ? current.children.map((child) => ({
                ...child,
                authorizedPickupCount: Math.max(child.authorizedPickupCount - 1, 0),
              }))
            : current.children,
        contacts: current.contacts.filter((entry) => entry.id !== contactId),
        activityFeed: pushActivity(
          current,
          'Contact removed',
          `${contact?.label ?? 'Contact'} was removed from the family profile.`,
        ),
      }
    })
  }

  const value = useMemo<UserPortalContextValue>(
    () => ({
      state,
      activeChild,
      visibleThreads,
      selectedThread,
      selectedThreadMessages,
      visibleApplications,
      visibleAttendanceEntries,
      visibleResources,
      visibleInvoices,
      quickStats,
      alerts,
      totalDueAmountLabel,
      syncSource,
      isHydrating,
      syncError,
      addChild,
      removeChild,
      updateChild,
      selectChild,
      createApplication,
      uploadDocument,
      scheduleTour,
      submitAbsenceNote,
      updatePickupWindow,
      selectThread,
      sendMessage,
      escalateToOffice,
      toggleAutopay,
      updatePaymentMethod,
      markInvoicePaid,
      downloadReceipt,
      updateContact,
      addContact,
      removeContact,
    }),
    [
      activeChild,
      alerts,
      quickStats,
      selectedThread,
      selectedThreadMessages,
      state,
      totalDueAmountLabel,
      syncError,
      syncSource,
      isHydrating,
      visibleApplications,
      visibleAttendanceEntries,
      visibleInvoices,
      visibleResources,
      visibleThreads,
    ],
  )

  return <UserPortalContext.Provider value={value}>{children}</UserPortalContext.Provider>
}

export function useUserPortalContext() {
  const context = useContext(UserPortalContext)

  if (!context) {
    throw new Error('useUserPortalContext must be used inside UserPortalProvider.')
  }

  return context
}
