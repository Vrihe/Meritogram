from .auth import router as auth_router
from .courses import router as courses_router
from .code_review import router as code_review_router
from .github import router as github_router
from .profile import router as profile_router
from .attendance import router as attendance_router
from .grades import router as grades_router

__all__ = [
    "auth_router", "courses_router", "code_review_router", "github_router",
    "profile_router", "attendance_router", "grades_router",
]
