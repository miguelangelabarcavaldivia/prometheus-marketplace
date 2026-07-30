from __future__ import annotations

from typing import Any, Optional

from langchain_chroma import ChromaVectorStore
from langchain_core.embeddings import Embeddings
from loguru import logger

from app.cache import get_embedding_cache, set_embedding_cache
from app.config import settings


class CachedEmbeddings(Embeddings):
    def __init__(self, provider: str, model: str, dimension: int = 1536):
        self.provider = provider
        self.model = model
        self.dimension = dimension
        self._client: Optional[Any] = None

    def _get_client(self) -> Any:
        if self._client is not None:
            return self._client
        if self.provider == "openai":
            from langchain_openai import OpenAIEmbeddings

            self._client = OpenAIEmbeddings(
                model=self.model,
                openai_api_key=settings.openai_api_key,
            )
        elif self.provider == "huggingface":
            from langchain_community.embeddings import HuggingFaceEmbeddings

            self._client = HuggingFaceEmbeddings(
                model_name=self.model or "all-MiniLM-L6-v2",
            )
        elif self.provider == "ollama":
            from langchain_community.embeddings import OllamaEmbeddings

            self._client = OllamaEmbeddings(
                model=self.model or "nomic-embed-text",
                base_url=settings.ollama_base_url,
            )
        else:
            raise ValueError(f"Unknown embedding provider: {self.provider}")
        logger.info(f"Initialized {self.provider} embeddings (model={self.model})")
        return self._client

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self._get_client().embed_documents(texts)

    def embed_query(self, text: str) -> list[float]:
        return self._get_client().embed_query(text)

    async def aembed_documents(self, texts: list[str]) -> list[list[float]]:
        results: list[list[float]] = []
        uncached: list[tuple[int, str]] = []
        for i, t in enumerate(texts):
            cached = await get_embedding_cache(t, f"{self.provider}:{self.model}")
            if cached is not None:
                results.append(cached)
            else:
                results.append([])
                uncached.append((i, t))
        if uncached:
            batch_texts = [t for _, t in uncached]
            client = self._get_client()
            if hasattr(client, "aembed_documents"):
                batch_embeds = await client.aembed_documents(batch_texts)
            else:
                batch_embeds = client.embed_documents(batch_texts)
            for (idx, _), emb in zip(uncached, batch_embeds):
                results[idx] = emb
                await set_embedding_cache(texts[idx], f"{self.provider}:{self.model}", emb)
        return results

    async def aembed_query(self, text: str) -> list[float]:
        cached = await get_embedding_cache(text, f"{self.provider}:{self.model}")
        if cached is not None:
            return cached
        client = self._get_client()
        if hasattr(client, "aembed_query"):
            emb = await client.aembed_query(text)
        else:
            emb = client.embed_query(text)
        await set_embedding_cache(text, f"{self.provider}:{self.model}", emb)
        return emb


def create_embeddings() -> CachedEmbeddings:
    return CachedEmbeddings(
        provider=settings.embedding_provider,
        model=settings.embedding_model,
        dimension=settings.embedding_dimension,
    )
