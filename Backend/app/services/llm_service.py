from app.services.prompt_service import build_prompt_template
from app.services.chunking_service import chunk_text
from app.services.gemini_service import generate_text_stream

import time

# Optimal chunk size for fast Time-To-First-Token (TTFT).
# Smaller chunks mean the LLM starts outputting within ~8-12s per chunk.
# A 2500-char chunk = ~625 tokens of input, which Gemini can process and stream quickly.
CHUNK_SIZE = 2500
CHUNK_OVERLAP = 100

def generate_markdown_notes_stream(text: str, style: str, custom_instructions: str = None, model_name: str = "gemini-1.5"):
    """Generates structured markdown notes and streams the response.
    
    Chunking strategy: Always chunk at CHUNK_SIZE characters. Smaller chunks
    keep TTFT low (user sees output almost immediately) while still covering
    the entire document. Each chunk gets its own LLM call and the results
    are streamed sequentially.
    """
    prompt = build_prompt_template(style, custom_instructions)

    chunks = chunk_text(text, chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    if not chunks:
        yield ""
        return

    num_chunks = len(chunks)
    print(f"\n[LLM] {num_chunks} chunk(s), avg {sum(len(c) for c in chunks)//num_chunks} chars each")

    for i, chunk in enumerate(chunks):
        chunk_start = time.time()
        
        prompt_text = prompt.format(text=chunk)
        for token in generate_text_stream(prompt_text, model_name=model_name, temperature=0.3, max_output_tokens=max(256, len(chunk) // 8)):
            yield token
        print(f"  [Chunk {i+1}/{num_chunks}] done in {time.time()-chunk_start:.2f}s")

        if i < len(chunks) - 1:
            yield "\n\n---\n\n"

    print("[LLM] Done.")
