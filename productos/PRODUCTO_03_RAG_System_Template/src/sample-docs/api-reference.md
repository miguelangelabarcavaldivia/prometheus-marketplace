# API Reference

## Base URL

All endpoints are served at `http://localhost:8000/api/v1`

## Authentication

Currently, the API does not require authentication in development mode.
For production deployment, add an API key middleware to `app/main.py`.

## Endpoints

### Health Check

```
GET /health
```

Returns the API status and version.

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

### Ingest Document

```
POST /api/v1/ingest
```

Upload and ingest a document into the vector store.

**Request:** multipart/form-data
- `file`: The document file (PDF, DOCX, TXT, MD, HTML)
- `strategy` (optional): Chunking strategy (`fixed`, `recursive`, `semantic`)

**Response:**
```json
{
  "document_id": "abc-123",
  "filename": "report.pdf",
  "chunk_count": 24,
  "strategy": "recursive",
  "status": "success"
}
```

### Query Documents

```
POST /api/v1/query
```

Ask a question based on ingested documents.

**Request:**
```json
{
  "question": "What is our remote work policy?",
  "strategy": "hybrid",
  "k": 5,
  "use_reranker": true
}
```

**Response:**
```json
{
  "answer": "Employees may work remotely up to 4 days per week...",
  "sources": [
    {
      "content": "...",
      "metadata": {"filename": "company-policies.txt"},
      "score": 0.92
    }
  ]
}
```

### Query with Streaming

```
POST /api/v1/query/stream
```

Same as query but returns a Server-Sent Events stream.

### Chat with History

```
POST /api/v1/chat
```

Multi-turn conversation with automatic chat history condensing.

**Request:**
```json
{
  "question": "What about security requirements?",
  "history": [
    {"question": "What is the remote work policy?", "answer": "..."}
  ]
}
```

### List Documents

```
GET /api/v1/documents
```

Returns all ingested documents and their chunk counts.

### Delete Document

```
DELETE /api/v1/documents/{document_id}
```

Removes a document and all its chunks from the vector store.
