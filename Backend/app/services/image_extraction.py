"""Moves inline base64 images out of note markdown and into attachment storage."""
import base64
import binascii
import hashlib
import logging
import re
import uuid

from sqlalchemy.orm import Session

from app.models import schema
from app.utils.supabase_client import supabase

logger = logging.getLogger(__name__)

BUCKET = "studyforge-storage"
MAX_INLINE_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB per embedded image

MIME_EXTENSIONS = {
    "png": "png",
    "jpeg": "jpg",
    "jpg": "jpg",
    "gif": "gif",
    "webp": "webp",
}

# Matches a data URI. Base64 wrapped across whitespace is only accepted when the
# URI is anchored in an opening context (](, <, src=" or src=') and followed by
# a closer; a bare URI stops at the first non-base64 character so it can never
# swallow following prose. SVG is skipped on purpose: renderers block SVG data
# URIs and it shouldn't be published to storage.
_B64 = r"[A-Za-z0-9+/=]"
DATA_URI = re.compile(
    r"(?:(?<=\]\()|(?<=<)|(?<=src=\")|(?<=src='))"
    rf"data:image/(png|jpe?g|gif|webp);base64,({_B64}+(?:\s+{_B64}+)*)(?=\s*[)\"'>])"
    rf"|data:image/(png|jpe?g|gif|webp);base64,({_B64}+)",
    re.IGNORECASE,
)


def store_attachment(
    db: Session,
    user_id: int,
    file_id: int,
    filename: str,
    content_type: str,
    data: bytes,
    storage_path: str | None = None,
) -> tuple[schema.Attachment, str]:
    """Uploads bytes to the attachments bucket and records an Attachment row.

    Raises whatever the storage client raises on upload failure. Commits the row.
    Returns the attachment and its public URL.
    """
    if storage_path is None:
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        storage_path = f"attachments/{user_id}/{file_id}/{uuid.uuid4()}.{ext}"

    supabase.storage.from_(BUCKET).upload(
        file=data,
        path=storage_path,
        file_options={"content-type": content_type},
    )

    attachment = schema.Attachment(
        file_id=file_id,
        filename=filename,
        file_type=content_type,
        file_size=len(data),
        storage_path=storage_path,
    )
    db.add(attachment)
    try:
        db.commit()
    except Exception:
        db.rollback()
        # Don't leave an orphaned object behind when the row can't be saved.
        try:
            supabase.storage.from_(BUCKET).remove([storage_path])
        except Exception:
            logger.exception("Failed to remove orphaned storage object %s", storage_path)
        raise
    db.refresh(attachment)
    return attachment, supabase.storage.from_(BUCKET).get_public_url(storage_path)


def extract_inline_images(db: Session, user_id: int, file_id: int, markdown: str | None) -> str | None:
    """Replaces base64 data:image URIs with public storage URLs.

    Paths are content-addressed, so saving the same buffer again reuses the
    existing attachment instead of uploading a duplicate. Any image that fails
    to decode, is too large, or fails to upload keeps its data URI.
    """
    if not markdown or "data:image" not in markdown:
        return markdown

    resolved: dict[str, str] = {}

    def replace(match: re.Match) -> str:
        uri = match.group(0)
        if uri in resolved:
            return resolved[uri]
        subtype = (match.group(1) or match.group(3)).lower()
        payload = match.group(2) if match.group(2) is not None else match.group(4)
        ext = MIME_EXTENSIONS.get(subtype, "png")
        try:
            data = base64.b64decode(re.sub(r"\s+", "", payload), validate=True)
        except (binascii.Error, ValueError):
            return uri
        if not data or len(data) > MAX_INLINE_IMAGE_BYTES:
            return uri

        digest = hashlib.sha256(data).hexdigest()[:32]
        storage_path = f"attachments/{user_id}/{file_id}/{digest}.{ext}"
        existing = db.query(schema.Attachment).filter(
            schema.Attachment.file_id == file_id,
            schema.Attachment.storage_path == storage_path,
        ).first()
        try:
            if existing:
                url = supabase.storage.from_(BUCKET).get_public_url(storage_path)
            else:
                _, url = store_attachment(
                    db, user_id, file_id, f"image-{digest[:8]}.{ext}",
                    f"image/{subtype}", data, storage_path,
                )
        except Exception:
            db.rollback()
            logger.exception("Inline image upload failed for file %s; keeping data URI", file_id)
            return uri
        resolved[uri] = url
        return url

    return DATA_URI.sub(replace, markdown)
