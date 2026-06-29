import os

ACTIVE_MODEL = os.environ.get("ACTIVE_MODEL", "BGE_SMALL")  # Default to BGE_SMALL if not set

CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL", "redis://redis:6379/0")
CELERY_BACKEND_URL = os.environ.get("CELERY_BACKEND_URL", "redis://redis:6379/0")