import os
import io
import faiss
import numpy as np
from PIL import Image
from sentence_transformers import SentenceTransformer
import torch
from transformers import CLIPProcessor, CLIPModel, CLIPTokenizer
from docx import Document
from pypdf import PdfReader

# ----------------- Models -----------------
clip_model_name = "openai/clip-vit-base-patch32"
clip_model = CLIPModel.from_pretrained(clip_model_name)
clip_processor = CLIPProcessor.from_pretrained(clip_model_name)

tokenizer = CLIPTokenizer.from_pretrained(clip_model_name) 

# ----------------- FAISS index -----------------
dim = 512
index = faiss.IndexFlatL2(dim)
metadata_db = {}
current_id = 0

def chunk_text_by_tokens(text, chunk_size=70, overlap=15):
    tokenized = tokenizer(text, add_special_tokens=False)
    input_ids = tokenized['input_ids']
    chunks = []
    start = 0
    while start < len(input_ids):
        end = start + chunk_size
        chunk_ids = input_ids[start:end]
        chunk_text = tokenizer.decode(chunk_ids, clean_up_tokenization_spaces=True)
        chunks.append({"chunk": chunk_text, "start_token": start, "end_token": min(end, len(input_ids))})
        start += (chunk_size - overlap)
    return chunks
   

def extract_pdf_text_and_images(filepath):
    reader = PdfReader(filepath)
    texts, images = [], []

    for page in reader.pages:
        # Extract text
        text = page.extract_text()
        if text:
            texts.append(text)

    for page_number, page in enumerate(reader.pages, start=1):
        resources = page.get("/Resources")
        if resources and "/XObject" in resources:
            xObject = resources["/XObject"].get_object()
            for img_index, obj_name in enumerate(xObject):
                obj = xObject[obj_name]
                if obj.get("/Subtype") == "/Image":
                    try:
                        img_data = obj.get_data()
                        img = Image.open(io.BytesIO(img_data))
                        if img.mode != "RGB":
                            img = img.convert("RGB")
                        images.append({
                            "image": img,
                            "page": page_number,
                            "index": img_index
                        })
                    except Exception as e:
                        print(f"️Skipped image on page {page_number}: {e}")
                        continue
    return texts, images

def chunk_text(text, chunk_size=30, overlap=5):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        # convert word indices to character indices
        start_char = len(" ".join(words[:i])) + (1 if i != 0 else 0)
        end_char = start_char + len(chunk)
        chunks.append({"chunk": chunk, "start": start_char, "end": end_char})
    return chunks

def embed_text(text_list):
    for text in text_list:
        if len(text) > 512:
            print(f"Warning: Text chunk exceeds 512 characters and may be truncated: {text[:60]}...")
    inputs = clip_processor(text=text_list, return_tensors="pt", padding=True)
    outputs = clip_model.get_text_features(**inputs)
    return outputs.detach().numpy().astype('float32')

def embed_image(image):
    if image.mode != "RGB":
        image = image.convert("RGB")
    inputs = clip_processor(images=image, return_tensors="pt").to(device=clip_model.device)
    with torch.no_grad():
        emb = clip_model.get_image_features(**inputs)
    return emb.cpu().numpy()[0]



def ingest_file(filepath):
    global current_id
    filename = os.path.basename(filepath)
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf":
        texts, images = extract_pdf_text_and_images(filepath)
    else:
        raise ValueError("Unsupported file type")
    
    for text in texts:
        # Printing chunked text length for debugging
        print(f"Processing text of length {len(text)}")
        chunks = chunk_text_by_tokens(text)
        print(f"Chunked into {len(chunks)} parts.")
        embs = embed_text([chunk_info["chunk"] for chunk_info in chunks])
        for i, chunk_info in enumerate(chunks):
            index.add(np.array([embs[i]]))
            metadata_db[current_id] = {
                "source": filename,
                "type": "text",
                "content": chunk_info["chunk"],
                "start_token": chunk_info["start_token"],
                "end_token": chunk_info["end_token"]
            }
            current_id += 1
    for img in images:
        emb = embed_image(img["image"])
        index.add(np.array([emb]))
        metadata_db[current_id] = {
            "source": filename,
            "type": "image",
            "page": img.get("page"),
            "index": img.get("index")
        }
        current_id += 1

# Example usage
if __name__ == "__main__":
    ingest_file("sample.pdf")
    # save metadata_db and index as needed
    print(f"Total vectors in index: {index.ntotal}")
    print(f"Metadata entries: {len(metadata_db)}")
    # Example: Save metadata_db to a file
    import json
    with open("metadata_db.json", "w") as f:
        json.dump(metadata_db, f)
    faiss.write_index(index, "faiss_index.bin")