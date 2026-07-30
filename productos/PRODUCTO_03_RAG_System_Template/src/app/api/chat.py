from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.generation.chain import create_rag_chain

router = APIRouter()


class ChatMessage(BaseModel):
    question: str = Field(..., min_length=1, max_length=10000)
    answer: str


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=10000)
    history: list[ChatMessage] = Field(default_factory=list)
    strategy: Optional[str] = None
    k: Optional[int] = None
    filter: Optional[dict] = None


class ChatResponse(BaseModel):
    answer: str
    standalone_question: str
    sources: list[dict]


@router.post("/chat", response_model=ChatResponse)
async def chat_with_history(req: ChatRequest):
    try:
        chain = create_rag_chain()
        history_dicts = [{"question": m.question, "answer": m.answer} for m in req.history]
        result = await chain.chat(
            question=req.question,
            history=history_dicts,
            strategy=req.strategy,
            k=req.k,
            filter=req.filter,
        )
        return ChatResponse(**result)
    except Exception as exc:
        raise HTTPException(500, f"Chat failed: {exc}")
