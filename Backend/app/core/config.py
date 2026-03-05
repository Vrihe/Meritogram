from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""
    
    # MongoDB
    MONGO_URL: str = "mongodb://localhost:27017/"
    MONGO_DB_NAME: str = "student_learning_db"
    
    # FastAPI
    API_URL: str = "http://localhost:8000"
    DEBUG: bool = True
    
    # Authentication
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OpenAI (for Code Review)
    OPENAI_API_KEY: str = ""
    
    # GitHub
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings():
    return Settings()
