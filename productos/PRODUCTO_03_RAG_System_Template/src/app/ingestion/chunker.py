from __future__ import annotations

import re
from typing import AsyncIterator, Literal

from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
)
from loguru import logger

from app.config import settings


class ChunkResult:
    def __init__(self, text: str, index: int, strategy: str, metadata: dict | None = None):
        self.text = text
        self.index = index
        self.strategy = strategy
        self.metadata = metadata or {}

    def to_dict(self) -> dict:
        return {
            "text": self.text,
            "index": self.index,
            "strategy": self.strategy,
            "metadata": self.metadata,
        }


async def chunk_fixed(
    text: str, chunk_size: int | None = None, overlap: int | None = None
) -> list[ChunkResult]:
    size = chunk_size or settings.chunk_size
    ov = overlap or settings.chunk_overlap
    step = size - ov
    chunks = []
    for i in range(0, max(len(text), 1), step):
        segment = text[i : i + size]
        if len(segment) < 50 and chunks:
            continue
        chunks.append(ChunkResult(segment, len(chunks), "fixed"))
    logger.info(f"Fixed chunking: {len(chunks)} chunks (size={size}, overlap={ov})")
    return chunks


async def chunk_recursive(
    text: str, chunk_size: int | None = None, overlap: int | None = None
) -> list[ChunkResult]:
    size = chunk_size or settings.chunk_size
    ov = overlap or settings.chunk_overlap
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=size,
        chunk_overlap=ov,
        separators=["\n\n", "\n", ". ", " ", ""],
        length_function=len,
    )
    raw = splitter.split_text(text)
    chunks = [ChunkResult(s, i, "recursive") for i, s in enumerate(raw)]
    logger.info(f"Recursive chunking: {len(chunks)} chunks (size={size}, overlap={ov})")
    return chunks


async def chunk_semantic(
    text: str,
    llm=None,
    max_chunk_size: int = 2000,
    min_chunk_size: int = 100,
) -> list[ChunkResult]:
    paragraphs = re.split(r"\n\s*\n", text)
    chunks: list[ChunkResult] = []
    buffer = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        if llm and len(buffer) > min_chunk_size:
            boundary = await _detect_boundary(llm, buffer, para)
            if boundary:
                chunks.append(ChunkResult(buffer, len(chunks), "semantic"))
                buffer = para
                continue

        if len(buffer) + len(para) > max_chunk_size and buffer:
            chunks.append(ChunkResult(buffer, len(chunks), "semantic"))
            buffer = para
        else:
            buffer = (buffer + "\n\n" + para) if buffer else para

    if buffer:
        chunks.append(ChunkResult(buffer, len(chunks), "semantic"))

    logger.info(f"Semantic chunking: {len(chunks)} chunks")
    return chunks


async def _detect_boundary(llm, current: str, next_para: str) -> bool:
    prompt = (
        "Does the following paragraph start a NEW TOPIC compared to the previous text? "
        "Answer only 'YES' or 'NO'.\n\n"
        f"PREVIOUS TEXT:\n{current[-500:]}\n\n"
        f"NEXT PARAGRAPH:\n{next_para[:300]}"
    )
    try:
        resp = await llm.ainvoke(prompt)
        answer = resp.content.strip().upper() if hasattr(resp, "content") else str(resp).strip().upper()
        return answer.startswith("YES")
    except Exception:
        return False


async def chunk_text(
    text: str,
    strategy: Literal["fixed", "recursive", "semantic"] | None = None,
    **kwargs,
) -> list[ChunkResult]:
    strategy = strategy or settings.chunking_strategy
    strategies = {
        "fixed": chunk_fixed,
        "recursive": chunk_recursive,
        "semantic": chunk_semantic,
    }
    fn = strategies.get(strategy)
    if fn is None:
        raise ValueError(f"Unknown chunking strategy: {strategy}")
    return await fn(text, **kwargs)
