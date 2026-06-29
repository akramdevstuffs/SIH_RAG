from fastapi import APIRouter
from app.dependencies import RetrievalServiceDep
from app.api.schemas import SearchResponse

router = APIRouter(
    prefix="/search",
    tags=["Search"]
)

@router.get("/{query}", response_model=SearchResponse)
def search(query: str, retrieval_service: RetrievalServiceDep):

    results = retrieval_service.retrieve(query)
    return {"query": query, "results": results}