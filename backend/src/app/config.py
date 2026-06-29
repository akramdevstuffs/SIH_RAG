from functools import lru_cache
from typing import Annotated
from pydantic_settings import BaseSettings
from fastapi import Depends

class Settings(BaseSettings):
    app_name: str = "APP"

    # PostgreSQL settings
    database_url: str = "postgresql://rag:password@postgres:5432/rag"

    vector_db_url: str = "http://qdrant:6333"

    # minio settings
    minio_endpoint: str = "minio:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadminpassword"
    minio_bucket_name: str = "documents"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

SettingsDep = Annotated[Settings, Depends(get_settings)]
