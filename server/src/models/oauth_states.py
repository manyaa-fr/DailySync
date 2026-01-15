from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from typing import Optional
from bson import ObjectId


class OAuthState(BaseModel):
    id: Optional[str] = Field(alias="_id")

    state: str
    user_id: str

    expires_at: datetime = Field(
        default_factory=lambda: datetime.utcnow() + timedelta(minutes=5)
    )

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str
        }