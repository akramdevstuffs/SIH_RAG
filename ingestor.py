import os
import io
import faiss
import numpy as np
from PIL import Image
from sentence_transformers import SentenceTransformer
import torch
from transformers import CLIPProcessor, CLIPModel, CLIPTokenizer, AutoTokenizer
from docx import Document
from pypdf import PdfReader

from db_handler import get_next_id, insert_image, insert_text_chunk

# ----------------- Models -----------------
clip_model_name = "openai/clip-vit-base-patch32"
clip_model = CLIPModel.from_pretrained(clip_model_name)
clip_processor = CLIPProcessor.from_pretrained(clip_model_name)

tokenizer = AutoTokenizer.from_pretrained(clip_model_name, use_fast=True)


# ----------------- FAISS index -----------------
index_path = "faiss_index.bin"
# Checking if index file exists
if os.path.exists(index_path):
    index = faiss.read_index(index_path)
    print("Index loaded. Number of vectors:", index.ntotal)
else:
    print("Index file not found. Creating new index...")
    dim = 512
    index = faiss.IndexFlatL2(dim)
    index = faiss.IndexIDMap(index)

def chunk_text_by_tokens(text, chunk_size=70, overlap=10):
    tokenized = tokenizer(text, add_special_tokens=False, return_offsets_mapping=True)
    input_ids = tokenized['input_ids']
    offsets = tokenized['offset_mapping']
    chunks = []
    start = 0
    while start < len(input_ids):
        end = min(start + chunk_size, len(input_ids))
        chunk_ids = input_ids[start:end]
        # Map token indices to character offsets
        char_start = offsets[start][0]
        char_end = offsets[end-1][1]

        # Slice original text
        chunk_text = text[char_start:char_end]

        chunks.append({
            "chunk": chunk_text,
            "char_start": char_start,
            "char_end": char_end
        })

        start += (chunk_size - overlap)
    return chunks
   

def extract_pdf_text_and_images(filepath):
    reader = PdfReader(filepath)
    texts, images = [], []

    for page in reader.pages:
        # Extract text
        text = page.extract_text()
        if text:
            texts.append({
                "text": text,
                "page": reader.pages.index(page) + 1
            })

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
    inputs = clip_processor(text=text_list, return_tensors="pt", padding=True, truncation=True).to(device=clip_model.device)
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
        chunks = chunk_text_by_tokens(text["text"])
        print(f"Chunked into {len(chunks)} parts.")
        embs = embed_text([chunk_info["chunk"] for chunk_info in chunks])
        for i, chunk_info in enumerate(chunks):
            faiss_id = get_next_id()
            index.add_with_ids(np.array([embs[i]]), np.array([faiss_id],dtype='int64'))
            insert_text_chunk(faiss_id, filename, text["page"], chunk_info["chunk"], chunk_info["char_start"], chunk_info["char_end"])
    for img in images:
        emb = embed_image(img["image"])
        faiss_id = get_next_id()
        index.add_with_ids(np.array([emb]), np.array([faiss_id], dtype='int64'))
        insert_image(faiss_id, filename, img.get("page"), img.get("index"), "")  # Assuming no OCR text for now

# Example usage
if __name__ == "__main__":
    ingest_file("C:\\Users\\akram\\Downloads\\Flowers.pdf")
    # save metadata_db and index as needed
    print(f"Total vectors in index: {index.ntotal}")
    # Example: Save metadata_db to a file
    faiss.write_index(index, "faiss_index.bin")