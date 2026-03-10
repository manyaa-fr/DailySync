from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from models.GithubAccount import GitHubAccount

class User(BaseModel):
    id: Optional[str] = Field(alias="_id")
    fullName: str
    email: EmailStr
    password_hash: Optional[str]

    github: Optional["GitHubAccount"] = None

    is_active: bool = True
    is_verified: bool = False

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            ObjectId: str
        }

class UserProfile(BaseModel):
    """User profile data (safe to send to frontend)"""
    _id: str
    fullName: str
    email: EmailStr
    github: Optional[dict] = None  # { github_id, username, access_token, connected_at }
    profile: Optional[dict] = {
        "avatar_url": None,
        "location": "",
        "about": "",
        "skills": [],
        "social_links": {}
    }
    stats: Optional[dict] = {
        "total_commits": 0,
        "hours_logged": 0,
        "current_streak": 0,
        "last_sync_date": None
    }
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserSettings(BaseModel):
    """User settings (writable via API)"""
    notifications_enabled: bool = True
    email_digest_frequency: str = "weekly"  # daily, weekly, never
    theme_preference: str = "system"  # system, light, dark
    privacy_level: str = "private"  # public, private

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str