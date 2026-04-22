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


# --- Chat models ---

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    code: str
    language: str = "python"
    selection: Optional[str] = None   # highlighted code fragment (if any)
    messages: List[ChatMessage] = []  # conversation history
    message: str                      # new user message


class ChatResponse(BaseModel):
    reply: str
    role: str = "assistant"
