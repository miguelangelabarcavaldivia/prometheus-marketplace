from __future__ import annotations

from typing import Any

from loguru import logger

from app.config import settings


_reranker_model: Any = None


def _get_reranker():
    global _reranker_model
    if _reranker_model is not None:
        return _reranker_model
    try:
        from sentence_transformers import CrossEncoder

        _reranker_model = CrossEncoder(
            settings.reranker_model, trust_remote_code=True
        )
        logger.info(f"Loaded reranker model: {settings.reranker_model}")
    except Exception as exc:
        logger.warning(f"Failed to load reranker model: {exc}")
        _reranker_model = None
    return _reranker_model


async def rerank_documents(
    query: str, documents: list[dict], top_k: int | None = None
) -> list[dict]:
    if not documents:
        return documents

    top_k = top_k or settings.reranker_top_k
    model = _get_reranker()

    if model is None:
        logger.info("Reranker unavailable, returning original order")
        return documents[:top_k]

    pairs = [(query, d["content"]) for d in documents]
    try:
        scores = model.predict(pairs)
        for i, score in enumerate(scores):
            documents[i]["rerank_score"] = float(score)

        ranked = sorted(
            documents, key=lambda x: x.get("rerank_score", 0), reverse=True
        )
        logger.info(
            f"Reranked {len(documents)} docs, top-{top_k} selected"
        )
        return ranked[:top_k]
    except Exception as exc:
        logger.error(f"Reranking failed: {exc}")
        return documents[:top_k]
