from embedding.models import EmbeddingModel
from embedding.embedder import Embedder
from embedding.reranker import Reranker
from retrieval.retriever import Retriever
from retrieval.config import RetrievalConfig
from dataclasses import dataclass

@dataclass
class RerankedCandidate:
    id: str
    content: str
    score: float
    page_number: int | None

class RetrievalService:
    def __init__(self, embedder: Embedder, retriever: Retriever, reranker: Reranker = None, config: RetrievalConfig = RetrievalConfig()):
        self.embedder = embedder
        self.retriever = retriever
        self.reranker = reranker
        self.config = config
    

    def retrieve(self, query, top_k_retrieved: int = None, top_k_reranked: int = None) -> list[RerankedCandidate]:
        if top_k_retrieved is None:
            top_k_retrieved = self.config.top_k_vectors
        if top_k_reranked is None:
            top_k_reranked = self.config.top_k_reranked

        hits = self.retriever.retrieve(
                query,
                top_k=top_k_retrieved,
            )

        if not self.reranker or not hits:
            return hits

        # Extract text for reranker
        candidate_texts = [
            hit.content
            for hit in hits
        ]

        scores = self.reranker.rerank(query, candidate_texts, top_k=top_k_reranked)

        reranked_cadidiates = []

        max_score = max(score.score for score in scores) if scores else 0

        for score in scores:
            # Only select candidates with scores of 80% or above of max_score and threshold
            if score.score >= self.config.min_score and score.score >= 0.8*max_score:
                reranked_cadidiates.append(
                    RerankedCandidate(
                        id=hits[score.idx].id,
                        content=hits[score.idx].content,
                        score=float(score.score),
                        page_number=hits[score.idx].page_number
                    )
                )

        reranked_cadidiates.sort(key=lambda x: x.score, reverse=True)
        return reranked_cadidiates