import type { Task } from '../types/crm'
import type { GamificationBadge, GamificationEvent, GamificationQuest } from '../types/gamification'

const STORAGE_KEY = 'crm-gamification-v1'
const LEVEL_SIZE = 120
const MAX_RECENT_EVENTS = 14
const MAX_TRACKED_IDS = 240

export const PAGE_VISIT_POINTS = 8
export const LEAD_REVIEW_POINTS = 12
export const PROGRAM_INSPECT_POINTS = 9
export const SEARCH_POINTS = 6

type DailyMetric = 'tasksCompleted' | 'leadsReviewed' | 'programsInspected' | 'pagesVisited'
type LifetimeMetric = DailyMetric | 'searches'
type BadgeMetric = 'totalPoints' | 'streakDays' | 'level' | 'tasksCompleted' | 'leadsReviewed' | 'programsInspected'

interface QuestDefinition {
  id: string
  title: string
  description: string
  rewardPoints: number
  target: number
  metric: DailyMetric
}

interface BadgeDefinition {
  id: string
  title: string
  description: string
  icon: GamificationBadge['icon']
  target: number
  metric: BadgeMetric
  rewardPoints: number
}

export interface StoredLifetimeStats {
  tasksCompleted: number
  leadsReviewed: number
  programsInspected: number
  pagesVisited: number
  searches: number
}

export interface StoredDailyStats {
  date: string
  tasksCompleted: number
  leadsReviewed: number
  programsInspected: number
  pagesVisited: number
  searches: number
  completedQuestIds: string[]
  visitedPaths: string[]
  searchedTerms: string[]
}

export interface StoredGamificationProgress {
  version: 1
  totalPoints: number
  streakDays: number
  lastActiveDate: string | null
  lifetime: StoredLifetimeStats
  daily: StoredDailyStats
  unlockedBadgeIds: string[]
  badgeUnlockedAt: Record<string, string>
  completedTaskIds: string[]
  reviewedLeadIds: string[]
  inspectedProgramIds: string[]
  recentEvents: GamificationEvent[]
}

const questDefinitions: QuestDefinition[] = [
  {
    id: 'quest-task-sprint',
    title: 'Follow-through sprint',
    description: 'Complete 2 tasks today.',
    rewardPoints: 40,
    target: 2,
    metric: 'tasksCompleted',
  },
  {
    id: 'quest-lead-radar',
    title: 'Lead radar',
    description: 'Log 3 lead touchpoints today.',
    rewardPoints: 35,
    target: 3,
    metric: 'leadsReviewed',
  },
  {
    id: 'quest-campus-tour',
    title: 'Campus tour',
    description: 'Visit 4 CRM pages today.',
    rewardPoints: 30,
    target: 4,
    metric: 'pagesVisited',
  },
]

const badgeDefinitions: BadgeDefinition[] = [
  {
    id: 'badge-first-burst',
    title: 'First burst',
    description: 'Earn 80 points to enter game mode.',
    icon: 'sparkles',
    target: 80,
    metric: 'totalPoints',
    rewardPoints: 20,
  },
  {
    id: 'badge-follow-through',
    title: 'Follow-through captain',
    description: 'Complete 5 tasks.',
    icon: 'flag',
    target: 5,
    metric: 'tasksCompleted',
    rewardPoints: 25,
  },
  {
    id: 'badge-family-scout',
    title: 'Family scout',
    description: 'Log 8 lead touchpoints.',
    icon: 'compass',
    target: 8,
    metric: 'leadsReviewed',
    rewardPoints: 30,
  },
  {
    id: 'badge-room-shield',
    title: 'Room shield',
    description: 'Inspect 6 program cards.',
    icon: 'shield',
    target: 6,
    metric: 'programsInspected',
    rewardPoints: 24,
  },
  {
    id: 'badge-streak-sunrise',
    title: 'Streak sunrise',
    description: 'Keep a 3-day streak.',
    icon: 'flame',
    target: 3,
    metric: 'streakDays',
    rewardPoints: 35,
  },
  {
    id: 'badge-momentum-rocket',
    title: 'Momentum rocket',
    description: 'Reach level 4.',
    icon: 'rocket',
    target: 4,
    metric: 'level',
    rewardPoints: 40,
  },
]

function dateToKey(value = new Date()) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00`)
}

function dayDiff(previousDate: string, nextDate: string) {
  const delta = toDate(nextDate).getTime() - toDate(previousDate).getTime()
  return Math.round(delta / 86_400_000)
}

function trimTracked(items: string[]) {
  return items.slice(-MAX_TRACKED_IDS)
}

function numberOrZero(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : []
}

function eventArray(value: unknown): GamificationEvent[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null
      }

      const candidate = entry as Partial<GamificationEvent>
      if (
        typeof candidate.id !== 'string' ||
        typeof candidate.label !== 'string' ||
        typeof candidate.points !== 'number' ||
        typeof candidate.createdAt !== 'string' ||
        (candidate.kind !== 'action' && candidate.kind !== 'quest' && candidate.kind !== 'badge')
      ) {
        return null
      }

      return {
        id: candidate.id,
        label: candidate.label,
        points: candidate.points,
        createdAt: candidate.createdAt,
        kind: candidate.kind,
      }
    })
    .filter((event): event is GamificationEvent => Boolean(event))
}

function recordOfStrings(value: unknown) {
  if (!value || typeof value !== 'object') {
    return {}
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>(
    (record, [key, current]) => {
      if (typeof current === 'string') {
        record[key] = current
      }
      return record
    },
    {},
  )
}

function getDefaultDaily(today: string): StoredDailyStats {
  return {
    date: today,
    tasksCompleted: 0,
    leadsReviewed: 0,
    programsInspected: 0,
    pagesVisited: 0,
    searches: 0,
    completedQuestIds: [],
    visitedPaths: [],
    searchedTerms: [],
  }
}

function getDefaultState(today = dateToKey()): StoredGamificationProgress {
  return {
    version: 1,
    totalPoints: 0,
    streakDays: 1,
    lastActiveDate: today,
    lifetime: {
      tasksCompleted: 0,
      leadsReviewed: 0,
      programsInspected: 0,
      pagesVisited: 0,
      searches: 0,
    },
    daily: getDefaultDaily(today),
    unlockedBadgeIds: [],
    badgeUnlockedAt: {},
    completedTaskIds: [],
    reviewedLeadIds: [],
    inspectedProgramIds: [],
    recentEvents: [],
  }
}

export function calculateLevelSummary(totalPoints: number) {
  const safePoints = Math.max(totalPoints, 0)
  const level = Math.floor(safePoints / LEVEL_SIZE) + 1
  const pointsIntoLevel = safePoints % LEVEL_SIZE
  const pointsToNextLevel = LEVEL_SIZE - pointsIntoLevel

  return {
    level,
    pointsIntoLevel,
    pointsToNextLevel,
  }
}

export function calculateTaskReward(task: Task) {
  const priorityBonus: Record<Task['priority'], number> = {
    High: 12,
    Medium: 8,
    Low: 4,
  }

  const statusBonus: Record<Task['status'], number> = {
    Today: 6,
    'This Week': 3,
    Done: 0,
  }

  return 24 + priorityBonus[task.priority] + statusBonus[task.status]
}

export function createEvent(label: string, points: number, kind: GamificationEvent['kind']): GamificationEvent {
  return {
    id: `event-${Date.now()}-${Math.round(Math.random() * 10_000)}`,
    label,
    points,
    kind,
    createdAt: new Date().toISOString(),
  }
}

export function addRecentEvent(events: GamificationEvent[], event: GamificationEvent) {
  return [event, ...events].slice(0, MAX_RECENT_EVENTS)
}

export function syncDay(progress: StoredGamificationProgress, today = dateToKey()) {
  const previousDate = progress.lastActiveDate

  let nextStreak = progress.streakDays
  if (!previousDate) {
    nextStreak = 1
  } else {
    const diff = dayDiff(previousDate, today)
    if (diff <= 0) {
      nextStreak = progress.streakDays
    } else if (diff === 1) {
      nextStreak = progress.streakDays + 1
    } else {
      nextStreak = 1
    }
  }

  const needsDailyReset = progress.daily.date !== today

  return {
    ...progress,
    streakDays: nextStreak,
    lastActiveDate: today,
    daily: needsDailyReset ? getDefaultDaily(today) : progress.daily,
  }
}

function buildFromUnknown(input: unknown): StoredGamificationProgress {
  const today = dateToKey()
  if (!input || typeof input !== 'object') {
    return getDefaultState(today)
  }

  const candidate = input as Partial<StoredGamificationProgress>
  const daily = candidate.daily

  const parsedDailyDate =
    daily && typeof daily === 'object' && typeof daily.date === 'string'
      ? daily.date
      : today

  return {
    version: 1,
    totalPoints: numberOrZero(candidate.totalPoints),
    streakDays: Math.max(numberOrZero(candidate.streakDays), 1),
    lastActiveDate: typeof candidate.lastActiveDate === 'string' ? candidate.lastActiveDate : today,
    lifetime: {
      tasksCompleted: numberOrZero(candidate.lifetime?.tasksCompleted),
      leadsReviewed: numberOrZero(candidate.lifetime?.leadsReviewed),
      programsInspected: numberOrZero(candidate.lifetime?.programsInspected),
      pagesVisited: numberOrZero(candidate.lifetime?.pagesVisited),
      searches: numberOrZero(candidate.lifetime?.searches),
    },
    daily: {
      date: parsedDailyDate,
      tasksCompleted: numberOrZero(daily?.tasksCompleted),
      leadsReviewed: numberOrZero(daily?.leadsReviewed),
      programsInspected: numberOrZero(daily?.programsInspected),
      pagesVisited: numberOrZero(daily?.pagesVisited),
      searches: numberOrZero(daily?.searches),
      completedQuestIds: trimTracked(stringArray(daily?.completedQuestIds)),
      visitedPaths: trimTracked(stringArray(daily?.visitedPaths)),
      searchedTerms: trimTracked(stringArray(daily?.searchedTerms)),
    },
    unlockedBadgeIds: trimTracked(stringArray(candidate.unlockedBadgeIds)),
    badgeUnlockedAt: recordOfStrings(candidate.badgeUnlockedAt),
    completedTaskIds: trimTracked(stringArray(candidate.completedTaskIds)),
    reviewedLeadIds: trimTracked(stringArray(candidate.reviewedLeadIds)),
    inspectedProgramIds: trimTracked(stringArray(candidate.inspectedProgramIds)),
    recentEvents: eventArray(candidate.recentEvents).slice(0, MAX_RECENT_EVENTS),
  }
}

export function loadGamificationProgress() {
  if (typeof window === 'undefined') {
    return getDefaultState()
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return getDefaultState()
    }

    const parsed = JSON.parse(raw) as unknown
    return syncDay(buildFromUnknown(parsed))
  } catch {
    return getDefaultState()
  }
}

export function saveGamificationProgress(progress: StoredGamificationProgress) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function buildQuests(progress: StoredGamificationProgress): GamificationQuest[] {
  return questDefinitions.map((definition) => {
    const progressValue = progress.daily[definition.metric]
    const completed = progress.daily.completedQuestIds.includes(definition.id)

    return {
      id: definition.id,
      title: definition.title,
      description: definition.description,
      progress: Math.min(progressValue, definition.target),
      target: definition.target,
      rewardPoints: definition.rewardPoints,
      completed,
    }
  })
}

function badgeMetricValue(progress: StoredGamificationProgress, metric: BadgeMetric) {
  if (metric === 'totalPoints') {
    return progress.totalPoints
  }

  if (metric === 'streakDays') {
    return progress.streakDays
  }

  if (metric === 'level') {
    return calculateLevelSummary(progress.totalPoints).level
  }

  return progress.lifetime[metric as LifetimeMetric]
}

export function buildBadges(progress: StoredGamificationProgress): GamificationBadge[] {
  return badgeDefinitions.map((definition) => {
    const metricValue = badgeMetricValue(progress, definition.metric)

    return {
      id: definition.id,
      title: definition.title,
      description: definition.description,
      icon: definition.icon,
      progress: Math.min(metricValue, definition.target),
      target: definition.target,
      unlockedAt: progress.badgeUnlockedAt[definition.id] ?? null,
      rewardPoints: definition.rewardPoints,
    }
  })
}

export function getQuestDefinitions() {
  return questDefinitions
}

export function getBadgeDefinitions() {
  return badgeDefinitions
}
