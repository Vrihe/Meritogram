"""
Seed script: creates a demo user with courses, attendance, and grades.
Run: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from pymongo import MongoClient
from datetime import datetime, timedelta
from app.core.config import get_settings
from app.services.auth import hash_password

settings = get_settings()


def seed():
    client = MongoClient(settings.MONGO_URL, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")
    db = client[settings.MONGO_DB_NAME]
    print(f"Connected to MongoDB: {settings.MONGO_DB_NAME}")

    # Clear existing data
    db["users"].delete_many({})
    db["courses"].delete_many({})
    db["attendance"].delete_many({})
    db["grades"].delete_many({})
    db["deadlines"].delete_many({})
    print("Cleared existing data")

    # --- Create demo user ---
    user_doc = {
        "email": "alex.johnson@university.edu",
        "password_hash": hash_password("password123"),
        "profile": {
            "full_name": "Alex Johnson",
            "student_id": "CS-2023-0047",
            "major": "Computer Science",
            "photo_url": "",
        },
        "notifications": {
            "email_notifications": True,
            "push_notifications": True,
            "grade_updates": True,
            "assignment_reminders": True,
        },
        "academic": {
            "year": "3rd Year",
            "gpa_target": 4.0,
            "attendance_pct": 78,
        },
        "security": {
            "two_factor_enabled": True,
            "active_sessions": [],
        },
        "app_settings": {
            "dark_mode": False,
        },
        "created_at": datetime.utcnow(),
        "updated_at": None,
    }
    user_result = db["users"].insert_one(user_doc)
    user_id = str(user_result.inserted_id)
    print(f"Created user: {user_doc['email']} (id: {user_id})")

    # --- Create courses ---
    courses_data = [
        {
            "name": "Data Structures & Algorithms",
            "code": "CS 301",
            "instructor": "Dr. Sarah Chen",
            "color": "#422beb",
            "credits": 4,
            "total_sessions": 28,
            "schedule": "Mon / Wed 10:00-11:30",
            "room": "ENG 214",
            "tags": ["Core", "Lab Required"],
            "description": "Comprehensive study of fundamental data structures and algorithm design techniques.",
        },
        {
            "name": "Machine Learning Fundamentals",
            "code": "CS 415",
            "instructor": "Prof. Marcus Wright",
            "color": "#5037e8",
            "credits": 3,
            "total_sessions": 26,
            "schedule": "Tue / Thu 14:00-15:30",
            "room": "SCI 108",
            "tags": ["Elective", "Python"],
            "description": "Introduction to supervised, unsupervised learning with Python and scikit-learn.",
        },
        {
            "name": "Operating Systems",
            "code": "CS 350",
            "instructor": "Dr. Priya Patel",
            "color": "#5845ff",
            "credits": 3,
            "total_sessions": 25,
            "schedule": "Mon / Wed / Fri 09:00-10:00",
            "room": "COMP 301",
            "tags": ["Core", "C/C++"],
            "description": "Process management, memory systems, filesystems, and concurrency.",
        },
        {
            "name": "Database Management",
            "code": "CS 380",
            "instructor": "Prof. Alan Torres",
            "color": "#624dfa",
            "credits": 3,
            "total_sessions": 27,
            "schedule": "Tue / Thu 10:00-11:30",
            "room": "ENG 102",
            "tags": ["Core", "SQL"],
            "description": "Relational databases, SQL, normalization, transactions, and NoSQL systems.",
        },
        {
            "name": "Computer Networks",
            "code": "CS 420",
            "instructor": "Dr. Linda Zhao",
            "color": "#7059f8",
            "credits": 3,
            "total_sessions": 24,
            "schedule": "Mon / Wed 13:00-14:30",
            "room": "NET 205",
            "tags": ["Elective", "Lab Required"],
            "description": "Network protocols, TCP/IP stack, socket programming, and network security basics.",
        },
    ]

    course_ids = {}
    for c in courses_data:
        doc = {
            **c,
            "user_id": user_id,
            "grades": [],
            "attendance": [],
            "created_at": datetime.utcnow(),
            "updated_at": None,
        }
        result = db["courses"].insert_one(doc)
        course_ids[c["code"]] = str(result.inserted_id)
    print(f"Created {len(courses_data)} courses")

    # --- Create attendance records ---
    attendance_data = [
        {"code": "CS 301", "date": "2026-03-06", "status": "present", "notes": ""},
        {"code": "CS 415", "date": "2026-03-06", "status": "late", "notes": "Arrived 10 min late"},
        {"code": "CS 301", "date": "2026-03-05", "status": "present", "notes": ""},
        {"code": "CS 350", "date": "2026-03-05", "status": "absent", "notes": "Sick leave"},
        {"code": "CS 380", "date": "2026-03-04", "status": "present", "notes": ""},
        {"code": "CS 420", "date": "2026-03-04", "status": "present", "notes": ""},
        {"code": "CS 301", "date": "2026-03-03", "status": "present", "notes": ""},
        {"code": "CS 415", "date": "2026-03-03", "status": "present", "notes": ""},
    ]

    for a in attendance_data:
        db["attendance"].insert_one({
            "user_id": user_id,
            "course_id": course_ids[a["code"]],
            "date": datetime.fromisoformat(a["date"]),
            "status": a["status"],
            "notes": a["notes"],
            "created_at": datetime.utcnow(),
        })
    print(f"Created {len(attendance_data)} attendance records")

    # --- Create grade records ---
    grade_data = [
        {"code": "CS 301", "history": [78, 82, 85, 88, 91, 92],
         "names": ["Quiz 1", "Assignment 1", "Midterm", "Assignment 2", "Quiz 2", "Assignment 3"]},
        {"code": "CS 415", "history": [80, 79, 83, 85, 86, 87],
         "names": ["Lab 1", "Quiz 1", "Midterm", "Lab 2", "Assignment 1", "Lab 3"]},
        {"code": "CS 350", "history": [70, 72, 74, 76, 77, 78],
         "names": ["Quiz 1", "Lab 1", "Midterm", "Assignment 1", "Lab 2", "Quiz 2"]},
        {"code": "CS 380", "history": [88, 90, 91, 93, 94, 95],
         "names": ["Quiz 1", "SQL Lab", "Midterm", "Project Phase 1", "Quiz 2", "Project Phase 2"]},
        {"code": "CS 420", "history": [75, 76, 78, 80, 81, 82],
         "names": ["Lab 1", "Quiz 1", "Midterm", "Lab 2", "Assignment 1", "Lab 3"]},
    ]

    total_grades = 0
    base_date = datetime(2026, 1, 15)
    for gd in grade_data:
        for i, score in enumerate(gd["history"]):
            date = base_date + timedelta(days=i * 10)
            db["grades"].insert_one({
                "user_id": user_id,
                "course_id": course_ids[gd["code"]],
                "name": gd["names"][i],
                "score": score,
                "max_score": 100,
                "weight": round(100 / len(gd["history"])),
                "feedback": "",
                "date": date,
                "created_at": datetime.utcnow(),
            })
            total_grades += 1
    print(f"Created {total_grades} grade records")

    # --- Create deadline records ---
    deadline_data = [
        {"code": "CS 301", "task": "Project Proposal", "due_days": 2, "urgent": True, "credits": 15},
        {"code": "CS 415", "task": "Lab 4 — Neural Nets", "due_days": 4, "urgent": False, "credits": 20},
        {"code": "CS 420", "task": "Network Simulation Report", "due_days": 5, "urgent": False, "credits": 10},
        {"code": "CS 350", "task": "Process Scheduling Quiz", "due_days": 7, "urgent": False, "credits": 5},
    ]

    now = datetime.utcnow()
    for d in deadline_data:
        db["deadlines"].insert_one({
            "user_id": user_id,
            "course_id": course_ids[d["code"]],
            "task": d["task"],
            "due": now + timedelta(days=d["due_days"]),
            "urgent": d["urgent"],
            "credits": d["credits"],
            "created_at": now,
        })
    print(f"Created {len(deadline_data)} deadline records")

    client.close()
    print("\nSeed complete!")
    print(f"  Login: alex.johnson@university.edu / password123")


if __name__ == "__main__":
    seed()
