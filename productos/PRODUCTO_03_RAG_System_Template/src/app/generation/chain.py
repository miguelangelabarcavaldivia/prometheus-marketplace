from __future__ import annotations

from typing import AsyncIterator, Optional

from langchain_core.messages import AIMessage, HumanMessage

from app.generation.llm import LLMWrapper
from app.generation.prompts import (
    CONDENSE_QUESTION_PROMPT,
    QA_PROMPT_TEMPLATE,
    SUMMARIZATION_PROMPT,
)
from app.retrieval.retriever import RetrievedDocument, retrieve


class RAGChain:
    def __init__(self, llm_wrapper: LLMWrapper | None = None):
        self.llm = llm_wrapper or LLMWrapper()

    async def ask(
        self,
        question: str,
        strategy: str | None = None,
        k: int | None = None,
        filter: dict | None = None,
        use_reranker: bool | None = None,
    ) -> dict:
        docs = await retrieve(
            query=question,
            strategy=strategy,
            k=k,
            filter=filter,
            use_reranker=use_reranker,
        )

        context = self._format_context(docs)
        prompt = QA_PROMPT_TEMPLATE.format(context=context, question=question)

        answer = await self.llm.generate(prompt)

        return {
            "answer": answer,
            "sources": [d.to_dict() for d in docs],
        }

    async def ask_stream(
        self,
        question: str,
        strategy: str | None = None,
        k: int | None = None,
        filter: dict | None = None,
        use_reranker: bool | None = None,
    ) -> AsyncIterator[str]:
        docs = await retrieve(
            query=question,
            strategy=strategy,
            k=k,
            filter=filter,
            use_reranker=use_reranker,
        )

        context = self._format_context(docs)
        prompt = QA_PROMPT_TEMPLATE.format(context=context, question=question)

        async for chunk in self.llm.stream(prompt):
            yield chunk

    async def chat(
        self,
        question: str,
        history: list[dict] | None = None,
        strategy: str | None = None,
        k: int | None = None,
        filter: dict | None = None,
    ) -> dict:
        history = history or []

        if history:
            chat_history_str = "\n".join(
                f"Human: {m.get('question', '')}\nAssistant: {m.get('answer', '')}"
                for m in history[-6:]
            )
            condense_prompt = CONDENSE_QUESTION_PROMPT.format(
                chat_history=chat_history_str, question=question
            )
            standalone_question = await self.llm.generate(condense_prompt)
        else:
            standalone_question = question

        result = await self.ask(
            question=standalone_question,
            strategy=strategy,
            k=k,
            filter=filter,
        )
        result["standalone_question"] = standalone_question
        return result

    async def summarize(
        self, content: str
    ) -> str:
        prompt = SUMMARIZATION_PROMPT.format(content=content)
        return await self.llm.generate(prompt)

    def _format_context(self, docs: list[RetrievedDocument]) -> str:
        parts = []
        for i, d in enumerate(docs, 1):
            source = d.metadata.get("filename", "unknown")
            parts.append(f"[Source {i}: {source}]\n{d.content}")
        return "\n\n".join(parts)


def create_rag_chain() -> RAGChain:
    return RAGChain()
