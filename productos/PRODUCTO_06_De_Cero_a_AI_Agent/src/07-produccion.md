# Chapter 7 — Production-Ready Agents

## 7.1 The Production Gap

Moving an agent from your laptop to production 24/7 requires solving problems that don't exist in development.

## 7.2 Error Handling and Retries

### Exponential Backoff Retry

```python
import time
import random
from functools import wraps
from openai import RateLimitError, APITimeoutError

def retry_with_backoff(max_retries=3, base_delay=1.0, max_delay=60.0):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except (RateLimitError, APITimeoutError) as e:
                    if attempt == max_retries:
                        raise
                    delay = min(base_delay * (2 ** attempt) + random.uniform(0, 1), max_delay)
                    print(f"Retry {attempt+1}: waiting {delay:.1f}s")
                    time.sleep(delay)
        return wrapper
    return decorator

@retry_with_backoff(max_retries=5)
def call_llm(llm, prompt):
    return llm.invoke(prompt)
```

### Circuit Breaker Pattern

```python
from datetime import datetime, timedelta
from enum import Enum

class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class CircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_timeout=30):
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.last_failure_time = None

    def call(self, func, *args, **kwargs):
        if self.state == CircuitState.OPEN:
            if datetime.now() - self.last_failure_time > timedelta(seconds=self.recovery_timeout):
                self.state = CircuitState.HALF_OPEN
            else:
                raise Exception("Circuit is OPEN, call rejected")
        try:
            result = func(*args, **kwargs)
            if self.state == CircuitState.HALF_OPEN:
                self.state = CircuitState.CLOSED
            self.failure_count = 0
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = datetime.now()
            if self.failure_count >= self.failure_threshold:
                self.state = CircuitState.OPEN
            raise e
```

## 7.3 Monitoring and Logging

### Structured Logging

```python
import structlog
import uuid

logger = structlog.get_logger()
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
)

class AgentLogger:
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.session_id = str(uuid.uuid4())

    def log_step(self, step: str, duration: float, tokens: int, success: bool):
        logger.info("agent_step", agent=self.agent_name, session=self.session_id,
                    step=step, duration_ms=round(duration*1000), tokens=tokens, success=success)

    def log_error(self, step: str, error: str):
        logger.error("agent_error", agent=self.agent_name, session=self.session_id,
                     step=step, error=error)
```

### LangSmith Tracing

```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGSMITH_API_KEY")
os.environ["LANGCHAIN_PROJECT"] = "agents-production"
```

### Key Metrics

| Metric | What it measures | Alert if |
|--------|-----------------|----------|
| p95 Latency | Response time | > 30s |
| Error Rate | % of failed calls | > 5% |
| Tokens/session | Cost per conversation | > 10K |
| Avg iterations | Steps per task | > 10 |
| Success rate | % completed tasks | < 80% |

## 7.4 Rate Limiting and Cost Control

### Token Bucket

```python
import time
import threading

class TokenBucket:
    def __init__(self, rate: float, burst: int):
        self.rate = rate
        self.burst = burst
        self.tokens = burst
        self.last_refill = time.time()
        self.lock = threading.Lock()

    def consume(self, tokens=1):
        with self.lock:
            now = time.time()
            elapsed = now - self.last_refill
            self.tokens = min(self.burst, self.tokens + elapsed * self.rate)
            self.last_refill = now
            if self.tokens >= tokens:
                self.tokens -= tokens
                return True
            return False

rate_limiter = TokenBucket(rate=10/60, burst=20)
```

### Cost Manager

```python
class CostManager:
    PRICING = {
        "gpt-4o":       {"input": 2.50, "output": 10.00},
        "gpt-4o-mini":  {"input": 0.15, "output": 0.60},
        "claude-3-opus": {"input": 15.00, "output": 75.00},
    }

    def __init__(self, monthly_budget=100.0):
        self.monthly_budget = monthly_budget
        self.daily_budget = monthly_budget / 30
        self.daily_cost = 0.0

    def track(self, model, input_tokens, output_tokens):
        p = self.PRICING.get(model)
        if not p:
            return 0.0
        cost = (input_tokens * p["input"] + output_tokens * p["output"]) / 1_000_000
        self.daily_cost += cost
        return cost
```

### Response Caching

```python
import hashlib
import diskcache

cache = diskcache.Cache("./llm_cache")

def cached_llm_call(llm, prompt: str, ttl=3600):
    key = hashlib.md5(prompt.encode()).hexdigest()
    if key in cache:
        return cache[key]
    result = llm.invoke(prompt)
    cache.set(key, result.content, expire=ttl)
    return result.content
```

## 7.5 Multi-Provider Fallbacks

```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_ollama import ChatOllama
import random

class ModelRouter:
    def __init__(self):
        self.providers = {
            "openai":    {"model": ChatOpenAI(model="gpt-4o-mini"), "enabled": True, "failures": 0},
            "anthropic": {"model": ChatAnthropic(model="claude-3-haiku-20240307"), "enabled": True, "failures": 0},
            "ollama":    {"model": ChatOllama(model="llama3"), "enabled": True, "failures": 0},
        }
        self.current = "openai"
        self.max_failures = 3

    def invoke(self, prompt: str) -> str:
        provider = self.providers[self.current]
        if not provider["enabled"]:
            self._switch_provider()
            provider = self.providers[self.current]
        try:
            result = provider["model"].invoke(prompt)
            provider["failures"] = 0
            return result.content
        except Exception as e:
            provider["failures"] += 1
            if provider["failures"] >= self.max_failures:
                provider["enabled"] = False
            self._switch_provider()
            return self.invoke(prompt)

    def _switch_provider(self):
        available = [n for n, p in self.providers.items() if p["enabled"]]
        if not available:
            raise RuntimeError("All providers exhausted")
        self.current = random.choice(available)
```

## 7.6 API Design for Agent Services

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uuid

app = FastAPI(title="Agent API", version="1.0.0")

sessions = {}

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    user_id: str

class ChatResponse(BaseModel):
    session_id: str
    response: str
    steps: list[dict]

@app.post("/v1/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())
    if session_id not in sessions:
        sessions[session_id] = {"history": []}
    session = sessions[session_id]

    result = agent_executor.invoke({
        "input": req.message,
        "chat_history": session["history"],
    })

    session["history"].append(("user", req.message))
    session["history"].append(("assistant", result["output"]))

    return ChatResponse(
        session_id=session_id,
        response=result["output"],
        steps=[{"tool": s[0].tool, "input": s[0].tool_input, "output": str(s[1])[:200]}
               for s in result.get("intermediate_steps", [])],
    )

@app.get("/health")
async def health():
    return {"status": "healthy"}
```

## 7.7 Docker Deployment

### Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ /app/app/

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  agent-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - MODEL_NAME=gpt-4o-mini
      - MONTHLY_BUDGET_USD=100
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
```

## 7.8 Production Checklist

- [ ] API keys in environment variables / secret manager
- [ ] Rate limiting implemented
- [ ] Timeouts configured (LLM, tools, total)
- [ ] Structured logging (JSON)
- [ ] Latency and error metrics
- [ ] Daily budget configured
- [ ] Cache for repetitive queries
- [ ] Health check endpoint
- [ ] Graceful shutdown
- [ ] Resource limits (CPU/Memory)
