from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class GithubCommit(BaseModel):
    sha: str
    message: str
    author: str
    date: datetime
    url: str


class GithubRepository(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    repo_name: str
    repo_owner: str
    repo_url: str
    commits: List[GithubCommit] = []
    last_sync: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        populate_by_name = True


class GithubRepoResponse(BaseModel):
    repo_name: str
    repo_owner: str
    repo_url: str
    commits: List[GithubCommit] = []
    last_sync: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
