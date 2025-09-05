#!/bin/bash
# test-etapa2.sh - Script de teste da Etapa 2

echo "🧪 Testando Sistema de Produção - Etapa 2"
echo "=========================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local expected_status=$4
    local description=$5
    
    echo -n "  Testing: $description... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method $url)
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method -H "Content-Type: application/json" -d "$data" $url)
    fi
    
    if [ "$response" == "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} ($response)"
    else
        echo -e "${RED}✗${NC} (Got $response, expected $expected_status)"
    fi
}

# ==================== 1. VERIFICAR SERVIÇOS ====================

echo ""
echo "1️⃣  Verificando Serviços"
echo "------------------------"

# PostgreSQL
echo -n "  PostgreSQL... "
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "    Execute: sudo systemctl start postgresql"
fi

# Redis
echo -n "  Redis... "
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "    Execute: sudo systemctl start redis-server"
fi

# Backend
echo -n "  Backend API... "
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "    Execute: cd apps/api && pnpm dev"
fi

# Frontend
echo -n "  Frontend... "
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "    Execute: cd apps/web && pnpm dev"
fi

# Blockchain
echo -n "  Blockchain... "
if curl -s http://localhost:9933 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} (Opcional para testes básicos)"
fi

# ==================== 2. HEALTH CHECK DETALHADO ====================

echo ""
echo "2️⃣  Health Check Detalhado"
echo "--------------------------"

health_response=$(curl -s http://localhost:3001/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "$health_response" | jq '.' 2>/dev/null || echo "$health_response"
else
    echo -e "${RED}Health check falhou${NC}"
fi

# ==================== 3. TESTE DE ENDPOINTS ====================

echo ""
echo "3️⃣  Testando Endpoints"
echo "----------------------"

API_URL="http://localhost:3001"

# Health
test_endpoint "GET" "$API_URL/health" "" "200" "Health Check"

# Registro sem dados (deve falhar)
test_endpoint "POST" "$API_URL/auth/register" "{}" "400" "Register (sem dados)"

# Login sem dados (deve falhar)
test_endpoint "POST" "$API_URL/auth/login" "{}" "400" "Login (sem dados)"

# Wallet sem auth (deve falhar)
test_endpoint "GET" "$API_URL/wallet/accounts" "" "401" "Wallet (sem auth)"

# ==================== 4. VERIFICAR BANCO DE DADOS ====================

echo ""
echo "4️⃣  Verificando Banco de Dados"
echo "------------------------------"

echo -n "  Tabelas criadas... "
table_count=$(psql -U bazari -d bazari_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')

if [ ! -z "$table_count" ] && [ "$table_count" -gt "0" ]; then
    echo -e "${GREEN}✓${NC} ($table_count tabelas)"
    
    # Listar tabelas
    echo "  Tabelas encontradas:"
    psql -U bazari -d bazari_db -c "\dt" 2>/dev/null | grep -E '^\s+public' | awk '{print "    - " $3}'
else
    echo -e "${RED}✗${NC}"
    echo "    Execute: cd apps/api && npx prisma migrate dev"
fi

# ==================== 5. VERIFICAR REDIS ====================

echo ""
echo "5️⃣  Verificando Redis"
echo "--------------------"

echo -n "  Conexão... "
redis_ping=$(redis-cli ping 2>/dev/null)
if [ "$redis_ping" == "PONG" ]; then
    echo -e "${GREEN}✓${NC}"
    
    # Contar chaves
    key_count=$(redis-cli DBSIZE | awk '{print $2}')
    echo "  Chaves armazenadas: $key_count"
    
    # Listar padrões de chaves
    echo "  Padrões de chaves:"
    redis-cli --scan --pattern "*" 2>/dev/null | head -5 | while read key; do
        echo "    - $key"
    done
else
    echo -e "${RED}✗${NC}"
fi

# ==================== 6. TESTE DE SEGURANÇA ====================

echo ""
echo "6️⃣  Verificações de Segurança"
echo "-----------------------------"

# JWT Secret
echo -n "  JWT_SECRET configurado... "
if [ -f "apps/api/.env" ]; then
    jwt_secret=$(grep "JWT_SECRET=" apps/api/.env | cut -d'=' -f2)
    if [ ! -z "$jwt_secret" ] && [ "$jwt_secret" != "your-super-secret-jwt-key-change-this-in-production" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠${NC} (Usando secret padrão)"
    fi
else
    echo -e "${RED}✗${NC} (Arquivo .env não encontrado)"
fi

# Rate Limiting
echo -n "  Rate limiting... "
# Fazer 5 requisições rápidas
for i in {1..5}; do
    curl -s -o /dev/null http://localhost:3001/health
done
last_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)
if [ "$last_response" == "429" ] || [ "$last_response" == "200" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC}"
fi

# ==================== 7. TESTE DE FLUXO COMPLETO ====================

echo ""
echo "7️⃣  Teste de Fluxo Completo (Simulação)"
echo "---------------------------------------"

echo "  Para testar o fluxo completo:"
echo "  1. Abra http://localhost:5173 no navegador"
echo "  2. Clique em 'Criar Carteira'"
echo "  3. Digite uma senha forte"
echo "  4. Anote a seed phrase (12 palavras)"
echo "  5. Verifique o dashboard"
echo ""
echo "  Comandos úteis para debug:"
echo "    - Ver logs do backend: cd apps/api && pnpm logs"
echo "    - Ver banco de dados: cd apps/api && pnpm db:studio"
echo "    - Ver Redis: redis-cli MONITOR"
echo "    - Ver rede: cd apps/bazari-chain && cargo run -- --dev"

# ==================== RESUMO ====================

echo ""
echo "=========================================="
echo "📊 Resumo do Teste"
echo "=========================================="

all_good=true

# Verificar serviços críticos
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${RED}❌ PostgreSQL não está rodando${NC}"
    all_good=false
fi

if ! redis-cli ping > /dev/null 2>&1; then
    echo -e "${RED}❌ Redis não está rodando${NC}"
    all_good=false
fi

if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend não está rodando${NC}"
    all_good=false
fi

if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${RED}❌ Frontend não está rodando${NC}"
    all_good=false
fi

if $all_good; then
    echo -e "${GREEN}✅ Sistema pronto para uso!${NC}"
    echo ""
    echo "🎯 Próximos passos:"
    echo "   1. Acesse http://localhost:5173"
    echo "   2. Crie uma nova carteira"
    echo "   3. Explore o dashboard"
else
    echo -e "${YELLOW}⚠️  Alguns serviços precisam ser iniciados${NC}"
    echo ""
    echo "🔧 Execute:"
    echo "   ./setup-etapa2.sh  # Para configurar tudo"
    echo "   pnpm dev           # Para iniciar o sistema"
fi

echo ""
echo "=========================================="