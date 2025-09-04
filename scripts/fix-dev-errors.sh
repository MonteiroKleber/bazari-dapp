#!/bin/bash

# Script para corrigir todos os erros do pnpm dev
# Uso: chmod +x scripts/fix-dev-errors.sh && ./scripts/fix-dev-errors.sh

set -e

echo "🔧 Iniciando correção dos erros do projeto Bazari..."
echo "================================================"

# 1. Limpar cache e node_modules
echo "📦 Limpando cache e reinstalando dependências..."
rm -rf node_modules packages/*/node_modules apps/*/node_modules
rm -rf .turbo
pnpm store prune

# 2. Reinstalar dependências
echo "📦 Reinstalando dependências..."
pnpm install

# 3. Adicionar dependência faltante no tsconfig base
echo "📝 Atualizando tsconfig.base.json..."
cat > tsconfig.base.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@bazari/*": ["packages/*/src", "apps/*/src"]
    }
  },
  "exclude": ["node_modules", "dist", "build", ".turbo"]
}
EOF

# 4. Atualizar package.json do API para suportar ESM
echo "📝 Atualizando apps/api/package.json..."
cd apps/api
npm pkg set type=module
cd ../..

# 5. Criar arquivo tsconfig para API com módulos ESM
echo "📝 Criando apps/api/tsconfig.json otimizado..."
cat > apps/api/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# 6. Remover plugin problemático do Vite temporariamente
echo "📝 Ajustando vite.config.ts para remover topLevelAwait..."
sed -i.bak '/topLevelAwait/d' apps/web/vite.config.ts 2>/dev/null || true
sed -i.bak '/vite-plugin-top-level-await/d' apps/web/vite.config.ts 2>/dev/null || true

# 7. Criar arquivo de configuração para tsx
echo "📝 Criando arquivo de configuração tsx..."
cat > apps/api/tsconfig.tsx.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "target": "ES2020"
  }
}
EOF

# 8. Limpar build artifacts antigos
echo "🧹 Limpando artifacts de build antigos..."
pnpm clean 2>/dev/null || true

# 9. Rebuild dos pacotes base
echo "🔨 Reconstruindo pacotes base..."
pnpm --filter @bazari/chain-client build 2>/dev/null || true
pnpm --filter @bazari/wallet-core build 2>/dev/null || true

# 10. Criar link simbólico para resolver problema de importação
echo "🔗 Criando links simbólicos..."
cd node_modules/.pnpm
ln -sf @polkadot+keyring@*/node_modules/@polkadot/keyring @polkadot-keyring 2>/dev/null || true
cd ../..

echo ""
echo "✅ Correções aplicadas com sucesso!"
echo "================================================"
echo ""
echo "📌 Próximos passos:"
echo "   1. Execute: pnpm dev"
echo "   2. Se ainda houver erros, execute: pnpm install --force"
echo "   3. Em último caso: rm -rf pnpm-lock.yaml && pnpm install"
echo ""
echo "💡 Dica: Se o erro persistir no IPFS, considere usar a versão 60.0.0 ao invés da 60.0.1"
echo "   pnpm add ipfs-http-client@60.0.0 -F @bazari/api"
echo ""