import { DEMO_DASHBOARD_DATA } from '../../mock/demoDashboard'
import { DashboardContext } from './DashboardContext'

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  // FOR NOW: demo data only
  return (
    <DashboardContext.Provider value={DEMO_DASHBOARD_DATA}>
      {children}
    </DashboardContext.Provider>
  )
}