"""Host photo upload. Files are stored on local disk and served from /uploads.

For production you'd swap this for S3/Cloudinary; the frontend only needs the returned URL,
so nothing else would change.
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from ..config import PUBLIC_API_URL, UPLOAD_DIR
from ..deps import require_host
from ..models import User

router = APIRouter(tags=["uploads"])

ALLOWED_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif"}
MAX_BYTES = 5 * 1024 * 1024


@router.post("/uploads")
async def upload_image(file: UploadFile, _host: User = Depends(require_host)):
    ext = ALLOWED_TYPES.get(file.content_type or "")
    if not ext:
        raise HTTPException(400, "Upload a JPG, PNG, WebP or GIF image")
    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(400, "Photos must be 5 MB or smaller")
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    name = f"{uuid.uuid4().hex}{ext}"  # random name: never trust the client filename
    (UPLOAD_DIR / name).write_bytes(data)
    return {"url": f"{PUBLIC_API_URL}/uploads/{name}"}
