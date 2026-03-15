/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react'
import type { GamificationContextValue } from '../types/gamification'

const GamificationContext = createContext<GamificationContextValue | null>(null)

interface GamificationProviderProps {
  value: GamificationContextValue
  children: ReactNode
}

export function GamificationProvider({ value, children }: GamificationProviderProps) {
  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>
}

export function useGamificationContext() {
  const value = useContext(GamificationContext)

  if (!value) {
    throw new Error('useGamificationContext must be used inside GamificationProvider')
  }

  return value
}
