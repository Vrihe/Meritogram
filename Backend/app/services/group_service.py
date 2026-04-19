"""Service for group management"""
from datetime import datetime
from bson.objectid import ObjectId
from ..models.group import GroupResponse, GroupWithStudents, GroupCreate, GroupUpdate
from ..models.user import UserRole


async def create_group(name: str, academic_year: str, professor_id: str, description: str = None, db=None) -> GroupResponse:
    """Create a new group"""
    group_dict = {
        "name": name,
        "academic_year": academic_year,
        "description": description,
        "professor_id": professor_id,
        "students": [],
        "created_at": datetime.utcnow(),
        "updated_at": None,
    }
    
    result = db["groups"].insert_one(group_dict)
    group_dict["_id"] = result.inserted_id
    
    return _convert_group_doc(group_dict)


async def get_professor_groups(professor_id: str, db=None, skip: int = 0, limit: int = 100) -> list:
    """Get all groups for a professor with student details"""
    groups = list(
        db["groups"]
        .find({"professor_id": professor_id})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    
    result = []
    for group in groups:
        # Get detailed student information
        students_data = []
        for student_id in group.get("students", []):
            student = db["users"].find_one({"_id": ObjectId(student_id)})
            if student:
                student["id"] = str(student["_id"])
                students_data.append({
                    "id": str(student["_id"]),
                    "email": student.get("email"),
                    "profile": student.get("profile", {}),
                    "academic": student.get("academic", {}),
                })
        
        group["students"] = students_data
        result.append(_convert_group_doc_with_students(group))
    
    return result


async def get_group_by_id(group_id: str, db=None) -> GroupWithStudents:
    """Get group by ID with student details"""
    group = db["groups"].find_one({"_id": ObjectId(group_id)})
    
    if not group:
        raise ValueError("Group not found")
    
    # Get detailed student information
    students_data = []
    for student_id in group.get("students", []):
        student = db["users"].find_one({"_id": ObjectId(student_id)})
        if student:
            students_data.append({
                "id": str(student["_id"]),
                "email": student.get("email"),
                "profile": student.get("profile", {}),
                "academic": student.get("academic", {}),
            })
    
    group["students"] = students_data
    return _convert_group_doc_with_students(group)


async def update_group(group_id: str, updates: dict, db=None) -> GroupResponse:
    """Update group information"""
    updates["updated_at"] = datetime.utcnow()
    
    result = db["groups"].update_one(
        {"_id": ObjectId(group_id)},
        {"$set": updates}
    )
    
    if result.matched_count == 0:
        raise ValueError("Group not found")
    
    group = db["groups"].find_one({"_id": ObjectId(group_id)})
    return _convert_group_doc(group)


async def add_student_to_group(group_id: str, student_id: str, db=None) -> GroupWithStudents:
    """Add student to group"""
    # Check if student exists and is a student
    student = db["users"].find_one({"_id": ObjectId(student_id), "role": UserRole.STUDENT.value})
    if not student:
        raise ValueError("Student not found")
    
    # Check if already in group
    group = db["groups"].find_one({"_id": ObjectId(group_id)})
    if not group:
        raise ValueError("Group not found")
    
    if student_id in [str(sid) if isinstance(sid, ObjectId) else sid for sid in group.get("students", [])]:
        raise ValueError("Student already in this group")
    
    # Add student to group
    db["groups"].update_one(
        {"_id": ObjectId(group_id)},
        {
            "$push": {"students": ObjectId(student_id)},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    # Return updated group
    return await get_group_by_id(group_id, db)


async def remove_student_from_group(group_id: str, student_id: str, db=None) -> GroupWithStudents:
    """Remove student from group"""
    group = db["groups"].find_one({"_id": ObjectId(group_id)})
    if not group:
        raise ValueError("Group not found")
    
    # Remove student from group
    db["groups"].update_one(
        {"_id": ObjectId(group_id)},
        {
            "$pull": {"students": ObjectId(student_id)},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return await get_group_by_id(group_id, db)


async def delete_group(group_id: str, db=None) -> dict:
    """Delete group"""
    result = db["groups"].delete_one({"_id": ObjectId(group_id)})
    
    if result.deleted_count == 0:
        raise ValueError("Group not found")
    
    return {"deleted": True, "group_id": group_id}


async def get_unassigned_students(professor_id: str, db=None) -> list:
    """Get students not assigned to any group (for the professor's groups)"""
    # Get all groups for this professor
    professor_groups = list(db["groups"].find({"professor_id": professor_id}))
    assigned_student_ids = set()
    
    for group in professor_groups:
        for sid in group.get("students", []):
            assigned_student_ids.add(str(sid) if isinstance(sid, ObjectId) else sid)
    
    # Get all students NOT assigned to any of this professor's groups
    # Only include users with role = "student" (exclude admins and professors)
    students = list(db["users"].find({
        "role": "student",  # Explicitly use string value
    }))
    unassigned = []
    
    for student in students:
        student_id_str = str(student["_id"])
        if student_id_str not in assigned_student_ids:
            unassigned.append({
                "id": student_id_str,
                "email": student.get("email"),
                "profile": student.get("profile", {}),
                "academic": student.get("academic", {}),
            })
    
    return unassigned


def _convert_group_doc(group_doc: dict) -> GroupResponse:
    """Convert MongoDB group document to GroupResponse"""
    # Create a clean copy to avoid modifying the original
    clean_doc = {}
    
    # Handle _id field
    if "_id" in group_doc:
        clean_doc["id"] = str(group_doc["_id"])
    elif "id" in group_doc:
        clean_doc["id"] = str(group_doc["id"])
    
    # Copy required fields with defaults
    clean_doc["name"] = group_doc.get("name", "")
    clean_doc["academic_year"] = group_doc.get("academic_year", "")
    clean_doc["professor_id"] = group_doc.get("professor_id", "")
    clean_doc["created_at"] = group_doc.get("created_at")
    
    # Copy optional fields
    if "description" in group_doc:
        clean_doc["description"] = group_doc["description"]
    if "updated_at" in group_doc:
        clean_doc["updated_at"] = group_doc["updated_at"]
    
    # Convert ObjectIds in students array to strings
    students = group_doc.get("students", [])
    if isinstance(students, list):
        clean_doc["students"] = [str(sid) if isinstance(sid, ObjectId) else sid for sid in students]
    else:
        clean_doc["students"] = []
    
    return GroupResponse(**clean_doc)


def _convert_group_doc_with_students(group_doc: dict) -> GroupWithStudents:
    """Convert MongoDB group document to GroupWithStudents"""
    # Create a clean copy
    clean_doc = {}
    
    # Handle _id field
    if "_id" in group_doc:
        clean_doc["id"] = str(group_doc["_id"])
    elif "id" in group_doc:
        clean_doc["id"] = str(group_doc["id"])
    
    # Copy required fields with defaults
    clean_doc["name"] = group_doc.get("name", "")
    clean_doc["academic_year"] = group_doc.get("academic_year", "")
    clean_doc["professor_id"] = group_doc.get("professor_id", "")
    clean_doc["created_at"] = group_doc.get("created_at")
    
    # Copy optional fields
    if "description" in group_doc:
        clean_doc["description"] = group_doc["description"]
    if "updated_at" in group_doc:
        clean_doc["updated_at"] = group_doc["updated_at"]
    
    # Copy students (already detailed)
    clean_doc["students"] = group_doc.get("students", [])
    
    return GroupWithStudents(**clean_doc)
