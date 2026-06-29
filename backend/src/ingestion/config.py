import os
from dataclasses import dataclass

@dataclass
class Config:
    chunk_size: int
    chunk_overlap: int
    postgres_url: str = os.environ.get("DATABASE_URL", "postgresql://rag:password@postgres:5432/rag")
    qdrant_url: str = os.environ.get("VECTOR_DB_URL", "http://qdrant:6333")
    minio_endpoint: str = os.environ.get("MINIO_ENDPOINT", "minio:9000")
    minio_access_key: str = os.environ.get("MINIO_ACCESS_KEY", "minioadmin")
    minio_secret_key: str = os.environ.get("MINIO_SECRET_KEY", "minioadminpassword")


def load_config() -> Config:
    # In a real application, you might load this from a file or environment variables
    return Config(
        chunk_size=400,
        chunk_overlap=80,
    )