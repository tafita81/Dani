#!/bin/bash
# deploy.sh — Deploy automatizado do Assistente Clínico
# Uso: ./scripts/deploy.sh [--fresh]

set -e

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m"

log()  { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; exit 1; }

echo -e "${BOLD}🚀 Deploy — Assistente Clínico${NC}"
echo "================================"

# ── Verificar dependências ────────────────────────────────────
command -v node   >/dev/null || err "Node.js não instalado"
command -v pnpm   >/dev/null || err "pnpm não instalado. Execute: npm i -g pnpm"
command -v docker >/dev/null || warn "Docker não encontrado — pulando containers"

# ── Verificar .env ────────────────────────────────────────────
if [ ! -f ".env" ]; then
  warn ".env não encontrado — copiando .env.example"
  cp .env.example .env
  err "Configure o .env antes de continuar!"
fi

log ".env encontrado"

# ── Subir infraestrutura ──────────────────────────────────────
if command -v docker &>/dev/null; then
  log "Subindo MySQL e Redis..."
  docker-compose up -d mysql redis
  sleep 5
  log "Infraestrutura pronta"
fi

# ── Instalar dependências ─────────────────────────────────────
log "Instalando dependências..."
pnpm install --frozen-lockfile

# ── Migrar banco ──────────────────────────────────────────────
log "Aplicando migrações do banco..."
pnpm db:push

# ── Build ─────────────────────────────────────────────────────
log "Build de produção..."
pnpm build

# ── Registrar webhook Telegram ────────────────────────────────
if grep -q "TELEGRAM_BOT_TOKEN=.\+" .env 2>/dev/null; then
  log "Registrando webhook Telegram..."
  node -e "
    import('./dist/integrations/telegram.js')
      .then(m => m.registerWebhook())
      .catch(console.error)
  " || warn "Telegram webhook falhou — configure manualmente"
fi

# ── PM2 ───────────────────────────────────────────────────────
if command -v pm2 &>/dev/null; then
  mkdir -p logs
  pm2 delete assistente-clinico 2>/dev/null || true
  pm2 start pm2.ecosystem.config.js
  pm2 save
  log "PM2 iniciado — sistema rodando 24/7"
  pm2 status
else

  warn "PM2 não encontrado. Iniciando com node..."
  NODE_ENV=production node dist/index.js &
  log "Servidor iniciado em background (PID: $!)"
fi

echo ""
echo -e "${BOLD}🎉 Deploy concluído!${NC}"
echo -e "   App:    http://localhost:3000"
echo -e "   Health: http://localhost:3000/api/health"
echo ""
