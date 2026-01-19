from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId


# ------------------ REPO SNAPSHOT ------------------

class GitHubRepoSnapshot(BaseModel):
    repo_id: int
    name: str
    full_name: str
    is_private: bool = False

    class Config:
        frozen = True  # repo identity never changes


# ------------------ COMMIT SNAPSHOT ------------------

class GitHubCommitSnapshot(BaseModel):
    repo_id: int
    repo_name: str
    sha: str
    message: str
    committed_at: datetime
    additions: Optional[int] = None
    deletions: Optional[int] = None

    class Config:
        frozen = True  # commits are immutable
