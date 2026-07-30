# Getting Started with the RAG System

## Overview

The RAG (Retrieval-Augmented Generation) System is a production-ready template
for building question-answering applications over your own documents. It combines
vector search with large language models to provide accurate, contextual answers.

## Key Features

- **Multi-format Support**: Ingest PDF, DOCX, TXT, HTML, and Markdown files
- **Flexible Chunking**: Choose from fixed-size, recursive, or semantic chunking
- **Hybrid Search**: Combines vector similarity with metadata filtering
- **Cross-encoder Reranking**: Improves result relevance with a second-pass ranker
- **Multi-model LLM**: Supports OpenAI, Anthropic, Google Gemini, and Ollama
- **Streaming Responses**: Real-time token-by-token streaming for chat applications
- **Conversational Memory**: Multi-turn chat with automatic question condensing

## Architecture

The system follows a modular pipeline:

1. **Ingestion** - Documents are loaded, chunked, and embedded
2. **Storage** - Embeddings are stored in ChromaDB vector database
3. **Retrieval** - User queries are embedded and searched against the vector store
4. **Reranking** - Retrieved chunks are re-scored by a cross-encoder model
5. **Generation** - The LLM generates answers based on retrieved context

## Quick Start

1. Install dependencies: `pip install -r requirements.txt`
2. Copy `.env.example` to `.env` and configure your API keys
3. Start ChromaDB: `docker compose up chromadb`
4. Run the API: `uvicorn app.main:app --reload`
5. Ingest documents via `POST /api/v1/ingest`
6. Ask questions via `POST /api/v1/query`
