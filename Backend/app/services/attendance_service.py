from bson.objectid import ObjectId
from datetime import datetime


async def get_attendance(user_id: str, db, course_id: str = None) -> list:
    """Get attendance records for a user, optionally filtered by course."""
    query = {"user_id": user_id}
    if course_id:
        query["course_id"] = course_id

    records = list(db["attendance"].find(query).sort("date", -1))

    result = []
    for r in records:
        # Enrich with course info
        course = db["courses"].find_one({"_id": ObjectId(r["course_id"])}) if r.get("course_id") else None
        result.append({
            "_id": str(r["_id"]),
            "user_id": r["user_id"],
            "course_id": r["course_id"],
            "date": r["date"],
            "status": r["status"],
            "notes": r.get("notes", ""),
            "course_code": course.get("code", "") if course else "",
            "course_name": course.get("name", "") if course else "",
            "created_at": r.get("created_at", r["date"]),
        })
    return result


async def create_attendance(user_id: str, data: dict, db) -> dict:
    """Create an attendance record."""
    record = {
        "user_id": user_id,
        "course_id": data["course_id"],
        "date": data["date"],
        "status": data["status"],
        "notes": data.get("notes", ""),
        "created_at": datetime.utcnow(),
    }
    result = db["attendance"].insert_one(record)
    record["_id"] = str(result.inserted_id)

    course = db["courses"].find_one({"_id": ObjectId(data["course_id"])})
    record["course_code"] = course.get("code", "") if course else ""
    record["course_name"] = course.get("name", "") if course else ""
    return record


async def update_attendance(user_id: str, record_id: str, data: dict, db) -> dict:
    """Update an attendance record."""
    set_fields = {}
    if "status" in data and data["status"] is not None:
        set_fields["status"] = data["status"]
    if "notes" in data and data["notes"] is not None:
        set_fields["notes"] = data["notes"]

    if not set_fields:
        raise ValueError("No valid fields to update")

    db["attendance"].update_one(
        {"_id": ObjectId(record_id), "user_id": user_id},
        {"$set": set_fields},
    )

    record = db["attendance"].find_one({"_id": ObjectId(record_id)})
    if not record:
        raise ValueError("Record not found")

    course = db["courses"].find_one({"_id": ObjectId(record["course_id"])}) if record.get("course_id") else None
    return {
        "_id": str(record["_id"]),
        "user_id": record["user_id"],
        "course_id": record["course_id"],
        "date": record["date"],
        "status": record["status"],
        "notes": record.get("notes", ""),
        "course_code": course.get("code", "") if course else "",
        "course_name": course.get("name", "") if course else "",
        "created_at": record.get("created_at", record["date"]),
    }
