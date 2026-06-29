from fastapi import FastAPI
from app.api.upload import router as upload_router
from app.api.search import router as search_router
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager

from app.dependencies import (
    get_embedder,
    get_reranker,
    get_vector_db,
    get_metadata_db,
    get_object_store
)

# Load resources on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    get_object_store()
    get_vector_db()
    get_metadata_db()
    get_embedder()
    get_reranker()

    print("Application is starting")
    yield
    print("Application is closing")

app = FastAPI(lifespan=lifespan)
app.include_router(upload_router)
app.include_router(search_router)

# Cors setings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
async def root():
    return {"message": "api running"}