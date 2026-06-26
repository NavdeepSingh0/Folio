from typing import Protocol, Tuple
from app.services.document_structure_service import extract_structured_text

class BaseParser(Protocol):
    def parse(self, file_bytes: bytes, filename: str) -> Tuple[str, int]:
        """Returns extracted text and number of pages."""
        ...

class DocumentParser:
    """Wrapper around the existing extraction service."""
    def parse(self, file_bytes: bytes, filename: str) -> Tuple[str, int]:
        # Future: Can be broken out into explicit PDFParser and PPTParser if logic diverges.
        # Currently, document_structure_service already abstracts this nicely.
        return extract_structured_text(file_bytes, filename)
