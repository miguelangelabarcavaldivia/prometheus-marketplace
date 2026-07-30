# AI Agent Pipeline (P5)

**Three production-ready AI agents** powered by a LangGraph-style orchestrator with multi-provider LLM support (OpenAI, Anthropic, Gemini, Ollama). Includes human-in-the-loop approval, memory, and a FastAPI REST API.

---

## Table of Contents

- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Agents](#agents)
  - [Customer Support Agent](#customer-support-agent)
  - [Research Agent](#research-agent)
  - [Code Review Agent](#code-review-agent)
- [API Reference](#api-reference)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Extending](#extending)
- [License](#license)

---

## Architecture

```
src/
├── agents/
│   ├── customer_support_agent.py   # Ticket classification & HITL
│   ├── research_agent.py           # Web research & report generation
│   └── code_review_agent.py        # Static analysis & PR descriptions
├── core/
│   ├── config.py                   # YAML + env var configuration
│   └── orchestrator.py             # LangGraph pipeline & LLM provider
├── api/
│   └── main.py                     # FastAPI server
└── __init__.py
```

- **Orchestrator** manages agent execution, LLM provider abstraction, session state, and lifecycle hooks.
- **Providers** wrap `AsyncOpenAI`-compatible clients — works with OpenAI, Anthropic (via API), Gemini, and Ollama.
- **Memory** (in-memory or Redis) for conversation history and session persistence.
- **Hooks** allow monitoring, logging, and external integrations into agent execution.

---

## Quick Start

### Prerequisites

- Python 3.11+
- An API key for at least one LLM provider

### Installation

```bash
# Clone / enter the product directory
cd PRODUCTO_05_AI_Agent_Pipeline

# Create virtual environment
python -m venv .venv
source .venv/bin/activate   # Linux/Mac
.venv\Scripts\activate       # Windows

# Install dependencies
pip install -r requirements.txt
```

### Configure API Keys

```bash
cp .env.example .env
# Edit .env with your API keys
```

### Run the API Server

```bash
cd src
python -m api.main
```

The server starts at **http://localhost:8000**.  
API docs at **http://localhost:8000/docs**.

### Test an Agent

```bash
curl -X POST http://localhost:8000/agents/research \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the latest trends in AI agents?", "depth": "quick"}'
```

---

## Configuration

Configuration is loaded from `config.yml` with environment variable overrides using the `PIPELINE_` prefix.

### YAML Config

```yaml
default_provider: openai

providers:
  openai:
    model: gpt-4o
    temperature: 0.7
    max_tokens: 4096

memory:
  backend: inmemory            # inmemory | redis
  redis_url: redis://localhost:6379/0

agent:
  human_in_the_loop: true
  max_retries: 3
```

### Environment Variable Overrides

```bash
# Override the OpenAI model
PIPELINE_PROVIDERS__OPENAI__MODEL=gpt-4o-mini

# Change memory backend
PIPELINE_MEMORY__BACKEND=redis
PIPELINE_MEMORY__REDIS_URL=redis://myredis:6379/0

# Disable human-in-the-loop
PIPELINE_AGENT__HUMAN_IN_THE_LOOP=false
```

---

## Agents

### Customer Support Agent

Classifies tickets into **billing**, **technical**, or **general** categories and resolves them with access to a knowledge base.

**Key Features:**
- Automatic ticket classification with confidence scoring
- Knowledge base lookup for common issues
- Human-in-the-loop approval for sensitive actions (refunds, escalation)
- Full conversation history tracking
- Session-based continuity

**Example:**

```bash
curl -X POST http://localhost:8000/agents/customer-support \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I was charged twice for my subscription",
    "session_id": "user_123",
    "history": []
  }'
```

**Response includes:**
- `ticket_id` — generated ticket identifier
- `classification` — category, confidence, reasoning
- `response` — agent's reply to the customer
- `needs_approval` — whether human approval is pending
- `pending_approvals` — list of approval requests

**Resolving an Approval:**

```bash
curl -X POST http://localhost:8000/agents/approval \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "customer-support_1234567890",
    "approval_id": "approval_0_1234567890",
    "approved": true
  }'
```

---

### Research Agent

Takes a query, searches the web, and compiles a structured markdown report.

**Key Features:**
- Automatic query decomposition into sub-questions
- Multi-backend web search (DuckDuckGo, SearXNG)
- URL content fetching and analysis
- Configurable depth: `quick` (2 searches), `standard` (5), `deep` (10)
- Structured markdown report with executive summary, analysis, and citations

**Example:**

```bash
curl -X POST http://localhost:8000/agents/research \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Compare OpenAI o3, Claude 4, and Gemini 2.5 reasoning models",
    "depth": "standard"
  }'
```

**Response includes:**
- `report_markdown` — full report in markdown format
- `sources_cited` — number of unique sources
- `searches_performed` — number of web searches executed

---

### Code Review Agent

Analyzes source code for bugs, security issues, style problems, and generates PR descriptions.

**Key Features:**
- Local AST analysis (Python): cyclomatic complexity, bare excepts, dangerous imports
- Optional linter integration (ruff, pylint, flake8)
- LLM-powered deep code review
- Auto-generated PR title and description
- Severity classification: critical / major / minor / info
- Code quality score (1-100)

**Example:**

```bash
curl -X POST http://localhost:8000/agents/code-review \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def process(data):\n    try:\n        return eval(data)\n    except:\n        pass",
    "language": "python",
    "generate_pr_description": true
  }'
```

**Or review a local file:**

```bash
curl -X POST http://localhost:8000/agents/code-review \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/absolute/path/to/file.py",
    "language": "python"
  }'
```

**Response includes:**
- `issues` — list of findings with severity, location, and suggested fix
- `overall_score` — code quality rating
- `pr_title` and `pr_description` — ready for pull request creation
- `lint_results` — raw linter output (if linter was available)
- `ast_analysis` — Python AST parsing results

---

## API Reference

### `POST /agents/customer-support`

Run the customer support agent.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | yes | Customer message (1-10,000 chars) |
| `session_id` | string | no | Session ID for conversation continuity |
| `history` | array | no | Previous messages `[{role, content}]` |
| `provider` | string | no | LLM provider (default: `openai`) |

### `POST /agents/research`

Run the research agent.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | yes | Research topic (1-5,000 chars) |
| `depth` | string | no | `quick`, `standard`, or `deep` |
| `provider` | string | no | LLM provider |

### `POST /agents/code-review`

Run the code review agent.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | no* | Source code as string |
| `path` | string | no* | Path to file on disk |
| `language` | string | no | Language (default: `python`) |
| `generate_pr_description` | bool | no | Auto-generate PR text |
| `provider` | string | no | LLM provider |

\* Either `code` or `path` must be provided.

### `POST /agents/approval`

Resolve a human-in-the-loop approval request.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `session_id` | string | yes | Session from agent response |
| `approval_id` | string | yes | Approval ID from agent response |
| `approved` | bool | no | Approve or reject (default: `true`) |

### `GET /health`

Health check — returns provider info and uptime.

### `GET /sessions/{session_id}`

Retrieve full session state including steps, artifacts, and approval queue.

---

## Docker Deployment

```bash
# Build and start
docker compose up --build

# The API is available at http://localhost:8000
# Redis is available at localhost:6379
```

### Docker Compose Services

| Service | Image | Purpose |
|---------|-------|---------|
| `api` | (builds from Dockerfile) | FastAPI server |
| `redis` | redis:7-alpine | Session memory store |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | OpenAI API key |
| `ANTHROPIC_API_KEY` | — | Anthropic API key |
| `GEMINI_API_KEY` | — | Google Gemini API key |
| `PIPELINE_DEFAULT_PROVIDER` | `openai` | Default LLM provider |
| `PIPELINE_CONFIG_PATH` | `config.yml` | Path to YAML config |
| `PIPELINE_MEMORY__BACKEND` | `inmemory` | Memory backend |
| `PIPELINE_MEMORY__REDIS_URL` | `redis://localhost:6379/0` | Redis connection |
| `PIPELINE_AGENT__HUMAN_IN_THE_LOOP` | `true` | Enable HITL approvals |
| `API_HOST` | `0.0.0.0` | API bind address |
| `API_PORT` | `8000` | API port |

---

## Extending

### Adding a Provider

Edit `config.yml`:

```yaml
providers:
  my_provider:
    api_key: "${MY_API_KEY}"
    model: my-model
    base_url: https://api.myprovider.com/v1
    temperature: 0.7
    max_tokens: 4096
```

### Adding a Custom Agent

1. Create `src/agents/my_agent.py`:

```python
async def handler(ctx, orchestrator):
    # ctx.input_data contains user input
    # orchestrator.llm_call() for LLM access
    response = await orchestrator.llm_call([
        {"role": "system", "content": "You are my agent"},
        {"role": "user", "content": ctx.input_data["query"]},
    ])
    return {"result": response}
```

2. Add an endpoint in `src/api/main.py`:

```python
@app.post("/agents/my-agent")
async def my_agent(req: MyRequest, request: Request):
    from agents import my_agent as ma
    return await _run_agent(request, "my-agent", ma, req.model_dump(), provider=req.provider)
```

### Monitoring Hooks

```python
orchestrator.register_hook(lambda ctx: print(f"Agent {ctx.agent_name}: {ctx.state}"))
```

Hooks receive the `PipelineContext` on every state transition.

---

## License

This product is sold via Gumroad. See license terms provided at purchase.
