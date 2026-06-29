from dataclasses import dataclass


@dataclass(slots=True)
class VectorContent:
    id: str
    content: str
    file_id: str
    page_number: int | None
    file_name: str

@dataclass(slots=True)
class Vector:
    id: str
    vector: list[float]
    content: str
    file_id: str
    page_number: int | None
    file_name: str