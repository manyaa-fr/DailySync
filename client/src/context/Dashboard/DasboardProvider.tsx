import { useSearchParams } from 'react-router-dom'
import { DashboardContext } from './DashboardContext'
import { DEMO_DASHBOARD_DATA } from '../../mock/demoDashboard'
import { DemoBanner } from '../../components/ui/UIComponents'

type DashboardProviderProps = {
  children: React.ReactNode
}

export const DashboardProvider = ({ children }: DashboardProviderProps) => {
  const [params] = useSearchParams()
  const isDemo = params.get('demo') === 'true'

  const data = isDemo
    ? DEMO_DASHBOARD_DATA
    : DEMO_DASHBOARD_DATA // real later

  return (
    <DashboardContext.Provider value={data}>
      {isDemo && <DemoBanner />}
      {children}
    </DashboardContext.Provider>
  )
}