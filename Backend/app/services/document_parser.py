import fitz  # PyMuPDF
import os
import mimetypes
try:
    import docx
except ImportError:
    pass

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts raw text from a PDF file using PyMuPDF."""
    text = ""
    try:
        doc = fitz.open(file_path)
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text += page.get_text("text") + "\n\n"
        doc.close()
    except Exception as e:
        raise Exception(f"Failed to parse PDF: {str(e)}")
    return text.strip()

def extract_text_from_docx(file_path: str) -> str:
    """Extracts text from a DOCX file."""
    try:
        doc = docx.Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        raise Exception(f"Failed to parse DOCX: {str(e)}")

def extract_text_from_file(file_path: str) -> str:
    """Universal text extractor based on file extension."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
        
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in [".docx", ".doc"]:
        return extract_text_from_docx(file_path)
    elif ext in [".txt", ".md", ".csv", ".py", ".js", ".tsx", ".ts", ".html", ".css", ".json"]:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except UnicodeDecodeError:
            raise Exception("File is not valid UTF-8 text.")
    elif ext in [".png", ".jpg", ".jpeg", ".webp"]:
        # We will handle images via Multimodal Gemini directly in the AI Pipeline.
        # So we return a special marker here for now.
        return f"[IMAGE_FILE]: {file_path}"
    else:
        # Fallback: attempt to read as text, if it fails, raise error.
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except:
            raise Exception(f"Unsupported file format: {ext}")
