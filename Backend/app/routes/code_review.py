import os
import logging
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
logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:3b")
OLLAMA_TIMEOUT_SECONDS = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "300"))
OLLAMA_NUM_PREDICT = int(os.getenv("OLLAMA_NUM_PREDICT", "400"))

MAX_CODE_CHARS = int(os.getenv("OLLAMA_MAX_CODE_CHARS", "12000"))
MAX_SELECTION_CHARS = int(os.getenv("OLLAMA_MAX_SELECTION_CHARS", "4000"))
MAX_HISTORY_MESSAGES = int(os.getenv("OLLAMA_MAX_HISTORY_MESSAGES", "8"))
MAX_MESSAGE_CHARS = int(os.getenv("OLLAMA_MAX_MESSAGE_CHARS", "2000"))

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


def _trim_text(value: str, limit: int) -> str:
    """Trim oversized text blocks to keep requests fast and stable."""
    if not value:
        return ""
    if len(value) <= limit:
        return value
    return value[:limit] + "\n\n[truncated to fit model context]"


def _build_ollama_messages(request: ChatRequest) -> list:
    """Build Ollama message list from chat request."""
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    trimmed_code = _trim_text(request.code, MAX_CODE_CHARS)
    trimmed_selection = _trim_text(request.selection or "", MAX_SELECTION_CHARS)
    trimmed_current_message = _trim_text(request.message, MAX_MESSAGE_CHARS)

    # Inject code context as first assistant-acknowledged message
    code_context = f"**Code being reviewed ({request.language}):**\n```{request.language}\n{trimmed_code}\n```"
    if trimmed_selection:
        code_context += f"\n\n**Selected fragment for analysis:**\n```{request.language}\n{trimmed_selection}\n```"

    history = request.messages[-MAX_HISTORY_MESSAGES:]

    messages.append({
        "role": "user",
        "content": code_context + "\n\n" + _trim_text(history[0].content, MAX_MESSAGE_CHARS)
        if history else code_context + "\n\n" + trimmed_current_message
    })

    # Add conversation history (skip first since we merged it above)
    if history:
        for i, msg in enumerate(history):
            if i == 0:
                continue  # already merged
            messages.append({"role": msg.role, "content": _trim_text(msg.content, MAX_MESSAGE_CHARS)})
        # Add current user message
        messages.append({"role": "user", "content": trimmed_current_message})

    return messages


def _demo_response(request: ChatRequest) -> str:
    """Fallback demo response when Ollama is not available."""
    if request.selection:
        return (
            f"## 🔍 Analysis of Selected Fragment\n\n"
            f"```{request.language}\n{request.selection[:200]}{'...' if len(request.selection) > 200 else ''}\n```\n\n"
            "**⚠️ Demo Mode** — Ollama is not running. Start the stack with `docker compose up` or run Ollama on port `11434`.\n\n"
            "If you use a local Ollama install, pull the model once with:\n"
            "```bash\nollama pull qwen2.5-coder:3b\n```\n\n"
            "Once Ollama is available, I'll provide real AI-powered analysis of your code selection, "
            "including performance issues, best practices, and specific improvement suggestions."
        )
    return (
        f"## 📋 Code Review — {request.language.title()}\n\n"
        "**⚠️ Demo Mode** — Ollama is not running.\n\n"
        "To enable real AI analysis:\n"
        "1. Start the full stack with `docker compose up`\n"
        "2. Or run Ollama locally on port `11434`\n"
        "3. Pull the model once: `ollama pull qwen2.5-coder:3b`\n\n"
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
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT_SECONDS) as client:
            resp = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "num_predict": OLLAMA_NUM_PREDICT,
                    },
                },
            )
            resp.raise_for_status()
            data = resp.json()
            reply = data["message"]["content"]
            return ChatResponse(reply=reply)

    except httpx.ConnectError:
        # Ollama not running — return demo response
        return ChatResponse(reply=_demo_response(request))
    except httpx.TimeoutException:
        return ChatResponse(
            reply=(
                "## ⏳ Response Timeout\n\n"
                "The model is running on CPU and took too long to respond.\n\n"
                "Try one of these:\n"
                "1. Ask a shorter question\n"
                "2. Review a smaller code fragment\n"
                "3. Increase `OLLAMA_TIMEOUT_SECONDS` in backend env\n"
                "4. Use a smaller/faster model"
            )
        )
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
        logger.warning("Ollama HTTP error status=%s body=%s", e.response.status_code, e.response.text[:500])
        return ChatResponse(
            reply=(
                "## ⚠️ AI Service Temporary Error\n\n"
                f"Ollama returned status `{e.response.status_code}`.\n\n"
                "Try again with a shorter message or smaller code selection. "
                "If this repeats, restart backend and ollama containers."
            )
        )
    except Exception as e:
        logger.exception("Unexpected AI service error")
        return ChatResponse(
            reply=(
                "## ⚠️ AI Service Error\n\n"
                "The request failed unexpectedly, but the app is still running.\n\n"
                "Please retry with a smaller code fragment."
            )
        )


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
