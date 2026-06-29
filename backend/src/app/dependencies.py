from fastapi import Depends
from typing import Annotated, TypeAlias
from storage.blobs.store import ObjectStore
from storage.vectors.qdrant import QdrantDocumentVectorRepository, QdrantVectorDB
from storage.vectors.database import VectorDB
from storage.vectors.repository import DocumentVectorRepository
from app.config import SettingsDep, get_settings
from functools import lru_cache
from storage.metadata.database import MetaDB
from storage.metadata.postgres import PostgresDatabase, PostgreSQLMetadataRepository, PostgreSQLContentRepository
from storage.metadata.repository import MetadataRepository, ContentRepository

from embedding.models import EmbeddingModel, get_model
from shared.config import ACTIVE_MODEL
from embedding.embedder import Embedder, BGEEmbedder
from embedding.reranker import Reranker
from retrieval.retriever import Retriever
from retrieval.service import RetrievalService


@lru_cache
def get_object_store() -> ObjectStore:
    settings = get_settings()
    store =  ObjectStore(
        endpoint=settings.minio_endpoint,
        access_key=settings.minio_access_key,
        secret_key=settings.minio_secret_key,
    )
    return store

@lru_cache
def get_vector_db() -> VectorDB:
    settings = get_settings()
    vector_db = QdrantVectorDB(settings.vector_db_url)
    return vector_db

@lru_cache
def get_document_vector_repository(db: QdrantVectorDB = Depends(get_vector_db)) -> DocumentVectorRepository:
    return QdrantDocumentVectorRepository(db, vector_size=get_model(ACTIVE_MODEL).dimensions)

@lru_cache
def get_metadata_db() -> MetaDB:
    settings = get_settings()
    db = PostgresDatabase(settings.database_url)
    db.connect()
    return db
    

def get_metadata_repository(db: PostgresDatabase = Depends(get_metadata_db)) -> MetadataRepository:
    return PostgreSQLMetadataRepository(db)

def get_content_repository(db: PostgresDatabase = Depends(get_metadata_db)) -> ContentRepository:
    return PostgreSQLContentRepository(db)

@lru_cache
def get_embedder() -> Embedder:
    settings = get_settings()
    # Initialize the embedder with the selected embedding model
    embedder = BGEEmbedder(get_model(ACTIVE_MODEL))
    embedder.load_model()
    return embedder

@lru_cache
def get_reranker() -> Reranker | None:
    embedder = get_embedder()

    if embedder.model.reranker is None:
        return None
    
    return Reranker(embedder.model.reranker)

ObjectStoreDep = Annotated[ObjectStore, Depends(get_object_store)]
MetadataRespositoryDep = Annotated[PostgreSQLMetadataRepository, Depends(get_metadata_repository)]
ContentRepositoryDep = Annotated[PostgreSQLContentRepository, Depends(get_content_repository)]
DocumentVectorRepositoryDep = Annotated[QdrantDocumentVectorRepository, Depends(get_document_vector_repository)]
EmbedderDep = Annotated[Embedder, Depends(get_embedder)]

def get_retrieval_service(
    document_vector_repository: DocumentVectorRepositoryDep,
    embedder: EmbedderDep,
    reranker: Annotated[Reranker|None, Depends(get_reranker)]
):
    # Initialize the retriever with the database handler and embedder
    retriever = Retriever(document_vector_repository, embedder)

    # Initialize the retrieval service with the retriever and reranker
    retrieval_service = RetrievalService(embedder, retriever, reranker)

    return retrieval_service

RetrievalServiceDep: TypeAlias = Annotated[RetrievalService, Depends(get_retrieval_service)]