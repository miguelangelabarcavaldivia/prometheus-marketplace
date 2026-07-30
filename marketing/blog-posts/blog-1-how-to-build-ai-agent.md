---
title: "How to Build an AI Agent in 30 Minutes with Python"
description: "Learn how to build an AI agent tutorial python step by step. Build a functional Python AI agent with tools, memory, and LLM integration in under 30 minutes."
keywords: "ai agent tutorial python, build ai agent python, python ai agent from scratch, create ai agent python, ai agent framework python"
---

# How to Build an AI Agent in 30 Minutes with Python

AI agents are transforming how developers automate complex tasks. Unlike simple chatbots that respond to queries, AI agents can reason, use tools, call APIs, and execute multi-step plans autonomously.

In this AI agent tutorial Python guide, you'll build a functional AI agent from scratch in under 30 minutes. By the end, you'll have an agent that can search the web, run code, and remember context across conversations.

## What Is an AI Agent?

An AI agent is a program that uses a large language model (LLM) as its "brain" to decide what actions to take. The agent loop works like this:

1. **Perceive** — Receive input from the user or environment
2. **Reason** — Use the LLM to decide what to do next
3. **Act** — Execute an action (call a function, run code, search the web)
4. **Observe** — Get the result of the action and feed it back to the LLM
5. **Repeat** — Until the task is complete

This simple loop is the foundation of every AI agent tutorial Python developers need to understand.

## Prerequisites

- Python 3.10 or higher
- An OpenAI API key (or Anthropic, or local Ollama model)
- Basic Python knowledge

## Step 1: Set Up Your Project

Create a new directory and virtual environment:

```bash
mkdir my-ai-agent && cd my-ai-agent
python -m venv venv && source venv/bin/activate
pip install openai python-dotenv
```

Create a `.env` file:

```
OPENAI_API_KEY=sk-your-key-here
```

## Step 2: Build the Core Agent Loop

Create `agent.py`:

```python
import json
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AIAgent:
    def __init__(self, system_prompt: str, tools: list):
        self.system_prompt = system_prompt
        self.tools = tools
        self.messages = [{"role": "system", "content": system_prompt}]
    
    def run(self, user_input: str, max_steps: int = 10) -> str:
        self.messages.append({"role": "user", "content": user_input})
        
        for step in range(max_steps):
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=self.messages,
                tools=self.tools,
                tool_choice="auto"
            )
            
            message = response.choices[0].message
            self.messages.append(message)
            
            if not message.tool_calls:
                return message.content
            
            for tool_call in message.tool_calls:
                result = self._execute_tool(tool_call)
                self.messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": str(result)
                })
        
        return "Max steps reached."
    
    def _execute_tool(self, tool_call):
        fn_name = tool_call.function.name
        args = json.loads(tool_call.function.arguments)
        # Find and execute the matching tool
        for tool in self.tools:
            if tool["function"]["name"] == fn_name:
                fn = globals().get(fn_name)
                if fn:
                    return fn(**args)
        return f"Tool {fn_name} not found"
```

This is the core of any AI agent tutorial Python implementation. The `run` method orchestrates the perception → reasoning → action → observation loop.

## Step 3: Define Tools

Tools are functions your agent can call. Let's define two:

```python
import subprocess
import requests

def run_python_code(code: str) -> str:
    """Execute Python code and return the output."""
    try:
        result = subprocess.run(
            ["python", "-c", code],
            capture_output=True, text=True, timeout=10
        )
        return result.stdout or result.stderr
    except Exception as e:
        return str(e)

def web_search(query: str) -> str:
    """Search the web using a simplified API."""
    try:
        response = requests.get(
            f"https://api.duckduckgo.com/?q={query}&format=json"
        )
        data = response.json()
        return data.get("AbstractText", "No results found.")
    except Exception as e:
        return f"Search failed: {e}"
```

Now register these as OpenAI-compatible tool definitions:

```python
TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "run_python_code",
            "description": "Execute Python code and get the output",
            "parameters": {
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "Python code to execute"
                    }
                },
                "required": ["code"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "Search the web for current information",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query"
                    }
                },
                "required": ["query"]
            }
        }
    }
]
```

## Step 4: Run Your Agent

```python
agent = AIAgent(
    system_prompt="You are a helpful AI assistant with coding and search abilities. "
                  "Use tools when needed. Always show your reasoning.",
    tools=TOOL_DEFINITIONS
)

result = agent.run("What's 15! (factorial)? Calculate it and show me the answer.")
print(result)
```

Run it:

```bash
python agent.py
```

Your agent will decide to call `run_python_code` to compute the factorial, then explain the result. This is the moment every AI agent tutorial Python should highlight — watching the agent *decide* which tool to use.

## Step 5: Add Memory and Context

The agent already remembers conversation history via `self.messages`. But for long-running tasks, you'll want persistence:

```python
import sqlite3

class Memory:
    def __init__(self, db_path="memory.db"):
        self.conn = sqlite3.connect(db_path)
        self.conn.execute("CREATE TABLE IF NOT EXISTS memories "
                         "(key TEXT PRIMARY KEY, value TEXT)")
    
    def save(self, key: str, value: str):
        self.conn.execute(
            "INSERT OR REPLACE INTO memories VALUES (?, ?)",
            (key, value)
        )
        self.conn.commit()
    
    def load(self, key: str) -> str:
        cursor = self.conn.execute(
            "SELECT value FROM memories WHERE key = ?", (key,)
        )
        row = cursor.fetchone()
        return row[0] if row else ""
```

Inject memory into your agent's system prompt:

```python
memory = Memory()
agent = AIAgent(
    system_prompt=f"You are a helpful assistant. "
                  f"Previous context: {memory.load('session_context')}",
    tools=TOOL_DEFINITIONS
)
```

## Production Considerations

This AI agent tutorial Python guide gives you a working prototype in 30 minutes. For production, add:

- **Rate limiting** — Prevent runaway API costs
- **Human-in-the-loop** — Pause before destructive actions
- **Logging and observability** — Track every step the agent takes
- **Error recovery** — Retry logic for failed tool calls
- **Streaming** — Show agent reasoning in real time

## Take It Further

Building an AI agent tutorial Python project from scratch is the best way to understand the fundamentals. But if you want a production-ready template with:

- 5 pre-built agents (code review, research, writing, QA, orchestrator)
- Agent-to-agent handoff protocol
- Human-in-the-loop checkpoints
- Multi-model support (OpenAI + Anthropic + Ollama)

Check out the **AI Agent Pipeline** template at Prometheus IA Dev Marketplace. It's the exact architecture I use in production, packaged as a ready-to-deploy Python project.

**Products:**
- AI Agent Pipeline ($59) — https://gumroad.com/l/JGw7jLEQllo50Nga_YeWuA
- De Cero a AI Agent ($24) — https://gumroad.com/l/j5GzAveDP0dpGhb6gV0rgg
- Store: https://gumroad.com/miguelabarca
- Discount: LAUNCH40 (40% off), DEV10 (10% off)
