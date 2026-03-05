from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CodeIssue(BaseModel):
    line: int
    issue: str
    severity: str  # "low", "medium", "high"
    suggestion: str


class CodeReviewRequest(BaseModel):
    code: str
    language: str = "python"
    context: Optional[str] = None


class CodeReviewResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    code: str
    language: str
    issues: List[CodeIssue] = []
    overall_feedback: str
    created_at: datetime
    
    class Config:
        populate_by_name = True
