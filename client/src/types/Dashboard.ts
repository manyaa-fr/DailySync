export interface DashboardData {
  metrics?: {
    weeklyCommits?: number
    codingMinutes?: number
    streakDays?: number
    aiScore?: number
  }

  weeklyActivity?: {
    name: string
    commits?: number
    minutes?: number
  }[]

  github?: {
    mostActiveDay?: string
    reposTouched?: number
    recentCommits?: {
      id: string
      message?: string
      repo?: string
      timestamp?: string
    }[]
  }

  codingTime?: {
    hourly?: {
      name: string
      value?: number
    }[]
    dailyAverageMinutes?: number
    mostProductiveTime?: string
    peakHourLabel?: string
  }

  aiInsight?: {
    title?: string
    summary?: string
  }

  meta: {
    source: 'demo' | 'github'
    lastUpdated?: string
    warnings?: string[]
  }
}