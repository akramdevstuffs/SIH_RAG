from storage.vectors.models import Vector, VectorContent
from storage.vectors.repository import DocumentVectorRepository
from storage.vectors.database import VectorDB
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance

class QdrantVectorDB(VectorDB):
    def __init__(self, db_url: str):
        super().__init__(db_url)
        self.client = QdrantClient(url=db_url)
    
    def connect(self):
        # Not required just for interface
        pass
    
    def close(self):
        pass
    
    def initialize_schema(self):
        # Not required just for interface
        pass
    
    def __enter__(self) -> "QdrantVectorDB":
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

    def create_collection(self, collection_name: str, vector_size: int):
        try:
            self.client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
            )
            print(f"Collection '{collection_name}' created successfully.")
        except Exception as e:
            print(f"Error creating collection '{collection_name}': {e}")

class QdrantDocumentVectorRepository(DocumentVectorRepository):

    COLLECTION_NAME = "documents"

    def __init__(self, db: QdrantVectorDB, vector_size: int = 384):
        self.db = db
        self.vector_size = vector_size
        self._ensure_collection()
    
    def _ensure_collection(self):
        if not self.db.client.collection_exists(self.COLLECTION_NAME):
            self.db.client.create_collection(
                collection_name=self.COLLECTION_NAME,
                vectors_config=VectorParams(size=self.vector_size, distance=Distance.COSINE),
            )

    def insert_vector(self, vector: Vector) -> bool:
        try:
            self.db.client.upsert(
                collection_name=self.COLLECTION_NAME,
                points=[
                    {
                        "id": vector.id,
                        "vector": vector.vector,
                        "payload": {
                            "content": vector.content,
                            "file_id": vector.file_id,
                            "page_number": vector.page_number,
                            "file_name": vector.file_name,
                        },
                    }
                ],
            )
            return True
        except Exception as e:
            print(f"Error inserting vector: {e}")
            return False

    def search_vectors(self, query_vector: list[float], top_k: int = 5) -> list[VectorContent]:
        try:
            search_result = self.db.client.query_points(
                collection_name=self.COLLECTION_NAME,
                query=query_vector,
                limit=top_k,
            ).points
            return [
                VectorContent(
                    id=point.id,
                    content=point.payload.get("content", ""),
                    file_id=point.payload.get("file_id", ""),
                    page_number=point.payload.get("page_number"),
                    file_name=point.payload.get("file_name", "")
                )
                for point in search_result
            ]
        except Exception as e:
            print(f"Error searching vectors: {e}")
            return []