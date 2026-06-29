from abc import ABC, abstractmethod
from storage.vectors.models import Vector, VectorContent

class DocumentVectorRepository(ABC):

    @abstractmethod
    def insert_vector(self, vector: Vector) -> bool:
        pass

    @abstractmethod
    def search_vectors(self, query_vector: list[float], top_k: int = 5) -> list[VectorContent]:
        pass