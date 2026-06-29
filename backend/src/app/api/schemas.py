from pydantic import BaseModel

class UploadDocumentResponse(BaseModel):
    file_id: str

class DocumentStatusResponse(BaseModel):
    file_id: str
    status: str

class SearchResult(BaseModel):
    id: str
    content: str
    score: float
    page_number: int | None

class SearchResponse(BaseModel):
    query: str
    results: list[SearchResult]