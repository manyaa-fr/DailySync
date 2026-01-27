import { DashboardData } from '../types/Dashboard'

export const DEMO_DASHBOARD_DATA: DashboardData = {
  metrics: {
    weeklyCommits: 124,
    codingMinutes: 1420,
    streakDays: 12,
    aiScore: 98,
  },

  weeklyActivity: [
    { name: 'Mon', commits: 45, minutes: 30 },
    { name: 'Tue', commits: 120, minutes: 90 },
    { name: 'Wed', commits: 80, minutes: 60 },
    { name: 'Thu', commits: 160, minutes: 110 },
    { name: 'Fri', commits: 100, minutes: 85 },
    { name: 'Sat', commits: 20, minutes: 10 },
    { name: 'Sun', commits: 10, minutes: 5 },
  ],

  github: {
    mostActiveDay: 'Thursday',
    reposTouched: 4,
    recentCommits: [
      {
        id: 'c1',
        message: 'feat: add user authentication',
        repo: 'dailysync-web',
        timestamp: '2 hours ago',
      },
      {
        id: 'c2',
        message: 'fix: layout shifting on mobile',
        repo: 'dailysync-web',
        timestamp: '4 hours ago',
      },
      {
        id: 'c3',
        message: 'chore: update dependencies',
        repo: 'backend-api',
        timestamp: 'Yesterday',
      },
    ],
  },

  codingTime: {
    hourly: [
      { name: '6am', value: 5 },
      { name: '9am', value: 45 },
      { name: '12pm', value: 85 },
      { name: '3pm', value: 60 },
      { name: '6pm', value: 40 },
      { name: '9pm', value: 90 },
      { name: '12am', value: 25 },
    ],
    dailyAverageMinutes: 252,
    mostProductiveTime: 'Evening',
    peakHourLabel: '9 PM',
  },

  aiInsight: {
    title: "You've crushed your commit goals",
    summary:
      "Your coding output is up 12% compared to last week. Consider blocking time tomorrow morning for code reviews to unblock your team.",
  },

  meta: {
    source: 'demo',
    lastUpdated: '2026-01-09T00:00:00Z',
  },
}

export const MOCK_SUMMARIES = [
   {
      id: '1',
      date: 'Yesterday',
      mood: 'productive',
      content: "You focused mainly on **dailysync-web**, resolving 3 UI bugs and setting up the new dashboard layout. You also reviewed 2 PRs from the team."
   },
   {
      id: '2',
      date: 'Jan 24',
      mood: 'neutral',
      content: "A slower day with 2 commits to **backend-api**. Spent most of the time debugging the authentication flow and researching OAuth providers."
   },
   {
      id: '3',
      date: 'Jan 23',
      mood: 'productive',
      content: "High activity! 8 commits across 3 repositories. You successfully refactored the database schema and updated all related API endpoints."
   }
];
