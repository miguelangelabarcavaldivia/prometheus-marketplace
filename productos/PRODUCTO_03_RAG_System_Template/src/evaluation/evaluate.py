#!/usr/bin/env python3
"""
RAG System Evaluation Template

Uses ragas to evaluate answer quality: faithfulness, relevancy,
context recall, and context precision.

Usage:
    python evaluation/evaluate.py
"""

from __future__ import annotations

import asyncio
import json
import os
from typing import Any

from datasets import Dataset
from loguru import logger

from app.config import settings
from app.generation.chain import create_rag_chain
from app.retrieval.retriever import retrieve


EVAL_QUESTIONS = [
    {
        "question": "What is the main topic of the first document?",
        "ground_truth": "",
    },
    {
        "question": "Summarize the key findings mentioned in the documents.",
        "ground_truth": "",
    },
]


async def evaluate():
    chain = create_rag_chain()

    questions = EVAL_QUESTIONS
    answers: list[str] = []
    contexts: list[list[str]] = []
    ground_truths: list[list[str]] = []

    for item in questions:
        q = item["question"]
        logger.info(f"Evaluating: {q[:60]}...")

        docs = await retrieve(q)
        result = await chain.ask(q)

        answers.append(result["answer"])
        contexts.append([d.content for d in docs])
        ground_truths.append([item.get("ground_truth", "")])

    data = Dataset.from_dict({
        "question": [q["question"] for q in questions],
        "answer": answers,
        "contexts": contexts,
        "ground_truth": ground_truths,
    })

    try:
        from ragas import evaluate as ragas_evaluate
        from ragas.metrics import (
            answer_relevancy,
            context_precision,
            context_recall,
            faithfulness,
        )

        scores = ragas_evaluate(
            dataset=data,
            metrics=[
                faithfulness,
                answer_relevancy,
                context_precision,
                context_recall,
            ],
        )

        logger.info("\n=== Evaluation Results ===")
        df = scores.to_pandas()
        logger.info(f"\n{df.to_string()}")
        logger.info(f"\nAggregate:\n{df.mean(numeric_only=True).to_string()}")

        out_path = "data/eval_results.json"
        os.makedirs("data", exist_ok=True)
        with open(out_path, "w") as f:
            f.write(df.to_json(orient="records", indent=2))
        logger.info(f"Results saved to {out_path}")

    except ImportError:
        logger.warning("ragas not installed. Skipping automated scoring.")
        logger.info("\n=== Manual Review Results ===")
        for i, q in enumerate(questions):
            print(f"\nQ: {q['question']}")
            print(f"A: {answers[i][:300]}...")
            print(f"Contexts: {len(contexts[i])} chunks")
    except Exception as exc:
        logger.error(f"Evaluation failed: {exc}")


def main():
    asyncio.run(evaluate())


if __name__ == "__main__":
    main()
