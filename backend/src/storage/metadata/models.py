from dataclasses import dataclass
from enum import Enum
from datetime import datetime

class DocumentStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    PROCESSED = "processed"
    ERROR = "error"

@dataclass(slots=True)
class DocumentMetadata:
    file_id: str
    file_name: str
    bucket_name: str
    object_name: str
    content_type: str
    time_uploaded: datetime
    file_size: int
    status: DocumentStatus = DocumentStatus.PENDING

@dataclass(slots=True)
class Content:
    id: str
    file_id: str
    content: str
    metadata: dict
