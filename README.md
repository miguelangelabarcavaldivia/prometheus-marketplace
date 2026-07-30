# Prometheus 3.0 — IA + Development Marketplace

A monorepo housing **7 integrated products** across AI-powered SaaS, developer tooling, and agentic marketplaces. Built for scalability, composability, and rapid iteration.

---

## Monorepo Structure

```
Prometheus_IA_Dev_Marketplace/
├── .github/               # CI/CD, actions, templates
├── docs/                  # Shared documentation
├── packages/              # Shared libraries, UI kit, SDKs
├── services/              # Backend microservices / APIs
├── apps/                  # Frontend applications
├── tools/                 # CLI utilities, scripts
├── README.md
├── LICENSE
├── CONTRIBUTING.md
└── .gitignore
```

---

## Products Overview

| # | Product | Description |
|---|---------|-------------|
| 1 | **AgentForge** | Multi-agent orchestration platform for building, deploying, and monitoring autonomous AI agents |
| 2 | **PromptLab** | Collaborative prompt engineering environment with version control, testing, and optimization |
| 3 | **DevMarket** | Peer-to-peer marketplace for developer services, code reviews, and consulting gigs |
| 4 | **SaaSForge** | Rapid SaaS scaffolding tool generating full-stack boilerplate with auth, billing, and multi-tenant support |
| 5 | **ModelHub** | Centralized registry for fine-tuned models, LoRA adapters, and embedding pipelines |
| 6 | **APICatalog** | Curated directory of 3rd-party APIs with live testing, billing aggregation, and SDK generation |
| 7 | **InsightEngine** | Real-time analytics & observability dashboards for agent workflows and API usage |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS v4, shadcn/ui |
| **Backend** | Node.js, Fastify, Python (FastAPI), Go |
| **AI / ML** | LangChain, LlamaIndex, ONNX Runtime, vLLM |
| **Database** | PostgreSQL, Redis, Qdrant (vector store) |
| **Infrastructure** | Docker, Kubernetes, Terraform, GitHub Actions |
| **Observability** | OpenTelemetry, Grafana, Sentry |

---

## How to Navigate

```bash
# Clone the repository
git clone https://github.com/your-org/Prometheus_IA_Dev_Marketplace.git
cd Prometheus_IA_Dev_Marketplace

# Install root dependencies
npm install    # or pnpm install / yarn

# Explore a product
cd apps/agent-forge       # AgentForge frontend
cd services/prompt-lab    # PromptLab backend
```

Each product has its own `README.md` with detailed setup instructions, environment variables, and local development guides.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on code style, branching, PR workflows, and code of conduct.

---

## License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.
