from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

class User(BaseModel):
    id: Optional[str] = Field(alias="_id")
    full_name: str
    email: EmailStr
    password_hash: str

    is_active: bool = True
    is_verified: bool = False

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            ObjectId: str
        }

class LoginRequest(BaseModel):
    email: EmailStr
    password: str