"""Routes for professor management"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from bson.objectid import ObjectId
from ..services.auth import get_current_user
from ..services.user_service import get_students, update_student_profile
from ..services.group_service import (
    create_group,
    get_professor_groups,
    get_group_by_id,
    update_group,
    add_student_to_group,
    remove_student_from_group,
    delete_group,
    get_unassigned_students,
)
from ..models.user import UserResponse, UserRole, UserProfileUpdate
from ..models.group import GroupCreate, GroupUpdate, GroupStudentAdd, GroupResponse, GroupWithStudents
from ..core.database import get_db

router = APIRouter(tags=["professor"])


def verify_professor(current_user: UserResponse = Depends(get_current_user)):
    """Verify that current user is professor or admin"""
    if current_user.role not in [UserRole.PROFESSOR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Professor or Admin access required"
        )
    return current_user


def _convert_user_doc(user_doc: dict) -> UserResponse:
    """Convert MongoDB user document to UserResponse"""
    if user_doc and "_id" in user_doc:
        user_doc["id"] = str(user_doc.pop("_id"))
    return UserResponse(**user_doc)


# ============ GROUPS ENDPOINTS ============

@router.get("/professor/groups")
async def get_groups(
    current_user: UserResponse = Depends(verify_professor),
    db=Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """Get all groups for professor with students"""
    try:
        groups = await get_professor_groups(str(current_user.id), db, skip, limit)
        return {"groups": groups, "total": len(groups)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/professor/groups", response_model=GroupResponse)
async def create_new_group(
    data: GroupCreate,
    current_user: UserResponse = Depends(verify_professor),
    db=Depends(get_db),
):
    """Create new group"""
    try:
        group = await create_group(
            name=data.name,
            academic_year=data.academic_year,
            professor_id=str(current_user.id),
            description=data.description,
            db=db,
        )
        return group
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/professor/groups/{group_id}", response_model=GroupWithStudents)
async def get_group(
    group_id: str,
    current_user: UserResponse = Depends(verify_professor),
    db=Depends(get_db),
):
    """Get group details with students"""
    try:
        group = await get_group_by_id(group_id, db)
        # Verify professor owns this group
        if group.professor_id != str(current_user.id) and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Access denied")
        return group
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/professor/groups/{group_id}", response_model=GroupResponse)
async def update_group_info(
    group_id: str,
    data: GroupUpdate,
    current_user: UserResponse = Depends(verify_professor),
    db=Depends(get_db),
):
    """Update group information"""
    try:
        # Verify professor owns this group
        group = db["groups"].find_one({"_id": ObjectId(group_id)})
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        if group["professor_id"] != str(current_user.id) and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Access denied")
        
        updates = data.model_dump(exclude_none=True)
        updated_group = await update_group(group_id, updates, db)
        return updated_group
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/professor/groups/{group_id}")
async def delete_group_endpoint(
    group_id: str,
    current_user: UserResponse = Depends(verify_professor),
    db=Depends(get_db),
):
    """Delete group"""
    try:
        # Verify professor owns this group
        group = db["groups"].find_one({"_id": ObjectId(group_id)})
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        if group["professor_id"] != str(current_user.id) and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Access denied")
        
        result = await delete_group(group_id, db)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/professor/groups/{group_id}/students", response_model=GroupWithStudents)
async def add_student_endpoint(
    group_id: str,
    data: GroupStudentAdd,
    current_user: UserResponse = Depends(verify_professor),
    db=Depends(get_db),
):
    """Add student to group"""
    try:
        # Verify professor owns this group
        group = db["groups"].find_one({"_id": ObjectId(group_id)})
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        if group["professor_id"] != str(current_user.id) and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Access denied")
        
        updated_group = await add_student_to_group(group_id, data.student_id, db)
        return updated_group
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/professor/groups/{group_id}/students/{student_id}", response_model=GroupWithStudents)
async def remove_student_endpoint(
    group_id: str,
    student_id: str,
    current_user: UserResponse = Depends(verify_professor),
    db=Depends(get_db),
):
    """Remove student from group"""
    try:
        # Verify professor owns this group
        group = db["groups"].find_one({"_id": ObjectId(group_id)})
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        if group["professor_id"] != str(current_user.id) and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Access denied")
        
        updated_group = await remove_student_from_group(group_id, student_id, db)
        return updated_group
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/professor/unassigned-students")
async def get_unassigned_students_endpoint(
    current_user: UserResponse = Depends(verify_professor),
    db=Depends(get_db),
):
    """Get students not assigned to any group"""
    try:
        students = await get_unassigned_students(str(current_user.id), db)
        return {"students": students, "total": len(students)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============ STUDENT MANAGEMENT ENDPOINTS (kept for compatibility) ============

@router.get("/professor/students")
async def get_all_students(
    current_user: UserResponse = Depends(verify_professor),
    db=Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """Get all students (professor can manage)"""
    try:
        students = await get_students(db, skip, limit)
        return {
            "students": students,
            "total": len(students)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/professor/students/{student_id}")
async def get_student_detail(
    student_id: str,
    current_user: UserResponse = Depends(verify_professor),
    db=Depends(get_db),
):
    """Get details of a specific student"""
    try:
        student = db["users"].find_one({"_id": ObjectId(student_id), "role": UserRole.STUDENT.value})
        
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        return _convert_user_doc(student)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/professor/students/{student_id}", response_model=UserResponse)
async def update_student(
    student_id: str,
    data: UserProfileUpdate,
    current_user: UserResponse = Depends(verify_professor),
    db=Depends(get_db),
):
    """Update a student's profile (professor can update)"""
    try:
        # Verify student exists
        student = db["users"].find_one({"_id": ObjectId(student_id), "role": UserRole.STUDENT.value})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Update student profile
        updates = data.model_dump(exclude_none=True)
        updated_user = await update_student_profile(student_id, updates, db)
        return updated_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
