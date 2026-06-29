from embedding.embedder import Embedder, BGEEmbedder
from storage.vectors.repository import DocumentVectorRepository

class Retriever:
    def __init__(self, repo: DocumentVectorRepository, embedder: Embedder):
        self.document_vector_repo = repo
        self.embedder = embedder

    def retrieve(self, query: str, top_k: int = 10):
        if isinstance(self.embedder, BGEEmbedder):
            # Special handling for BGEEmbedder: prepend the query with a specific instruction for better passage retrieval
            query = f"Represent this sentence for searching relevant passages: {query}"
        query_embedding = self.embedder.embed(query)
        results = self.document_vector_repo.search_vectors(query_embedding, top_k=top_k)
        return results