# NextJS AI Starter Kit

A production-ready AI chat application built with Next.js 15, TypeScript, and OpenAI. Features multi-model support with automatic fallback, Stripe subscriptions, Auth.js authentication, and 10 pre-configured developer prompts.

**Price: $49** — [Buy on Gumroad](https://gumroad.com)

## Features

- **Multi-Model AI Chat** — GPT-4o, GPT-4o-mini, GPT-4 Turbo, GPT-3.5 Turbo with automatic fallback
- **Streaming Responses** — Real-time token-by-token streaming via Server-Sent Events
- **Authentication** — GitHub and Google OAuth via Auth.js v5 with JWT sessions
- **Stripe Subscriptions** — Monthly ($29) and yearly ($249) plans with Stripe Checkout
- **10 Pre-Configured Prompts** — Code generation, debugging, code review, test writing, documentation, refactoring, API design, database queries, deployment checks, and commit messages
- **PostgreSQL + Redis** — Docker Compose setup for local development
- **Rate Limiting** — Configurable request limiting per user/IP
- **Responsive UI** — Tailwind CSS with dark mode support
- **Type Safe** — Full TypeScript coverage across the entire codebase

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | [TypeScript 5.6](https://www.typescriptlang.org) |
| AI SDK | [OpenAI Node SDK v4](https://github.com/openai/openai-node) |
| Auth | [Auth.js v5](https://authjs.dev) (next-auth@beta) |
| Database | [PostgreSQL 16](https://www.postgresql.org) + [Prisma ORM](https://www.prisma.io) |
| Cache | [Redis 7](https://redis.io) |
| Payments | [Stripe](https://stripe.com) |
| Styling | [Tailwind CSS 3.4](https://tailwindcss.com) |
| Container | [Docker Compose](https://docs.docker.com/compose/) |

## Quick Start

### Prerequisites

- Node.js 18+ (recommended: 20 LTS)
- Docker Desktop (for PostgreSQL + Redis)
- npm or pnpm

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd nextjs-ai-starter-kit

# 2. Start database services
docker compose up -d

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# 4. Install dependencies
npm install

# 5. Push database schema
npx prisma db push

# 6. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Automated Setup

```bash
npm run setup
```

## Project Structure

```
├── bonus/
│   ├── postman-collection.json    # Postman API collection
│   └── deployment-guide.md        # Vercel deployment guide
├── prisma/
│   └── schema.prisma              # Database schema
├── scripts/
│   ├── setup.sh                   # Automated setup script
│   └── seed.ts                    # Database seed script
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth] # Auth.js API route
│   │   │   ├── chat/              # Chat API (streaming)
│   │   │   └── stripe/            # Stripe checkout & webhook
│   │   ├── chat/                  # Chat page (Client Component)
│   │   ├── dashboard/             # User dashboard
│   │   ├── login/                 # Login page
│   │   ├── pricing/               # Subscription pricing
│   │   ├── prompts/               # Prompts library
│   │   ├── globals.css            # Tailwind imports
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Landing page
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx  # Main chat UI with streaming
│   │   │   └── ChatMessage.tsx    # Message bubble component
│   │   ├── AuthButton.tsx         # Sign in/out button
│   │   ├── Header.tsx             # Site header
│   │   └── Providers.tsx          # Session provider wrapper
│   ├── lib/
│   │   ├── auth.ts                # Auth.js configuration
│   │   ├── openai.ts              # OpenAI client + streaming + rate limiting
│   │   ├── prisma.ts              # Prisma singleton
│   │   └── stripe.ts              # Stripe client
│   └── prompts/                   # 10 pre-configured AI prompts
│       ├── code-generator.md
│       ├── debug-assistant.md
│       ├── code-review.md
│       ├── test-writer.md
│       ├── docs-generator.md
│       ├── refactor-suggestor.md
│       ├── api-designer.md
│       ├── db-query-helper.md
│       ├── deploy-checker.md
│       └── commit-writer.md
├── docker-compose.yml             # PostgreSQL + Redis
├── next.config.ts                 # Next.js configuration
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

## API Reference

### Authentication

All chat endpoints require authentication. Use Auth.js session cookies.

### `POST /api/chat`

Send a message and receive a streaming response.

**Request Body:**
```json
{
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Write a hello world function." }
  ],
  "model": "gpt-4o-mini",
  "temperature": 0.7,
  "maxTokens": 2048,
  "topP": 1
}
```

**Response:** Server-Sent Events stream
```
{"chatId":"clxyz..."}
{"token":"Hello"}
{"token":" world"}
...
{"done":true,"model":"gpt-4o-mini"}
```

**Error format:**
```
{"error":"message","code":"ERROR_CODE","retryable":false,"model":"gpt-4o"}
```

### `GET /api/chat`

Get user's chat history or a specific chat.

**Query params:**
- `chatId` (optional) — Get specific chat with messages

### `DELETE /api/chat?chatId=...`

Delete a chat and its messages.

### `POST /api/stripe/checkout`

Create a Stripe Checkout session.

**Request Body:**
```json
{ "priceId": "price_monthly_id" }
```

**Response:**
```json
{ "url": "https://checkout.stripe.com/..." }
```

### `POST /api/stripe/webhook`

Stripe webhook handler for subscription events.

**Events handled:**
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

## Environment Variables

See [.env.example](.env.example) for all variables.

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `OPENAI_API_KEY` | OpenAI API key | — |
| `AUTH_SECRET` | Session encryption secret | — |
| `AUTH_GITHUB_ID` | GitHub OAuth client ID | — |
| `AUTH_GITHUB_SECRET` | GitHub OAuth client secret | — |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | — |
| `STRIPE_SECRET_KEY` | Stripe secret key | — |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | — |
| `OPENAI_ENABLED_MODELS` | Comma-separated allowed models | `gpt-4o,gpt-4o-mini,gpt-4-turbo,gpt-3.5-turbo` |
| `RATE_LIMIT_REQUESTS` | Max requests per window | `60` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | `60000` |

## Models

| Model | Context | Cost Input | Cost Output | Enabled by Default |
|-------|---------|------------|-------------|-------------------|
| GPT-4o | 128K | $2.50/1M tokens | $10/1M tokens | Yes |
| GPT-4o-mini | 128K | $0.15/1M tokens | $0.60/1M tokens | Yes |
| GPT-4 Turbo | 128K | $10/1M tokens | $30/1M tokens | Yes |
| GPT-3.5 Turbo | 16K | $0.50/1M tokens | $1.50/1M tokens | Yes |

## Database Schema

- **User** — User accounts with OAuth connections
- **Account** — OAuth provider accounts (GitHub, Google)
- **Session** — Session management
- **Chat** — Chat conversations with model and user association
- **Message** — Individual messages with role, content, token counts
- **Subscription** — Stripe subscription with status tracking
- **SavedPrompt** — Saved/preset prompts
- **ApiUsage** — API usage tracking and billing

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript check |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run setup` | Run automated setup script |

## Deployment

See [bonus/deployment-guide.md](bonus/deployment-guide.md) for complete Vercel deployment instructions.

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

## License

MIT — see [LICENSE](LICENSE)

## Support

- Documentation: This README
- Issues: GitHub Issues
- Email: support@example.com
