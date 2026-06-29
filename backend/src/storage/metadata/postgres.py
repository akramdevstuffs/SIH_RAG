from storage.metadata.repository import MetadataRepository, ContentRepository
from storage.metadata.models import DocumentMetadata, DocumentStatus, Content
from storage.metadata.database import MetaDB
import psycopg

class PostgresDatabase(MetaDB):
    def __init__(self, db_url: str):
        super().__init__(db_url)
        self.connection = None

    def connect(self):
        self.connection = psycopg.connect(self.db_url)
        self.initialize_schema()
    
    def initialize_schema(self):
        with self.connection.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS document_metadata (
                    file_id TEXT PRIMARY KEY,
                    file_name TEXT NOT NULL,
                    bucket_name TEXT NOT NULL,
                    object_name TEXT NOT NULL,
                    content_type TEXT NOT NULL,
                    time_uploaded TIMESTAMP NOT NULL,
                    file_size BIGINT NOT NULL,
                    status TEXT NOT NULL
                )
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS document_content (
                    id TEXT PRIMARY KEY,
                    file_id TEXT REFERENCES document_metadata(file_id) 
                    ON DELETE CASCADE,
                    content TEXT,
                    metadata JSONB
                )
                """
            )
        self.connection.commit()

    def close(self):
        if self.connection:
            self.connection.close()
            self.connection = None

    def __enter__(self) -> "PostgresDatabase":
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


class PostgreSQLMetadataRepository(MetadataRepository):
    def __init__(self, db: PostgresDatabase):
        self.db = db
    
    def save_metadata(self, metadata):
        with self.db.connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO document_metadata (file_id, file_name, bucket_name,object_name, content_type, time_uploaded, file_size, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    metadata.file_id,
                    metadata.file_name,
                    metadata.bucket_name,
                    metadata.object_name,
                    metadata.content_type,
                    metadata.time_uploaded,
                    metadata.file_size,
                    metadata.status.value
                )
            )
            self.db.connection.commit()
    
    def update_document_status(self, file_id, status):
        with self.db.connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE document_metadata
                SET status = %s
                WHERE file_id = %s
                """,
                (status.value, file_id)
            )
            self.db.connection.commit()

    def get_document_metadata(self, file_id):
        with self.db.connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT file_id, file_name, bucket_name, object_name, content_type, time_uploaded, file_size, status
                FROM document_metadata
                WHERE file_id = %s
                """,
                (file_id,)
            )
            result = cursor.fetchone()
            if result:
                return DocumentMetadata(
                    file_id=result[0],
                    file_name=result[1],
                    bucket_name=result[2],
                    object_name=result[3],
                    content_type=result[4],
                    time_uploaded=result[5],
                    file_size=result[6],
                    status=DocumentStatus(result[7])
                )
            else:
                return None

class PostgreSQLContentRepository(ContentRepository):
    def __init__(self, db: PostgresDatabase):
        self.db = db
    
    def save_content(self, content):
        with self.db.connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO document_content (id, file_id, content, metadata)
                VALUES (%s, %s, %s, %s)
                """,
                (
                    content.id,
                    content.file_id,
                    content.content,
                    psycopg.types.json.Jsonb(content.metadata)
                )
            )
            self.db.connection.commit()
    
    def get_contents_by_file_id(self, file_id):
        with self.db.connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, file_id, content, metadata
                FROM document_content
                WHERE file_id = %s
                """,
                (file_id,)
            )
            results = cursor.fetchall()
            return [
                Content(
                    id=result[0],
                    file_id=result[1],
                    content=result[2],
                    metadata=result[3]
                ) for result in results
            ]
    
    def get_content(self, id):
        with self.db.connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, file_id, content, metadata
                FROM document_content
                WHERE id = %s
                """,
                (id,)
            )
            result = cursor.fetchone()
            if result:
                return Content(
                    id=result[0],
                    file_id=result[1],
                    content=result[2],
                    metadata=result[3]
                )
            else:
                return None