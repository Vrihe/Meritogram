"""Routes for admin panel"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from ..services.auth import get_current_user
from ..services.profile_change_service import (
    create_profile_change_request,
    get_pending_requests,
    get_request_by_id,
    approve_profile_change,
    reject_profile_change,
)
from ..models.user import UserResponse, UserRole, ProfileChangeRequestCreate, ProfileChangeRequestReview
from ..core.database import get_db

router = APIRouter(tags=["admin"])


def verify_admin(current_user: UserResponse = Depends(get_current_user)):
    """Verify that current user is admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def verify_professor(current_user: UserResponse = Depends(get_current_user)):
    """Verify that current user is professor"""
    if current_user.role not in [UserRole.PROFESSOR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Professor or Admin access required"
        )
    return current_user


# ==================== ADMIN PANEL ROUTES ====================

@router.get("/admin/profile-change-requests")
async def get_profile_change_requests(
    current_user: UserResponse = Depends(verify_admin),
    db=Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status_filter: str = Query("pending"),
):
    """Get profile change requests for admin panel"""
    if status_filter == "pending":
        requests = await get_pending_requests(db, skip, limit)
    else:
        requests = list(
            db["profile_change_requests"]
            .find({"status": status_filter})
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        result = []
        for req in requests:
            from ..services.profile_change_service import _profile_change_request_doc_to_response
            requester = db["users"].find_one({"_id": req["requested_by_id"]})
            student = db["users"].find_one({"_id": req["user_id"]})
            result.append(_profile_change_request_doc_to_response(req, requester, student))
        requests = result
    
    return {
        "requests": requests,
        "total": len(requests)
    }


@router.get("/admin/profile-change-requests/{request_id}")
async def get_profile_change_request_detail(
    request_id: str,
    current_user: UserResponse = Depends(verify_admin),
    db=Depends(get_db),
):
    """Get details of a specific profile change request"""
    try:
        request = await get_request_by_id(request_id, db)
        return request
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/admin/profile-change-requests/{request_id}/approve")
async def approve_request(
    request_id: str,
    review: ProfileChangeRequestReview,
    current_user: UserResponse = Depends(verify_admin),
    db=Depends(get_db),
):
    """Approve a profile change request"""
    if review.status != "approved":
        raise HTTPException(
            status_code=400,
            detail="Use /reject endpoint for rejecting requests"
        )
    
    try:
        updated_request = await approve_profile_change(
            request_id,
            current_user.id,
            review.comment or "",
            db
        )
        return {
            "message": "Profile change approved and applied",
            "request": updated_request
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/admin/profile-change-requests/{request_id}/reject")
async def reject_request(
    request_id: str,
    review: ProfileChangeRequestReview,
    current_user: UserResponse = Depends(verify_admin),
    db=Depends(get_db),
):
    """Reject a profile change request"""
    if review.status != "rejected":
        raise HTTPException(
            status_code=400,
            detail="Use /approve endpoint for approving requests"
        )
    
    try:
        updated_request = await reject_profile_change(
            request_id,
            current_user.id,
            review.comment or "",
            db
        )
        return {
            "message": "Profile change rejected",
            "request": updated_request
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== PROFESSOR ROUTES ====================

@router.post("/professor/profile-change-request")
async def request_profile_change(
    request_data: ProfileChangeRequestCreate,
    current_user: UserResponse = Depends(verify_professor),
    db=Depends(get_db),
):
    """Create a profile change request (professor initiates)"""
    try:
        created_request = await create_profile_change_request(
            user_id=request_data.user_id,
            requested_by_id=current_user.id,
            changes=request_data.changes,
            reason=request_data.reason,
            db=db
        )
        return {
            "message": "Profile change request created",
            "request": created_request
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
