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

  const { isAuthenticated } = useAuth()

  const [state, setState] = useState<DashboardState>({
    status: 'loading',
  })

  useEffect(() => {
    // DEMO MODE
    if (isDemo) {
      setState({
        status: 'demo',
        data: DEMO_DASHBOARD_DATA,
      })
      return
    }

    // Not logged in → do nothing
    if (!isAuthenticated) {
      setState({ status: 'loading' })
      return
    }

    const fetchDashboard = async () => {
      try {
        setState({ status: 'loading' })

        const res = await fetch('http://localhost:8000/api/v1/dashboard', {
          credentials: 'include',
        })

        const contentType = res.headers.get('content-type')

        if (!contentType?.includes('application/json')) {
          const text = await res.text()
          console.error('NON-JSON RESPONSE:', text)
          throw new Error('Backend did not return JSON')
        }

        const data = await res.json()

        if (!res.ok) {
          throw new Error('Failed to fetch dashboard')
        }

        if (data.meta?.source === 'github') {
          setState({
            status: 'ready',
            data,
          })
        } else {
          setState({
            status: 'needs_github',
            data,
          })
        }
      } catch (err) {
        console.error(err)
        setState({ status: 'needs_github' })
      }
    }

    fetchDashboard()
  }, [isDemo, isAuthenticated])

  return (
    <DashboardContext.Provider value={state}>
      {isDemo && <DemoBanner />}
      {children}
    </DashboardContext.Provider>
  )
}