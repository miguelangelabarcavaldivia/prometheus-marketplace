"""Research Agent — web search, source synthesis, structured markdown reports."""

from __future__ import annotations

import asyncio
import json
import logging
import re
import time
from typing import Optional

import httpx

from core.orchestrator import PipelineContext, PipelineOrchestrator

logger = logging.getLogger("agents.research")

SYSTEM_PROMPT = """You are a professional research analyst. Your task is to:
1. Decompose the user's query into focused sub-questions for web search
2. Search for relevant information from multiple sources
3. Critically evaluate and synthesize findings
4. Produce a comprehensive, well-structured markdown report

The report must include:
- Executive summary
- Key findings (with citations)
- Detailed analysis
- Contradictions or differing viewpoints (if any)
- Sources section with URLs
- Conclusion and recommendations

Be thorough and objective. Acknowledge uncertainty when appropriate."""

SEARCH_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "Search the web for current information",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query string"},
                    "max_results": {"type": "integer", "description": "Max results (1-10)"},
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "visit_url",
            "description": "Fetch and read the content of a URL",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {"type": "string", "description": "The full URL to visit"},
                },
                "required": ["url"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generate_report",
            "description": "Generate the final report. Call this when you have enough information.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Report title"},
                    "sections": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "heading": {"type": "string"},
                                "content": {"type": "string"},
                                "sources": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                },
                            },
                            "required": ["heading", "content"],
                        },
                    },
                    "conclusion": {"type": "string"},
                    "sources": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "title": {"type": "string"},
                                "url": {"type": "string"},
                                "retrieved": {"type": "string"},
                            },
                        },
                    },
                },
                "required": ["title", "sections", "conclusion", "sources"],
            },
        },
    },
]


async def handler(ctx: PipelineContext, orchestrator: PipelineOrchestrator) -> dict:
    query = ctx.input_data.get("query", "")
    depth = ctx.input_data.get("depth", "standard")
    max_searches = {"quick": 2, "standard": 5, "deep": 10}.get(depth, 5)

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Research topic: {query}\n\nDepth: {depth}\n"
         "Break down the topic, search for information, and compile a report."},
    ]

    search_count = 0
    gathered_sources: list[dict] = []
    report_data: Optional[dict] = None

    for iteration in range(12):
        content, tool_call = await orchestrator.llm_call(messages, tools=SEARCH_TOOLS)

        if tool_call:
            for tc in tool_call["tool_calls"]:
                fn_name = tc["function"]["name"]
                args = json.loads(tc["function"]["arguments"])

                if fn_name == "web_search":
                    if search_count >= max_searches:
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tc["id"],
                            "content": "Max searches reached. Continue with gathered data.",
                        })
                        continue
                    search_count += 1
                    results = await _web_search(args["query"], args.get("max_results", 5))
                    gathered_sources.extend(results)
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc["id"],
                        "content": json.dumps(results, indent=2),
                    })
                    logger.info("Searched[%d/%d]: %s", search_count, max_searches, args["query"])

                elif fn_name == "visit_url":
                    url = args["url"]
                    body = await _fetch_url(url)
                    # Truncate long content
                    if len(body) > 8000:
                        body = body[:8000] + "\n\n[Content truncated at 8000 chars]"
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc["id"],
                        "content": body,
                    })
                    logger.info("Visited: %s (%d chars)", url, len(body))

                elif fn_name == "generate_report":
                    report_data = args
                    logger.info("Report generated: %s", args["title"])
                    break

                await asyncio.sleep(0)

            if report_data:
                break
        else:
            messages.append({"role": "assistant", "content": content})

    report_md = _render_report(report_data) if report_data else _fallback_report(query, messages)

    ctx.artifacts["sources"] = gathered_sources
    ctx.artifacts["search_count"] = search_count

    return {
        "query": query,
        "depth": depth,
        "report_markdown": report_md,
        "sources_cited": len(report_data["sources"]) if report_data else 0,
        "searches_performed": search_count,
    }


async def _web_search(query: str, max_results: int = 5) -> list[dict]:
    results = []
    backends = [
        _search_duckduckgo_lite,
        _search_searxng,
    ]

    for backend in backends:
        try:
            results = await backend(query, max_results)
            if results:
                logger.debug("Backend %s returned %d results", backend.__name__, len(results))
                break
        except Exception as e:
            logger.debug("Backend %s failed: %s", backend.__name__, e)
            continue

    if not results:
        results = _fallback_search_results(query)
    return results[:max_results]


async def _search_duckduckgo_lite(query: str, max_results: int) -> list[dict]:
    url = "https://lite.duckduckgo.com/lite/"
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(url, data={"q": query})
        resp.raise_for_status()
        text = resp.text
        results = []
        for match in re.finditer(r'<a[^>]+href="([^"]+)"[^>]*>([^<]+)</a>', text):
            href = match.group(1)
            title = match.group(2).strip()
            if href.startswith("http") and title:
                results.append({"title": title, "url": href, "snippet": ""})
        return results[:max_results]


async def _search_searxng(query: str, max_results: int) -> list[dict]:
    instances = [
        "https://searx.be",
        "https://search.sapti.me",
        "https://searx.space",
    ]
    for instance in instances:
        try:
            url = f"{instance}/search"
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(url, params={"q": query, "format": "json", "language": "en"})
                if resp.status_code != 200:
                    continue
                data = resp.json()
                results = [
                    {"title": r.get("title", ""), "url": r.get("url", ""), "snippet": r.get("content", "")}
                    for r in data.get("results", [])
                ]
                if results:
                    return results[:max_results]
        except Exception:
            continue
    return []


async def _fetch_url(url: str) -> str:
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; ResearchAgent/1.0; +https://github.com/pipeline-agent)",
    }
    async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        text = resp.text
        # Strip HTML tags for plain text
        text = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.DOTALL)
        text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL)
        text = re.sub(r"<[^>]+>", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text[:10000]


def _fallback_search_results(query: str) -> list[dict]:
    return [
        {
            "title": f"Search results for: {query}",
            "url": f"https://en.wikipedia.org/wiki/{query.replace(' ', '_')}",
            "snippet": f"Information related to '{query}' from Wikipedia.",
        },
    ]


def _render_report(data: dict) -> str:
    lines = []
    lines.append(f"# {data['title']}")
    lines.append("")
    lines.append(f"*Generated: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}*")
    lines.append("")
    lines.append("---")
    lines.append("")

    for section in data.get("sections", []):
        lines.append(f"## {section['heading']}")
        lines.append("")
        lines.append(section["content"])
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## Conclusion")
    lines.append("")
    lines.append(data.get("conclusion", ""))

    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Sources")
    lines.append("")
    for idx, src in enumerate(data.get("sources", []), 1):
        title = src.get("title", "Untitled")
        url = src.get("url", "")
        retrieved = src.get("retrieved", "")
        lines.append(f"{idx}. **{title}** — {url} {f'*(retrieved {retrieved})*' if retrieved else ''}")

    return "\n".join(lines)


def _fallback_report(query: str, messages: list[dict]) -> str:
    assistant_msgs = [m["content"] for m in messages if m["role"] == "assistant" and m.get("content")]
    combined = "\n\n".join(assistant_msgs)

    lines = []
    lines.append(f"# Research Report: {query}")
    lines.append("")
    lines.append(f"*Auto-generated on {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}*")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Findings")
    lines.append("")
    lines.append(combined if combined else "No structured data was gathered. Please try a more specific query.")
    lines.append("")
    lines.append("---")
    lines.append("## Sources")
    lines.append("")
    lines.append("Web search results were gathered during the research process. Enable search backends for fuller results.")

    return "\n".join(lines)
