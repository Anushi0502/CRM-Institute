import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Task } from '../types/crm'
import type {
  GamificationCelebration,
  GamificationContextValue,
  GamificationEvent,
} from '../types/gamification'
import {
  LEAD_REVIEW_POINTS,
  PAGE_VISIT_POINTS,
  PROGRAM_INSPECT_POINTS,
  SEARCH_POINTS,
  addRecentEvent,
  buildBadges,
  buildQuests,
  calculateLevelSummary,
  calculateTaskReward,
  createEvent,
  getBadgeDefinitions,
  getQuestDefinitions,
  loadGamificationProgress,
  saveGamificationProgress,
  syncDay,
  type StoredGamificationProgress,
} from '../services/gamificationService'

const MAX_TRACKED_ITEMS = 240

function clampTracked(items: string[]) {
  return items.slice(-MAX_TRACKED_ITEMS)
}

function awardPoints(
  progress: StoredGamificationProgress,
  label: string,
  points: number,
  kind: GamificationEvent['kind'],
) {
  const event = createEvent(label, points, kind)

  return {
    ...progress,
    totalPoints: progress.totalPoints + points,
    recentEvents: addRecentEvent(progress.recentEvents, event),
  }
}

function resolveQuestRewards(progress: StoredGamificationProgress) {
  let next = progress
  const celebrations: GamificationCelebration[] = []

  for (const quest of getQuestDefinitions()) {
    const alreadyCompleted = next.daily.completedQuestIds.includes(quest.id)
    const currentProgress = next.daily[quest.metric]

    if (alreadyCompleted || currentProgress < quest.target) {
      continue
    }

    const rewarded = awardPoints(next, `Quest complete: ${quest.title}`, quest.rewardPoints, 'quest')

    next = {
      ...rewarded,
      daily: {
        ...rewarded.daily,
        completedQuestIds: clampTracked([...rewarded.daily.completedQuestIds, quest.id]),
      },
    }

    celebrations.push({
      id: `celebration-quest-${quest.id}-${Date.now()}`,
      title: 'Quest complete',
      message: quest.title,
      kind: 'quest',
      points: quest.rewardPoints,
    })
  }

  return {
    next,
    celebrations,
  }
}

function resolveBadgeUnlocks(progress: StoredGamificationProgress) {
  let next = progress
  const celebrations: GamificationCelebration[] = []

  let shouldRecheck = true
  while (shouldRecheck) {
    shouldRecheck = false

    const definitions = getBadgeDefinitions()
    const badges = buildBadges(next)

    for (const definition of definitions) {
      const badge = badges.find((entry) => entry.id === definition.id)

      if (!badge || badge.unlockedAt || badge.progress < badge.target) {
        continue
      }

      const unlockedAt = new Date().toISOString()
      const unlocked = {
        ...next,
        unlockedBadgeIds: clampTracked([...next.unlockedBadgeIds, definition.id]),
        badgeUnlockedAt: {
          ...next.badgeUnlockedAt,
          [definition.id]: unlockedAt,
        },
      }

      next = awardPoints(unlocked, `Badge unlocked: ${definition.title}`, definition.rewardPoints, 'badge')

      celebrations.push({
        id: `celebration-badge-${definition.id}-${Date.now()}`,
        title: 'Badge unlocked',
        message: definition.title,
        kind: 'badge',
        points: definition.rewardPoints,
      })

      shouldRecheck = true
      break
    }
  }

  return {
    next,
    celebrations,
  }
}

export function useGamification(): GamificationContextValue {
  const [progress, setProgress] = useState<StoredGamificationProgress>(() => loadGamificationProgress())
  const [latestCelebration, setLatestCelebration] = useState<GamificationCelebration | null>(null)
  const pendingCelebrationRef = useRef<GamificationCelebration | null>(null)

  useEffect(() => {
    saveGamificationProgress(progress)
  }, [progress])

  useEffect(() => {
    if (!pendingCelebrationRef.current) {
      return
    }

    setLatestCelebration(pendingCelebrationRef.current)
    pendingCelebrationRef.current = null
  }, [progress])

  useEffect(() => {
    if (!latestCelebration) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setLatestCelebration(null)
    }, 5600)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [latestCelebration])

  const applyUpdate = useCallback(
    (updater: (state: StoredGamificationProgress) => {
      next: StoredGamificationProgress
      celebrations: GamificationCelebration[]
    }) => {
      setProgress((previous) => {
        const { next, celebrations } = updater(syncDay(previous))
        pendingCelebrationRef.current = celebrations.at(-1) ?? null
        return next
      })
    },
    [],
  )

  const completeTask = useCallback(
    (task: Task) => {
      applyUpdate((state) => {
        if (state.completedTaskIds.includes(task.id)) {
          return {
            next: state,
            celebrations: [],
          }
        }

        let next: StoredGamificationProgress = {
          ...state,
          completedTaskIds: clampTracked([...state.completedTaskIds, task.id]),
          lifetime: {
            ...state.lifetime,
            tasksCompleted: state.lifetime.tasksCompleted + 1,
          },
          daily: {
            ...state.daily,
            tasksCompleted: state.daily.tasksCompleted + 1,
          },
        }

        const rewardPoints = calculateTaskReward(task)
        next = awardPoints(next, `Task completed: ${task.category}`, rewardPoints, 'action')

        const questResult = resolveQuestRewards(next)
        const badgeResult = resolveBadgeUnlocks(questResult.next)

        return {
          next: badgeResult.next,
          celebrations: [...questResult.celebrations, ...badgeResult.celebrations],
        }
      })
    },
    [applyUpdate],
  )

  const reviewLead = useCallback(
    (leadId: string) => {
      applyUpdate((state) => {
        if (state.reviewedLeadIds.includes(leadId)) {
          return {
            next: state,
            celebrations: [],
          }
        }

        let next: StoredGamificationProgress = {
          ...state,
          reviewedLeadIds: clampTracked([...state.reviewedLeadIds, leadId]),
          lifetime: {
            ...state.lifetime,
            leadsReviewed: state.lifetime.leadsReviewed + 1,
          },
          daily: {
            ...state.daily,
            leadsReviewed: state.daily.leadsReviewed + 1,
          },
        }

        next = awardPoints(next, 'Lead touchpoint logged', LEAD_REVIEW_POINTS, 'action')

        const questResult = resolveQuestRewards(next)
        const badgeResult = resolveBadgeUnlocks(questResult.next)

        return {
          next: badgeResult.next,
          celebrations: [...questResult.celebrations, ...badgeResult.celebrations],
        }
      })
    },
    [applyUpdate],
  )

  const inspectProgram = useCallback(
    (programId: string) => {
      applyUpdate((state) => {
        if (state.inspectedProgramIds.includes(programId)) {
          return {
            next: state,
            celebrations: [],
          }
        }

        let next: StoredGamificationProgress = {
          ...state,
          inspectedProgramIds: clampTracked([...state.inspectedProgramIds, programId]),
          lifetime: {
            ...state.lifetime,
            programsInspected: state.lifetime.programsInspected + 1,
          },
          daily: {
            ...state.daily,
            programsInspected: state.daily.programsInspected + 1,
          },
        }

        next = awardPoints(next, 'Program inspected', PROGRAM_INSPECT_POINTS, 'action')

        const questResult = resolveQuestRewards(next)
        const badgeResult = resolveBadgeUnlocks(questResult.next)

        return {
          next: badgeResult.next,
          celebrations: [...questResult.celebrations, ...badgeResult.celebrations],
        }
      })
    },
    [applyUpdate],
  )

  const logAdmissionsSearch = useCallback(
    (term: string) => {
      const normalized = term.trim().toLowerCase()
      if (normalized.length < 2) {
        return
      }

      applyUpdate((state) => {
        if (state.daily.searchedTerms.includes(normalized)) {
          return {
            next: state,
            celebrations: [],
          }
        }

        let next: StoredGamificationProgress = {
          ...state,
          lifetime: {
            ...state.lifetime,
            searches: state.lifetime.searches + 1,
          },
          daily: {
            ...state.daily,
            searches: state.daily.searches + 1,
            searchedTerms: clampTracked([...state.daily.searchedTerms, normalized]),
          },
        }

        next = awardPoints(next, 'Admissions search used', SEARCH_POINTS, 'action')

        const badgeResult = resolveBadgeUnlocks(next)

        return {
          next: badgeResult.next,
          celebrations: badgeResult.celebrations,
        }
      })
    },
    [applyUpdate],
  )

  const visitPage = useCallback(
    (path: string) => {
      const normalizedPath = path === '/' ? '/' : path.replace(/\/+$/, '')

      applyUpdate((state) => {
        if (state.daily.visitedPaths.includes(normalizedPath)) {
          return {
            next: state,
            celebrations: [],
          }
        }

        let next: StoredGamificationProgress = {
          ...state,
          lifetime: {
            ...state.lifetime,
            pagesVisited: state.lifetime.pagesVisited + 1,
          },
          daily: {
            ...state.daily,
            pagesVisited: state.daily.pagesVisited + 1,
            visitedPaths: clampTracked([...state.daily.visitedPaths, normalizedPath]),
          },
        }

        next = awardPoints(next, `Visited ${normalizedPath === '/' ? 'dashboard' : normalizedPath}`, PAGE_VISIT_POINTS, 'action')

        const questResult = resolveQuestRewards(next)
        const badgeResult = resolveBadgeUnlocks(questResult.next)

        return {
          next: badgeResult.next,
          celebrations: [...questResult.celebrations, ...badgeResult.celebrations],
        }
      })
    },
    [applyUpdate],
  )

  const clearCelebration = useCallback(() => {
    setLatestCelebration(null)
  }, [])

  const isTaskCompleted = useCallback(
    (taskId: string) => progress.completedTaskIds.includes(taskId),
    [progress.completedTaskIds],
  )

  const summary = useMemo(() => {
    const levelSummary = calculateLevelSummary(progress.totalPoints)
    const quests = buildQuests(progress)

    return {
      totalPoints: progress.totalPoints,
      level: levelSummary.level,
      pointsIntoLevel: levelSummary.pointsIntoLevel,
      pointsToNextLevel: levelSummary.pointsToNextLevel,
      streakDays: progress.streakDays,
      questsCompletedToday: quests.filter((quest) => quest.completed).length,
      tasksCompleted: progress.lifetime.tasksCompleted,
      leadsReviewed: progress.lifetime.leadsReviewed,
      programsInspected: progress.lifetime.programsInspected,
      pagesVisitedToday: progress.daily.pagesVisited,
    }
  }, [progress])

  const quests = useMemo(() => buildQuests(progress), [progress])
  const badges = useMemo(() => buildBadges(progress), [progress])

  return {
    summary,
    quests,
    badges,
    recentEvents: progress.recentEvents,
    completedTaskIds: progress.completedTaskIds,
    reviewedLeadIds: progress.reviewedLeadIds,
    inspectedProgramIds: progress.inspectedProgramIds,
    latestCelebration,
    completeTask,
    reviewLead,
    inspectProgram,
    logAdmissionsSearch,
    visitPage,
    clearCelebration,
    isTaskCompleted,
  }
}
