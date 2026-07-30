"""LangGraph-based pipeline orchestrator with multi-provider LLM support."""

from __future__ import annotations

import json
import logging
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, AsyncIterator, Callable, Optional

import httpx
from openai import AsyncOpenAI

from .config import PipelineSettings, ProviderSettings, load_config

logger = logging.getLogger("orchestrator")


class AgentState(Enum):
    IDLE = "idle"
    RUNNING = "running"
    AWAITING_HUMAN = "awaiting_human"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class PipelineContext:
    session_id: str
    agent_name: str
    input_data: dict
    state: AgentState = AgentState.IDLE
    steps: list[dict] = field(default_factory=list)
    artifacts: dict = field(default_factory=dict)
    human_approval_queue: list[dict] = field(default_factory=list)
    error: Optional[str] = None
    start_time: Optional[float] = None
    end_time: Optional[float] = None

    def add_step(self, step_name: str, result: Any, meta: Optional[dict] = None) -> None:
        self.steps.append({
            "step": step_name,
            "result": result,
            "meta": meta or {},
            "timestamp": time.time(),
        })

    def request_human_approval(self, action: str, payload: dict) -> str:
        approval_id = f"approval_{len(self.human_approval_queue)}_{time.time_ns()}"
        self.human_approval_queue.append({
            "id": approval_id,
            "action": action,
            "payload": payload,
            "status": "pending",
        })
        self.state = AgentState.AWAITING_HUMAN
        return approval_id

    def resolve_approval(self, approval_id: str, approved: bool) -> bool:
        for item in self.human_approval_queue:
            if item["id"] == approval_id:
                item["status"] = "approved" if approved else "rejected"
                self.state = AgentState.RUNNING
                return True
        return False

    def elapsed(self) -> float:
        if self.start_time is None:
            return 0.0
        end = self.end_time or time.time()
        return end - self.start_time

    def to_dict(self) -> dict:
        return {
            "session_id": self.session_id,
            "agent_name": self.agent_name,
            "state": self.state.value,
            "steps": self.steps,
            "artifacts": self.artifacts,
            "human_approval_queue": self.human_approval_queue,
            "error": self.error,
            "elapsed_seconds": self.elapsed(),
        }


class LLMProvider:
    def __init__(self, name: str, settings: ProviderSettings):
        self.name = name
        self.settings = settings
        self._client: Optional[AsyncOpenAI] = None

    @property
    def client(self) -> AsyncOpenAI:
        if self._client is None:
            kwargs = {"api_key": self.settings.api_key}
            if self.name == "ollama" or self.settings.base_url:
                kwargs["base_url"] = self.settings.base_url or "http://localhost:11434/v1"
            self._client = AsyncOpenAI(**kwargs)
        return self._client

    async def chat(
        self,
        messages: list[dict],
        tools: Optional[list[dict]] = None,
        response_format: Optional[type] = None,
    ) -> tuple[str, Optional[dict]]:
        kwargs = {
            "model": self.settings.model,
            "messages": messages,
            "temperature": self.settings.temperature,
            "max_tokens": self.settings.max_tokens,
        }
        if tools:
            kwargs["tools"] = tools
            kwargs["tool_choice"] = "auto"

        if response_format and hasattr(self, "_structured_mode"):
            kwargs["response_format"] = {"type": "json_object"}

        resp = await self.client.chat.completions.create(**kwargs)
        msg = resp.choices[0].message

        if msg.tool_calls:
            return "", {
                "tool_calls": [
                    {"id": tc.id, "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
                    for tc in msg.tool_calls
                ],
                "content": msg.content or "",
            }

        return msg.content or "", None

    async def chat_stream(self, messages: list[dict]) -> AsyncIterator[str]:
        stream = await self.client.chat.completions.create(
            model=self.settings.model,
            messages=messages,
            temperature=self.settings.temperature,
            max_tokens=self.settings.max_tokens,
            stream=True,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta if chunk.choices else None
            if delta and delta.content:
                yield delta.content


class PipelineOrchestrator:
    """Top-level orchestrator that manages agent execution workflows."""

    def __init__(self, config: Optional[PipelineSettings] = None):
        self.config = config or load_config()
        self._providers: dict[str, LLMProvider] = {}
        self._hooks: list[Callable[[PipelineContext], None]] = []
        self._sessions: dict[str, PipelineContext] = {}
        self.logger = logging.getLogger("orchestrator.Pipeline")

    def get_provider(self, name: Optional[str] = None) -> LLMProvider:
        name = name or self.config.default_provider
        if name not in self._providers:
            if name not in self.config.providers:
                raise ValueError(f"Unknown provider: {name}. Available: {list(self.config.providers)}")
            self._providers[name] = LLMProvider(name, self.config.providers[name])
        return self._providers[name]

    def register_hook(self, hook: Callable[[PipelineContext], None]) -> None:
        self._hooks.append(hook)

    def _notify(self, ctx: PipelineContext) -> None:
        for hook in self._hooks:
            try:
                hook(ctx)
            except Exception as e:
                self.logger.warning("Hook %r failed: %s", hook, e)

    async def run_agent(
        self,
        agent_name: str,
        handler: Callable,
        input_data: dict,
        session_id: Optional[str] = None,
    ) -> PipelineContext:
        session_id = session_id or f"{agent_name}_{int(time.time())}"
        ctx = PipelineContext(
            session_id=session_id,
            agent_name=agent_name,
            input_data=input_data,
        )
        self._sessions[session_id] = ctx
        ctx.start_time = time.time()
        ctx.state = AgentState.RUNNING
        self._notify(ctx)

        try:
            result = await handler(ctx, self)
            ctx.artifacts["result"] = result
            ctx.state = AgentState.COMPLETED
        except Exception as e:
            ctx.state = AgentState.FAILED
            ctx.error = f"{type(e).__name__}: {e}"
            self.logger.exception("Agent %s failed", agent_name)
        finally:
            ctx.end_time = time.time()
            self._notify(ctx)

        return ctx

    def get_session(self, session_id: str) -> Optional[PipelineContext]:
        return self._sessions.get(session_id)

    async def llm_call(
        self,
        messages: list[dict],
        provider: Optional[str] = None,
        tools: Optional[list[dict]] = None,
        response_format: Optional[type] = None,
    ) -> tuple[str, Optional[dict]]:
        prov = self.get_provider(provider)
        return await prov.chat(messages, tools=tools, response_format=response_format)

    def as_tool_schema(self) -> list[dict]:
        return [
            {
                "type": "function",
                "function": {
                    "name": "search_web",
                    "description": "Search the web for current information",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "Search query"},
                        },
                        "required": ["query"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "read_file",
                    "description": "Read content from a file on disk",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "path": {"type": "string", "description": "Absolute file path"},
                        },
                        "required": ["path"],
                    },
                },
            },
        ]
