from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.generation.chain import create_rag_chain

router = APIRouter()


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=10000)
    strategy: Optional[str] = None
    k: Optional[int] = None
    use_reranker: Optional[bool] = None
    filter: Optional[dict] = None


class QueryResponse(BaseModel):
    answer: str
    sources: list[dict]


@router.post("/query", response_model=QueryResponse)
async def query_documents(req: QueryRequest):
    try:
        chain = create_rag_chain()
        result = await chain.ask(
            question=req.question,
            strategy=req.strategy,
            k=req.k,
            filter=req.filter,
            use_reranker=req.use_reranker,
        )
        return QueryResponse(**result)
    except Exception as exc:
        raise HTTPException(500, f"Query failed: {exc}")


@router.post("/query/stream")
async def query_stream(req: QueryRequest):
    from fastapi.responses import StreamingResponse

    chain = create_rag_chain()

    async def generate():
        async for chunk in chain.ask_stream(
            question=req.question,
            strategy=req.strategy,
            k=req.k,
            filter=req.filter,
            use_reranker=req.use_reranker,
        ):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
