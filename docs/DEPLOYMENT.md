# 🚀 Deployment Guide — Prometheus IA Dev Marketplace

## Pre-requisitos

- Node.js 20+
- npm 10+
- Cuenta de Gumroad (access token)
- Cuenta de GitHub

## 1. Deploy en Vercel (Next.js AI Starter Kit)

```bash
# 1. Fork el repositorio
git clone https://github.com/miguelabarca/nextjs-ai-starter.git
cd nextjs-ai-starter

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Edit .env.local con tus API keys:
# - OPENAI_API_KEY
# - AUTH_SECRET
# - STRIPE_SECRET_KEY
# - NEXTAUTH_URL

# 4. Deploy en Vercel
vercel --prod
```

## 2. Deploy en Docker (AI Agent Pipeline)

```bash
cd productos/PRODUCTO_05_AI_Agent_Pipeline
docker compose up -d
```

Variables de entorno necesarias:
```bash
OPENAI_API_KEY=sk-...
REDIS_URL=redis://localhost:6379
GITHUB_TOKEN=ghp_...  # Para code review agent
SLACK_BOT_TOKEN=xoxb-...  # Para customer support agent
```

## 3. CLI Tool (npm global)

```bash
npm install -g @miguelabarca/aicommit
aicommit generate
```

Variables de entorno:
```bash
export AI_PROVIDER=openai  # o anthropic, groq, google
export OPENAI_API_KEY=sk-...
```

## 4. Gumroad Product Upload

### Attach files to products
```bash
# Usar el presign upload script
node scripts/gumroad-presign-upload.mjs <product_id> <file_path>

# Ejemplo:
node scripts/gumroad-presign-upload.mjs "3GwDAXU1HguMAQfh5YbyeQ==" ./nextjs-ai-starter-kit.zip
```

### Enable products
```bash
curl -X PUT "https://api.gumroad.com/v2/products/<product_id>/enable" \
  -d "access_token=$GUMROAD_ACCESS_TOKEN"
```

## 5. GitHub Actions CI

El workflow de CI se ejecuta automáticamente en cada push a master.

Para deploy manual:
```bash
gh workflow run publish-npm.yml -f version=patch
```

## 6. VS Code Extension

```bash
cd productos/PRODUCTO_07_CLI_AI_Commit_Tool/src/vscode-extension
npm install
npm run compile
# Presiona F5 para testear en modo desarrollo
# O usa: vsce package para crear el .vsix
```

## Troubleshooting

### Error: "Rate limit exceeded"
- Gumroad API: 10 product creates/day, resets at midnight UTC
- OpenAI API: revisa tu plan en platform.openai.com

### Error: "Module not found"
```bash
rm -rf node_modules && npm install
```

### Error: "Port already in use"
```bash
lsof -i :3000  # Find process
kill -9 <PID>  # Kill it
```

## Soporte

- 📧 Email: miguel@prometheus-ia.dev
- 💬 Discord: https://discord.gg/prometheus-ia
- 🐛 Issues: https://github.com/miguelabarca/Prometheus_IA_Dev_Marketplace/issues
