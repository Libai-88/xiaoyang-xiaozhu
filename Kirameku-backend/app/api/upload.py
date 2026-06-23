import hashlib
import random
import string
import time
import uuid
from io import BytesIO
from pathlib import Path

import httpx
import oss2
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from PIL import Image

from app.deps import get_current_user
from app.config import (
    OSS_ACCESS_KEY_ID,
    OSS_ACCESS_KEY_SECRET,
    OSS_BUCKET_NAME,
    OSS_ENDPOINT,
    OSS_CUSTOM_DOMAIN,
    OSS_PREFIX,
    STARDOTS_API_BASE,
    STARDOTS_KEY,
    STARDOTS_SECRET,
    STARDOTS_SPACE,
)

router = APIRouter(prefix="/api/upload", tags=["上传"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}
MAX_SIZE = 10 * 1024 * 1024  # 10MB
UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)


def _get_bucket():
    auth = oss2.Auth(OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET)
    return oss2.Bucket(auth, OSS_ENDPOINT, OSS_BUCKET_NAME)


def _can_use_oss():
    return all(
        [
            OSS_ACCESS_KEY_ID,
            OSS_ACCESS_KEY_SECRET,
            OSS_BUCKET_NAME,
            OSS_ENDPOINT,
            OSS_CUSTOM_DOMAIN,
        ]
    )


def _can_use_stardots():
    return all([STARDOTS_KEY, STARDOTS_SECRET, STARDOTS_SPACE])


def _build_stardots_headers():
    timestamp = str(int(time.time()))
    nonce = "".join(random.choices(string.ascii_letters + string.digits, k=10))
    need_sign_str = f"{timestamp}|{STARDOTS_SECRET}|{nonce}"
    sign = hashlib.md5(need_sign_str.encode("utf-8")).hexdigest().upper()
    return {
        "x-stardots-timestamp": timestamp,
        "x-stardots-nonce": nonce,
        "x-stardots-key": STARDOTS_KEY,
        "x-stardots-sign": sign,
    }


async def _upload_to_stardots(filename: str, content: bytes, content_type: str) -> str:
    headers = _build_stardots_headers()
    files = {
        "file": (filename, content, content_type),
    }
    data = {
        "space": STARDOTS_SPACE,
    }
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.put(
            f"{STARDOTS_API_BASE}/openapi/file/upload",
            headers=headers,
            data=data,
            files=files,
        )
    response.raise_for_status()
    payload = response.json()
    if payload.get("code") != 200 or not payload.get("success"):
        raise HTTPException(500, payload.get("message") or "StarDots 上传失败")
    file_url = (payload.get("data") or {}).get("url")
    if not file_url:
        raise HTTPException(500, "StarDots 未返回图片地址")
    return file_url


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    _: dict = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"不支持的文件类型: {file.content_type}")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(400, "文件大小不能超过 10MB")

    # 检测方向
    orientation = "landscape"
    try:
        img = Image.open(BytesIO(content))
        w, h = img.size
        orientation = "landscape" if w >= h else "portrait"
    except Exception:
        pass

    # 生成文件名
    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "webp"
    filename = f"{uuid.uuid4().hex}.{ext}"

    if _can_use_stardots():
        try:
            url = await _upload_to_stardots(filename, content, file.content_type)
        except httpx.HTTPStatusError as exc:
            detail = exc.response.text if exc.response is not None else "StarDots 上传失败"
            raise HTTPException(500, f"StarDots 上传失败: {detail}") from exc
        except httpx.HTTPError as exc:
            raise HTTPException(500, f"StarDots 上传失败: {str(exc)}") from exc
    elif _can_use_oss():
        oss_key = f"{OSS_PREFIX}{filename}"
        bucket = _get_bucket()
        bucket.put_object(oss_key, content)
        url = f"{OSS_CUSTOM_DOMAIN}/{oss_key}"
    else:
        file_path = UPLOADS_DIR / filename
        file_path.write_bytes(content)
        url = f"/uploads/{filename}"

    return {"url": url, "orientation": orientation}
