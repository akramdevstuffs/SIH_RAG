from .extractor import PDFExtractor, WordExtractor, ImageExtractor, ExtractedData
from embedding.embedder import Embedder
from .chunks import Chunker
from storage.metadata.repository import ContentRepository, MetadataRepository
from storage.metadata.models import Content, DocumentStatus
from storage.vectors.repository import DocumentVectorRepository
from storage.blobs.store import ObjectStore
from storage.vectors.models import Vector
from uuid import uuid4
from ingestion.utility import download_file
import tempfile
import os

class Worker:
    def __init__(
            self, 
            config, 
            embedder: Embedder, 
            doc_meta_repo: MetadataRepository,
            content_repo: ContentRepository, 
            document_vector_repo: DocumentVectorRepository, 
            object_store: ObjectStore
        ):
        self.config = config
        self.chunker = Chunker(config, embedder.model)
        self.embedder = embedder
        self.doc_meta_repo = doc_meta_repo
        self.content_repo = content_repo
        self.object_store = object_store
        self.document_vector_repo = document_vector_repo
    
    def close(self):
        pass
    
    def _get_extractor(self, file_type):
        if file_type == "pdf":
            return PDFExtractor(self.config)
        elif file_type == "docx":
            return WordExtractor(self.config)
        elif file_type in ["jpg", "jpeg", "png"]:
            return ImageExtractor(self.config)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")

    def process_file(self, metadata) -> bool:

        # Mark as processing
        self.doc_meta_repo.update_document_status(metadata['file_id'], DocumentStatus.PROCESSING)

        # Returns a tuple of (embedding_page_mapping, text_page_mapping)
        # Use the extractor to process the file and return the extracted data
        file_extension = os.path.splitext(metadata["object_name"])[-1][1:].lower()
        with tempfile.NamedTemporaryFile(
            delete=False, suffix=f".{file_extension}"
        ) as tmp:
            file_path = tmp.name
        
        self.object_store.get_object_file(metadata["bucket_name"], metadata["object_name"], file_path)

        extracted_data = self._get_extractor(file_extension).extract(file_path)
        text_chunks = []
        text_page_mapping = []
        for text in extracted_data.texts:
            text_chunks.extend(self.chunker.chunk_by_token(text.text))
            text_page_mapping.extend([text.page for chunk in self.chunker.chunk_by_token(text.text)])
        
        # Unlink the file so it can get removed
        os.unlink(file_path)

        # Run inference in batches
        embedding = self.embedder.embed_batch(text_chunks)
        
        # Save it to the database
        for i, chunk in enumerate(text_chunks):
            if chunk.strip() == "":
                continue
            id = str(uuid4())
            embedding_vector = embedding[i]

            content = Content(
                id=id,
                file_id=metadata['file_id'],
                content=chunk,
                metadata={"page": text_page_mapping[i] }
            )
            
            # TODO: Implement batch insertion for databases
            self.content_repo.save_content(content)
            vector = Vector(
                id = id,
                vector = embedding_vector,
                file_id = metadata['file_id'],
                content = chunk,
                page_number = text_page_mapping[i],
                file_name = metadata['file_name']
            )
            result = self.document_vector_repo.insert_vector(vector)
            if not result:
                print(f"Failed to insert embedding for chunk {i}")
                # Mark the document as failed
                self.doc_meta_repo.update_document_status(metadata['file_id'], DocumentStatus.ERROR)
                return False
        
        # Mark as processed
        self.doc_meta_repo.update_document_status(metadata['file_id'], DocumentStatus.PROCESSED)

        return True