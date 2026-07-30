"""Code Review Agent — static analysis, linting, security checks, PR description."""

from __future__ import annotations

import ast
import json
import logging
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Optional

from core.orchestrator import PipelineContext, PipelineOrchestrator

logger = logging.getLogger("agents.code_review")

SYSTEM_PROMPT = """You are a senior software engineer conducting a thorough code review.
Analyze the code for:

1. **Bugs & Logic Errors** — off-by-one, None dereference, race conditions, etc.
2. **Security Vulnerabilities** — SQL injection, XSS, command injection, hardcoded secrets, etc.
3. **Code Style & Maintainability** — naming conventions, dead code, complexity, DRY violations
4. **Performance Issues** — unnecessary allocations, O(n²) in loops, missing caching
5. **Type Safety** — missing type hints, Any abuse, incorrect generics
6. **Testing Concerns** — untestable code, missing edge cases

For each issue found, include:
- Severity: critical / major / minor / info
- Location: file:line
- Description
- Suggested fix (with code snippet)

At the end, generate a PR description summarizing the changes needed."""

CODE_REVIEW_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "run_linter",
            "description": "Run a linter (pylint, flake8, ruff) on a file or directory",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "File or directory to lint"},
                    "linter": {
                        "type": "string",
                        "enum": ["ruff", "pylint", "flake8", "pyright"],
                        "description": "Linter to run",
                    },
                },
                "required": ["path", "linter"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "analyze_ast",
            "description": "Parse and analyze the AST of a Python file for structural issues",
            "parameters": {
                "type": "object",
                "properties": {
                    "code": {"type": "string", "description": "Source code to analyze"},
                },
                "required": ["code"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "finalize_review",
            "description": "Output the final code review report and PR description",
            "parameters": {
                "type": "object",
                "properties": {
                    "summary": {"type": "string", "description": "Overall summary of the review"},
                    "issues": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "severity": {"type": "string", "enum": ["critical", "major", "minor", "info"]},
                                "location": {"type": "string"},
                                "title": {"type": "string"},
                                "description": {"type": "string"},
                                "suggestion": {"type": "string"},
                            },
                            "required": ["severity", "title", "description"],
                        },
                    },
                    "pr_title": {"type": "string", "description": "Suggested PR title"},
                    "pr_description": {"type": "string", "description": "Full PR description in markdown"},
                    "overall_score": {"type": "integer", "description": "Code quality score 1-100"},
                },
                "required": ["summary", "issues", "pr_title", "pr_description", "overall_score"],
            },
        },
    },
]


def _read_code(path: str) -> str:
    p = Path(path)
    if not p.is_file():
        raise FileNotFoundError(f"File not found: {path}")
    return p.read_text(encoding="utf-8")


def _run_linter(path: str, linter: str) -> str:
    if not Path(path).exists():
        return f"Error: path '{path}' does not exist"

    cmd_map = {
        "ruff": [sys.executable, "-m", "ruff", "check", path],
        "pylint": [sys.executable, "-m", "pylint", path, "--output-format=text"],
        "flake8": [sys.executable, "-m", "flake8", path],
        "pyright": ["pyright", path],
    }
    cmd = cmd_map.get(linter)
    if cmd is None:
        return f"Unknown linter: {linter}"

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        return result.stdout + result.stderr
    except FileNotFoundError:
        return f"Linter '{linter}' not installed. Install with: pip install {linter}"
    except subprocess.TimeoutExpired:
        return f"Linter '{linter}' timed out after 30s"
    except Exception as e:
        return f"Error running {linter}: {e}"


def _analyze_ast(code: str) -> dict:
    findings = {"issues": [], "complexity": [], "structure": {}}
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        findings["issues"].append({"severity": "critical", "message": f"Syntax error: {e}"})
        return findings

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            complexity = _cyclomatic_complexity(node)
            if complexity > 10:
                findings["complexity"].append({
                    "name": node.name,
                    "line": node.lineno,
                    "complexity": complexity,
                    "message": f"Function '{node.name}' has high cyclomatic complexity ({complexity})",
                })
        if isinstance(node, ast.Try):
            for handler in node.handlers:
                if handler.type is None:
                    findings["issues"].append({
                        "severity": "major",
                        "line": handler.lineno,
                        "message": "Bare `except:` clause — catches all exceptions, may hide bugs",
                    })
        if isinstance(node, ast.Assert):
            findings["issues"].append({
                "severity": "info",
                "line": node.lineno,
                "message": "`assert` used — assertions are disabled with `python -O`",
            })
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Attribute):
                if node.func.attr == "exec" or node.func.attr == "eval":
                    findings["issues"].append({
                        "severity": "critical",
                        "line": node.lineno,
                        "message": f"Use of `{node.func.attr}()` — security risk",
                    })
            if isinstance(node.func, ast.Name):
                if node.func.id == "input" and sys.version_info >= (3, 0):
                    findings["issues"].append({
                        "severity": "info",
                        "line": node.lineno,
                        "message": "`input()` in Python 3 returns str (safe from eval)",
                    })
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name in ("pickle", "marshal", "shelve"):
                    findings["issues"].append({
                        "severity": "major",
                        "line": node.lineno,
                        "message": f"Use of `{alias.name}` — unsafe deserialization risk",
                    })

    findings["structure"] = {
        "classes": sum(1 for _ in ast.walk(tree) if isinstance(_, ast.ClassDef)),
        "functions": sum(1 for _ in ast.walk(tree) if isinstance(_, ast.FunctionDef)),
        "lines": len(code.splitlines()),
    }
    return findings


def _cyclomatic_complexity(node: ast.AST) -> int:
    complexity = 1
    for child in ast.walk(node):
        if isinstance(child, (ast.If, ast.While, ast.For, ast.AsyncFor, ast.AsyncWith)):
            complexity += 1
        elif isinstance(child, ast.BoolOp):
            complexity += len(child.values) - 1
        elif isinstance(child, (ast.ExceptHandler,)):
            complexity += 1
    return complexity


async def handler(ctx: PipelineContext, orchestrator: PipelineOrchestrator) -> dict:
    code_source = ctx.input_data.get("code", "")
    file_path = ctx.input_data.get("path", "")
    language = ctx.input_data.get("language", "python")
    generate_pr = ctx.input_data.get("generate_pr_description", True)

    # Read code from file if path is given
    if file_path and not code_source:
        try:
            code_source = _read_code(file_path)
            ctx.artifacts["file_path"] = file_path
        except FileNotFoundError as e:
            return {"error": str(e)}

    if not code_source:
        return {"error": "No code provided. Pass 'code' or 'path' in input."}

    ctx.artifacts["code_length"] = len(code_source)
    ctx.artifacts["language"] = language

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Review the following {language} code:\n\n```{language}\n{code_source}\n```"},
    ]

    # Run AST analysis locally for Python code
    ast_findings = {}
    if language == "python":
        ast_findings = _analyze_ast(code_source)
        messages.append({
            "role": "user",
            "content": f"AST analysis results:\n{json.dumps(ast_findings, indent=2)}",
        })

    # Run linters if available
    lint_results = {}
    if file_path and language == "python":
        for linter in ("ruff", "pylint", "flake8"):
            output = _run_linter(file_path, linter)
            if "not installed" not in output.lower() and "error" not in output.lower():
                lint_results[linter] = output
                messages.append({
                    "role": "user",
                    "content": f"{linter} results for {file_path}:\n```\n{output[:3000]}\n```",
                })
                break

    review_data = None
    for iteration in range(4):
        content, tool_call = await orchestrator.llm_call(messages, tools=CODE_REVIEW_TOOLS)

        if tool_call:
            for tc in tool_call["tool_calls"]:
                fn_name = tc["function"]["name"]
                args = json.loads(tc["function"]["arguments"])

                if fn_name == "run_linter":
                    out = _run_linter(args["path"], args["linter"])
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc["id"],
                        "content": out[:3000],
                    })

                elif fn_name == "analyze_ast":
                    res = _analyze_ast(args["code"])
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc["id"],
                        "content": json.dumps(res),
                    })

                elif fn_name == "finalize_review":
                    review_data = args
                    break
        else:
            messages.append({"role": "assistant", "content": content})

        if review_data:
            break

    if review_data is None:
        # LLM did not call finalize — create a fallback report
        review_data = _fallback_review(code_source, messages, ast_findings)

    pr_description = review_data.get("pr_description", "")
    if generate_pr and not pr_description:
        pr_description = _auto_pr_description(review_data)

    ctx.artifacts["issues_count"] = len(review_data.get("issues", []))
    ctx.artifacts["quality_score"] = review_data.get("overall_score", 0)

    return {
        "summary": review_data.get("summary", ""),
        "issues": review_data.get("issues", []),
        "overall_score": review_data.get("overall_score", 50),
        "pr_title": review_data.get("pr_title", "Code review changes"),
        "pr_description": pr_description,
        "ast_analysis": ast_findings,
        "lint_results": lint_results,
    }


def _fallback_review(code: str, messages: list[dict], ast_findings: dict) -> dict:
    assistant_text = " ".join(
        m.get("content", "") for m in messages if m["role"] == "assistant" and m.get("content")
    )
    issues = []
    if ast_findings.get("issues"):
        for iss in ast_findings["issues"]:
            issues.append({
                "severity": iss.get("severity", "info"),
                "location": f"line {iss.get('line', '?')}",
                "title": iss.get("message", "Unknown issue"),
                "description": iss.get("message", ""),
                "suggestion": "Review the flagged pattern and refactor.",
            })

    for ci in ast_findings.get("complexity", []):
        issues.append({
            "severity": "major",
            "location": ci.get("name", "?"),
            "title": ci.get("message", ""),
            "description": ci.get("message", ""),
            "suggestion": f"Consider extracting sub-functions or simplifying logic (complexity: {ci.get('complexity')})",
        })

    return {
        "summary": "Code review completed with AST analysis." if issues else "No issues detected in basic analysis.",
        "issues": issues,
        "pr_title": "Code quality improvements",
        "pr_description": assistant_text[:2000] if assistant_text else "Automated code review completed.",
        "overall_score": max(10, 100 - len(issues) * 10),
    }


def _auto_pr_description(review_data: dict) -> str:
    lines = []
    lines.append(f"## {review_data.get('pr_title', 'Code Review Changes')}")
    lines.append("")
    lines.append(review_data.get("summary", ""))
    lines.append("")
    issues = review_data.get("issues", [])
    if issues:
        lines.append("### Changes Made")
        lines.append("")
        for iss in issues:
            emoji = {"critical": "🔴", "major": "🟡", "minor": "🟢", "info": "🔵"}.get(iss["severity"], "⚪")
            lines.append(f"- {emoji} **[{iss['severity'].upper()}]** {iss['title']}")
            if iss.get("location"):
                lines.append(f"  - Location: {iss['location']}")
    lines.append("")
    lines.append("### Checklist")
    lines.append("- [ ] Code compiles and lints cleanly")
    lines.append("- [ ] Tests pass")
    lines.append("- [ ] Edge cases handled")
    lines.append("- [ ] No hardcoded secrets")
    return "\n".join(lines)
