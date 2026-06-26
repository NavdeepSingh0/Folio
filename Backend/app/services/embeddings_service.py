import json
import math
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import MarkdownHeaderTextSplitter

def get_embeddings_model():
    return OllamaEmbeddings(model="nomic-embed-text")

def compute_cosine_similarity(vec1, vec2):
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    norm_a = math.sqrt(sum(a * a for a in vec1))
    norm_b = math.sqrt(sum(b * b for b in vec2))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)

def generate_document_embeddings_json(text: str, existing_embeddings_json: str = None) -> str:
    """
    Chunks a document using Markdown headers, generates embeddings for each chunk incrementally, 
    and returns a JSON string representing the array of chunks and their vectors.
    """
    if not text or len(text.strip()) == 0:
        return "[]"
        
    headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
    ]
    markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on, strip_headers=False)
    md_header_splits = markdown_splitter.split_text(text)
    chunks = [doc.page_content for doc in md_header_splits]
    
    if not chunks:
        chunks = [text]

    existing_map = {}
    if existing_embeddings_json:
        try:
            old_data = json.loads(existing_embeddings_json)
            for item in old_data:
                if "text" in item and "vector" in item:
                    existing_map[item["text"]] = item["vector"]
        except Exception:
            pass

    embeddings_model = get_embeddings_model()
    
    data = []
    chunks_to_embed = []
    chunk_indices = []
    
    for i, chunk in enumerate(chunks):
        if chunk in existing_map:
            data.append({
                "text": chunk,
                "vector": existing_map[chunk]
            })
        else:
            data.append({
                "text": chunk,
                "vector": None
            })
            chunks_to_embed.append(chunk)
            chunk_indices.append(i)
            
    if chunks_to_embed:
        new_vectors = embeddings_model.embed_documents(chunks_to_embed)
        for i, vector in zip(chunk_indices, new_vectors):
            data[i]["vector"] = vector
            
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
