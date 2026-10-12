"""Shared request size limits."""

MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024  # 20 MB per note attachment
MAX_CHAT_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB per chat image
MAX_CHAT_TEXT_ATTACHMENT_BYTES = 2 * 1024 * 1024  # raw bytes read for a chat text attachment
MAX_CHAT_TEXT_CHARS = 50_000  # decoded text kept from a chat text attachment
MAX_IMAGE_PIXELS = 40_000_000  # decompression-bomb guard for PIL

ATTACHMENT_EXTENSIONS = {
    # images
    "png", "jpg", "jpeg", "gif", "webp", "svg", "bmp",
    # documents
    "pdf", "docx", "pptx", "doc", "ppt", "xlsx", "csv",
    # text / code
    "txt", "md", "json", "py", "js", "ts", "tsx", "jsx", "java", "c", "cpp", "h",
    "cs", "go", "rs", "html", "css", "sql", "yaml", "yml", "xml",
}


def read_limited(fileobj, max_bytes: int) -> bytes | None:
    """Reads up to max_bytes; returns None if the stream is larger than the limit."""
    data = fileobj.read(max_bytes + 1)
    if len(data) > max_bytes:
        return None
    return data
