from bson.objectid import ObjectId
from datetime import datetime


async def get_deadlines(user_id: str, db, course_id: str = None) -> list:
    """Get upcoming deadlines for a user, optionally filtered by course."""
    query = {"user_id": user_id}
    # Only get upcoming deadlines or both? We'll return all, and frontend can filter.
    if course_id:
        query["course_id"] = course_id

    records = list(db["deadlines"].find(query).sort("due", 1))

    result = []
    for r in records:
        course = db["courses"].find_one({"_id": ObjectId(r["course_id"])}) if r.get("course_id") else None
        
        result.append({
            "_id": str(r["_id"]),
            "user_id": r["user_id"],
            "course_id": r["course_id"],
            "task": r["task"],
            "due": r["due"],
            "urgent": r.get("urgent", False),
            "credits": r.get("credits", 0),
            "course_code": course.get("code", "") if course else "",
            "course_name": course.get("name", "") if course else "",
            "created_at": r.get("created_at", r["due"]),
        })
    return result


async def create_deadline(user_id: str, data: dict, db) -> dict:
    """Create a deadline record."""
    record = {
        "user_id": user_id,
        "course_id": data["course_id"],
        "task": data["task"],
        "due": data["due"],
        "urgent": data.get("urgent", False),
        "credits": data.get("credits", 0),
        "created_at": datetime.utcnow(),
    }
    
    result = db["deadlines"].insert_one(record)
    record["_id"] = str(result.inserted_id)
    return record
