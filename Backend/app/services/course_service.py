from bson.objectid import ObjectId
from datetime import datetime
from ..models import Course, CourseCreate, CourseResponse, Grade
from ..core.database import get_db


async def create_course(user_id: str, course: CourseCreate, db) -> CourseResponse:
    """Create new course for user"""
    course_dict = {
        "user_id": user_id,
        "name": course.name,
        "code": course.code,
        "description": course.description,
        "instructor": course.instructor,
        "credits": course.credits,
        "color": course.color,
        "schedule": course.schedule,
        "room": course.room,
        "tags": course.tags,
        "total_sessions": course.total_sessions,
        "grades": [],
        "attendance": [],
        "created_at": datetime.utcnow(),
        "updated_at": None
    }
    
    result = db["courses"].insert_one(course_dict)
    course_dict["_id"] = result.inserted_id
    
    return CourseResponse(**course_dict)


async def get_user_courses(user_id: str, db) -> list:
    """Get all courses for a user"""
    courses = list(db["courses"].find({"user_id": user_id}))
    return [CourseResponse(**course) for course in courses]


async def add_grade(user_id: str, course_id: str, score: float, feedback: str = None, db=None) -> CourseResponse:
    """Add grade to course"""
    try:
        course_oid = ObjectId(course_id)
    except:
        raise ValueError("Invalid course ID")
    
    course = db["courses"].find_one({
        "_id": course_oid,
        "user_id": user_id
    })
    
    if not course:
        raise ValueError("Course not found")
    
    grade = {
        "date": datetime.utcnow(),
        "score": score,
        "feedback": feedback
    }
    
    db["courses"].update_one(
        {"_id": course_oid},
        {
            "$push": {"grades": grade},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    updated_course = db["courses"].find_one({"_id": course_oid})
    return CourseResponse(**updated_course)


async def add_attendance(user_id: str, course_id: str, db) -> CourseResponse:
    """Log attendance for course"""
    try:
        course_oid = ObjectId(course_id)
    except:
        raise ValueError("Invalid course ID")
    
    course = db["courses"].find_one({
        "_id": course_oid,
        "user_id": user_id
    })
    
    if not course:
        raise ValueError("Course not found")
    
    db["courses"].update_one(
        {"_id": course_oid},
        {
            "$push": {"attendance": datetime.utcnow()},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    updated_course = db["courses"].find_one({"_id": course_oid})
    return CourseResponse(**updated_course)
