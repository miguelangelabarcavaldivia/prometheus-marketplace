#!/usr/bin/env python3
"""
Chunking Strategy Benchmark

Compares fixed-size, recursive, and semantic chunking strategies
on a given document. Reports chunk counts, sizes, and time taken.
"""

from __future__ import annotations

import asyncio
import time
from pathlib import Path

from loguru import logger

from app.config import settings
from app.ingestion.chunker import chunk_text
from app.ingestion.loader import load_document


async def benchmark(file_path: str) -> None:
    path = Path(file_path)
    if not path.exists():
        logger.error(f"File not found: {path}")
        return

    logger.info(f"Loading document: {path.name}")
    text = await load_document(path)
    logger.info(f"Document length: {len(text)} characters")

    strategies = ["fixed", "recursive", "semantic"]

    for strategy in strategies:
        start = time.perf_counter()
        chunks = await chunk_text(text, strategy=strategy)
        elapsed = time.perf_counter() - start

        chunk_sizes = [len(c.text) for c in chunks]
        avg_size = sum(chunk_sizes) / len(chunk_sizes) if chunk_sizes else 0
        min_size = min(chunk_sizes) if chunk_sizes else 0
        max_size = max(chunk_sizes) if chunk_sizes else 0

        logger.info(
            f"\n--- {strategy.upper()} ---\n"
            f"  Chunks:      {len(chunks)}\n"
            f"  Avg size:    {avg_size:.0f}\n"
            f"  Min size:    {min_size}\n"
            f"  Max size:    {max_size}\n"
            f"  Time:        {elapsed:.3f}s\n"
        )


async def main():
    import sys

    if len(sys.argv) < 2:
        logger.error("Usage: python scripts/benchmark.py <document_path>")
        sys.exit(1)

    await benchmark(sys.argv[1])


if __name__ == "__main__":
    asyncio.run(main())
