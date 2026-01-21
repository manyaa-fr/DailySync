from fastapi import APIRouter, Request, HTTPException
from config.db import db
from schemas.time_logs import TimeLogCreate, TimeLogResponse
from bson import ObjectId
from typing import List, Dict, Any
import uuid

router = APIRouter(prefix="/api/v1/time", tags=["time"])
time_logs_collection = db["time_logs"]

@router.get("/logs")
async def get_time_logs(request: Request):
    user_id = request.state.user_id
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Fetch recent logs for the list
    cursor = time_logs_collection.find({"user_id": ObjectId(user_id)}).sort("date", -1).limit(50)
    recent_logs_docs = await cursor.to_list(length=50)

    recent_logs = []
    for log in recent_logs_docs:
        recent_logs.append({
            "id": str(log["_id"]),
            "project": log.get("project", "Unknown"),
            "description": log.get("description", ""),
            "minutes": log.get("minutes", 0),
            "date": log.get("date", ""),
            "startTime": log.get("startTime"),
            "endTime": log.get("endTime"),
            "isDeepWork": log.get("isDeepWork", False),
            "source": log.get("source", "synced"),
            "tags": log.get("tags", [])
        })

    # Aggregate distribution (all time)
    pipeline = [
        {"$match": {"user_id": ObjectId(user_id)}},
        {"$group": {"_id": "$project", "totalMinutes": {"$sum": "$minutes"}}}
    ]
    agg_results = await time_logs_collection.aggregate(pipeline).to_list(length=None)
    
    distribution = [
        {"project": res["_id"], "minutes": res["totalMinutes"]}
        for res in agg_results
    ]

    return {
        "distribution": distribution,
        "recentLogs": recent_logs
    }

@router.post("/logs")
async def create_time_log(request: Request, log: TimeLogCreate):
    user_id = request.state.user_id
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    new_log = log.dict()
    new_log["user_id"] = ObjectId(user_id)
    # Ensure we use a consistent date format or rely on what's passed
    # Schema says date is str (YYYY-MM-DD)

    result = await time_logs_collection.insert_one(new_log)
    
    return {
        "id": str(result.inserted_id),
        "project": new_log["project"],
        "description": new_log["description"],
        "minutes": new_log["minutes"],
        "date": new_log["date"],
        "startTime": new_log.get("startTime"),
        "endTime": new_log.get("endTime"),
        "isDeepWork": new_log.get("isDeepWork", False),
        "source": new_log.get("source", "synced"),
        "tags": new_log.get("tags", [])
    }