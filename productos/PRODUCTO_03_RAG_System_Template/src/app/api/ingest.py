from __future__ import annotations

import shutil
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.config import settings
from app.ingestion.pipeline import IngestionResult, run_ingestion

router = APIRouter()

ALLOWED_EXTENSIONS = {
    ".txt", ".md", ".html", ".htm",
    ".pdf", ".docx", ".doc", ".json", ".csv",
}


@router.post("/ingest", response_model=dict, status_code=status.HTTP_201_CREATED)
async def ingest_document(
    file: UploadFile = File(...),
    strategy: Optional[str] = None,
):
    if not file.filename:
        raise HTTPException(400, "No filename provided")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            400,
            f"Unsupported file type '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    max_bytes = settings.max_file_size_mb * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_bytes:
        raise HTTPException(
            400,
            f"File exceeds {settings.max_file_size_mb}MB limit",
        )

    upload_dir = settings.upload_path
    save_path = upload_dir / file.filename
    with open(save_path, "wb") as f:
        f.write(contents)

    try:
        result: IngestionResult = await run_ingestion(
            file_path=save_path,
            strategy=strategy,
        )
        if result.status == "error":
            raise HTTPException(500, f"Ingestion failed: {result.error}")
        return result.to_dict()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(500, f"Ingestion error: {exc}")


@router.post("/ingest/batch", response_model=list[dict])
async def ingest_batch(
    files: list[UploadFile] = File(...),
    strategy: Optional[str] = None,
):
    results: list[dict] = []
    for f in files:
        try:
            ext = Path(f.filename).suffix.lower() if f.filename else ""
            if ext not in ALLOWED_EXTENSIONS:
                results.append({
                    "filename": f.filename,
                    "status": "error",
                    "error": f"Unsupported type '{ext}'",
                })
                continue

            contents = await f.read()
            max_bytes = settings.max_file_size_mb * 1024 * 1024
            if len(contents) > max_bytes:
                results.append({
                    "filename": f.filename,
                    "status": "error",
                    "error": f"Exceeds {settings.max_file_size_mb}MB limit",
                })
                continue

            save_path = settings.upload_path / (f.filename or "unknown")
            with open(save_path, "wb") as out:
                out.write(contents)

            result = await run_ingestion(save_path, strategy=strategy)
            results.append(result.to_dict())
        except Exception as exc:
            results.append({
                "filename": f.filename,
                "status": "error",
                "error": str(exc),
            })
    return results
