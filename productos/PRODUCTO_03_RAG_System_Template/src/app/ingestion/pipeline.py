from __future__ import annotations

import hashlib
import uuid
from pathlib import Path
from typing import AsyncIterator, Optional

from loguru import logger

from app.config import settings
from app.ingestion.chunker import ChunkResult, chunk_text
from app.ingestion.embeddings import create_embeddings
from app.ingestion.loader import get_document_metadata, load_document
from app.retrieval.vectorstore import get_vectorstore


class IngestionResult:
    def __init__(
        self,
        document_id: str,
        filename: str,
        chunk_count: int,
        strategy: str,
        status: str = "success",
        error: Optional[str] = None,
    ):
        self.document_id = document_id
        self.filename = filename
        self.chunk_count = chunk_count
        self.strategy = strategy
        self.status = status
        self.error = error

    def to_dict(self) -> dict:
        return {
            "document_id": self.document_id,
            "filename": self.filename,
            "chunk_count": self.chunk_count,
            "strategy": self.strategy,
            "status": self.status,
            "error": self.error,
        }


async def run_ingestion(
    file_path: str | Path,
    strategy: str | None = None,
    metadata: dict | None = None,
) -> IngestionResult:
    path = Path(file_path)
    filename = path.name

    logger.info(f"Starting ingestion for: {filename}")
    document_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, str(path.absolute())))

    try:
        text = await load_document(path)
        if not text.strip():
            raise ValueError("Document is empty after extraction")

        chunks = await chunk_text(text, strategy=strategy)
        doc_meta = get_document_metadata(path)
        if metadata:
            doc_meta.update(metadata)

        embeddings = create_embeddings()
        store = get_vectorstore(embeddings)

        texts = [c.text for c in chunks]
        metadatas = [
            {
                "document_id": document_id,
                "filename": filename,
                "chunk_index": c.index,
                "strategy": c.strategy,
                **doc_meta,
            }
            for c in chunks
        ]
        ids = [
            hashlib.md5(f"{document_id}:{c.index}".encode()).hexdigest()
            for c in chunks
        ]

        store.add_texts(texts=texts, metadatas=metadatas, ids=ids)

        logger.info(
            f"Ingested {filename}: {len(chunks)} chunks, id={document_id}"
        )
        return IngestionResult(
            document_id=document_id,
            filename=filename,
            chunk_count=len(chunks),
            strategy=strategy or settings.chunking_strategy,
        )

    except Exception as exc:
        logger.error(f"Ingestion failed for {filename}: {exc}")
        return IngestionResult(
            document_id=document_id,
            filename=filename,
            chunk_count=0,
            strategy=strategy or settings.chunking_strategy,
            status="error",
            error=str(exc),
        )
