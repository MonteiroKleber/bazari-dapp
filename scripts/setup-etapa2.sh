#!/bin/bash
# setup-etapa2.sh - Script completo de setup da Etapa 2

set -e

echo "🚀 Iniciando setup da Etapa 2 - Sistema Seguro para Produção"
echo "================================================"

# ==================== BACKEND SETUP ====================

echo ""
echo "📦 1. Configurando Backend..."
cd apps/api

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "   Criando arquivo .env..."
    cp .env.example .env
    
    # Gerar JWT secret aleatório
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/g" .env
    
    echo "   ✓ Arquivo .env criado com JWT_SECRET gerado"
fi

# Instalar dependências
echo "   Instalando dependências..."
pnpm add @fastify/cors @fastify/jwt @fastify/rate-limit \
    @prisma/client prisma \
    ioredis \
    @polkadot/util @polkadot/util-crypto @polkadot/api \
    bcrypt \
    dotenv \
    pino pino-pretty

pnpm add -D @types/bcrypt @types/node

echo "   ✓ Dependências instaladas"

# ==================== DATABASE SETUP ====================

echo ""
echo "💾 2. Configurando Banco de Dados..."

# Verificar se PostgreSQL está rodando
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "   ⚠️  PostgreSQL não está rodando. Iniciando..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Criar database se não existir
echo "   Criando database bazari_dev..."
sudo -u postgres psql <<EOF
SELECT 'CREATE DATABASE bazari_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bazari_dev')\gexec
EOF

echo "   ✓ Database configurado"

# Executar migrations
echo "   Executando migrations do Prisma..."
npx prisma generate
npx prisma migrate dev --name init || npx prisma db push

echo "   ✓ Migrations executadas"

# ==================== REDIS SETUP ====================

echo ""
echo "📦 3. Configurando Redis..."

# Verificar se Redis está instalado
if ! command -v redis-server &> /dev/null; then
    echo "   Instalando Redis..."
    sudo apt-get update
    sudo apt-get install -y redis-server
fi

# Verificar se Redis está rodando
if ! redis-cli ping > /dev/null 2>&1; then
    echo "   Iniciando Redis..."
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
fi

echo "   ✓ Redis configurado e rodando"

# ==================== FRONTEND SETUP ====================

echo ""
echo "🎨 4. Configurando Frontend..."
cd ../web

# Criar arquivo .env.local se não existir
if [ ! -f .env.local ]; then
    echo "   Criando arquivo .env.local..."
    cat > .env.local <<EOF
VITE_API_URL=http://localhost:3001
VITE_WS_PROVIDER=ws://127.0.0.1:9944
VITE_IPFS_GATEWAY=http://localhost:8080
EOF
    echo "   ✓ Arquivo .env.local criado"
fi

# Instalar dependências se necessário
echo "   Verificando dependências..."
pnpm add @polkadot/api @polkadot/keyring @polkadot/util @polkadot/util-crypto zustand

echo "   ✓ Frontend configurado"

# ==================== VERIFICAÇÃO FINAL ====================

cd ../..

echo ""
echo "🔍 5. Verificando instalação..."
echo ""

# Verificar PostgreSQL
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "   ✅ PostgreSQL: OK"
else
    echo "   ❌ PostgreSQL: ERRO"
fi

# Verificar Redis
if redis-cli ping > /dev/null 2>&1; then
    echo "   ✅ Redis: OK"
else
    echo "   ❌ Redis: ERRO"
fi

# Verificar Blockchain
if curl -s http://localhost:9933 > /dev/null 2>&1; then
    echo "   ✅ Blockchain: OK"
else
    echo "   ⚠️  Blockchain: Não detectada (certifique-se de estar rodando)"
fi

echo ""
echo "================================================"
echo "✨ Setup da Etapa 2 concluído!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Certifique-se que a blockchain está rodando:"
echo "      cd apps/bazari-chain && ./target/release/bazari-node --dev"
echo ""
echo "   2. Inicie o sistema:"
echo "      pnpm dev"
echo ""
echo "   3. Acesse:"
echo "      Frontend: http://localhost:5173"
echo "      Backend:  http://localhost:3333"
echo "      Health:   http://localhost:3333/health"
echo ""
echo "🔒 Segurança implementada:"
echo "   ✓ Criptografia AES-256-GCM"
echo "   ✓ PBKDF2 para derivação de chaves"
echo "   ✓ Verificação de assinaturas Polkadot"
echo "   ✓ Redis para sessões"
echo "   ✓ Rate limiting"
echo "   ✓ Logs estruturados"
echo "   ✓ Tratamento robusto de erros"
echo "================================================"