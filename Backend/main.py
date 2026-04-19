from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core import connect_db, close_db
from app.routes import (
    auth_router, courses_router, code_review_router, github_router,
    profile_router, attendance_router, grades_router,
    notifications_router, admin_router, professor_router,
)


# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()
    yield
    # Shutdown
    await close_db()


# Create FastAPI app
app = FastAPI(
    title="Student Learning Dashboard API",
    description="Backend API for Student Learning & Code Review Dashboard",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:7777",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth")
app.include_router(profile_router, prefix="/api")
app.include_router(courses_router, prefix="/api")
app.include_router(attendance_router, prefix="/api")
app.include_router(grades_router, prefix="/api")
app.include_router(code_review_router, prefix="/api")
app.include_router(github_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(professor_router, prefix="/api")


@app.get("/", tags=["root"])
async def read_root():
    """Root endpoint"""
    return {
        "message": "Student Learning Dashboard API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
