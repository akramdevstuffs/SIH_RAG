# Backend - SIH_RAG Project

This is the backend of the **SIH_RAG** project. It provides APIs for file ingestion, querying, and serving embeddings for multimodal documents (text, images, PDF, etc.) using FastAPI.

---

## **1. Prerequisites**

- Python 3.10+ (3.12 works too)
- Git (optional, for cloning the repo)

---

## **2. Create and activate a virtual environment**

> It is recommended to use a virtual environment to avoid conflicts with system packages.

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Linux / macOS
source venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Make sure your virtual environment is activated
Run the server
uvicorn app:app --reload
The server will run at: http://127.0.0.1:8000
The served or uploaded file at: http://127.0.0.1.8000/files/


## **3. API EndPoints**
File Upload: POST /uploadfiles/ (multiple files)
Query Text: POST /query/text (query: str, top_k: (int) = 5)
Query Image: POST /query/image (top_k: int = 5)
Query File Tree: GET /filetree
Serve Uploaded Files: GET /files/<filename>

#Sample /filetree response
{
  "name": "files",
  "type": "folder",
  "children": [
    {
      "name": "docs",
      "type": "folder",
      "children": [
        {"name": "book.pdf", "type": "file"},
        {"name": "notes.txt", "type": "file"}
      ]
    },
    {"name": "image.png", "type": "file"}
  ]
}


For testing
File upload page: GET /upload   (A html upload form)
```
