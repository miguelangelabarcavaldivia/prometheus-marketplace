from __future__ import annotations

from typing import Literal, Optional

from loguru import logger

from app.config import settings
from app.ingestion.embeddings import create_embeddings
from app.retrieval.reranker import rerank_documents
from app.retrieval.vectorstore import (
    hybrid_search,
    mmr_search,
    similarity_search,
)


class RetrievedDocument:
    def __init__(
        self,
        content: str,
        metadata: dict,
        score: float,
        rerank_score: float | None = None,
    ):
        self.content = content
        self.metadata = metadata
        self.score = score
        self.rerank_score = rerank_score

    def to_dict(self) -> dict:
        d = {
            "content": self.content,
            "metadata": self.metadata,
            "score": self.score,
        }
        if self.rerank_score is not None:
            d["rerank_score"] = self.rerank_score
        return d


async def retrieve(
    query: str,
    strategy: Literal["hybrid", "similarity", "mmr"] | None = None,
    k: int | None = None,
    score_threshold: float | None = None,
    filter: dict | None = None,
    use_reranker: bool | None = None,
) -> list[RetrievedDocument]:
    strategy = strategy or settings.retriever_strategy
    k = k or settings.retriever_k
    score_threshold = score_threshold or settings.retriever_score_threshold
    use_reranker = (
        use_reranker
        if use_reranker is not None
        else settings.reranker_enabled
    )

    embeddings = create_embeddings()
    logger.info(
        f"Retrieving with strategy={strategy}, k={k}, threshold={score_threshold}"
    )

    if strategy == "mmr":
        raw = await mmr_search(
            query, embeddings, k=k, filter=filter
        )
    elif strategy == "similarity":
        raw = await similarity_search(
            query, embeddings, k=k, filter=filter
        )
    else:
        raw = await hybrid_search(
            query, embeddings, k=k, score_threshold=score_threshold, filter=filter
        )

    if not raw:
        logger.warning("No documents retrieved")
        return []

    if use_reranker and len(raw) > 1:
        raw = await rerank_documents(query, raw, top_k=k)

    return [
        RetrievedDocument(
            content=r["content"],
            metadata=r["metadata"],
            score=r.get("score", 0.0),
            rerank_score=r.get("rerank_score"),
        )
        for r in raw
    ]
