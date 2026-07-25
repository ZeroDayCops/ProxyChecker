import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from engine.dedupe import Deduplicator, ProxyItem
from backend_api.schemas import UploadResponse

router = APIRouter(prefix="/api", tags=["upload"])
uploaded_store = {}

@router.post("/upload", response_model=UploadResponse)
async def upload_proxies(files: List[UploadFile] = File(...)):
    combined_lines = []
    for file in files:
        content = await file.read()
        lines = content.decode("utf-8", errors="ignore").splitlines()
        combined_lines.extend(lines)

    valid, invalid, duplicates = Deduplicator.process_proxies(combined_lines)
    file_id = str(uuid.uuid4())
    uploaded_store[file_id] = {
        "valid": valid,
        "invalid": invalid,
        "duplicates": duplicates
    }

    return UploadResponse(
        file_id=file_id,
        loaded_count=len(combined_lines),
        valid_count=len(valid),
        invalid_count=len(invalid),
        duplicate_count=len(duplicates)
    )
