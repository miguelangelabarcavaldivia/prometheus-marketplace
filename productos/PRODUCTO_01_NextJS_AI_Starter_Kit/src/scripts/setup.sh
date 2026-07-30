#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "============================================"
echo "  NextJS AI Starter Kit - Setup"
echo "============================================"
echo ""

# ─── Check prerequisites ────────────────────────────
echo "[1/5] Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo "ERROR: Node.js is required (v18+). Install from https://nodejs.org"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "ERROR: npm is required."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "WARNING: Docker not found. PostgreSQL/Redis won't start automatically."; }

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "ERROR: Node.js v18+ required. Found: $(node -v)"
  exit 1
fi

echo "  ✓ Node.js $(node -v)"
echo "  ✓ npm $(npm -v)"
echo ""

# ─── Environment file ───────────────────────────────
echo "[2/5] Setting up environment variables..."

if [ ! -f "$PROJECT_DIR/.env" ]; then
  cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
  echo "  ✓ Created .env from .env.example"

  # Generate a random AUTH_SECRET
  if command -v openssl >/dev/null 2>&1; then
    AUTH_SECRET=$(openssl rand -hex 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|AUTH_SECRET=.*|AUTH_SECRET=$AUTH_SECRET|" "$PROJECT_DIR/.env"
    else
      sed -i "s|AUTH_SECRET=.*|AUTH_SECRET=$AUTH_SECRET|" "$PROJECT_DIR/.env"
    fi
    echo "  ✓ Generated AUTH_SECRET"
  fi

  echo "  ⚠  Edit .env and add your API keys (OpenAI, GitHub OAuth, Stripe)"
else
  echo "  ✓ .env already exists"
fi
echo ""

# ─── Docker services ────────────────────────────────
echo "[3/5] Starting Docker services..."

if command -v docker >/dev/null 2>&1; then
  cd "$PROJECT_DIR"
  docker compose up -d 2>/dev/null && echo "  ✓ PostgreSQL and Redis started" || echo "  ⚠  Docker compose failed — start services manually"
else
  echo "  ⚠  Docker not found. Start PostgreSQL and Redis manually."
fi
echo ""

# ─── Install dependencies ───────────────────────────
echo "[4/5] Installing npm dependencies..."

cd "$PROJECT_DIR"
npm install

echo "  ✓ Dependencies installed"
echo ""

# ─── Database setup ─────────────────────────────────
echo "[5/5] Setting up database..."

cd "$PROJECT_DIR"

# Run Prisma migrations
npx prisma generate 2>/dev/null && echo "  ✓ Prisma client generated"
npx prisma db push 2>/dev/null && echo "  ✓ Database schema pushed" || echo "  ⚠  Database push failed — ensure PostgreSQL is running"

echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo ""
echo "  Next steps:"
echo "  1. Edit .env with your API keys"
echo "  2. Run 'npm run dev' to start"
echo "  3. Visit http://localhost:3000"
echo ""
echo "  For production deployment:"
echo "  - Set up a PostgreSQL database (Railway, Neon, Supabase)"
echo "  - Add your Stripe publishable/secret keys"
echo "  - Configure OAuth apps (GitHub, Google)"
echo "  - Deploy to Vercel: npx vercel deploy"
echo ""
