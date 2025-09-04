#!/bin/bash

# Script para verificar a estrutura completa do projeto Bazari
# Uso: ./scripts/check-structure.sh

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Contadores
TOTAL_FILES=0
MISSING_FILES=0
EXISTING_FILES=0
OPTIONAL_MISSING=0

# Arrays para armazenar arquivos faltantes
declare -a MISSING_LIST
declare -a OPTIONAL_MISSING_LIST

echo -e "${BLUE}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}║     🔍 VERIFICAÇÃO DA ESTRUTURA - PROJETO BAZARI    ║${NC}"
echo -e "${BLUE}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Função para verificar arquivo
check_file() {
    local file_path="$1"
    local is_optional="${2:-false}"
    
    TOTAL_FILES=$((TOTAL_FILES + 1))
    
    if [ -f "$file_path" ]; then
        echo -e "${GREEN}✅${NC} $file_path"
        EXISTING_FILES=$((EXISTING_FILES + 1))
        return 0
    else
        if [ "$is_optional" == "true" ]; then
            echo -e "${YELLOW}⚠️${NC}  $file_path ${YELLOW}(opcional - preparado para próxima etapa)${NC}"
            OPTIONAL_MISSING_LIST+=("$file_path")
            OPTIONAL_MISSING=$((OPTIONAL_MISSING + 1))
        else
            echo -e "${RED}❌${NC} $file_path ${RED}(FALTANDO!)${NC}"
            MISSING_LIST+=("$file_path")
            MISSING_FILES=$((MISSING_FILES + 1))
        fi
        return 1
    fi
}

# Função para verificar diretório
check_dir() {
    local dir_path="$1"
    if [ -d "$dir_path" ]; then
        echo -e "${GREEN}📁${NC} $dir_path/"
        return 0
    else
        echo -e "${RED}📁${NC} $dir_path/ ${RED}(DIRETÓRIO FALTANDO!)${NC}"
        MISSING_LIST+=("$dir_path/")
        return 1
    fi
}

echo -e "${BOLD}📁 Verificando Arquivos de Configuração Raiz...${NC}"
echo "────────────────────────────────────────────────"
check_file "package.json"
check_file "pnpm-workspace.yaml"
check_file "turbo.json"
check_file "tsconfig.base.json"
check_file ".env.example"
check_file ".gitignore"
check_file ".prettierrc"
check_file ".eslintrc.json"
check_file ".lintstagedrc.js"
check_file "Makefile"
check_file "README.md"
check_file "LICENSE"
check_file "CONTRIBUTING.md"
check_file "QUICKSTART.md"
echo ""

echo -e "${BOLD}📁 Verificando .vscode...${NC}"
echo "────────────────────────────────────────────────"
check_dir ".vscode"
check_file ".vscode/extensions.json"
check_file ".vscode/settings.json"
echo ""

echo -e "${BOLD}📁 Verificando .github...${NC}"
echo "────────────────────────────────────────────────"
check_dir ".github"
check_dir ".github/workflows"
check_file ".github/workflows/ci.yml"
echo ""

echo -e "${BOLD}📁 Verificando .husky...${NC}"
echo "────────────────────────────────────────────────"
check_dir ".husky"
check_file ".husky/pre-commit"
echo ""

echo -e "${BOLD}📁 Verificando apps/web...${NC}"
echo "────────────────────────────────────────────────"
check_dir "apps"
check_dir "apps/web"
check_file "apps/web/package.json"
check_file "apps/web/vite.config.ts"
check_file "apps/web/tailwind.config.js"
check_file "apps/web/postcss.config.js"
check_file "apps/web/tsconfig.json"
check_file "apps/web/tsconfig.node.json"
check_file "apps/web/index.html"
echo ""

echo -e "${BOLD}📁 Verificando apps/web/public...${NC}"
echo "────────────────────────────────────────────────"
check_dir "apps/web/public"
check_file "apps/web/public/bazari-logo.svg"
check_file "apps/web/public/manifest.json"
check_file "apps/web/public/robots.txt"
echo ""

echo -e "${BOLD}📁 Verificando apps/web/src...${NC}"
echo "────────────────────────────────────────────────"
check_dir "apps/web/src"
check_file "apps/web/src/index.css"
check_file "apps/web/src/main.tsx"
check_file "apps/web/src/App.tsx"
echo ""

echo -e "${BOLD}📁 Verificando apps/web/src/pages...${NC}"
echo "────────────────────────────────────────────────"
check_dir "apps/web/src/pages"
check_file "apps/web/src/pages/Landing.tsx"
check_file "apps/web/src/pages/Auth.tsx"
check_file "apps/web/src/pages/Wallet.tsx"
echo ""

echo -e "${BOLD}📁 Verificando apps/web/src/components...${NC}"
echo "────────────────────────────────────────────────"
check_dir "apps/web/src/components"
check_file "apps/web/src/components/Loading.tsx"
check_file "apps/web/src/components/Layout.tsx"
echo ""

echo -e "${BOLD}📁 Verificando apps/web/src/components/ui...${NC}"
echo "────────────────────────────────────────────────"
check_dir "apps/web/src/components/ui"
check_file "apps/web/src/components/ui/button.tsx"
check_file "apps/web/src/components/ui/card.tsx"
check_file "apps/web/src/components/ui/dropdown-menu.tsx"
check_file "apps/web/src/components/ui/tabs.tsx"
echo ""

echo -e "${BOLD}📁 Verificando apps/web/src/components/wallet...${NC}"
echo "────────────────────────────────────────────────"
check_dir "apps/web/src/components/wallet"
check_file "apps/web/src/components/wallet/WalletBalance.tsx"
check_file "apps/web/src/components/wallet/WalletConnect.tsx"
check_file "apps/web/src/components/wallet/TransactionHistory.tsx"
check_file "apps/web/src/components/wallet/SendModal.tsx"
check_file "apps/web/src/components/wallet/ReceiveModal.tsx"
check_file "apps/web/src/components/wallet/AccountManager.tsx"
echo ""

echo -e "${BOLD}📁 Verificando apps/web/src/hooks...${NC}"
echo "────────────────────────────────────────────────"
check_dir "apps/web/src/hooks"
check_file "apps/web/src/hooks/index.ts"
check_file "apps/web/src/hooks/useLocalStorage.ts"
check_file "apps/web/src/hooks/useMediaQuery.ts"
check_file "apps/web/src/hooks/useOnClickOutside.ts"
check_file "apps/web/src/hooks/useDebounce.ts"
check_file "apps/web/src/hooks/useCopyToClipboard.ts"
check_file "apps/web/src/hooks/useWallet.ts"
echo ""

echo -e "${BOLD}📁 Verificando apps/web/src/lib...${NC}"
echo "────────────────────────────────────────────────"
check_dir "apps/web/src/lib"
check_file "apps/web/src/lib/i18n.ts"
check_file "apps/web/src/lib/utils.ts"
echo ""

echo -e "${BOLD}📁 Verificando apps/web/src/store...${NC}"
echo "────────────────────────────────────────────────"
check_dir "apps/web/src/store"
check_file "apps/web/src/store/index.ts"
check_file "apps/web/src/store/auth.ts"
check_file "apps/web/src/store/wallet.ts"
echo ""

echo -e "${BOLD}📁 Verificando apps/web/src/locales...${NC}"
echo "────────────────────────────────────────────────"
check_dir "apps/web/src/locales"
check_dir "apps/web/src/locales/pt-BR"
check_file "apps/web/src/locales/pt-BR/common.json"
check_dir "apps/web/src/locales/en-US"
check_file "apps/web/src/locales/en-US/common.json"
check_dir "apps/web/src/locales/es-ES"
check_file "apps/web/src/locales/es-ES/common.json"
echo ""

echo -e "${BOLD}📁 Verificando packages/wallet-core...${NC}"
echo "────────────────────────────────────────────────"
check_dir "packages"
check_dir "packages/wallet-core"
check_file "packages/wallet-core/package.json"
check_file "packages/wallet-core/tsup.config.ts"
check_file "packages/wallet-core/tsconfig.json"
check_dir "packages/wallet-core/src"
check_file "packages/wallet-core/src/index.ts"
check_file "packages/wallet-core/src/crypto.ts"
echo ""

echo -e "${BOLD}📁 Verificando infra...${NC}"
echo "────────────────────────────────────────────────"
check_dir "infra"
check_file "infra/docker-compose.dev.yml"
check_file "infra/docker-compose.prod.yml"
check_dir "infra/ipfs"
check_file "infra/ipfs/config.template.json"
check_file "infra/ipfs/swarm.key"
echo ""

echo -e "${BOLD}📁 Verificando scripts...${NC}"
echo "────────────────────────────────────────────────"
check_dir "scripts"
check_file "scripts/setup.sh"
check_file "scripts/setup.ps1"
check_file "scripts/clean.sh"
check_file "scripts/fix-wasm.sh"
echo ""

echo -e "${BOLD}📁 Verificando docs...${NC}"
echo "────────────────────────────────────────────────"
check_dir "docs"
check_file "docs/COMMANDS.md"
check_file "docs/ETAPA2-COMPLETED.md"
echo ""

echo -e "${BOLD}📁 Verificando estruturas preparadas para próximas etapas...${NC}"
echo "────────────────────────────────────────────────"
check_dir "apps/api" true
check_dir "apps/bazari-chain" true
check_dir "apps/studio" true
check_dir "packages/chain-client" true
check_dir "packages/ipfs-client" true
check_dir "packages/ui-kit" true
check_dir "packages/schemas" true
check_dir "packages/dsl" true
check_dir "infra/kubernetes" true
echo ""

# Relatório Final
echo -e "${BLUE}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}║                  📊 RELATÓRIO FINAL                  ║${NC}"
echo -e "${BLUE}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BOLD}📈 Estatísticas:${NC}"
echo "────────────────────────────────────────────────"
echo -e "Total verificado: ${BOLD}$TOTAL_FILES${NC} arquivos/diretórios"
echo -e "✅ Existentes: ${GREEN}${BOLD}$EXISTING_FILES${NC}"
echo -e "❌ Faltando (obrigatórios): ${RED}${BOLD}$MISSING_FILES${NC}"
echo -e "⚠️  Opcionais (próximas etapas): ${YELLOW}${BOLD}$OPTIONAL_MISSING${NC}"
echo ""

# Status Final
if [ $MISSING_FILES -eq 0 ]; then
    echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}${BOLD}║         ✅ ESTRUTURA COMPLETA E CORRETA! ✅         ║${NC}"
    echo -e "${GREEN}${BOLD}║      Todos os arquivos obrigatórios presentes!      ║${NC}"
    echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}🎉 Projeto pronto para desenvolvimento!${NC}"
    echo -e "${GREEN}🚀 Execute 'pnpm dev' para iniciar${NC}"
    exit 0
else
    echo -e "${RED}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}${BOLD}║          ❌ ARQUIVOS FALTANDO NA ESTRUTURA! ❌      ║${NC}"
    echo -e "${RED}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}${BOLD}📋 Lista de arquivos/diretórios faltantes:${NC}"
    echo "────────────────────────────────────────────────"
    for missing in "${MISSING_LIST[@]}"; do
        echo -e "${RED}  • $missing${NC}"
    done
    echo ""
    echo -e "${YELLOW}💡 Dica: Execute os scripts de setup para criar os arquivos faltantes${NC}"
    echo -e "${YELLOW}   ./scripts/setup.sh (Linux/Mac) ou ./scripts/setup.ps1 (Windows)${NC}"
    exit 1
fi