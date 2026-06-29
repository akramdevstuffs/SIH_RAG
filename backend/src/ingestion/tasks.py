from shared.celery_client import celery as celery_app
from shared.tasks_name import TaskName
from ingestion.worker import Worker
from embedding.models import BGE_SMALL
from embedding.embedder import BGEEmbedder
from storage.metadata.postgres import PostgresDatabase, PostgreSQLContentRepository, PostgreSQLMetadataRepository
from storage.vectors.qdrant import QdrantVectorDB, QdrantDocumentVectorRepository
from storage.blobs.store import ObjectStore
from ingestion.config import load_config
from celery.signals import worker_process_init, worker_process_shutdown

# Example config
config = load_config()

worker_instance = None

@worker_process_init.connect
def init_worker(**kwargs):
    global worker_instance, config
    # Initialize ONCE per Celery process
    embedder = BGEEmbedder(BGE_SMALL)
    embedder.load_model()

    postgres_db = PostgresDatabase(db_url=config.postgres_url)
    postgres_db.connect()
    

    vector_db = QdrantVectorDB(db_url=config.qdrant_url)


    object_store = ObjectStore(
        endpoint=config.minio_endpoint,
        access_key=config.minio_access_key,
        secret_key=config.minio_secret_key
    )

    worker_instance = Worker(
        config=config,
        embedder=embedder,
        doc_meta_repo=PostgreSQLMetadataRepository(postgres_db),
        content_repo=PostgreSQLContentRepository(postgres_db),
        document_vector_repo=QdrantDocumentVectorRepository(vector_db, vector_size=embedder.model.dimensions),
        object_store=object_store
    )

@worker_process_shutdown.connect
def shutdown_worker(**kwargs):
    global worker_instance
    if worker_instance:
        worker_instance.close()  
    worker_instance = None

@celery_app.task(name=TaskName.PROCESS_FILE)
def process_file_task(metadata):

    assert worker_instance is not None, "Worker instance not initialized"

    return worker_instance.process_file(
        metadata
    )