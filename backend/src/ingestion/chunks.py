from ingestion.config import Config
from embedding.tokenizer import Tokenizer
from embedding.models import EmbeddingModel

class Chunker:
    def __init__(self, config: Config, model: EmbeddingModel=None):
        self.config = config
        self.model = model
        self.tokenizer = Tokenizer(model) if model else None

    def chunk_by_token(self, data: str):
        parts = self._split_by_semantics(data)

        if self.config.chunk_size > self.model.token_limit:
            raise ValueError(f"Chunk size {self.config.chunk_size} exceeds the model's token limit of {self.model.token_limit}.")

        available_tokens = self.config.chunk_size - self.config.chunk_overlap
        current_chunk = ""
        for part in parts:
            part_tokens = self._token_count(part)
            if part_tokens > available_tokens:
                current_chunk += part
                available_tokens -= part_tokens
            else:
                yield current_chunk
                current_chunk = part
                available_tokens = self.config.chunk_size - self.config.chunk_overlap - part_tokens
        if current_chunk:
            yield current_chunk

    def chunk_by_text(self, data: str):
        parts = self._split_by_semantics(data)
        current_chunk = ""
        for part in parts:
            if len(current_chunk) + len(part) <= self.config.chunk_size:
                current_chunk += part
            else:
                yield current_chunk
                current_chunk = part
        if current_chunk:
            yield current_chunk
    
    def _token_count(self, text: str) -> int:
        if not self.tokenizer:
            raise ValueError("Tokenizer is not initialized. Please provide a model to initialize the tokenizer.")
        return self.tokenizer.count_tokens(text)

    def _split_by_semantics(self, text: str) -> list[str]:
        # TODO: Implement more sophisticated semantic splitting logic
        # This is a simple implementation - replace with actual semantic splitting
        return text.split('\n\n')   