from __future__ import annotations

import os
from pathlib import Path
from typing import Literal

import yaml
from pydantic_settings import BaseSettings, SettingsConfigDict


def load_yaml_config(path: str | Path | None = None) -> dict:
    path = path or os.getenv("CONFIG_YAML", "config.yml")
    p = Path(path)
    if p.exists():
        with open(p) as f:
            return yaml.safe_load(f) or {}
    return {}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # API
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "INFO"
    cors_origins: str = "*"

    # LLM
    llm_provider: Literal["openai", "anthropic", "google", "ollama"] = "openai"
    llm_model: str = "gpt-4o-mini"
    llm_temperature: float = 0.1
    llm_max_tokens: int = 4096

    # API Keys
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    google_api_key: str = ""

    # Ollama
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"

    # Embeddings
    embedding_provider: Literal["openai", "huggingface", "ollama"] = "openai"
    embedding_model: str = "text-embedding-3-small"
    embedding_dimension: int = 1536

    # ChromaDB
    chroma_host: str = "localhost"
    chroma_port: int = 8001
    chroma_collection: str = "rag_documents"

    # Chunking
    chunking_strategy: Literal["fixed", "recursive", "semantic"] = "recursive"
    chunk_size: int = 1000
    chunk_overlap: int = 200

    # Retrieval
    retriever_strategy: Literal["hybrid", "similarity", "mmr"] = "hybrid"
    retriever_k: int = 5
    retriever_score_threshold: float = 0.3

    # Reranker
    reranker_enabled: bool = True
    reranker_model: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    reranker_top_k: int = 3

    # Cache
    redis_url: str = "redis://localhost:6379/0"
    cache_backend: Literal["redis", "disk"] = "disk"

    # Ingestion
    upload_dir: str = "data/uploads"
    max_file_size_mb: int = 50

    # Derived
    @property
    def chroma_url(self) -> str:
        return f"http://{self.chroma_host}:{self.chroma_port}"

    @property
    def upload_path(self) -> Path:
        p = Path(self.upload_dir)
        p.mkdir(parents=True, exist_ok=True)
        return p


settings = Settings()
yaml_overrides = load_yaml_config()

for k, v in yaml_overrides.items():
    if hasattr(settings, k) and v is not None:
        setattr(settings, k, v)
