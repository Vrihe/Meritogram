from bson.objectid import ObjectId
from datetime import datetime


async def get_grades(user_id: str, db, course_id: str = None) -> list:
    """Get grade records for a user, optionally filtered by course."""
    query = {"user_id": user_id}
    if course_id:
        query["course_id"] = course_id

    records = list(db["grades"].find(query).sort("date", -1))

    result = []
    for r in records:
        course = db["courses"].find_one({"_id": ObjectId(r["course_id"])}) if r.get("course_id") else None
        result.append({
            "_id": str(r["_id"]),
            "user_id": r["user_id"],
            "course_id": r["course_id"],
            "name": r["name"],
            "score": r["score"],
            "max_score": r.get("max_score", 100),
            "weight": r.get("weight", 0),
            "feedback": r.get("feedback", ""),
            "date": r["date"],
            "course_code": course.get("code", "") if course else "",
            "course_name": course.get("name", "") if course else "",
            "created_at": r.get("created_at", r["date"]),
        })
    return result


async def create_grade(user_id: str, data: dict, db) -> dict:
    """Create a grade record."""
    record = {
        "user_id": user_id,
        "course_id": data["course_id"],
        "name": data["name"],
        "score": data["score"],
        "max_score": data.get("max_score", 100),
        "weight": data.get("weight", 0),
        "feedback": data.get("feedback", ""),
        "date": datetime.utcnow(),
        "created_at": datetime.utcnow(),
    }
    result = db["grades"].insert_one(record)
    record["_id"] = str(result.inserted_id)

    course = db["courses"].find_one({"_id": ObjectId(data["course_id"])})
    record["course_code"] = course.get("code", "") if course else ""
    record["course_name"] = course.get("name", "") if course else ""
    return record


async def update_grade(user_id: str, grade_id: str, data: dict, db) -> dict:
    """Update a grade record."""
    set_fields = {}
    for key in ("name", "score", "max_score", "weight", "feedback"):
        if key in data and data[key] is not None:
            set_fields[key] = data[key]

    if not set_fields:
        raise ValueError("No valid fields to update")

    db["grades"].update_one(
        {"_id": ObjectId(grade_id), "user_id": user_id},
        {"$set": set_fields},
    )

    record = db["grades"].find_one({"_id": ObjectId(grade_id)})
    if not record:
        raise ValueError("Grade not found")

    course = db["courses"].find_one({"_id": ObjectId(record["course_id"])}) if record.get("course_id") else None
    return {
        "_id": str(record["_id"]),
        "user_id": record["user_id"],
        "course_id": record["course_id"],
        "name": record["name"],
        "score": record["score"],
        "max_score": record.get("max_score", 100),
        "weight": record.get("weight", 0),
        "feedback": record.get("feedback", ""),
        "date": record["date"],
        "course_code": course.get("code", "") if course else "",
        "course_name": course.get("name", "") if course else "",
        "created_at": record.get("created_at", record["date"]),
    }


async def delete_grade(user_id: str, grade_id: str, db) -> bool:
    """Delete a grade record."""
    result = db["grades"].delete_one(
        {"_id": ObjectId(grade_id), "user_id": user_id}
    )
    if result.deleted_count == 0:
        raise ValueError("Grade not found")
    return True
