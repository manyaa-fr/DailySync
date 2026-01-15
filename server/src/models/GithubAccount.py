from sqlite3.dbapi2 import Timestamp
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class GitHubAccount(BaseModel):
    github_id: int
    username: str
    access_token: str
    connected_at: datetime = Field(default_factory=datetime.now(Timestamp.utcnow))