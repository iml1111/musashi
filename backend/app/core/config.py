import os
from typing import List
from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Database
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://host.docker.internal:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "musashi")

    # JWT
    ALGORITHM: str = "HS256"

    model_config = ConfigDict(case_sensitive=True)

    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        cors_origins = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000,http://localhost:8000")
        if isinstance(cors_origins, str):
            return [i.strip() for i in cors_origins.split(",")]
        return cors_origins or ["http://localhost:3000", "http://localhost:8000"]


settings = Settings()

