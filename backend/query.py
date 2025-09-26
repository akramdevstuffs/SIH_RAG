from ingestor import embed_text, embed_image, index
import numpy as np
from PIL import Image

from db_handler import insert_text_chunk, insert_image, get_next_id, get_metadata_by_faiss_id

def query_text(query_text, top_k=5):
    # 1. Embed the query (returns shape (1, 512))
    query_emb = embed_text([query_text])[0]  
    
    # 2. Search FAISS
    query_emb = np.expand_dims(query_emb, axis=0)  # shape (1, 512)
    distances, ids = index.search(query_emb, top_k)  
    
    # 3. Collect metadata
    results = []
    for i, faiss_id in enumerate(ids[0]):
        if faiss_id == -1:  # faiss returns -1 for empty slots
            continue
        metadata = get_metadata_by_faiss_id(int(faiss_id))
        results.append({
            "id": int(faiss_id),
            "distance": float(distances[0][i]),
            "metadata": metadata
        })
    
    return results

def query_image(image, top_k=5):
    # 1. Embed the query image (returns shape (512,))
    query_emb = embed_image(image)  
    
    # 2. Search FAISS
    query_emb = np.expand_dims(query_emb, axis=0)  # shape (1, 512)
    distances, ids = index.search(query_emb, top_k)  
    
    # 3. Collect metadata
    results = []
    for i, faiss_id in enumerate(ids[0]):
        if faiss_id == -1:  # faiss returns -1 for empty slots
            continue
        metadata = get_metadata_by_faiss_id(int(faiss_id))
        results.append({
            "id": int(faiss_id),
            "distance": float(distances[0][i]),
            "metadata": metadata
        })
    
    return results


# only for testing
if __name__ == "__main__":
    query = "robot"
    results = query_text(query)
    img_file = "files\\sample_img.png"  
    img = Image.open(img_file)
    

    image_results = query_image(img)  
    print("Text Query Results:")
    for res in results:
        print(res)
    print("\nImage Query Results:")
    for res in image_results:
        print(res)
    #Keep taking query from inputs
    while True:
        q = input("Enter your query (or 'exit' to quit): ")
        while q.lower() != 'exit':
            results = query_text(q)
            print("Text Query Results:")
            for res in results:
                print(res)
            q = input("Enter your query (or 'exit' to quit): ")