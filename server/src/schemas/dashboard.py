from typing import List, Optional, Literal
from pydantic import BaseModel

class DashboardMeta(BaseModel):
    source: Literal["demo", "github"]
    lastUpdated: Optional[str] = None
    warnings: Optional[List[str]] = None

class DashboardMetrics(BaseModel):
    weeklyCommits: Optional[int] = None
    codingMinutes: Optional[int] = None
    streakDays: Optional[int] = None
    aiScore: Optional[int] = None

class WeeklyActivityItem(BaseModel):
    name: str
    commits: Optional[int] = None
    minutes: Optional[int] = None

class GitHubCommit(BaseModel):
    id: str
    message: Optional[str] = None
    repo: Optional[str] = None
    timestamp: Optional[str] = None
    
class DashboardGitHub(BaseModel):
    mostActiveDay: Optional[str] = None
    reposTouched: Optional[int] = None
    recentCommits: Optional[List[GitHubCommit]] = None

class CodingTimeHourly(BaseModel):
    name: str
    value: Optional[int] = None

class DashboardCodingTime(BaseModel):
    hourly: Optional[List[CodingTimeHourly]] = None
    dailyAverageMinutes: Optional[int] = None
    mostProductiveTime: Optional[str] = None
    peakHourLabel: Optional[str] = None

class DashboardAIInsight(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None

class DashboardResponse(BaseModel):
    metrics: Optional[DashboardMetrics] = None
    weeklyActivity: Optional[List[WeeklyActivityItem]] = None
    github: Optional[DashboardGitHub] = None
    codingTime: Optional[DashboardCodingTime] = None
    aiInsight: Optional[DashboardAIInsight] = None
    meta: DashboardMeta