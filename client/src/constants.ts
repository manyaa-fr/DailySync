import { ChartDataPoint, Commit, RepoStats, Summary, TimeLog, ChurnData, HourlyData, LanguageStat } from '../types';

// --- Dashboard & General Data ---
export const WEEKLY_ACTIVITY_DATA: ChartDataPoint[] = [
  { name: 'Mon', value: 45, secondary: 30, fullDate: '2023-10-23' },
  { name: 'Tue', value: 120, secondary: 90, fullDate: '2023-10-24' },
  { name: 'Wed', value: 80, secondary: 60, fullDate: '2023-10-25' },
  { name: 'Thu', value: 160, secondary: 110, fullDate: '2023-10-26' },
  { name: 'Fri', value: 100, secondary: 85, fullDate: '2023-10-27' },
  { name: 'Sat', value: 20, secondary: 10, fullDate: '2023-10-28' },
  { name: 'Sun', value: 10, secondary: 5, fullDate: '2023-10-29' },
];

export const CODING_TIME_HOURLY: ChartDataPoint[] = [
  { name: '6am', value: 5 },
  { name: '9am', value: 45 },
  { name: '12pm', value: 85 },
  { name: '3pm', value: 60 },
  { name: '6pm', value: 40 },
  { name: '9pm', value: 90 },
  { name: '12am', value: 25 },
];

export const TIME_DISTRIBUTION_DATA: ChartDataPoint[] = [
  { name: 'Coding', value: 65 },
  { name: 'Review', value: 20 },
  { name: 'Meetings', value: 10 },
  { name: 'Planning', value: 5 },
];

// --- GitHub Specific Data ---

export const GITHUB_ACTIVITY_30_DAYS: ChartDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
  name: `Day ${i + 1}`,
  value: Math.floor(Math.random() * 15) + (i % 7 === 0 ? 0 : 5), // Simulating weekends
  date: `Oct ${i + 1}`
}));

export const CODE_CHURN_DATA: ChurnData[] = [
  { day: 'Mon', additions: 145, deletions: 40 },
  { day: 'Tue', additions: 320, deletions: 120 },
  { day: 'Wed', additions: 180, deletions: 60 },
  { day: 'Thu', additions: 450, deletions: 210 }, // High churn day
  { day: 'Fri', additions: 200, deletions: 90 },
  { day: 'Sat', additions: 40, deletions: 10 },
  { day: 'Sun', additions: 0, deletions: 0 },
];

export const HOURLY_RHYTHM_DATA: HourlyData[] = [
  { hour: '00', commits: 2, intensity: 'low' },
  { hour: '02', commits: 0, intensity: 'low' },
  { hour: '04', commits: 0, intensity: 'low' },
  { hour: '06', commits: 5, intensity: 'low' },
  { hour: '08', commits: 15, intensity: 'medium' },
  { hour: '10', commits: 45, intensity: 'high' },
  { hour: '12', commits: 20, intensity: 'medium' },
  { hour: '14', commits: 55, intensity: 'high' },
  { hour: '16', commits: 40, intensity: 'high' },
  { hour: '18', commits: 25, intensity: 'medium' },
  { hour: '20', commits: 60, intensity: 'high' }, // Night owl peak
  { hour: '22', commits: 35, intensity: 'medium' },
];

export const LANGUAGE_STATS: LanguageStat[] = [
  { name: 'TypeScript', percentage: 65, color: '#A27D5C' }, // Warm Accent
  { name: 'Python', percentage: 20, color: '#525252' },     // Dark Grey
  { name: 'Rust', percentage: 10, color: '#A3A3A3' },       // Light Grey
  { name: 'CSS', percentage: 5, color: '#E5E5E5' },        // Very Light
];

export const MOCK_REPOS: RepoStats[] = [
  { name: 'dailysync-web', commits: 124, active: true, language: 'TypeScript', lastActive: '2 hours ago', churnScore: 'Medium' },
  { name: 'backend-api', commits: 89, active: true, language: 'Python', lastActive: '5 hours ago', churnScore: 'Low' },
  { name: 'marketing-site', commits: 12, active: false, language: 'React', lastActive: '3 days ago', churnScore: 'Low' },
  { name: 'dev-tools-cli', commits: 45, active: false, language: 'Rust', lastActive: '1 week ago', churnScore: 'High' },
  { name: 'design-system', commits: 67, active: true, language: 'CSS', lastActive: '1 day ago', churnScore: 'Low' },
];

export const MOCK_COMMITS: Commit[] = [
  { id: 'c1', message: 'feat: add user authentication', repo: 'dailysync-web', timestamp: '2 hours ago', branch: 'main' },
  { id: 'c2', message: 'fix: layout shifting on mobile', repo: 'dailysync-web', timestamp: '4 hours ago', branch: 'fix/ui-bug' },
  { id: 'c3', message: 'chore: update dependencies', repo: 'backend-api', timestamp: 'Yesterday', branch: 'main' },
  { id: 'c4', message: 'refactor: simplify data fetching', repo: 'dailysync-web', timestamp: 'Yesterday', branch: 'feature/refactor' },
  { id: 'c5', message: 'docs: update readme', repo: 'marketing-site', timestamp: '2 days ago', branch: 'main' },
];

export const MOCK_LOGS: TimeLog[] = [
  { id: 'l1', project: 'DailySync Frontend', minutes: 120, date: 'Today', description: 'Implemented dashboard charts' },
  { id: 'l2', project: 'API Integration', minutes: 45, date: 'Today', description: 'Debugging Gemini response' },
  { id: 'l3', project: 'Team Sync', minutes: 30, date: 'Yesterday', description: 'Weekly standup' },
];

export const MOCK_SUMMARIES: Summary[] = [
  { id: 's1', date: 'Oct 24, 2023', content: 'High productivity today. Focused mainly on the frontend architecture. Completed the dashboard layout and integrated Recharts. Need to focus on unit tests tomorrow.', mood: 'productive' },
  { id: 's2', date: 'Oct 23, 2023', content: 'Moderate progress. Spent too much time debugging a race condition in the auth flow. API integration is halfway done.', mood: 'neutral' },
];

export const DEMO_SUMMARY_TEXT = `Here is your AI-generated summary for today:

You've had a highly productive session, logging over 4 hours of deep work. 
• **Key Achievement**: Successfully refactored the authentication middleware in 'dailysync-web'.
• **Focus Area**: 70% of your time was spent on pure coding, with minimal context switching.
• **Suggestion**: Tomorrow, consider prioritizing the documentation update for the API changes to unblock the frontend team.

Keep up the great momentum! 🚀`;
