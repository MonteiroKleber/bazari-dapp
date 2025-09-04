#!/bin/bash

# Script para criar arquivos faltantes do projeto Bazari
# Uso: ./scripts/fix-missing.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
BOLD='\033[1m'

echo -e "${BLUE}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}║       🔧 CRIANDO ARQUIVOS FALTANTES - BAZARI        ║${NC}"
echo -e "${BLUE}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Função para criar arquivo se não existir
create_file_if_missing() {
    local file_path="$1"
    local content="${2:-}"
    
    if [ ! -f "$file_path" ]; then
        echo -e "${YELLOW}📝 Criando: $file_path${NC}"
        
        # Criar diretório se não existir
        mkdir -p "$(dirname "$file_path")"
        
        # Se tem conteúdo específico, usar ele
        if [ -n "$content" ]; then
            echo "$content" > "$file_path"
        else
            # Criar arquivo vazio ou com conteúdo padrão baseado na extensão
            case "${file_path##*.}" in
                "json")
                    echo "{}" > "$file_path"
                    ;;
                "ts"|"tsx")
                    echo "// File: $file_path" > "$file_path"
                    echo "export {}" >> "$file_path"
                    ;;
                "js"|"jsx")
                    echo "// File: $file_path" > "$file_path"
                    echo "module.exports = {}" >> "$file_path"
                    ;;
                "md")
                    echo "# $(basename "$file_path" .md)" > "$file_path"
                    ;;
                "css")
                    echo "/* File: $file_path */" > "$file_path"
                    ;;
                "html")
                    echo "<!DOCTYPE html>" > "$file_path"
                    echo "<html><head><title>Bazari</title></head><body></body></html>" >> "$file_path"
                    ;;
                "sh")
                    echo "#!/bin/bash" > "$file_path"
                    echo "# File: $file_path" >> "$file_path"
                    chmod +x "$file_path"
                    ;;
                "ps1")
                    echo "# File: $file_path" > "$file_path"
                    ;;
                "svg")
                    echo '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"></svg>' > "$file_path"
                    ;;
                *)
                    touch "$file_path"
                    ;;
            esac
        fi
        
        echo -e "${GREEN}✅ Criado: $file_path${NC}"
        return 0
    else
        echo -e "${BLUE}✓ Já existe: $file_path${NC}"
        return 1
    fi
}

# Função para criar diretório se não existir
create_dir_if_missing() {
    local dir_path="$1"
    
    if [ ! -d "$dir_path" ]; then
        echo -e "${YELLOW}📁 Criando diretório: $dir_path${NC}"
        mkdir -p "$dir_path"
        echo -e "${GREEN}✅ Diretório criado: $dir_path${NC}"
        return 0
    else
        return 1
    fi
}

# Contador
CREATED_COUNT=0

# Criar estrutura de diretórios primeiro
echo -e "${BOLD}📁 Criando estrutura de diretórios...${NC}"
echo "────────────────────────────────────────────────"

DIRECTORIES=(
    ".vscode"
    ".github/workflows"
    ".husky"
    "apps/web/public"
    "apps/web/src/pages"
    "apps/web/src/components/ui"
    "apps/web/src/components/wallet"
    "apps/web/src/hooks"
    "apps/web/src/lib"
    "apps/web/src/store"
    "apps/web/src/locales/pt-BR"
    "apps/web/src/locales/en-US"
    "apps/web/src/locales/es-ES"
    "packages/wallet-core/src"
    "infra/ipfs"
    "scripts"
    "docs"
    "apps/api"
    "apps/bazari-chain"
    "apps/studio"
    "packages/chain-client"
    "packages/ipfs-client"
    "packages/ui-kit"
    "packages/schemas"
    "packages/dsl"
    "infra/kubernetes"
)

for dir in "${DIRECTORIES[@]}"; do
    if create_dir_if_missing "$dir"; then
        ((CREATED_COUNT++))
    fi
done

echo ""
echo -e "${BOLD}📄 Criando arquivos faltantes...${NC}"
echo "────────────────────────────────────────────────"

# Lista de todos os arquivos necessários
FILES=(
    "package.json"
    "pnpm-workspace.yaml"
    "turbo.json"
    "tsconfig.base.json"
    ".env.example"
    ".gitignore"
    ".prettierrc"
    ".eslintrc.json"
    ".lintstagedrc.js"
    "Makefile"
    "README.md"
    "LICENSE"
    "CONTRIBUTING.md"
    "QUICKSTART.md"
    ".vscode/extensions.json"
    ".vscode/settings.json"
    ".github/workflows/ci.yml"
    ".husky/pre-commit"
    "apps/web/package.json"
    "apps/web/vite.config.ts"
    "apps/web/tailwind.config.js"
    "apps/web/postcss.config.js"
    "apps/web/tsconfig.json"
    "apps/web/tsconfig.node.json"
    "apps/web/index.html"
    "apps/web/public/bazari-logo.svg"
    "apps/web/public/manifest.json"
    "apps/web/public/robots.txt"
    "apps/web/src/index.css"
    "apps/web/src/main.tsx"
    "apps/web/src/App.tsx"
    "apps/web/src/pages/Landing.tsx"
    "apps/web/src/pages/Auth.tsx"
    "apps/web/src/pages/Wallet.tsx"
    "apps/web/src/components/Loading.tsx"
    "apps/web/src/components/Layout.tsx"
    "apps/web/src/components/ui/button.tsx"
    "apps/web/src/components/ui/card.tsx"
    "apps/web/src/components/ui/dropdown-menu.tsx"
    "apps/web/src/components/ui/tabs.tsx"
    "apps/web/src/components/wallet/WalletBalance.tsx"
    "apps/web/src/components/wallet/WalletConnect.tsx"
    "apps/web/src/components/wallet/TransactionHistory.tsx"
    "apps/web/src/components/wallet/SendModal.tsx"
    "apps/web/src/components/wallet/ReceiveModal.tsx"
    "apps/web/src/components/wallet/AccountManager.tsx"
    "apps/web/src/hooks/index.ts"
    "apps/web/src/hooks/useLocalStorage.ts"
    "apps/web/src/hooks/useMediaQuery.ts"
    "apps/web/src/hooks/useOnClickOutside.ts"
    "apps/web/src/hooks/useDebounce.ts"
    "apps/web/src/hooks/useCopyToClipboard.ts"
    "apps/web/src/hooks/useWallet.ts"
    "apps/web/src/lib/i18n.ts"
    "apps/web/src/lib/utils.ts"
    "apps/web/src/store/index.ts"
    "apps/web/src/store/auth.ts"
    "apps/web/src/store/wallet.ts"
    "apps/web/src/locales/pt-BR/common.json"
    "apps/web/src/locales/en-US/common.json"
    "apps/web/src/locales/es-ES/common.json"
    "packages/wallet-core/package.json"
    "packages/wallet-core/tsup.config.ts"
    "packages/wallet-core/tsconfig.json"
    "packages/wallet-core/src/index.ts"
    "packages/wallet-core/src/crypto.ts"
    "infra/docker-compose.dev.yml"
    "infra/docker-compose.prod.yml"
    "infra/ipfs/config.template.json"
    "infra/ipfs/swarm.key"
    "scripts/setup.sh"
    "scripts/setup.ps1"
    "scripts/clean.sh"
    "scripts/fix-wasm.sh"
    "scripts/check-structure.sh"
    "scripts/check-structure.py"
    "scripts/check-structure.js"
    "docs/COMMANDS.md"
    "docs/ETAPA2-COMPLETED.md"
)

for file in "${FILES[@]}"; do
    if create_file_if_missing "$file"; then
        ((CREATED_COUNT++))
    fi
done

echo ""
echo -e "${BLUE}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}║                     📊 RESULTADO                     ║${NC}"
echo -e "${BLUE}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

if [ $CREATED_COUNT -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✨ Nenhum arquivo precisou ser criado!${NC}"
    echo -e "${GREEN}${BOLD}✅ Estrutura já está completa!${NC}"
else
    echo -e "${GREEN}${BOLD}✨ $CREATED_COUNT arquivos/diretórios criados com sucesso!${NC}"
    echo -e "${GREEN}${BOLD}✅ Estrutura agora está completa!${NC}"
fi

echo ""
echo -e "${YELLOW}📝 Nota: Os arquivos foram criados com conteúdo básico.${NC}"
echo -e "${YELLOW}   Você deve substituir pelo conteúdo real conforme necessário.${NC}"
echo ""
echo -e "${GREEN}🚀 Próximos passos:${NC}"
echo -e "   1. Execute: ${BOLD}pnpm install${NC}"
echo -e "   2. Execute: ${BOLD}pnpm dev${NC}"
echo ""