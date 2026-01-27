from pydantic import BaseModel
from typing import List, Optional

class TimeStats(BaseModel):
    total_minutes: int
    deep_work_minutes: int
    sessions: int
    top_project: Optional[str]

class ProjectBreakdown(BaseModel):
    name: str
    minutes: int

class ActivityContext(BaseModel):
    commits: int
    prs: int
    reviews: int

class DailySummaryResponse(BaseModel):
    score: float
    summary: str
    highlights: List[str]
    gaps: List[str]