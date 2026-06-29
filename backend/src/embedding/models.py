from dataclasses import dataclass

@dataclass(frozen=True)
class RerankerModel:
    model_name: str
    token_limit: int

@dataclass(frozen=True)
class EmbeddingModel:
    model_name: str
    dimensions: int
    token_limit: int
    reranker: RerankerModel = None

BGE_SMALL = EmbeddingModel(
    model_name="BAAI/bge-small-en-v1.5",
    dimensions=384,
    token_limit=512,
    reranker=RerankerModel(
        model_name="BAAI/bge-reranker-base",
        token_limit=512
    )
)

BGE_BASE = EmbeddingModel(
    model_name="BAAI/bge-base-en-v1.5",
    dimensions=768,
    token_limit=512,
    reranker=RerankerModel(
        model_name="BAAI/bge-reranker-base",
        token_limit=512
    )
)

BGE_LARGE = EmbeddingModel(
    model_name="BAAI/bge-large-en-v1.5",
    dimensions=1024,
    token_limit=512,
    reranker=RerankerModel(
        model_name="BAAI/bge-reranker-large",
        token_limit=512
    )
)

BGE_M3 = EmbeddingModel(
    model_name="BAAI/bge-m3",
    dimensions=1024,
    token_limit=8192,
    reranker=RerankerModel(
        model_name="BAAI/bge-reranker-v2-m3",
        token_limit=8192
    )
)

def get_model(model_name: str) -> EmbeddingModel:
    if model_name == "BGE_SMALL":
        return BGE_SMALL
    elif model_name == "BGE_BASE":
        return BGE_BASE
    elif model_name == "BGE_LARGE":
        return BGE_LARGE
    elif model_name == "BGE_M3":
        return BGE_M3
    else:
        raise ValueError(f"Unknown embedding model: {model_name}")