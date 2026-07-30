"""FastAPI REST API — run agents, health checks, configuration."""

from __future__ import annotations

import json
import logging
import os
import time
from contextlib import asynccontextmanager
from typing import Any, Optional

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from core.config import load_config
from core.orchestrator import PipelineContext, PipelineOrchestrator

logger = logging.getLogger("api")

orchestrator: Optional[PipelineOrchestrator] = None


# ── Request / Response Models ──────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(system|user|assistant|tool)$")
    content: str


class CustomerSupportRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000, description="Customer message")
    session_id: Optional[str] = Field(None, description="Existing session ID for conversation continuity")
    history: list[ChatMessage] = Field(default_factory=list, description="Previous conversation messages")
    provider: str = "openai"

    class Config:
        json_schema_extra = {
            "example": {
                "message": "I was charged twice for my subscription this month",
                "session_id": "sess_abc123",
                "history": [],
                "provider": "openai",
            }
        }


class ResearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=5000, description="Research topic or question")
    depth: str = Field("standard", pattern="^(quick|standard|deep)$")
    provider: str = "openai"

    class Config:
        json_schema_extra = {
            "example": {
                "query": "Latest developments in AI agent frameworks 2026",
                "depth": "standard",
                "provider": "openai",
            }
        }


class CodeReviewRequest(BaseModel):
    code: str = Field("", description="Source code as string")
    path: Optional[str] = Field(None, description="Path to file on disk")
    language: str = Field("python", description="Programming language")
    generate_pr_description: bool = True
    provider: str = "openai"

    class Config:
        json_schema_extra = {
            "example": {
                "code": "def hello():\n    print('world')\n",
                "language": "python",
                "generate_pr_description": True,
                "provider": "openai",
            }
        }


class ApprovalRequest(BaseModel):
    session_id: str = Field(..., description="Session ID requiring approval")
    approval_id: str = Field(..., description="Approval ID from the agent response")
    approved: bool = True


class AgentResponse(BaseModel):
    success: bool = True
    session_id: str
    elapsed_seconds: float
    data: dict = Field(default_factory=dict)
    state: str = "completed"
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    default_provider: str = "openai"
    available_providers: list[str] = Field(default_factory=list)
    uptime_seconds: float = 0.0


# ── Lifespan ───────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    global orchestrator
    config = load_config()
    orchestrator = PipelineOrchestrator(config)
    app.state.orchestrator = orchestrator
    app.state.start_time = time.time()

    startup_log(config)
    yield


app = FastAPI(
    title="AI Agent Pipeline API",
    description="Production-ready multi-agent pipeline with LangGraph-based orchestration",
    version="1.0.0",
    lifespan=lifespan,
)


# ── Helpers ────────────────────────────────────────────────────────────────

def startup_log(config) -> None:
    logger.info("AI Agent Pipeline API starting")
    logger.info("Default provider: %s", config.default_provider)
    logger.info("Available providers: %s", list(config.providers.keys()))
    logger.info("Provider models:")
    for name, prov in config.providers.items():
        logger.info("  %s -> %s", name, prov.model)


def get_orch(request: Request) -> PipelineOrchestrator:
    orch: PipelineOrchestrator = request.app.state.orchestrator
    if orch is None:
        raise HTTPException(503, "Orchestrator not initialized")
    return orch


async def _run_agent(
    request: Request,
    agent_name: str,
    handler_module: Any,
    input_data: dict,
    provider: str,
    session_id: Optional[str] = None,
) -> AgentResponse:
    orch = get_orch(request)
    ctx = await orch.run_agent(
        agent_name=agent_name,
        handler=handler_module.handler,
        input_data=input_data,
        session_id=session_id,
    )
    if ctx.state.value == "failed":
        return AgentResponse(
            success=False,
            session_id=ctx.session_id,
            elapsed_seconds=ctx.elapsed(),
            data={},
            state="failed",
            error=ctx.error,
        )
    return AgentResponse(
        success=True,
        session_id=ctx.session_id,
        elapsed_seconds=ctx.elapsed(),
        data=ctx.artifacts.get("result", {}),
        state="completed",
    )


# ── Endpoints ──────────────────────────────────────────────────────────────

@app.post("/agents/customer-support", response_model=AgentResponse)
async def customer_support(req: CustomerSupportRequest, request: Request):
    from agents import customer_support_agent as csa
    return await _run_agent(
        request,
        "customer-support",
        csa,
        {
            "message": req.message,
            "history": [m.model_dump() for m in req.history],
        },
        provider=req.provider,
        session_id=req.session_id,
    )


@app.post("/agents/research", response_model=AgentResponse)
async def research(req: ResearchRequest, request: Request):
    from agents import research_agent as ra
    return await _run_agent(
        request,
        "research",
        ra,
        {"query": req.query, "depth": req.depth},
        provider=req.provider,
    )


@app.post("/agents/code-review", response_model=AgentResponse)
async def code_review(req: CodeReviewRequest, request: Request):
    from agents import code_review_agent as cra
    return await _run_agent(
        request,
        "code-review",
        cra,
        {
            "code": req.code,
            "path": req.path,
            "language": req.language,
            "generate_pr_description": req.generate_pr_description,
        },
        provider=req.provider,
    )


@app.post("/agents/approval", response_model=AgentResponse)
async def resolve_approval(req: ApprovalRequest, request: Request):
    orch = get_orch(request)
    ctx = orch.get_session(req.session_id)
    if ctx is None:
        raise HTTPException(404, f"Session not found: {req.session_id}")

    resolved = ctx.resolve_approval(req.approval_id, req.approved)
    if not resolved:
        raise HTTPException(404, f"Approval ID not found: {req.approval_id}")

    return AgentResponse(
        success=True,
        session_id=req.session_id,
        elapsed_seconds=ctx.elapsed(),
        data={"approval_id": req.approval_id, "approved": req.approved, "state": ctx.state.value},
        state=ctx.state.value,
    )


@app.get("/health", response_model=HealthResponse)
async def health(request: Request):
    orch: PipelineOrchestrator = getattr(request.app.state, "orchestrator", None)
    uptime = time.time() - getattr(request.app.state, "start_time", time.time())

    return HealthResponse(
        status="ok",
        version="1.0.0",
        default_provider=orch.config.default_provider if orch else "unknown",
        available_providers=list(orch.config.providers.keys()) if orch else [],
        uptime_seconds=round(uptime, 2),
    )


@app.get("/sessions/{session_id}")
async def get_session(session_id: str, request: Request):
    orch = get_orch(request)
    ctx = orch.get_session(session_id)
    if ctx is None:
        raise HTTPException(404, f"Session not found: {session_id}")
    return ctx.to_dict()


# ── Entrypoint ─────────────────────────────────────────────────────────────

def main():
    host = os.environ.get("API_HOST", "0.0.0.0")
    port = int(os.environ.get("API_PORT", "8000"))
    log_level = os.environ.get("API_LOG_LEVEL", "info").lower()

    uvicorn.run(
        "api.main:app",
        host=host,
        port=port,
        log_level=log_level,
        reload=os.environ.get("API_RELOAD", "false").lower() == "true",
    )


if __name__ == "__main__":
    main()
