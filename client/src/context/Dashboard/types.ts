import { DashboardData } from '../../types/Dashboard'

export type DashboardState =
  | { status: 'loading' }
  | { status: 'needs_github'; data?: DashboardData }
  | { status: 'demo'; data: DashboardData }
  | { status: 'ready'; data: DashboardData }