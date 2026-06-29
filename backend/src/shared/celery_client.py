from celery import Celery
from shared.config import CELERY_BROKER_URL, CELERY_BACKEND_URL

celery = Celery('tasks', broker=CELERY_BROKER_URL, backend=CELERY_BACKEND_URL)

celery.autodiscover_tasks(['ingestion.tasks'], force=True)