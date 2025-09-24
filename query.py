from ingestor import embed_text, embed_image, index
import numpy as np

from db_handler import insert_text_chunk, insert_image, get_next_id, get_metadata_by_faiss_id

def query_index(query_text, top_k=5):
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


if __name__ == "__main__":
    query = "An action is to maximize the performace measure"
    results = query_index(query)
    for res in results:
        print(res)