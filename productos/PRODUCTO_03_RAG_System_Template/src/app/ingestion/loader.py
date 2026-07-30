from __future__ import annotations

from pathlib import Path
from typing import AsyncIterator

from loguru import logger


async def load_document(path: str | Path) -> str:
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"File not found: {p}")
    suffix = p.suffix.lower()

    loaders = {
        ".txt": _load_text,
        ".md": _load_text,
        ".html": _load_html,
        ".htm": _load_html,
        ".pdf": _load_pdf,
        ".docx": _load_docx,
        ".doc": _load_docx,
        ".json": _load_text,
        ".csv": _load_text,
    }

    loader = loaders.get(suffix)
    if loader is None:
        raise ValueError(f"Unsupported file type: {suffix}")

    logger.info(f"Loading document: {p.name}")
    return await loader(p)


async def _load_text(path: Path) -> str:
    with open(path, encoding="utf-8", errors="replace") as f:
        return f.read()


async def _load_html(path: Path) -> str:
    from bs4 import BeautifulSoup

    text = await _load_text(path)
    soup = BeautifulSoup(text, "lxml")
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    return soup.get_text(separator="\n", strip=True)


async def _load_pdf(path: Path) -> str:
    from pypdf import PdfReader

    reader = PdfReader(str(path))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    return "\n\n".join(pages)


async def _load_docx(path: Path) -> str:
    from docx import Document

    doc = Document(str(path))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs)


def get_document_metadata(path: str | Path) -> dict:
    p = Path(path)
    return {
        "filename": p.name,
        "extension": p.suffix.lower(),
        "size_bytes": p.stat().st_size,
        "created": p.stat().st_ctime,
        "modified": p.stat().st_mtime,
    }
