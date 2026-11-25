import os
from pydantic_settings import BaseSettings

def get_db_url() -> str:
    raw = os.getenv("DATABASE_URL", "").strip()
    if raw.startswith("postgres://"):
        raw = raw.replace("postgres://", "postgresql+pg8000://", 1)
    elif raw.startswith("postgresql://") and "+pg8000" not in raw and "+psycopg2" not in raw:
        raw = raw.replace("postgresql://", "postgresql+pg8000://", 1)
    if raw:
        return raw
    return "sqlite:////tmp/edupath.db" if os.getenv("VERCEL") else "sqlite:///./edupath.db"

class Settings(BaseSettings):
    PROJECT_NAME: str = "EduPath AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = get_db_url()
    
    # Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "edupath-jwt-secure-secret-key-32chars-min-length-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # AI Engine
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Job APIs
    ADZUNA_APP_ID: str = os.getenv("ADZUNA_APP_ID", "")
    ADZUNA_APP_KEY: str = os.getenv("ADZUNA_APP_KEY", "171c50966d0d1f32a46e12efa55dea28")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
