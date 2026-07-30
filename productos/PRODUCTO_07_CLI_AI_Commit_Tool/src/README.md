# @miguelabarcavaldivia/aicommit

AI-powered commit message generator and code review CLI tool.

```bash
npx @miguelabarcavaldivia/aicommit generate
```

No installation required.

## Commands

| Command | Description |
|---------|-------------|
| `aicommit generate` | Generate a commit message from staged changes |
| `aicommit review` | Review the latest commit |
| `aicommit suggest` | Suggest improvements for unstaged changes |
| `aicommit changelog` | Generate a changelog from recent commits |
| `aicommit init` | Create a `.aicommitrc` configuration file |

## Quick Start

```bash
# Create a config file
npx @miguelabarcavaldivia/aicommit init

# Edit .aicommitrc with your API key and provider

# Stage your changes
git add .

# Generate a commit message
npx @miguelabarcavaldivia/aicommit generate

# Review the latest commit
npx @miguelabarcavaldivia/aicommit review

# Get suggestions for unstaged changes
npx @miguelabarcavaldivia/aicommit suggest

# Generate a changelog
npx @miguelabarcavaldivia/aicommit changelog --count 30
```

Or install globally:
```bash
npm install -g @miguelabarcavaldivia/aicommit
aicommit generate
```

## Configuration

Create a `.aicommitrc` file in your project directory or home directory:

```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "apiKey": "sk-...",
  "maxTokens": 1000,
  "conventionalCommits": true,
  "emoji": false,
  "language": "en",
  "maxDiffLength": 15000
}
```

### AI Providers

| Provider | Config Value | Default Model | API Key Env Var |
|----------|-------------|---------------|-----------------|
| OpenAI | `openai` | `gpt-4o` | `OPENAI_API_KEY` |
| Anthropic | `anthropic` | `claude-3-5-sonnet-latest` | `ANTHROPIC_API_KEY` |
| Gemini | `gemini` | `gemini-2.0-flash` | `GEMINI_API_KEY` |

API keys are resolved in this order:
1. `AICOMMIT_API_KEY` environment variable
2. `apiKey` field in `.aicommitrc`
3. Provider-specific env var (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`)

### CLI Options

```bash
# Disable conventional commits for this run
npx aicommit generate --no-conventional

# Enable emoji mode for this run
npx aicommit generate --emoji

# Specify commit count for changelog
npx aicommit changelog --count 50
```

## GitHub Actions

Add the following secret to your repository:
- `AICOMMIT_API_KEY` — Your AI provider API key
- `AICOMMIT_PROVIDER` (optional) — Provider name (`openai`, `anthropic`, `gemini`)

The `.github/workflows/review.yml` workflow runs `aicommit review` on every PR.

## Development

```bash
git clone ...
npm install
npm run build
node dist/cli.js generate
```
