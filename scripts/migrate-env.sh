#!/bin/bash
# migrate-env.sh - Script para migrar variáveis de ambiente

set -e

echo "🔄 Migrando Variáveis de Ambiente para Etapa 2"
echo "=============================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ==================== BACKEND ====================

echo "📦 1. Atualizando Backend (.env)..."
cd apps/api

# Fazer backup do .env existente se houver
if [ -f .env ]; then
    echo "   Criando backup do .env existente..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "   ${GREEN}✓${NC} Backup criado"
fi

# Criar novo .env com as variáveis corretas
echo "   Criando novo arquivo .env..."
cat > .env << 'EOF'
# API Configuration
NODE_ENV=development
API_PORT=3333
API_HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://bazari:bazari@localhost:5432/bazari_db

# JWT
JWT_SECRET=change-this-secret-in-production-please-use-a-strong-secret
JWT_EXPIRES_IN=7d

# Blockchain
CHAIN_ENDPOINT=ws://localhost:9944

# IPFS
IPFS_API_URL=http://localhost:5001
IPFS_GATEWAY=http://localhost:8080

# Redis
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# OpenSearch (optional)
OPENSEARCH_HOST=http://localhost:9200
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=admin

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# Security
BCRYPT_ROUNDS=10
LOG_LEVEL=info
EOF

# Gerar JWT secret aleatório
JWT_SECRET=$(openssl rand -base64 32)
sed -i "s/change-this-secret-in-production-please-use-a-strong-secret/$JWT_SECRET/g" .env

echo -e "   ${GREEN}✓${NC} Novo .env criado com JWT_SECRET seguro"

# ==================== FRONTEND ====================

echo ""
echo "🎨 2. Atualizando Frontend (.env.local)..."
cd ../web

# Fazer backup se existir
if [ -f .env.local ]; then
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "   ${GREEN}✓${NC} Backup criado"
fi

# Criar .env.local
cat > .env.local << 'EOF'
# Frontend Environment Variables
VITE_API_URL=http://localhost:3333
VITE_WS_PROVIDER=ws://127.0.0.1:9944
VITE_IPFS_GATEWAY=http://localhost:8080
EOF

echo -e "   ${GREEN}✓${NC} .env.local atualizado"

# ==================== DATABASE ====================

echo ""
echo "💾 3. Configurando Banco de Dados..."

# Verificar se PostgreSQL está rodando
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "   ${YELLOW}⚠${NC}  PostgreSQL não está rodando"
    echo "   Iniciando PostgreSQL..."
    sudo systemctl start postgresql
fi

# Criar usuário e database
echo "   Criando usuário 'bazari' e database 'bazari_db'..."
sudo -u postgres psql <<EOF 2>/dev/null || true
-- Criar usuário se não existir
DO
\$do\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'bazari') THEN
      CREATE USER bazari WITH PASSWORD 'bazari';
   END IF;
END
\$do\$;

-- Criar database se não existir
SELECT 'CREATE DATABASE bazari_db OWNER bazari'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bazari_db')\gexec;

-- Dar todas as permissões
GRANT ALL PRIVILEGES ON DATABASE bazari_db TO bazari;
EOF

echo -e "   ${GREEN}✓${NC} Database configurado"

# ==================== MIGRATIONS ====================

echo ""
echo "🔄 4. Executando Migrations..."
cd ../api

# Gerar Prisma Client
npx prisma generate

# Executar migrations
echo "   Aplicando migrations..."
npx prisma migrate dev --name init || npx prisma db push

echo -e "   ${GREEN}✓${NC} Migrations aplicadas"

# ==================== VERIFICAÇÃO ====================

echo ""
echo "🔍 5. Verificando Configuração..."
cd ../..

# Verificar se tudo está OK
all_good=true

# PostgreSQL
echo -n "   PostgreSQL... "
if psql -U bazari -d bazari_db -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} Verifique a senha do usuário bazari"
    all_good=false
fi

# Redis
echo -n "   Redis... "
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} Execute: sudo systemctl start redis-server"
    all_good=false
fi

# Arquivos de configuração
echo -n "   Backend .env... "
if [ -f apps/api/.env ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC}"
    all_good=false
fi

echo -n "   Frontend .env.local... "
if [ -f apps/web/.env.local ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC}"
    all_good=false
fi

# ==================== RESUMO ====================

echo ""
echo "=============================================="
if $all_good; then
    echo -e "${GREEN}✅ Migração concluída com sucesso!${NC}"
    echo ""
    echo "📝 Mudanças aplicadas:"
    echo "   • Backend porta: 3001 → 3333"
    echo "   • Database: bazari_dev → bazari_db"
    echo "   • Usuário DB: postgres → bazari"
    echo "   • Novas variáveis: JWT_EXPIRES_IN, BCRYPT_ROUNDS, LOG_LEVEL"
    echo ""
    echo "🚀 Para iniciar o sistema:"
    echo "   pnpm dev"
    echo ""
    echo "🌐 URLs de acesso:"
    echo "   • Frontend: http://localhost:5173"
    echo "   • Backend:  http://localhost:3333"
    echo "   • Health:   http://localhost:3333/health"
else
    echo -e "${YELLOW}⚠️  Migração concluída com avisos${NC}"
    echo ""
    echo "Verifique os itens marcados com ⚠️ acima"
fi

echo ""
echo "💾 Backups criados:"
ls -la apps/api/.env.backup.* 2>/dev/null || echo "   Nenhum backup de backend"
ls -la apps/web/.env.local.backup.* 2>/dev/null || echo "   Nenhum backup de frontend"

echo ""
echo "=============================================="