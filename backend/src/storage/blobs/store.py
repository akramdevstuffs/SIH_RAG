from minio import Minio
from io import BytesIO
from typing import Generator

class ObjectStore:
    def __init__(self, endpoint: str, access_key: str, secret_key: str):
        self.client = Minio(endpoint, access_key=access_key, secret_key=secret_key, secure=False)

    def upload_file(self, bucket_name: str, object_name: str, file_path: str) -> str:
        # Ensure the bucket exists
        if not self.client.bucket_exists(bucket_name):
            self.client.make_bucket(bucket_name)
        
        self.client.fput_object(bucket_name, object_name, file_path)
        download_url = self.client.presigned_get_object(bucket_name, object_name)
        return download_url
    
    def upload_file_stream(self, bucket_name: str, object_name: str, file_stream: BytesIO, file_size: int) -> str:

        # Ensure the bucket exists
        if not self.client.bucket_exists(bucket_name):
            self.client.make_bucket(bucket_name)
        
        # Upload the file
        self.client.put_object(
            bucket_name=bucket_name,
            object_name=object_name,
            data=file_stream,
            length=file_size
        )

        download_url = self.client.presigned_get_object(bucket_name, object_name)
        return download_url
    
    def get_object_file(self, bucket_name: str, object_name: str, file_path: str):
        "Downloads the object to a file"
        self.client.fget_object(bucket_name, object_name, file_path)
    
    def get_object(self, bucket_name: str, object_name: str) -> bytes:
        "Returns the object as bytes"
        response = self.client.get_object(bucket_name, object_name)
        return response.read()
    
    def get_object_stream(self, bucket_name: str, object_name: str, chunk_size: int = 32*1024) -> Generator[bytes, None, None]:
        response = self.client.get_object(bucket_name, object_name)
        try:
            yield from response.stream(amt=chunk_size)
        finally:
            response.close()
            response.release_conn()
    
    def get_object_stat(self, bucket_name: str, object_name: str):
        "Returns the statistics for the object"
        return self.client.stat_object(bucket_name, object_name)