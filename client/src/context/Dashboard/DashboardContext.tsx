import { createContext } from 'react'
import { DashboardData } from '../../types/Dashboard'

export const DashboardContext = createContext<DashboardData | null>(null)