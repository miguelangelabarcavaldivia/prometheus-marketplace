from __future__ import annotations

from typing import Any, Optional

from chromadb import HttpClient
from chromadb.config import Settings as ChromaSettings
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings
from langchain_core.vectorstores import VectorStore
from loguru import logger

from app.config import settings


_vector_store: Optional[Chroma] = None


def get_vectorstore(embeddings: Embeddings) -> Chroma:
    global _vector_store
    if _vector_store is not None:
        return _vector_store

    client = HttpClient(
        host=settings.chroma_host,
        port=settings.chroma_port,
        settings=ChromaSettings(anonymized_telemetry=False),
    )

    _vector_store = Chroma(
        client=client,
        collection_name=settings.chroma_collection,
        embedding_function=embeddings,
    )
    logger.info(
        f"Connected to ChromaDB: {settings.chroma_host}:{settings.chroma_port}"
    )
    return _vector_store


async def hybrid_search(
    query: str,
    embeddings: Embeddings,
    k: int = 5,
    score_threshold: float = 0.0,
    filter: dict | None = None,
) -> list[dict]:
    store = get_vectorstore(embeddings)
    query_emb = await embeddings.aembed_query(query)

    results = store.similarity_search_by_vector_with_relevance_scores(
        embedding=query_emb,
        k=k * 2,
        filter=filter,
    )

    filtered = []
    for doc, score in results:
        if score >= score_threshold:
            filtered.append(
                {
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "score": float(score),
                }
            )
        if len(filtered) >= k:
            break

    return filtered


async def mmr_search(
    query: str,
    embeddings: Embeddings,
    k: int = 5,
    fetch_k: int = 20,
    lambda_mult: float = 0.5,
    filter: dict | None = None,
) -> list[dict]:
    store = get_vectorstore(embeddings)
    docs = store.max_marginal_relevance_search(
        query=query,
        k=k,
        fetch_k=fetch_k,
        lambda_mult=lambda_mult,
        filter=filter,
    )
    return [
        {"content": d.page_content, "metadata": d.metadata, "score": 0.0}
        for d in docs
    ]


async def similarity_search(
    query: str,
    embeddings: Embeddings,
    k: int = 5,
    filter: dict | None = None,
) -> list[dict]:
    store = get_vectorstore(embeddings)
    docs = store.similarity_search(query=query, k=k, filter=filter)
    return [
        {"content": d.page_content, "metadata": d.metadata, "score": 0.0}
        for d in docs
    ]


async def delete_document(document_id: str) -> int:
    store = get_vectorstore(None)
    collection = store._collection
    results = collection.get(where={"document_id": document_id})
    ids = results.get("ids", [])
    if ids:
        collection.delete(ids=ids)
    return len(ids)


async def list_documents() -> list[dict]:
    store = get_vectorstore(None)
    collection = store._collection
    results = collection.get(include=["metadatas"])
    seen: dict[str, dict] = {}
    for meta in results.get("metadatas", []):
        if meta is None:
            continue
        did = meta.get("document_id", "")
        if did and did not in seen:
            seen[did] = {
                "document_id": did,
                "filename": meta.get("filename", ""),
                "chunk_count": sum(
                    1
                    for m in results["metadatas"]
                    if m and m.get("document_id") == did
                ),
            }
    return list(seen.values())
