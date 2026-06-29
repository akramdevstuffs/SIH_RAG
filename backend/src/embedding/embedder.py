from embedding.models import EmbeddingModel
from sentence_transformers import SentenceTransformer
import torch

class Embedder:
    def __init__(self, model: EmbeddingModel):
        self.model = model
    
    def load_model(self):
        raise NotImplementedError("This method should be implemented in subclasses.")
    
    def embed(self, data) -> list[float]:
        raise NotImplementedError("This method should be implemented in subclasses.")
    
    def embed_batch(self, data: list) -> list[list[float]]:
        raise NotImplementedError("This method should be implemented in subclasses.")

class BGEEmbedder(Embedder):
    def __init__(self, model: EmbeddingModel):
        super().__init__(model)
        self.model_instance = None
    
    def load_model(self):
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model_instance = SentenceTransformer(self.model.model_name, device=device)
    
    def embed(self, data) -> list[float]:
        if self.model_instance is None:
            raise ValueError("Model is not loaded. Call load_model() first.")
        return self.model_instance.encode(data, normalize_embeddings=True).tolist()
    
    def embed_batch(self, data: list, batch_size:int = 64) -> list[list[float]]:
        if self.model_instance is None:
            raise ValueError("Model is not loaded. Call load_model() first.")
        embedding =  self.model_instance.encode(data, batch_size=batch_size, normalize_embeddings=True)
        print(f"Embedding batch of size {len(data)} with batch_size {batch_size} shape {embedding.shape}.")
        return embedding.tolist()