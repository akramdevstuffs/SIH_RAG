FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml .
COPY src ./src

RUN pip install -e ".[all,dev]"

ENV PYTHONPATH=/app/src

CMD ["celery", "-A", "shared.celery_client:celery", "worker", "--loglevel=info", "--concurrency=1"]