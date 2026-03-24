from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from bson import ObjectId


def parse_iso_datetime(value: Any) -> Optional[datetime]:
    """
    Parse ISO timestamps coming from the frontend (`toISOString()` -> trailing `Z`).
    Returns None if the value is missing or cannot be parsed.
    """
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    if not isinstance(value, str) or not value.strip():
        return None

    # Frontend uses `Z` suffix; datetime.fromisoformat doesn't like raw `Z`.
    s = value.strip()
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"

    try:
        dt = datetime.fromisoformat(s)
    except ValueError:
        return None

    # Normalize naive datetimes to UTC.
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def compute_code_activity_in_window(
    *,
    commits: list[dict],
    session_start: Optional[datetime],
    session_end: Optional[datetime],
) -> dict[str, int]:
    """
    Enrich a focus session with GitHub commit activity inside the session window.
    """
    if not session_start or not session_end or not commits:
        return {"commitCount": 0, "additions": 0, "deletions": 0}

    # Defensive ordering: some UIs could produce swapped timestamps.
    if session_end < session_start:
        session_start, session_end = session_end, session_start

    commit_count = 0
    additions = 0
    deletions = 0

    for c in commits:
        raw_dt = c.get("committed_at") or c.get("date")
        if raw_dt is None:
            continue

        if isinstance(raw_dt, str):
            dt = parse_iso_datetime(raw_dt)
        else:
            dt = raw_dt

        if not isinstance(dt, datetime):
            continue

        if session_start <= dt <= session_end:
            commit_count += 1
            if c.get("additions") is not None:
                try:
                    additions += int(c["additions"])
                except (TypeError, ValueError):
                    pass
            if c.get("deletions") is not None:
                try:
                    deletions += int(c["deletions"])
                except (TypeError, ValueError):
                    pass

    return {"commitCount": commit_count, "additions": additions, "deletions": deletions}


async def upsert_developer_session(
    *,
    sessions_collection: Any,
    github_snapshots_collection: Any,
    time_log_id: ObjectId,
    time_log_doc: dict[str, Any],
    user_id: ObjectId,
) -> None:
    """
    Normalize `time_logs` into `developer_sessions` and enrich with code-activity.

    - `time_log_id` is used as an idempotency key.
    - Code enrichment uses the latest `github_snapshots` commit timestamps.
    """
    session_start = parse_iso_datetime(time_log_doc.get("startTime"))
    session_end = parse_iso_datetime(time_log_doc.get("endTime"))

    github_snapshot = await github_snapshots_collection.find_one({"user_id": user_id})
    commits = github_snapshot.get("commits", []) if github_snapshot else []

    code_activity = compute_code_activity_in_window(
        commits=commits,
        session_start=session_start,
        session_end=session_end,
    )

    now = datetime.now(timezone.utc)

    normalized = {
        "user_id": user_id,
        "time_log_id": time_log_id,
        "date": time_log_doc.get("date"),
        "project": time_log_doc.get("project"),
        "description": time_log_doc.get("description", ""),
        "minutes": int(time_log_doc.get("minutes") or 0),
        "isDeepWork": bool(time_log_doc.get("isDeepWork", False)),
        "tags": time_log_doc.get("tags", []),
        "source": time_log_doc.get("source", "synced"),
        "session_start": session_start,
        "session_end": session_end,
        "codeActivity": code_activity,
        "updated_at": now,
    }

    await sessions_collection.update_one(
        {"time_log_id": time_log_id},
        {"$set": normalized, "$setOnInsert": {"created_at": now}},
        upsert=True,
    )

