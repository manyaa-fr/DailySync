import { useSearchParams } from 'react-router-dom'
import { DashboardContext } from './DashboardContext'
import { DEMO_DASHBOARD_DATA } from '../../mock/demoDashboard'
import { DemoBanner } from '../../components/ui/UIComponents'
import { DashboardData } from '../../types/Dashboard'

type DashboardProviderProps = {
  children: React.ReactNode
}

function normalizeDashboardData(raw: DashboardData): Required<DashboardData> {
  return {
    metrics: {
      weeklyCommits: raw.metrics?.weeklyCommits ?? 0,
      codingMinutes: raw.metrics?.codingMinutes ?? 0,
      streakDays: raw.metrics?.streakDays ?? 0,
      aiScore: raw.metrics?.aiScore ?? 0,
    },

    weeklyActivity: raw.weeklyActivity ?? [],

    github: {
      mostActiveDay: raw.github?.mostActiveDay ?? 'N/A',
      reposTouched: raw.github?.reposTouched ?? 0,
      recentCommits: raw.github?.recentCommits ?? [],
    },

    codingTime: {
      hourly: raw.codingTime?.hourly ?? [],
      dailyAverageMinutes: raw.codingTime?.dailyAverageMinutes ?? 0,
      mostProductiveTime: raw.codingTime?.mostProductiveTime ?? 'N/A',
      peakHourLabel: raw.codingTime?.peakHourLabel ?? 'N/A',
    },

    aiInsight: {
      title: raw.aiInsight?.title,
      summary: raw.aiInsight?.summary,
    },

    meta: {
      source: raw.meta.source,
      lastUpdated: raw.meta.lastUpdated ?? '',
      warnings: raw.meta.warnings ?? [],
    },
  }
}

export const DashboardProvider = ({ children }: DashboardProviderProps) => {
  const [params] = useSearchParams()
  const isDemo = params.get('demo') === 'true'

  const data = isDemo
    ? DEMO_DASHBOARD_DATA
    : DEMO_DASHBOARD_DATA // real later
  
  const safeData = normalizeDashboardData(data)

  return (
    <DashboardContext.Provider value={safeData}>
      {isDemo && <DemoBanner />}
      {children}
    </DashboardContext.Provider>
  )
}