# AI Commit - VS Code Extension

AI-powered commit messages, code reviews, improvement suggestions, and changelogs — all from within VS Code.

## Features

| Command | Description |
|---------|-------------|
| `AI Commit: Generate Commit Message` | Analyzes staged changes and writes a commit message |
| `AI Commit: Review Latest Commit` | Reviews the last commit for bugs, security, and quality |
| `AI Commit: Suggest Improvements` | Analyzes unstaged changes and suggests improvements |
| `AI Commit: Generate Changelog` | Generates a changelog from recent git history |

All commands are accessible from the Command Palette (`Ctrl+Shift+P`), the SCM title bar, the editor context menu, and the explorer context menu.

![Screenshot placeholder](https://via.placeholder.com/800x450?text=AI+Commit+Screenshot)

## Requirements

- **VS Code** 1.85.0 or later
- **Node.js** 18+ (bundled with VS Code)
- **Git** repository with a remote (for AI analysis)
- An API key for one of the supported AI providers (OpenAI, Anthropic, or Google Gemini)

## Installation

### From VS Code Marketplace
1. Open the Extensions view (`Ctrl+Shift+X`)
2. Search for "AI Commit"
3. Click **Install**

### From VSIX
1. Download the `.vsix` file
2. In VS Code, run **Extensions: Install from VSIX...**
3. Select the file

## Setup

After installing, create an `.aicommitrc` file in your home directory or project root:

```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "apiKey": "your-api-key-here",
  "conventionalCommits": true,
  "emoji": false,
  "language": "en"
}
```

Alternatively, set the environment variable for your chosen provider:

- OpenAI: `OPENAI_API_KEY`
- Anthropic: `ANTHROPIC_API_KEY`
- Google Gemini: `GEMINI_API_KEY`

You can also use `AICOMMIT_API_KEY`, `AICOMMIT_PROVIDER`, and `AICOMMIT_MODEL` environment variables.

### Supported Providers

| Provider | SDK Package | Default Model |
|----------|-------------|---------------|
| OpenAI | `openai` | gpt-4o |
| Anthropic | `@anthropic-ai/sdk` | claude-3-opus-20240229 |
| Google Gemini | `@google/generative-ai` | gemini-pro |

## Usage

1. **Stage your changes** (`git add` your files)
2. Run **AI Commit: Generate Commit Message** from the Command Palette or SCM title bar
3. The generated message appears in the SCM input box
4. Adjust if needed and commit

For reviews, suggestions, and changelogs, use the corresponding commands.

## Status Bar

An **AI Commit** item is added to the status bar. Click it to quickly generate a commit message.

## Development

```bash
# Clone and install
git clone https://github.com/miguelabarca/aicommit.git
cd aicommit

# Install extension dependencies
npm install

# Compile TypeScript
npm run compile

# Run in VS Code (F5)
```

### Building the VSIX

```bash
npm install -g @vscode/vsce
vsce package
```

## Configuration

See the [main CLI documentation](https://github.com/miguelabarca/aicommit) for all available options.

## License

MIT
