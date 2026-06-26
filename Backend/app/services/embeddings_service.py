import json
import math
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

def get_embeddings_model():
    return OllamaEmbeddings(model="nomic-embed-text")

def compute_cosine_similarity(vec1, vec2):
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    norm_a = math.sqrt(sum(a * a for a in vec1))
    norm_b = math.sqrt(sum(b * b for b in vec2))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)

def generate_document_embeddings_json(text: str) -> str:
    """
    Chunks a document, generates embeddings for each chunk, 
    and returns a JSON string representing the array of chunks and their vectors.
    """
    if not text or len(text.strip()) == 0:
        return "[]"
        
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = splitter.split_text(text)
    
    embeddings_model = get_embeddings_model()
    vectors = embeddings_model.embed_documents(chunks)
    
    data = []
    for chunk, vector in zip(chunks, vectors):
        data.append({
            "text": chunk,
            "vector": vector
        })
        
    return json.dumps(data)

def generate_query_embedding(query: str) -> list[float]:
    """Generates an embedding for the search query."""
    embeddings_model = get_embeddings_model()
    return embeddings_model.embed_query(query)

def search_knowledge_base(query: str, projects: list[dict], top_k: int = 5) -> list[dict]:
    """
    Takes a query and a list of project dicts (which must include the 'embedding' JSON string).
    Returns the top_k matching chunks across all projects.
    """
    if not query or not projects:
        return []
        
    query_vec = generate_query_embedding(query)
    results = []
    
    for proj in projects:
        if not proj.get("embedding"):
            continue
            
        try:
            chunks_data = json.loads(proj["embedding"])
            for chunk_obj in chunks_data:
                vec = chunk_obj.get("vector")
                text = chunk_obj.get("text")
                if vec and text:
                    sim = compute_cosine_similarity(query_vec, vec)
                    results.append({
                        "project_id": proj["id"],
                        "project_title": proj["title"],
                        "text": text,
                        "similarity": sim
                    })
        except Exception as e:
            print(f"Error parsing embeddings for project {proj['id']}: {e}")
            continue
            
    # Sort by descending similarity
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:top_k]
