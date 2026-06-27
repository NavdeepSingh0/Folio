from typing import Protocol, Tuple
from app.services.document_structure_service import extract_structured_text
from app.models.document_profile import ExtractedDocument

class BaseParser(Protocol):
    def parse(self, file_bytes: bytes, filename: str) -> ExtractedDocument:
        """Returns an ExtractedDocument."""
        ...

class DocumentParser:
    """Wrapper around the existing extraction service."""
    def parse(self, file_bytes: bytes, filename: str) -> ExtractedDocument:
        # Future: Can be broken out into explicit PDFParser and PPTParser if logic diverges.
        # Currently, document_structure_service already abstracts this nicely.
        return extract_structured_text(file_bytes, filename)
