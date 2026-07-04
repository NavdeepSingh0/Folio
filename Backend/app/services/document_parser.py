import fitz  # PyMuPDF
import os
import re
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

def process_markdown_frontmatter(text: str) -> str:
    """
    Detects YAML frontmatter in a Markdown string and converts it to a
    proper Markdown table so it renders beautifully in the viewer.
    Handles both --- delimited and bare YAML-at-top formats.
    """
    # Normalize line endings
    text = text.replace('\r\n', '\n').replace('\r', '\n').strip()

    # --- Case 1: Standard YAML frontmatter with --- delimiters ---
    fm_match = re.match(r'^-{3,}\s*\n([\s\S]*?)\n-{3,}\s*\n?', text)
    yaml_block = None
    body = text

    if fm_match:
        yaml_block = fm_match.group(1)
        body = text[fm_match.end():]
    else:
        # --- Case 2: Detect bare YAML-like lines at the top ---
        lines = text.split('\n')
        yaml_end = -1
        yaml_line_re = re.compile(r'^[a-zA-Z_][a-zA-Z0-9_]*:\s*.+')
        for i, line in enumerate(lines[:20]):
            stripped = line.strip()
            if stripped == '':
                if yaml_end >= 0:
                    break
                continue
            if yaml_line_re.match(line) or line.startswith(('  ', '\t')):
                yaml_end = i
            else:
                if i == 0:
                    return text  # First line is not YAML, do nothing
                break
        if yaml_end >= 1:
            yaml_block = '\n'.join(lines[:yaml_end + 1])
            body = '\n'.join(lines[yaml_end + 1:]).lstrip('\n')

    if not yaml_block:
        return text

    # Parse the YAML block into key-value pairs
    meta = {}
    current_key = None
    current_value = []

    for line in yaml_block.split('\n'):
        if not line.strip():
            continue
        top_level = re.match(r'^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)', line)
        if top_level:
            if current_key:
                val = ' '.join(current_value).strip().strip('"\'')
                meta[current_key] = val
            current_key = top_level.group(1)
            current_value = [top_level.group(2)]
        else:
            current_value.append(line.strip())

    if current_key:
        val = ' '.join(current_value).strip().strip('"\'')
        meta[current_key] = val

    if not meta:
        return text

    # Build the Markdown table
    rows = '\n'.join(
        f"| **{k.replace('_', ' ').title()}** | {v} |"
        for k, v in meta.items() if v.strip()
    )
    table = f"| Property | Value |\n| :--- | :--- |\n{rows}\n\n"

    return table + body


def extract_text_from_file(file_path: str) -> str:
    """Universal text extractor based on file extension."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
        
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in [".docx", ".doc"]:
        return extract_text_from_docx(file_path)
    elif ext == ".md":
        # For Markdown files, process frontmatter server-side for clean rendering
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                raw = f.read()
            return process_markdown_frontmatter(raw)
        except UnicodeDecodeError:
            raise Exception("File is not valid UTF-8 text.")
    elif ext in [".txt", ".csv", ".py", ".java", ".js", ".tsx", ".ts", ".html", ".css", ".json"]:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except UnicodeDecodeError:
            raise Exception("File is not valid UTF-8 text.")
    elif ext in [".png", ".jpg", ".jpeg", ".webp"]:
        # We will handle images via Multimodal Gemini directly in the AI Pipeline.
        return f"[IMAGE_FILE]: {file_path}"
    else:
        # Fallback: attempt to read as text
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except:
            raise Exception(f"Unsupported file format: {ext}")

