from .auth import router as auth_router
from .courses import router as courses_router
from .code_review import router as code_review_router
from .github import router as github_router
from .profile import router as profile_router
from .attendance import router as attendance_router
from .grades import router as grades_router
from .notifications import router as notifications_router
from .admin import router as admin_router
from .professor import router as professor_router
from .deadlines import router as deadlines_router

__all__ = [
    "auth_router", "courses_router", "code_review_router", "github_router",
    "profile_router", "attendance_router", "grades_router",
    "notifications_router", "admin_router", "professor_router", "deadlines_router"
]
