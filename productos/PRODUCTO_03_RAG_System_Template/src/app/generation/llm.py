from __future__ import annotations

from typing import Any, AsyncIterator, Optional

from langchain_anthropic import ChatAnthropic
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from loguru import logger

from app.config import settings


_llm_instance: Optional[BaseChatModel] = None


def create_llm(
    provider: str | None = None,
    model: str | None = None,
    temperature: float | None = None,
    max_tokens: int | None = None,
) -> BaseChatModel:
    global _llm_instance
    provider = provider or settings.llm_provider
    model = model or settings.llm_model
    temperature = temperature if temperature is not None else settings.llm_temperature
    max_tokens = max_tokens or settings.llm_max_tokens

    if provider == "openai":
        llm = ChatOpenAI(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            api_key=settings.openai_api_key,
        )
    elif provider == "anthropic":
        llm = ChatAnthropic(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            api_key=settings.anthropic_api_key,
        )
    elif provider == "google":
        llm = ChatGoogleGenerativeAI(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            google_api_key=settings.google_api_key,
        )
    elif provider == "ollama":
        from langchain_community.chat_models import ChatOllama

        llm = ChatOllama(
            model=model or settings.ollama_model,
            temperature=temperature,
            num_predict=max_tokens,
            base_url=settings.ollama_base_url,
        )
    else:
        raise ValueError(f"Unknown LLM provider: {provider}")

    logger.info(f"Initialized LLM: {provider}/{model}")
    _llm_instance = llm
    return llm


def get_llm() -> BaseChatModel:
    global _llm_instance
    if _llm_instance is None:
        _llm_instance = create_llm()
    return _llm_instance


class LLMWrapper:
    def __init__(self, llm: BaseChatModel | None = None):
        self._llm = llm or get_llm()

    async def generate(
        self, prompt: str, system_prompt: str | None = None
    ) -> str:
        messages: list[BaseMessage] = []
        if system_prompt:
            from langchain_core.messages import SystemMessage

            messages.append(SystemMessage(content=system_prompt))
        messages.append(HumanMessage(content=prompt))
        resp = await self._llm.ainvoke(messages)
        return resp.content if hasattr(resp, "content") else str(resp)

    async def stream(
        self, prompt: str, system_prompt: str | None = None
    ) -> AsyncIterator[str]:
        messages: list[BaseMessage] = []
        if system_prompt:
            from langchain_core.messages import SystemMessage

            messages.append(SystemMessage(content=system_prompt))
        messages.append(HumanMessage(content=prompt))
        async for chunk in self._llm.astream(messages):
            content = chunk.content if hasattr(chunk, "content") else str(chunk)
            if content:
                yield content
