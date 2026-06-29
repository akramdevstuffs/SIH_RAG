from sentence_transformers import CrossEncoder
from embedding.models import RerankerModel
from dataclasses import dataclass
import torch


class Reranker:
    def __init__(self, model: RerankerModel):
        self.model = model
        self.reranker = CrossEncoder(self.model.model_name, 
                                     max_length=self.model.token_limit,
                                     device='cuda' if torch.cuda.is_available() else 'cpu',
                                    )

    @dataclass(frozen=True)
    class RerankResult:
        idx: int
        score: float

    def rerank(self, query: str, candidates: list[str], top_k: int) -> list[RerankResult]:
        """
        Rerank the candidate documents based on their relevance to the query.

        Args:
            query (str): The input query string.
            candidates (list): A list of candidate documents to be reranked.
            top_k (int): The number of top-ranked documents to return.

        Returns:
            list: A list of reranked candidate documents.
        """

        results = self.reranker.rank(
            query=query,
            documents=candidates,
            top_k=top_k,
            return_documents=False
        )

        return [Reranker.RerankResult(idx=int(result['corpus_id']), score=float(result['score'])) for result in results]

    
    def score(self, query: str, candidate: str) -> float:
        """
        Score a single candidate document based on its relevance to the query.

        Args:
            query (str): The input query string.
            candidate (str): A single candidate document to be scored.

        Returns:
            float: The relevance score of the candidate document.
        """
        score = self.reranker.predict([(query, candidate)])[0]
        return float(score)