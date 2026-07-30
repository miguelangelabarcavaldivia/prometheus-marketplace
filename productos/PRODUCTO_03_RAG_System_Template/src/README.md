# RAG System Template

> **Product P3** — Production-ready Retrieval-Augmented Generation API with FastAPI, LangChain, and ChromaDB.

A complete, modular RAG system that lets you ingest documents, retrieve relevant context, and generate answers using LLMs. Supports multiple chunking strategies, retrieval methods, LLM providers, and embedding backends.

---

## Architecture

```
┌──────────────┐    ┌───────────────────┐    ┌──────────────────┐
│   Client     │───▶│   FastAPI API     │───▶│  LLM (OpenAI /   │
│ (cURL, Web,  │    │  (app/main.py)    │    │  Anthropic /      │
│  Mobile)     │◀───│  - /api/v1/query  │◀───│  Gemini / Ollama) │
└──────────────┘    │  - /api/v1/chat   │    └──────────────────┘
                    │  - /api/v1/ingest │            ▲
                    └────────┬──────────┘            │
                             │                       │
                    ┌────────▼──────────┐    ┌───────┴────────┐
                    │   Vector Store    │    │  Cross-Encoder │
                    │   (ChromaDB)      │◀───│  Reranker      │
                    │   Embeddings +    │    │  (sentence-     │
                    │   Metadata        │    │   transformers)│
                    └───────────────────┘    └────────────────┘
                             ▲
                    ┌────────┴──────────┐
                    │  Ingestion Pipeline│
                    │  Load → Chunk →   │
                    │  Embed → Store    │
                    └───────────────────┘
```

## Features

| Feature | Details |
|---------|---------|
| **Document Loading** | PDF, DOCX, TXT, HTML, Markdown, JSON, CSV |
| **Chunking Strategies** | Fixed-size, Recursive Character, Semantic (LLM-based boundary detection) |
| **Embedding Providers** | OpenAI (`text-embedding-3-small`), HuggingFace, Ollama |
| **Vector Store** | ChromaDB with hybrid search, MMR, and similarity search |
| **Reranking** | Cross-encoder (`cross-encoder/ms-marco-MiniLM-L-6-v2`) |
| **LLM Providers** | OpenAI, Anthropic (Claude), Google (Gemini), Ollama (local) |
| **Retrieval Strategies** | Hybrid (score-thresholded), MMR (diverse), Similarity |
| **Caching** | Redis (optional) with automatic disk fallback via diskcache |
| **Streaming** | Server-Sent Events for real-time token streaming |
| **Chat History** | Multi-turn conversation with automatic question condensing |

## Quick Start

### Prerequisites

- Python 3.11+
- Docker & Docker Compose (for ChromaDB)
- API keys for your chosen LLM provider

### Installation

```bash
# Clone and enter the directory
cd producto-03-rag-system-template

# Copy environment configuration
cp .env.example .env
# Edit .env with your API keys and preferences

# Start ChromaDB + Redis
docker compose up -d

# Install dependencies
pip install -r requirements.txt

# Run the API
uvicorn app.main:app --reload
```

### Usage

```bash
# 1. Ingest a document
curl -X POST http://localhost:8000/api/v1/ingest \
  -F "file=@sample-docs/company-policies.txt"

# 2. Ask a question
curl -X POST http://localhost:8000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the remote work policy?"}'

# 3. Chat with history
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What about security?", "history": []}'
```

### API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Configuration

All configuration is via environment variables (see `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_PROVIDER` | `openai` | LLM backend (`openai`, `anthropic`, `google`, `ollama`) |
| `LLM_MODEL` | `gpt-4o-mini` | Model name |
| `EMBEDDING_PROVIDER` | `openai` | Embedding backend |
| `CHUNKING_STRATEGY` | `recursive` | `fixed`, `recursive`, or `semantic` |
| `RETRIEVER_STRATEGY` | `hybrid` | `hybrid`, `similarity`, or `mmr` |
| `RERANKER_ENABLED` | `true` | Enable/disable cross-encoder reranking |

## Project Structure

```
src/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration (env + YAML)
│   ├── cache.py             # Embedding cache (Redis/disk)
│   ├── ingestion/
│   │   ├── loader.py        # Document loaders
│   │   ├── chunker.py       # Chunking strategies
│   │   ├── embeddings.py    # Embedding generation
│   │   └── pipeline.py      # Ingestion orchestrator
│   ├── retrieval/
│   │   ├── vectorstore.py   # ChromaDB wrapper
│   │   ├── reranker.py      # Cross-encoder reranking
│   │   └── retriever.py     # Multi-strategy retriever
│   ├── generation/
│   │   ├── llm.py           # Multi-model LLM wrapper
│   │   ├── prompts.py       # Prompt templates
│   │   └── chain.py         # RAG chain (LCEL)
│   └── api/
│       ├── ingest.py        # POST /api/v1/ingest
│       ├── query.py         # POST /api/v1/query
│       ├── chat.py          # POST /api/v1/chat
│       └── documents.py     # GET/DELETE /api/v1/documents
├── scripts/
│   └── benchmark.py         # Chunking strategy benchmark
├── evaluation/
│   └── evaluate.py          # Answer quality evaluation
├── sample-docs/             # Sample documents for testing
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Benchmarking

```bash
python scripts/benchmark.py sample-docs/company-policies.txt
```

Compares chunk count, average size, and speed across all three strategies.

## Evaluation

```bash
python evaluation/evaluate.py
```

Runs ragas metrics (faithfulness, relevancy, context precision/recall) against your ingested documents.

## License

MIT — see LICENSE file.
