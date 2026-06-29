from abc import ABC, abstractmethod

class VectorDB(ABC):
    def __init__(self, db_url: str):
        self.db_url = db_url

    @abstractmethod
    def connect(self):
        ...

    def close(self):
        ...

    def initialize_schema(self):
        ...

    @abstractmethod
    def __enter__(self) -> "VectorDB":
        ...

    @abstractmethod
    def __exit__(self, exc_type, exc_val, exc_tb):
        ...