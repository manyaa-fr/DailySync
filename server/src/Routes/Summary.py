from fastapi import APIRouter, Request, HTTPException
from bson import ObjectId
from datetime import datetime, timezone
from config.db import db
from services.gemini_service import generate_ai_summary

router = APIRouter(prefix="/api/v1/summary", tags=["summary"])

github_snapshots = db["github_snapshots"]
summaries_collection = db["summaries"]


# GET SUMMARIES (Paginated)
@router.get("/")
async def get_summaries(request: Request, limit: int = 10, skip: int = 0):
    user_id = request.state.user_id
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    cursor = (
        summaries_collection.find({"user_id": ObjectId(user_id)})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )

    summaries = await cursor.to_list(length=limit)

    formatted = []
    for s in summaries:
        created_at = s.get("created_at")
        date_str = created_at.strftime("%Y-%m-%d %H:%M") if isinstance(created_at, datetime) else str(created_at)

        formatted.append({
            "id": str(s["_id"]),
            "content": s["content"],
            "date": date_str,
            "mood": s.get("mood", "neutral"),
            "stats": s.get("stats", {})
        })

    return formatted


# GENERATE DAILY SUMMARY
@router.post("/generate")
async def generate_summary(request: Request):
    user_id = request.state.user_id
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    today = datetime.now(timezone.utc).date()
    start_of_day = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    # 🔒 Prevent duplicate summary for today
    existing = await summaries_collection.find_one({
        "user_id": ObjectId(user_id),
        "created_at": {"$gte": start_of_day}
    })

    if existing:
        return {
            "summary": existing["content"],
            "mood": existing.get("mood"),
            "stats": existing.get("stats", {}),
            "cached": True
        }

    # 📦 Fetch GitHub snapshot
    snapshot = await github_snapshots.find_one({"user_id": ObjectId(user_id)})
    if not snapshot:
        return {"summary": "No GitHub activity found to summarize. Connect your account or sync first."}

    all_commits = snapshot.get("commits", [])

    from datetime import timedelta
    now = datetime.now(timezone.utc)
    last_24h = now - timedelta(hours=24)

    def is_recent(commit):
        try:
            committed_at = commit.get("committed_at")
            if isinstance(committed_at, str):
                committed_at = datetime.fromisoformat(committed_at.replace("Z", "+00:00"))
            return committed_at and last_24h <= committed_at <= now
        except Exception:
            return False

    commits = [c for c in all_commits if is_recent(c)]

    if not commits:
        return {"summary": "No commits made today yet. Go build something 🚀"}

    commit_count = len(commits)
    repo_count = len(set(c.get("repo_name", "unknown") for c in commits))

    ai_context = {
        "commit_count": commit_count,
        "repo_count": repo_count,
        "commits": [
            {
                "repo": c.get("repo_name"),
                "message": c.get("message"),
                "additions": c.get("additions"),
                "deletions": c.get("deletions")
            }
            for c in commits[:10]
        ]
    }

    ai_result = await generate_ai_summary(ai_context)


    # AI SUCCESS
    if ai_result:
        ai_score = ai_result.get("score", 5)

        base_score = min(10, (commit_count * 0.7) + (repo_count * 0.5))
        score = round((base_score * 0.6) + (ai_score * 0.4))
        score = max(1, min(score, 10))

        summary = "## 🚀 Daily Progress Report\n\n"
        summary += f"{ai_result.get('summary', '')}\n\n"

        summary += "### ✨ Highlights\n"
        for h in ai_result.get("highlights", []):
            summary += f"- {h}\n"

        if ai_result.get("gaps"):
            summary += "\n### ⚠️ Gaps & Blockers\n"
            for g in ai_result.get("gaps", []):
                summary += f"- {g}\n"

        summary += f"\n**Productivity Score:** {score}/10"


    # FALLBACK (No AI)
    else:
        repos = set(c.get("repo", "unknown") for c in commits)
        repo_list = ", ".join(repos)

        summary = "## 🚀 Daily Progress Report (Offline Mode)\n\n"
        summary += f"You made **{commit_count} commits** across **{len(repos)} repositories** ({repo_list}).\n\n"

        summary += "### 📋 Key Updates\n"
        for c in commits[:5]:
            summary += f"- **{c.get('repo','unknown')}**: {c.get('message','Update')}\n"

        if commit_count > 5:
            summary += f"\n*...and {commit_count - 5} more updates.*\n"

        score = min(10, commit_count)
        summary += f"\n**Productivity Score:** {score}/10"

    # 🎭 Mood Calculation
    if score >= 8:
        mood = "productive"
    elif score >= 5:
        mood = "steady"
    else:
        mood = "struggling"

    # 💾 Save to DB with analytics
    new_summary = {
        "user_id": ObjectId(user_id),
        "content": summary,
        "created_at": datetime.now(timezone.utc),
        "mood": mood,
        "stats": {
            "commit_count": commit_count,
            "repo_count": repo_count,
            "score": score
        }
    }

    await summaries_collection.insert_one(new_summary)

    return {
        "summary": summary,
        "mood": mood,
        "stats": new_summary["stats"],
        "cached": False
    }