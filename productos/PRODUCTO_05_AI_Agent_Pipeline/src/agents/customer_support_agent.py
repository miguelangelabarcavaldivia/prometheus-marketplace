"""Customer Support Agent — ticket classification, routing, resolution, HITL."""

from __future__ import annotations

import json
import logging
import time
from typing import Optional

from core.orchestrator import PipelineContext, PipelineOrchestrator

logger = logging.getLogger("agents.customer_support")

SYSTEM_PROMPT = """You are an expert customer support agent for a SaaS company.
Your job is to help customers with their issues.

You operate in these phases:
1. CLASSIFY — Determine the category: billing, technical, or general
2. GATHER — Ask clarifying questions if needed
3. RESOLVE — Provide a solution or escalate

For BILLING issues you may need to:
- Check subscription status (requires approval)
- Issue refunds (requires approval)
- Update payment methods (requires approval)

For TECHNICAL issues you may need to:
- Check system status
- Provide debugging steps
- Escalate to engineering (requires approval)

For GENERAL issues, answer directly and helpfully.

When an action requires approval, clearly state what you need approved.
Always be polite, professional, and concise."""

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "classify_ticket",
            "description": "Classify the customer ticket into a category",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "enum": ["billing", "technical", "general"],
                        "description": "The ticket category",
                    },
                    "confidence": {
                        "type": "number",
                        "description": "Confidence score 0-1",
                    },
                    "reasoning": {"type": "string", "description": "Why this category"},
                },
                "required": ["category", "confidence", "reasoning"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "request_human_approval",
            "description": "Request human approval for sensitive actions (refunds, escalation, etc.)",
            "parameters": {
                "type": "object",
                "properties": {
                    "action": {"type": "string", "description": "Action requiring approval"},
                    "justification": {"type": "string", "description": "Why this action is needed"},
                    "details": {"type": "object", "description": "Additional context"},
                },
                "required": ["action", "justification"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "lookup_knowledge_base",
            "description": "Look up information from the knowledge base",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Knowledge base query"},
                },
                "required": ["query"],
            },
        },
    },
]


async def handler(ctx: PipelineContext, orchestrator: PipelineOrchestrator) -> dict:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *ctx.input_data.get("history", []),
        {"role": "user", "content": ctx.input_data["message"]},
    ]

    classification = {"category": "general", "confidence": 1.0, "reasoning": "No classification needed"}
    resolution_steps = []
    final_response = ""

    for iteration in range(5):
        content, tool_call = await orchestrator.llm_call(messages, tools=TOOLS)

        if tool_call:
            for tc in tool_call["tool_calls"]:
                fn_name = tc["function"]["name"]
                args = json.loads(tc["function"]["arguments"])

                if fn_name == "classify_ticket":
                    classification = args
                    messages.append({
                        "role": "assistant",
                        "content": f"I'll classify this ticket as **{args['category']}** (confidence: {args['confidence']}).",
                    })
                    resolution_steps.append({"step": "classification", "result": args})
                    logger.info("Ticket classified: %s (%.2f)", args["category"], args["confidence"])

                elif fn_name == "request_human_approval":
                    approval_id = ctx.request_human_approval(args["action"], args)
                    messages.append({
                        "role": "assistant",
                        "content": (
                            f"⏳ **Human approval needed** for: {args['action']}\n\n"
                            f"**Approval ID**: `{approval_id}`\n"
                            f"**Justification**: {args['justification']}\n\n"
                            "Waiting for approval to proceed..."
                        ),
                    })
                    resolution_steps.append({"step": "human_approval", "result": {"id": approval_id, **args}})

                elif fn_name == "lookup_knowledge_base":
                    kb_response = lookup_knowledge_base_simulated(args["query"])
                    messages.append({"role": "user", "content": f"Knowledge base result: {kb_response}"})
                    resolution_steps.append({"step": "knowledge_base", "result": {"query": args["query"], "response": kb_response}})
        else:
            final_response = content
            messages.append({"role": "assistant", "content": content})
            break

    ctx.artifacts["conversation"] = messages
    ctx.artifacts["classification"] = classification
    ctx.artifacts["ticket_id"] = f"TKT-{int(time.time())}"

    return {
        "ticket_id": ctx.artifacts["ticket_id"],
        "classification": classification,
        "response": final_response,
        "resolution_steps": resolution_steps,
        "needs_approval": len(ctx.human_approval_queue) > 0,
        "pending_approvals": [
            {"id": a["id"], "action": a["action"]}
            for a in ctx.human_approval_queue if a["status"] == "pending"
        ],
    }


def lookup_knowledge_base_simulated(query: str) -> str:
    query_lower = query.lower()
    if "refund" in query_lower:
        return "Refunds are processed within 5-7 business days. Request must be initiated within 30 days of purchase."
    if "password" in query_lower:
        return "Password reset: Go to Settings > Account > Reset Password. Email link expires in 15 minutes."
    if "api key" in query_lower:
        return "API keys can be regenerated from Dashboard > API > Create Key. Old key becomes invalid immediately."
    if "subscription" in query_lower:
        return "Standard: $29/mo, Pro: $99/mo, Enterprise: custom. Downgrades take effect at next billing cycle."
    if "integration" in query_lower or "webhook" in query_lower:
        return "Webhooks: Configure in Dashboard > Integrations. Supported: Slack, Discord, Zapier, Make."
    return (
        f"I found general information about '{query}'. "
        "Please check our documentation at https://docs.example.com for more details."
    )
