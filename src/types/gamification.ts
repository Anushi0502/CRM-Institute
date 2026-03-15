import type { Task } from './crm'

export type GamificationBadgeIcon =
  | 'sparkles'
  | 'flag'
  | 'compass'
  | 'shield'
  | 'flame'
  | 'rocket'

export interface GamificationSummary {
  totalPoints: number
  level: number
  pointsIntoLevel: number
  pointsToNextLevel: number
  streakDays: number
  questsCompletedToday: number
  tasksCompleted: number
  leadsReviewed: number
  programsInspected: number
  pagesVisitedToday: number
}

export interface GamificationQuest {
  id: string
  title: string
  description: string
  progress: number
  target: number
  rewardPoints: number
  completed: boolean
}

export interface GamificationBadge {
  id: string
  title: string
  description: string
  icon: GamificationBadgeIcon
  progress: number
  target: number
  unlockedAt: string | null
  rewardPoints: number
}

export interface GamificationEvent {
  id: string
  label: string
  points: number
  createdAt: string
  kind: 'action' | 'quest' | 'badge'
}

export interface GamificationCelebration {
  id: string
  title: string
  message: string
  kind: 'quest' | 'badge'
  points?: number
}

export interface GamificationState {
  summary: GamificationSummary
  quests: GamificationQuest[]
  badges: GamificationBadge[]
  recentEvents: GamificationEvent[]
  completedTaskIds: string[]
  reviewedLeadIds: string[]
  inspectedProgramIds: string[]
  latestCelebration: GamificationCelebration | null
}

export interface GamificationContextValue extends GamificationState {
  completeTask: (task: Task) => void
  reviewLead: (leadId: string) => void
  inspectProgram: (programId: string) => void
  logAdmissionsSearch: (term: string) => void
  visitPage: (path: string) => void
  clearCelebration: () => void
  isTaskCompleted: (taskId: string) => boolean
}
