from dataclasses import dataclass

@dataclass(frozen=True)
class RetrievalConfig:
    top_k_vectors: int = 30
    top_k_reranked: int = 3
    min_score: float = 0.10