import { createContext } from 'react'
import { DashboardState } from './types'

export const DashboardContext = createContext<DashboardState | null>(null)