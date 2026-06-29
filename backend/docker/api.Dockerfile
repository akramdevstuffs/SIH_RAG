FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml .
COPY src ./src

RUN pip install -e ".[all,dev]"

ENV PYTHONPATH=/app/src

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]