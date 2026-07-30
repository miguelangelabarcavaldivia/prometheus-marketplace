from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.api import chat, documents, ingest, query
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting RAG System Template")
    for d in ["data/chroma", "data/uploads", "data/cache"]:
        Path(d).mkdir(parents=True, exist_ok=True)
    logger.info(f"LLM provider: {settings.llm_provider}")
    logger.info(f"Embedding provider: {settings.embedding_provider}")
    logger.info(f"Chunking strategy: {settings.chunking_strategy}")
    logger.info(f"Retriever strategy: {settings.retriever_strategy}")
    yield
    logger.info("Shutting down RAG System Template")


app = FastAPI(
    title="RAG System Template",
    description="Production-ready Retrieval-Augmented Generation API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


app.include_router(ingest.router, prefix="/api/v1", tags=["Ingestion"])
app.include_router(query.router, prefix="/api/v1", tags=["Query"])
app.include_router(chat.router, prefix="/api/v1", tags=["Chat"])
app.include_router(documents.router, prefix="/api/v1", tags=["Documents"])
