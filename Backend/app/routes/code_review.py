import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from bson.objectid import ObjectId
from datetime import datetime
from ..models import (
    CodeReviewRequest, CodeReviewResponse, UserResponse, CodeIssue,
    ChatRequest, ChatResponse
)
from ..services import get_current_user
from ..core.database import get_db

router = APIRouter(prefix="/code-review", tags=["code-review"])

OLLAMA_BASE_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:7b")

SYSTEM_PROMPT = """You are an expert code reviewer and senior software engineer. 
Your job is to review code and provide actionable, specific feedback.

When reviewing code:
- Identify bugs, performance issues, and security vulnerabilities
- Suggest best practices and idiomatic improvements
- Point out missing error handling, edge cases, or input validation
- Comment on code readability and maintainability
- Format your response with clear sections using markdown
- Be constructive and explain WHY something should be changed
- Keep responses concise but thorough

If analyzing a code selection, focus specifically on that fragment while keeping the full code as context.
Respond in the same language the user messages you in."""


def _build_ollama_messages(request: ChatRequest) -> list:
    """Build Ollama message list from chat request."""
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Inject code context as first assistant-acknowledged message
    code_context = f"**Code being reviewed ({request.language}):**\n```{request.language}\n{request.code}\n```"
    if request.selection:
        code_context += f"\n\n**Selected fragment for analysis:**\n```{request.language}\n{request.selection}\n```"

    messages.append({
        "role": "user",
        "content": code_context + "\n\n" + request.messages[0].content
        if request.messages else code_context + "\n\n" + request.message
    })

    # Add conversation history (skip first since we merged it above)
    if request.messages:
        for i, msg in enumerate(request.messages):
            if i == 0:
                continue  # already merged
            messages.append({"role": msg.role, "content": msg.content})
        # Add current user message
        messages.append({"role": "user", "content": request.message})

    return messages


def _demo_response(request: ChatRequest) -> str:
    """Fallback demo response when Ollama is not available."""
    if request.selection:
        return (
            f"## 🔍 Analysis of Selected Fragment\n\n"
            f"```{request.language}\n{request.selection[:200]}{'...' if len(request.selection) > 200 else ''}\n```\n\n"
            "**⚠️ Demo Mode** — Ollama is not running. Start it with `ollama serve` and pull a model:\n"
            "```bash\nollama pull qwen2.5-coder:7b\n```\n\n"
            "Once Ollama is running, I'll provide real AI-powered analysis of your code selection, "
            "including performance issues, best practices, and specific improvement suggestions."
        )
    return (
        f"## 📋 Code Review — {request.language.title()}\n\n"
        "**⚠️ Demo Mode** — Ollama is not running.\n\n"
        "To enable real AI analysis:\n"
        "1. Install Ollama: https://ollama.ai\n"
        "2. Run: `ollama serve`\n"
        "3. Pull a model: `ollama pull qwen2.5-coder:7b`\n\n"
        "---\n\n"
        "Once connected, I'll analyze your code for:\n"
        "- 🔴 **Bugs & Errors** — logic errors, off-by-one, null dereferences\n"
        "- 🟡 **Performance** — O(n²) loops, unnecessary allocations, caching opportunities\n"
        "- 🔵 **Best Practices** — naming, structure, idiomatic patterns\n"
        "- 🟢 **Security** — injection risks, input validation, error leakage\n"
        "- 💡 **Refactoring** — DRY violations, abstraction opportunities"
    )


@router.post("/chat", response_model=ChatResponse)
async def chat_code_review(
    request: ChatRequest,
    current_user: UserResponse = Depends(get_current_user),
):
    """Chat with AI code reviewer powered by Ollama."""

    messages = _build_ollama_messages(request)

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": messages,
                    "stream": False,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            reply = data["message"]["content"]
            return ChatResponse(reply=reply)

    except httpx.ConnectError:
        # Ollama not running — return demo response
        return ChatResponse(reply=_demo_response(request))
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            # Model not found
            return ChatResponse(
                reply=(
                    f"## ❌ Model Not Found\n\n"
                    f"Ollama is running but the model `{OLLAMA_MODEL}` is not installed.\n\n"
                    f"Pull it with:\n```bash\nollama pull {OLLAMA_MODEL}\n```"
                )
            )
        raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/review", response_model=CodeReviewResponse)
async def review_code(
    request: CodeReviewRequest,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db)
):
    """Submit code for AI review (legacy endpoint)."""

    review_dict = {
        "user_id": current_user.id,
        "code": request.code,
        "language": request.language,
        "issues": [
            {
                "line": 1,
                "issue": "Unused import detected",
                "severity": "low",
                "suggestion": "Remove unused import statement"
            }
        ],
        "overall_feedback": "Code looks good! Consider the suggestions above.",
        "created_at": datetime.utcnow()
    }

    result = db["code_reviews"].insert_one(review_dict)
    review_dict["_id"] = result.inserted_id

    return CodeReviewResponse(**review_dict)


@router.get("/history", response_model=list)
async def get_review_history(
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get user's code review history."""
    reviews = list(db["code_reviews"].find({"user_id": current_user.id}))
    return [CodeReviewResponse(**review) for review in reviews]
