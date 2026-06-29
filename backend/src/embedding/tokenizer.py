from transformers import AutoTokenizer
from embedding.models import EmbeddingModel

class Tokenizer:
    def __init__(self, model: EmbeddingModel):
        self.model = model
        self.tokenizer = AutoTokenizer.from_pretrained(self.model.model_name)
    
    def tokenize(self, text: str) -> list[int]:
        return self.tokenizer.encode(text, add_special_tokens=False)
    
    def count_tokens(self, text: str) -> int:
        return len(self.tokenize(text))