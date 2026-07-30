# Cheatsheet — AI Agents Quick Reference

## Core Agent Loop

```
OBSERVE → THINK → ACT → OBSERVE → EVALUATE → (DONE | REPEAT)
```

## LangChain

```python
# Basic setup
from langchain_openai import ChatOpenAI
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain_core.tools import tool

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

@tool
def my_tool(arg: str) -> str:
    """Description of what this tool does."""
    return f"Result: {arg}"

agent = create_openai_functions_agent(llm, [my_tool], prompt)
executor = AgentExecutor(agent=agent, tools=[my_tool])
result = executor.invoke({"input": "user query"})
```

## LangGraph

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class State(TypedDict):
    messages: list
    done: bool

def node_a(state: State) -> dict:
    return {"messages": state["messages"] + ["processed"]}

def router(state: State) -> str:
    return "end" if state["done"] else "node_b"

builder = StateGraph(State)
builder.add_node("a", node_a)
builder.add_node("b", another_node)
builder.set_entry_point("a")
builder.add_conditional_edges("b", router, {"b": "end", "end": END})
graph = builder.compile()
result = graph.invoke({"messages": [], "done": False})
```

## CrewAI

```python
from crewai import Agent, Task, Crew

agent = Agent(role="Expert", goal="Do X", backstory="...", llm=llm)
task = Task(description="Do Y", expected_output="Result", agent=agent)
crew = Crew(agents=[agent], tasks=[task], process="sequential")
result = crew.kickoff()
```

## AutoGen

```python
import autogen

assistant = autogen.AssistantAgent(name="AI", llm_config={"config_list": [{"model": "gpt-4o", "api_key": "..."}]})
proxy = autogen.UserProxyAgent(name="User", human_input_mode="NEVER", code_execution_config={"use_docker": False})
proxy.initiate_chat(assistant, message="Hello")
```

## Tools Reference

```python
# Simple tool
@tool
def search(query: str) -> str:
    """Search the web."""
    return results

# Structured tool with Pydantic
from pydantic import BaseModel, Field
from langchain_core.tools import StructuredTool

class Input(BaseModel):
    x: int = Field(description="Number")

def calc(x: int) -> str:
    return str(x * 2)

tool = StructuredTool(name="double", description="Double a number", args_schema=Input, func=calc)
```

## Memory Types

| Type | Class | Use |
|------|-------|-----|
| Buffer | `ConversationBufferMemory` | Last N messages |
| Summary | `ConversationSummaryBufferMemory` | Auto-summarize when long |
| Vector | `VectorStoreRetrieverMemory` | Semantic search over history |

## Cost Reference (per 1M tokens)

| Model | Input | Output |
|-------|-------|--------|
| GPT-4o | $2.50 | $10.00 |
| GPT-4o-mini | $0.15 | $0.60 |
| Claude 3.5 Sonnet | $3.00 | $15.00 |
| Claude 3 Haiku | $0.25 | $1.25 |
| Gemini 1.5 Flash | $0.075 | $0.30 |

## Production Checklist

- [ ] Retry with exponential backoff
- [ ] Circuit breaker for API failures
- [ ] Rate limiting (TokenBucket)
- [ ] Structured logging (JSON)
- [ ] Cost tracking and daily budget
- [ ] Response caching
- [ ] Multi-provider fallback
- [ ] Health check endpoint
- [ ] Timeout per step and total
- [ ] Session persistence

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `OutputParserException` | Add `handle_parsing_errors=True` to AgentExecutor |
| `Agent stopped (max iterations)` | Increase `max_iterations` or simplify task |
| `RateLimitError` | Add retry + backoff |
| `Context length exceeded` | Summarize/truncate history |
| Tool returns unexpected format | Validate tool output, add try/except |

## Quick Setup

```bash
pip install langchain langchain-openai langgraph crewai pyautogen
pip install fastapi uvicorn python-dotenv diskcache structlog
export OPENAI_API_KEY="sk-..."
```

## Framework Selection Guide

```
Simple Q&A → LangChain + AgentExecutor
Custom flows → LangGraph
Role-based teams → CrewAI
Conversational + code → AutoGen
.NET/Azure → Semantic Kernel
```
