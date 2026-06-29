from abc import ABC, abstractmethod
from storage.metadata.models import DocumentMetadata, DocumentStatus, Content

class MetadataRepository(ABC):
    @abstractmethod
    def save_metadata(self, metadata: DocumentMetadata):
        ...

    @abstractmethod
    def update_document_status(self, file_id: str, status: DocumentStatus):
        ...

    @abstractmethod
    def get_document_metadata(self, file_id: str) -> DocumentMetadata | None:
        ...

class ContentRepository(ABC):
    @abstractmethod
    def save_content(self, content: Content):
        ...
    
    @abstractmethod
    def get_contents_by_file_id(self, file_id: str) -> list[Content]:
        ...

    @abstractmethod
    def get_content(self, uid: str) -> Content | None:
        ...