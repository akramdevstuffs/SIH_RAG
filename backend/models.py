import faiss
import os
from transformers import AutoTokenizer, CLIPModel, CLIPProcessor

clip_model_name = "openai/clip-vit-base-patch32"

#Global (initialized once)
clip_model = None
clip_processor = None
tokenizer = None
faiss_index = None

def load_resources(fiass_path="faiss_index.bin"):
    global clip_model, clip_processor, tokenizer, faiss_index
    if clip_model is None or clip_processor is None or tokenizer is None:
        clip_model = CLIPModel.from_pretrained(clip_model_name)
        clip_processor = CLIPProcessor.from_pretrained(clip_model_name)
        tokenizer = AutoTokenizer.from_pretrained(clip_model_name, use_fast=True)
    
    if faiss_index is None:
        if os.path.exists(fiass_path):
            faiss_index = faiss.read_index(fiass_path)
            print("Index loaded. Number of vectors:", faiss_index.ntotal)
        else:
            print("Index file not found. Creating new index...")
            dim = 512
            faiss_index = faiss.IndexFlatL2(dim)
            faiss_index = faiss.IndexIDMap(faiss_index)
    return clip_model, clip_processor, tokenizer, faiss_index