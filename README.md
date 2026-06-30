# Distributed Retrieval Platform

An AI-powered Retrieval-Augmented Generation (RAG) platform for document ingestion and semantic search using FastAPI, React, Celery, PostgreSQL, Redis, and Qdrant.

## Features

- Upload PDF and text documents
- Asynchronous ingestion pipeline using Celery
- Automatic document extraction and chunking
- Semantic embeddings using BAAI/bge-m3
- Vector search with Qdrant
- Cross-encoder reranking
- PostgreSQL metadata storage
- React frontend for document upload and querying
- Dockerized deployment

## Screenshots
<!-- 
### Upload Documents

![Upload](docs/images/upload.png)

### Search

![Search](docs/images/search.png)

### Search Results -->

![Results](docs/images/results.png)

## Architecture

```mermaid
flowchart TD
    O[Download Document] --> P[FastAPI Download API]
    P --> C[(MinIO)]

    A[Upload Document] --> B[FastAPI Upload API]

    B --> C
    B --> D[Celery Task Queue]

    D --> E[Ingestion Worker]

    E --> C
    E --> F[Extract Text]
    F --> G[Generate Embeddings]

    F --> H[(PostgreSQL)]
    G --> I[(Qdrant)]

    J[Search Query] --> K[FastAPI Search API]
    K --> L[Embed Query]
    L --> I
    I --> M[Cross Encoder]
    M --> N[Ranked Results]
```

## Tech Stack

### Backend

- FastAPI
- Celery
- Redis
- PostgreSQL
- MinIO
- Qdrant
- Sentence Transformers
- Docker

### Frontend

- React
- Vite

## Project Structure

```text
backend/
    app/            FastAPI application
    ingestion/      Document extraction and indexing
    retrieval/      Search pipeline
    embedding/      Embedding and reranking models
    storage/
        blobs/      Raw document storage
        metadata/   PostgreSQL repositories
        vectors/    Qdrant repositories
    shared/         Shared Celery configuration

frontend/
    src/
        components/
        context/
        hooks/
```

## Retrieval Pipeline

1. User uploads document.
2. API stores the file in **MinIO**.
3. Celery worker download the file from MinIO.
4. Text is extracted and chunked.
5. Chunks are embedded.
6. Embeddings are indexed in Qdrant.
7. Metadata is stored in PostgreSQL.
8. During search:
   - Query embedding is generated.
   - Similar vectors are retrieved.
   - Cross-encoder reranks candidates.
   - Top passages are returned.
9. Original File can downloaded through API.

## Getting Started

### Clone

```bash
git clone https://github.com/akramdevstuffs/SIH_RAG.git
cd SIH_RAG
```


### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
docker compose build
```

### Start services

#### Start API

```bash
docker compose up api
```

#### Start Ingestion worker

```bash
docker compose up ingestion
```

## Configuration

### Backend

The backend reads configuration variables from a `.env` file located in the `backend/` directory. These variables are automatically injected into the containerized services when using Docker Compose.

You can copy the template file to get started:
```bash
cp backend/.env.example backend/.env
```

The following environment variables are supported:

- `ACTIVE_MODEL`: The active embedding model to use (default: `BGE_SMALL`). Supported values:
  - `BGE_SMALL`: Uses `BAAI/bge-small-en-v1.5` (Dimensions: 384, Token Limit: 512, Reranker: `BAAI/bge-reranker-base`)
  - `BGE_BASE`: Uses `BAAI/bge-base-en-v1.5` (Dimensions: 768, Token Limit: 512, Reranker: `BAAI/bge-reranker-base`)
  - `BGE_LARGE`: Uses `BAAI/bge-large-en-v1.5` (Dimensions: 1024, Token Limit: 512, Reranker: `BAAI/bge-reranker-large`)
  - `BGE_M3`: Uses `BAAI/bge-m3` (Dimensions: 1024, Token Limit: 8192, Reranker: `BAAI/bge-reranker-v2-m3`)
- `DATABASE_URL`: PostgreSQL connection URL (default: `postgresql://rag:password@postgres:5432/rag`).
- `VECTOR_DB_URL`: Qdrant vector database URL (default: `http://qdrant:6333`).
- `MINIO_ENDPOINT`: MinIO connection endpoint (default: `minio:9000`).
- `MINIO_ACCESS_KEY`: MinIO access key (default: `minioadmin`).
- `MINIO_SECRET_KEY`: MinIO secret key (default: `minioadminpassword`).
- `MINIO_BUCKET_NAME`: The bucket name where documents are stored (default: `documents`).
- `CELERY_BROKER_URL`: Celery broker URL (default: `redis://redis:6379/0`).
- `CELERY_BACKEND_URL`: Celery backend URL (default: `redis://redis:6379/0`).
- `REDIS_URL`: Redis URL (default: `redis://redis:6379/0`).

### Frontend

The frontend reads configuration variables loaded by Vite. Define these in the `frontend/.env` file:

- `VITE_API_URL`: The URL of the backend API service (default: `http://localhost:8000`).

## API

### Upload Document

```http
POST /upload
```

Uploads a document for asynchronous indexing.

---

### Search

```http
GET /search/{query}
```

Returns the top semantic search results.

Example response:

```json
{
  "query": "What is RAG?",
  "results": [
    {
      "id": "string"
      "content": "...",
      "score": 0.96,
      "source": "paper.pdf"
    }
  ]
}
```

---

### Download Document

```http
GET /upload/download/{file_id}
```

Streams the original uploaded document.
