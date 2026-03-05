from fastapi import APIRouter, Depends, HTTPException
from bson.objectid import ObjectId
from datetime import datetime
from ..models import CodeReviewRequest, CodeReviewResponse, UserResponse, CodeIssue
from ..services import get_current_user
from ..core.database import get_db

router = APIRouter(prefix="/code-review", tags=["code-review"])


@router.post("/review", response_model=CodeReviewResponse)
async def review_code(
    request: CodeReviewRequest,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db)
):
    """Submit code for AI review"""
    
    # TODO: Integrate with OpenAI API for actual code review
    # For now, return a mock response
    
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
    """Get user's code review history"""
    reviews = list(db["code_reviews"].find({"user_id": current_user.id}))
    return [CodeReviewResponse(**review) for review in reviews]
