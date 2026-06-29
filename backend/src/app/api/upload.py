from typing import cast
from shared.task_dispatcher import enqueue_process_file
from io import BytesIO
from fastapi import UploadFile, File, Depends, HTTPException, APIRouter
from fastapi.responses import StreamingResponse
from app.dependencies import ObjectStoreDep, MetadataRespositoryDep
from storage.metadata.models import DocumentMetadata
from app.config import SettingsDep
from uuid import uuid4
from datetime import datetime
from app.api.schemas import UploadDocumentResponse, DocumentStatusResponse

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("/", response_model=UploadDocumentResponse)
def upload_file(store: ObjectStoreDep, meta_repo: MetadataRespositoryDep, settings: SettingsDep, file: UploadFile = File(...)):
    bucket_name = settings.minio_bucket_name
    file_name = file.filename
    if(file_name is None):
        raise HTTPException(status_code=400, detail="Invalid file name")
    suffix = file_name.split(".")[-1]
    # Generate file_id and file_name
    file_id = str(uuid4())
    object_name = f"{file_id}.{suffix}"
    # Get file size
    file.file.seek(0, 2)  # Move to the end of the file
    file_size = file.file.tell()  # Get the current position (file size)

    file.file.seek(0)

    store.upload_file_stream(bucket_name, object_name, cast(BytesIO,file.file), file_size)

    metadata = {
        "file_id": file_id,
        "file_name": file_name,
        "bucket_name": bucket_name,
        "object_name": object_name,
        "content_type": file.content_type,
        "time_uploaded": datetime.now(),
        "file_size": file_size,
    }


    meta_repo.save_metadata(DocumentMetadata(**metadata))
    enqueue_process_file(metadata)

    return UploadDocumentResponse(file_id=file_id)

@router.get("/download/{file_id}")
def download_file(store: ObjectStoreDep, meta_repo: MetadataRespositoryDep, file_id: str):
    metadata = meta_repo.get_document_metadata(file_id)
    if metadata is None:
        raise HTTPException(status_code=404, detail="File not found")
    bucket_name = metadata.bucket_name
    object_name = metadata.object_name
    response = store.get_object_stream(bucket_name, object_name)
    return StreamingResponse(
        response, 
        media_type=metadata.content_type, 
        headers={"Content-Disposition": f"attachment; filename={metadata.file_name}"}
    )

@router.get("/status/{file_id}", response_model=DocumentStatusResponse)
async def get_status(document_repo: MetadataRespositoryDep, file_id: str):
    metadata = document_repo.get_document_metadata(file_id)
    if metadata is None:
        raise HTTPException(status_code=404, detail="File not found")
    return DocumentStatusResponse(file_id=file_id, status=metadata.status.value)