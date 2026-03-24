"""
Pydantic model for documents in the `developer_sessions` MongoDB collection.

Each document is produced by `services.etl_sessions.upsert_developer_session()`
which normalizes a raw `time_logs` entry and enriches it with GitHub commit
activity that overlaps the focus-session window.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from bson import ObjectId
from pydantic import BaseModel, Field


class CodeActivity(BaseModel):
    """Commit-level code signals captured within a focus-session window."""

    commitCount: int = 0
    additions: int = 0
    deletions: int = 0


class DeveloperSession(BaseModel):
    """
    Normalized developer session document stored in `developer_sessions`.

    This is the canonical output of the ETL pipeline that joins focus-time
    data (from `time_logs`) with GitHub code-activity signals (from
    `github_snapshots`) for a given user and session window.
    """

    # Identity / foreign keys
    user_id: str  # hex string of MongoDB ObjectId
    time_log_id: str  # idempotency key — hex string of source time_log ObjectId

    # Session descriptor
    date: Optional[str] = None           # YYYY-MM-DD
    project: Optional[str] = None
    description: str = ""
    minutes: int = 0
    isDeepWork: bool = False
    tags: list[str] = Field(default_factory=list)
    source: str = "synced"               # "synced" | "manual"

    # Precise window timestamps (UTC-aware)
    session_start: Optional[datetime] = None
    session_end: Optional[datetime] = None

    # Enriched code-activity (commits that fell inside the session window)
    codeActivity: CodeActivity = Field(default_factory=CodeActivity)

    # Audit timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
