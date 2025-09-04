#!/usr/bin/env python3
"""
Script para verificar a estrutura completa do projeto Bazari
Uso: python scripts/check-structure.py
"""

import os
import sys
from pathlib import Path
from typing import List, Tuple, Dict

# Cores ANSI para terminal
class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

# Estrutura esperada do projeto
PROJECT_STRUCTURE = {
    "root_files": [
        "package.json",
        "pnpm-workspace.yaml",
        "turbo.json",
        "tsconfig.base.json",
        ".env.example",
        ".gitignore",
        ".prettierrc",
        ".eslintrc.json",
        ".lintstagedrc.js",
        "Makefile",
        "README.md",
        "LICENSE",
        "CONTRIBUTING.md",
        "QUICKSTART.md"
    ],
    "directories": {
        ".vscode": [
            "extensions.json",
            "settings.json"
        ],
        ".github/workflows": [
            "ci.yml"
        ],
        ".husky": [
            "pre-commit"
        ],
        "apps/web": [
            "package.json",
            "vite.config.ts",
            "tailwind.config.js",
            "postcss.config.js",
            "tsconfig.json",
            "tsconfig.node.json",
            "index.html"
        ],
        "apps/web/public": [
            "bazari-logo.svg",
            "manifest.json",
            "robots.txt"
        ],
        "apps/web/src": [
            "index.css",
            "main.tsx",
            "App.tsx"
        ],
        "apps/web/src/pages": [
            "Landing.tsx",
            "Auth.tsx",
            "Wallet.tsx"
        ],
        "apps/web/src/components": [
            "Loading.tsx",
            "Layout.tsx"
        ],
        "apps/web/src/components/ui": [
            "button.tsx",
            "card.tsx",
            "dropdown-menu.tsx",
            "tabs.tsx"
        ],
        "apps/web/src/components/wallet": [
            "WalletBalance.tsx",
            "WalletConnect.tsx",
            "TransactionHistory.tsx",
            "SendModal.tsx",
            "ReceiveModal.tsx",
            "AccountManager.tsx"
        ],
        "apps/web/src/hooks": [
            "index.ts",
            "useLocalStorage.ts",
            "useMediaQuery.ts",
            "useOnClickOutside.ts",
            "useDebounce.ts",
            "useCopyToClipboard.ts",
            "useWallet.ts"
        ],
        "apps/web/src/lib": [
            "i18n.ts",
            "utils.ts"
        ],
        "apps/web/src/store": [
            "index.ts",
            "auth.ts",
            "wallet.ts"
        ],
        "apps/web/src/locales/pt-BR": [
            "common.json"
        ],
        "apps/web/src/locales/en-US": [
            "common.json"
        ],
        "apps/web/src/locales/es-ES": [
            "common.json"
        ],
        "packages/wallet-core": [
            "package.json",
            "tsup.config.ts",
            "tsconfig.json"
        ],
        "packages/wallet-core/src": [
            "index.ts",
            "crypto.ts"
        ],
        "infra": [
            "docker-compose.dev.yml",
            "docker-compose.prod.yml"
        ],
        "infra/ipfs": [
            "config.template.json",
            "swarm.key"
        ],
        "scripts": [
            "setup.sh",
            "setup.ps1",
            "clean.sh",
            "fix-wasm.sh",
            "check-structure.sh",
            "check-structure.py"
        ],
        "docs": [
            "COMMANDS.md",
            "ETAPA2-COMPLETED.md"
        ]
    },
    "optional_directories": [
        "apps/api",
        "apps/bazari-chain",
        "apps/studio",
        "packages/chain-client",
        "packages/ipfs-client",
        "packages/ui-kit",
        "packages/schemas",
        "packages/dsl",
        "infra/kubernetes"
    ]
}

class ProjectChecker:
    def __init__(self, root_path: Path = Path.cwd()):
        self.root_path = root_path
        self.total_files = 0
        self.existing_files = 0
        self.missing_files = 0
        self.optional_missing = 0
        self.missing_list: List[str] = []
        self.optional_missing_list: List[str] = []

    def check_file(self, file_path: str, is_optional: bool = False) -> bool:
        """Verifica se um arquivo existe"""
        self.total_files += 1
        full_path = self.root_path / file_path
        
        if full_path.exists():
            print(f"{Colors.GREEN}✅{Colors.END} {file_path}")
            self.existing_files += 1
            return True
        else:
            if is_optional:
                print(f"{Colors.YELLOW}⚠️{Colors.END}  {file_path} {Colors.YELLOW}(opcional - próxima etapa){Colors.END}")
                self.optional_missing_list.append(file_path)
                self.optional_missing += 1
            else:
                print(f"{Colors.RED}❌{Colors.END} {file_path} {Colors.RED}(FALTANDO!){Colors.END}")
                self.missing_list.append(file_path)
                self.missing_files += 1
            return False

    def check_directory(self, dir_path: str, is_optional: bool = False) -> bool:
        """Verifica se um diretório existe"""
        full_path = self.root_path / dir_path
        
        if full_path.exists() and full_path.is_dir():
            print(f"{Colors.GREEN}📁{Colors.END} {dir_path}/")
            return True
        else:
            if is_optional:
                print(f"{Colors.YELLOW}📁{Colors.END} {dir_path}/ {Colors.YELLOW}(opcional - próxima etapa){Colors.END}")
                self.optional_missing_list.append(f"{dir_path}/")
                self.optional_missing += 1
            else:
                print(f"{Colors.RED}📁{Colors.END} {dir_path}/ {Colors.RED}(DIRETÓRIO FALTANDO!){Colors.END}")
                self.missing_list.append(f"{dir_path}/")
                self.missing_files += 1
            return False

    def print_header(self, title: str):
        """Imprime cabeçalho de seção"""
        print(f"\n{Colors.BOLD}{Colors.CYAN}📁 {title}...{Colors.END}")
        print("─" * 50)

    def run_check(self):
        """Executa a verificação completa"""
        print(f"{Colors.BLUE}{Colors.BOLD}╔══════════════════════════════════════════════════════╗{Colors.END}")
        print(f"{Colors.BLUE}{Colors.BOLD}║     🔍 VERIFICAÇÃO DA ESTRUTURA - PROJETO BAZARI    ║{Colors.END}")
        print(f"{Colors.BLUE}{Colors.BOLD}╚══════════════════════════════════════════════════════╝{Colors.END}")

        # Verificar arquivos na raiz
        self.print_header("Verificando Arquivos de Configuração Raiz")
        for file in PROJECT_STRUCTURE["root_files"]:
            self.check_file(file)

        # Verificar diretórios e seus arquivos
        for dir_path, files in PROJECT_STRUCTURE["directories"].items():
            self.print_header(f"Verificando {dir_path}")
            
            # Verifica se o diretório existe
            if self.check_directory(dir_path):
                # Verifica arquivos dentro do diretório
                for file in files:
                    file_path = os.path.join(dir_path, file)
                    self.check_file(file_path)

        # Verificar diretórios opcionais
        self.print_header("Verificando Estruturas para Próximas Etapas")
        for dir_path in PROJECT_STRUCTURE["optional_directories"]:
            self.check_directory(dir_path, is_optional=True)

        # Imprimir relatório
        self.print_report()

    def print_report(self):
        """Imprime o relatório final"""
        print(f"\n{Colors.BLUE}{Colors.BOLD}╔══════════════════════════════════════════════════════╗{Colors.END}")
        print(f"{Colors.BLUE}{Colors.BOLD}║                  📊 RELATÓRIO FINAL                  ║{Colors.END}")
        print(f"{Colors.BLUE}{Colors.BOLD}╚══════════════════════════════════════════════════════╝{Colors.END}")
        
        print(f"\n{Colors.BOLD}📈 Estatísticas:{Colors.END}")
        print("─" * 50)
        print(f"Total verificado: {Colors.BOLD}{self.total_files}{Colors.END} arquivos/diretórios")
        print(f"✅ Existentes: {Colors.GREEN}{Colors.BOLD}{self.existing_files}{Colors.END}")
        print(f"❌ Faltando (obrigatórios): {Colors.RED}{Colors.BOLD}{self.missing_files}{Colors.END}")
        print(f"⚠️  Opcionais (próximas etapas): {Colors.YELLOW}{Colors.BOLD}{self.optional_missing}{Colors.END}")

        if self.missing_files == 0:
            print(f"\n{Colors.GREEN}{Colors.BOLD}╔══════════════════════════════════════════════════════╗{Colors.END}")
            print(f"{Colors.GREEN}{Colors.BOLD}║         ✅ ESTRUTURA COMPLETA E CORRETA! ✅         ║{Colors.END}")
            print(f"{Colors.GREEN}{Colors.BOLD}║      Todos os arquivos obrigatórios presentes!      ║{Colors.END}")
            print(f"{Colors.GREEN}{Colors.BOLD}╚══════════════════════════════════════════════════════╝{Colors.END}")
            print(f"\n{Colors.GREEN}🎉 Projeto pronto para desenvolvimento!{Colors.END}")
            print(f"{Colors.GREEN}🚀 Execute 'pnpm dev' para iniciar{Colors.END}")
            return 0
        else:
            print(f"\n{Colors.RED}{Colors.BOLD}╔══════════════════════════════════════════════════════╗{Colors.END}")
            print(f"{Colors.RED}{Colors.BOLD}║          ❌ ARQUIVOS FALTANDO NA ESTRUTURA! ❌      ║{Colors.END}")
            print(f"{Colors.RED}{Colors.BOLD}╚══════════════════════════════════════════════════════╝{Colors.END}")
            
            print(f"\n{Colors.RED}{Colors.BOLD}📋 Lista de arquivos/diretórios faltantes:{Colors.END}")
            print("─" * 50)
            for missing in self.missing_list:
                print(f"{Colors.RED}  • {missing}{Colors.END}")
            
            print(f"\n{Colors.YELLOW}💡 Dica: Execute os scripts de setup para criar os arquivos faltantes{Colors.END}")
            print(f"{Colors.YELLOW}   ./scripts/setup.sh (Linux/Mac) ou python scripts/setup.ps1 (Windows){Colors.END}")
            return 1

def main():
    """Função principal"""
    checker = ProjectChecker()
    exit_code = checker.run_check()
    sys.exit(exit_code)

if __name__ == "__main__":
    main()