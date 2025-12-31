export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  secondary?: number;
  [key: string]: string | number | undefined;
}

export interface Commit {
  id: string;
  message: string;
  repo: string;
  timestamp: string;
  branch: string;
}

export interface TimeLog {
  id: string;
  project: string;
  minutes: number;
  date: string;
  description: string;
}

export interface Summary {
  id: string;
  date: string;
  content: string;
  mood: 'productive' | 'neutral' | 'stuck';
}

export interface RepoStats {
  name: string;
  commits: number;
  active: boolean;
  language: string;
  lastActive: string;
  churnScore: 'Low' | 'Medium' | 'High';
}

export interface ChurnData {
  day: string;
  additions: number;
  deletions: number;
}

export interface HourlyData {
  hour: string;
  commits: number;
  intensity: 'low' | 'medium' | 'high';
}

export interface LanguageStat {
  name: string;
  percentage: number;
  color: string;
}
