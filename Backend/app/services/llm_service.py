from langchain_ollama import OllamaLLM
from app.services.prompt_service import build_prompt_template
from app.services.chunking_service import chunk_text

import time

# Optimal chunk size for fast Time-To-First-Token (TTFT).
# Smaller chunks mean the LLM starts outputting within ~8-12s per chunk.
# A 2500-char chunk = ~625 tokens of input, which Ollama processes in ~5-10s
# before emitting the first output token.
CHUNK_SIZE = 2500
CHUNK_OVERLAP = 100

def generate_markdown_notes_stream(text: str, style: str, custom_instructions: str = None, model_name: str = "qwen3"):
    """Generates structured markdown notes using Ollama and streams the response.
    
    Chunking strategy: Always chunk at CHUNK_SIZE characters. Smaller chunks
    keep TTFT low (user sees output almost immediately) while still covering
    the entire document. Each chunk gets its own LLM call and the results
    are streamed sequentially.
    """
    llm = OllamaLLM(model=model_name)
    prompt = build_prompt_template(style, custom_instructions)
    chain = prompt | llm

    chunks = chunk_text(text, chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    if not chunks:
        yield ""
        return

    num_chunks = len(chunks)
    print(f"\n[LLM] {num_chunks} chunk(s), avg {sum(len(c) for c in chunks)//num_chunks} chars each")

    for i, chunk in enumerate(chunks):
        chunk_start = time.time()
        
        # Calculate budget for this specific chunk: roughly 25% of input words
        # 1 word ~ 5 chars. So chunk_len / 5 = input_words. Output budget = input_words * 0.25
        max_words = max(50, len(chunk) // 20)
        
        for token in chain.stream({"text": chunk, "max_words": max_words}):
            yield token
        print(f"  [Chunk {i+1}/{num_chunks}] done in {time.time()-chunk_start:.2f}s")

        if i < len(chunks) - 1:
            yield "\n\n---\n\n"

    print("[LLM] Done.")
