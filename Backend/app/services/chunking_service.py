from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_text(text: str, chunk_size: int = 4000, chunk_overlap: int = 400) -> list[str]:
    """
    Splits long document text into manageable chunks using RecursiveCharacterTextSplitter.
    Helps prevent context-window exhaustion for LLMs.
    """
    if not text or not text.strip():
        return []
        
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", " ", ""]
    )
    
    return text_splitter.split_text(text)
