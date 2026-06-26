from langchain_ollama import OllamaLLM
from app.services.prompt_service import build_prompt_template
from app.services.chunking_service import chunk_text

import time

def generate_markdown_notes_stream(text: str, style: str, custom_instructions: str = None, model_name: str = "llama3.2"):
    """Generates structured markdown notes using Ollama and streams the response."""
    
    # Initialize LLM with the specified model
    llm = OllamaLLM(model=model_name)
    
    # 1. Chunk the document to avoid context window limits
    chunks = chunk_text(text)
    if not chunks:
        yield ""
        return
        
    num_chunks = len(chunks)
    avg_chunk_size = sum(len(c) for c in chunks) / num_chunks if num_chunks > 0 else 0
    total_llm_calls = num_chunks
    
    print("\n" + "="*50)
    print("CHUNK GENERATION INSTRUMENTATION")
    print(f"- Number of chunks: {num_chunks}")
    print(f"- Average chunk size: {avg_chunk_size:.2f} characters")
    print(f"- Total LLM calls: {total_llm_calls}")
    print("="*50 + "\n")
    
    # 2. Build the appropriate prompt template
    prompt = build_prompt_template(style, custom_instructions)
    chain = prompt | llm
    
    # 3. Stream chunks
    merge_time = 0
    
    for i, chunk in enumerate(chunks):
        chunk_start = time.time()
        
        # We use .stream() instead of .invoke() to get tokens as they arrive
        for token in chain.stream({"text": chunk}):
            yield token
            
        chunk_duration = time.time() - chunk_start
        print(f"  [Chunk {i+1}/{num_chunks}] Processed in {chunk_duration:.2f} seconds")
            
        # Add a separator if it's not the last chunk
        if i < len(chunks) - 1:
            merge_start = time.time()
            yield "\n\n---\n\n"
            merge_time += (time.time() - merge_start)
            
    print(f"\n- Total merge time: {merge_time:.4f} seconds")
    print("="*50 + "\n")
