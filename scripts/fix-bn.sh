#!/bin/bash

# Script para corrigir erro BN.js no Bazari
echo "🔧 Corrigindo erro BN.js no projeto Bazari..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📦 Instalando dependências necessárias...${NC}"

# Instalar vite-plugin-node-polyfills
pnpm add -D vite-plugin-node-polyfills -F @bazari/web

# Reinstalar dependências do chain-client para garantir
cd packages/chain-client
pnpm install
pnpm build
cd ../..

# Reinstalar dependências do wallet-core
cd packages/wallet-core  
pnpm install
pnpm build
cd ../..

# Limpar cache do Vite
echo -e "${YELLOW}🧹 Limpando cache do Vite...${NC}"
rm -rf apps/web/node_modules/.vite

# Reinstalar dependências do web
cd apps/web
pnpm install
cd ../..

echo -e "${GREEN}✅ Correções aplicadas!${NC}"
echo -e "${GREEN}🚀 Agora execute 'pnpm dev' para iniciar o projeto${NC}"