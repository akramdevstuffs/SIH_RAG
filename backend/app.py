from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from ingestor import ingest_file
from query import query_text, query_image
from typing import List
from PIL import Image
import io
from fastapi.staticfiles import StaticFiles


app = FastAPI()

# Mount the "files" directory at URL path "/files"
app.mount("/files", StaticFiles(directory="files"), name="files")


@app.post("/uploadfiles")
async def upload_files(background_tasks: BackgroundTasks,files: List[UploadFile] = File(...)):
    saved_files = []
    for upload_file in files:
        file_location = f"files/{upload_file.filename}"
        with open(file_location, "wb") as f:
            f.write(await upload_file.read())
        saved_files.append(file_location)
    # Start async ingestion for each file
    for file_path in saved_files:
        background_tasks.add_task(ingest_file, file_path)

    return {"status": "Files uploaded and ingestion started", "files": saved_files}

@app.post("/query/text")
async def query_by_text(query: str, top_k: int = 5):
    results = query_text(query, top_k)
    return {"query": query, "results": results}

@app.post("/query/image")
async def query_by_image(file: UploadFile = File(...), top_k: int = 5):
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))
    results = query_image(image, top_k)
    return {"filename": file.filename, "results": results}

# For testing purposes
from fastapi.responses import HTMLResponse

@app.get("/upload", response_class=HTMLResponse)
async def upload_form():
    content = """
    <html>
        <body>
            <form action="/uploadfiles" enctype="multipart/form-data" method="post">
                <input name="files" type="file" multiple>
                <input type="submit">
            </form>
        </body>
    </html>
    """
    return content

@app.get("/query", response_class=HTMLResponse)
async def query_form():
    content = """
    <html>
        <body>
            <h2>Text Query</h2>
            <form action="/query/text" method="post">
                <input name="query" type="text" placeholder="Enter your text query">
                <input type="submit">
            </form>
            <h2>Image Query</h2>
            <form action="/query/image" enctype="multipart/form-data" method="post">
                <input name="file" type="file">
                <input type="submit">
            </form>
        </body>
    </html>
    """
    return content

@app.get("/")
async def root():
    return {"message": "Welcome to the Document Ingestion and Query API"}
