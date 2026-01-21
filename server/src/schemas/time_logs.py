from pydantic import BaseModel
from typing import Optional, List

class TimeLogBase(BaseModel):
    project: str
    description: Optional[str] = ""
    minutes: int
    date: str  # YYYY-MM-DD
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    isDeepWork: bool = False
    tags: List[str] = []

class TimeLogCreate(TimeLogBase):
    source: str = "synced"

class TimeLogResponse(TimeLogBase):
    id: str
    source: str = "synced"