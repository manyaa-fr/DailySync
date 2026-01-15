import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DashboardContext } from './DashboardContext'
import { DEMO_DASHBOARD_DATA } from '../../mock/demoDashboard'
import { DemoBanner } from '../../components/ui/UIComponents'
import { useAuth } from '../../auth/useAuth'
import { DashboardState } from './types'

export const DashboardProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [params] = useSearchParams()
  const isDemo = params.get('demo') === 'true'

  // ✅ THIS NOW MATCHES YOUR AUTH CONTEXT
  const { isAuthenticated, githubConnected } = useAuth()

  const [state, setState] = useState<DashboardState>({
    status: 'loading',
  })

  useEffect(() => {
    // DEMO MODE (only via URL)
    if (isDemo) {
      setState({
        status: 'demo',
        data: DEMO_DASHBOARD_DATA,
      })
      return
    }

    // Not logged in -> dashboard shouldn't even try
    if (!isAuthenticated) {
      setState({ status: 'loading' })
      return
    }

    // Logged in but GitHub not connected
    if (!githubConnected) {
      setState({ status: 'needs_github' })
      return
    }

    // Logged in + GitHub connected → fetch real data
    const fetchDashboard = async () => {
      try {
        setState({ status: 'loading' })

        const res = await fetch('/api/dashboard', {
          credentials: 'include',
        })

        if (!res.ok) {
          throw new Error('Failed to fetch dashboard')
        }

        const data = await res.json()

        setState({
          status: 'ready',
          data,
        })
      } catch (err) {
        console.error(err)
        setState({ status: 'needs_github' })
      }
    }

    fetchDashboard()
  }, [isDemo, isAuthenticated, githubConnected])

  return (
    <DashboardContext.Provider value={state}>
      {isDemo && <DemoBanner />}
      {children}
    </DashboardContext.Provider>
  )
}