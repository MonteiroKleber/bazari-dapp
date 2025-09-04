#!/usr/bin/env node

/**
 * Script para verificar a estrutura completa do projeto Bazari
 * Uso: node scripts/check-structure.js ou pnpm check-structure
 */

const fs = require('fs');
const path = require('path');

// Cores ANSI para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Estrutura esperada do projeto
const PROJECT_STRUCTURE = {
  rootFiles: [
    'package.json',
    'pnpm-workspace.yaml',
    'turbo.json',
    'tsconfig.base.json',
    '.env.example',
    '.gitignore',
    '.prettierrc',
    '.eslintrc.json',
    '.lintstagedrc.js',
    'Makefile',
    'README.md',
    'LICENSE',
    'CONTRIBUTING.md',
    'QUICKSTART.md'
  ],
  directories: {
    '.vscode': [
      'extensions.json',
      'settings.json'
    ],
    '.github/workflows': [
      'ci.yml'
    ],
    '.husky': [
      'pre-commit'
    ],
    'apps/web': [
      'package.json',
      'vite.config.ts',
      'tailwind.config.js',
      'postcss.config.js',
      'tsconfig.json',
      'tsconfig.node.json',
      'index.html'
    ],
    'apps/web/public': [
      'bazari-logo.svg',
      'manifest.json',
      'robots.txt'
    ],
    'apps/web/src': [
      'index.css',
      'main.tsx',
      'App.tsx'
    ],
    'apps/web/src/pages': [
      'Landing.tsx',
      'Auth.tsx',
      'Wallet.tsx'
    ],
    'apps/web/src/components': [
      'Loading.tsx',
      'Layout.tsx'
    ],
    'apps/web/src/components/ui': [
      'button.tsx',
      'card.tsx',
      'dropdown-menu.tsx',
      'tabs.tsx'
    ],
    'apps/web/src/components/wallet': [
      'WalletBalance.tsx',
      'WalletConnect.tsx',
      'TransactionHistory.tsx',
      'SendModal.tsx',
      'ReceiveModal.tsx',
      'AccountManager.tsx'
    ],
    'apps/web/src/hooks': [
      'index.ts',
      'useLocalStorage.ts',
      'useMediaQuery.ts',
      'useOnClickOutside.ts',
      'useDebounce.ts',
      'useCopyToClipboard.ts',
      'useWallet.ts'
    ],
    'apps/web/src/lib': [
      'i18n.ts',
      'utils.ts'
    ],
    'apps/web/src/store': [
      'index.ts',
      'auth.ts',
      'wallet.ts'
    ],
    'apps/web/src/locales/pt-BR': [
      'common.json'
    ],
    'apps/web/src/locales/en-US': [
      'common.json'
    ],
    'apps/web/src/locales/es-ES': [
      'common.json'
    ],
    'packages/wallet-core': [
      'package.json',
      'tsup.config.ts',
      'tsconfig.json'
    ],
    'packages/wallet-core/src': [
      'index.ts',
      'crypto.ts'
    ],
    'infra': [
      'docker-compose.dev.yml',
      'docker-compose.prod.yml'
    ],
    'infra/ipfs': [
      'config.template.json',
      'swarm.key'
    ],
    'scripts': [
      'setup.sh',
      'setup.ps1',
      'clean.sh',
      'fix-wasm.sh',
      'check-structure.sh',
      'check-structure.py',
      'check-structure.js'
    ],
    'docs': [
      'COMMANDS.md',
      'ETAPA2-COMPLETED.md'
    ]
  },
  optionalDirectories: [
    'apps/api',
    'apps/bazari-chain',
    'apps/studio',
    'packages/chain-client',
    'packages/ipfs-client',
    'packages/ui-kit',
    'packages/schemas',
    'packages/dsl',
    'infra/kubernetes'
  ]
};

class ProjectChecker {
  constructor() {
    this.rootPath = process.cwd();
    this.totalFiles = 0;
    this.existingFiles = 0;
    this.missingFiles = 0;
    this.optionalMissing = 0;
    this.missingList = [];
    this.optionalMissingList = [];
  }

  checkFile(filePath, isOptional = false) {
    this.totalFiles++;
    const fullPath = path.join(this.rootPath, filePath);
    
    if (fs.existsSync(fullPath)) {
      console.log(`${colors.green}✅${colors.reset} ${filePath}`);
      this.existingFiles++;
      return true;
    } else {
      if (isOptional) {
        console.log(`${colors.yellow}⚠️${colors.reset}  ${filePath} ${colors.yellow}(opcional - próxima etapa)${colors.reset}`);
        this.optionalMissingList.push(filePath);
        this.optionalMissing++;
      } else {
        console.log(`${colors.red}❌${colors.reset} ${filePath} ${colors.red}(FALTANDO!)${colors.reset}`);
        this.missingList.push(filePath);
        this.missingFiles++;
      }
      return false;
    }
  }

  checkDirectory(dirPath, isOptional = false) {
    const fullPath = path.join(this.rootPath, dirPath);
    
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      console.log(`${colors.green}📁${colors.reset} ${dirPath}/`);
      return true;
    } else {
      if (isOptional) {
        console.log(`${colors.yellow}📁${colors.reset} ${dirPath}/ ${colors.yellow}(opcional - próxima etapa)${colors.reset}`);
        this.optionalMissingList.push(`${dirPath}/`);
        this.optionalMissing++;
      } else {
        console.log(`${colors.red}📁${colors.reset} ${dirPath}/ ${colors.red}(DIRETÓRIO FALTANDO!)${colors.reset}`);
        this.missingList.push(`${dirPath}/`);
        this.missingFiles++;
      }
      return false;
    }
  }

  printHeader(title) {
    console.log(`\n${colors.bright}${colors.cyan}📁 ${title}...${colors.reset}`);
    console.log('─'.repeat(50));
  }

  printBox(text, color = colors.blue) {
    const line = '═'.repeat(56);
    console.log(`${color}${colors.bright}╔${line}╗${colors.reset}`);
    console.log(`${color}${colors.bright}║${text.padStart(29).padEnd(56)}║${colors.reset}`);
    console.log(`${color}${colors.bright}╚${line}╝${colors.reset}`);
  }

  runCheck() {
    this.printBox('     🔍 VERIFICAÇÃO DA ESTRUTURA - PROJETO BAZARI    ');

    // Verificar arquivos na raiz
    this.printHeader('Verificando Arquivos de Configuração Raiz');
    PROJECT_STRUCTURE.rootFiles.forEach(file => {
      this.checkFile(file);
    });

    // Verificar diretórios e seus arquivos
    Object.entries(PROJECT_STRUCTURE.directories).forEach(([dirPath, files]) => {
      this.printHeader(`Verificando ${dirPath}`);
      
      if (this.checkDirectory(dirPath)) {
        files.forEach(file => {
          const filePath = path.join(dirPath, file);
          this.checkFile(filePath);
        });
      }
    });

    // Verificar diretórios opcionais
    this.printHeader('Verificando Estruturas para Próximas Etapas');
    PROJECT_STRUCTURE.optionalDirectories.forEach(dirPath => {
      this.checkDirectory(dirPath, true);
    });

    // Imprimir relatório
    this.printReport();
  }

  printReport() {
    console.log('');
    this.printBox('                  📊 RELATÓRIO FINAL                  ');
    
    console.log(`\n${colors.bright}📈 Estatísticas:${colors.reset}`);
    console.log('─'.repeat(50));
    console.log(`Total verificado: ${colors.bright}${this.totalFiles}${colors.reset} arquivos/diretórios`);
    console.log(`✅ Existentes: ${colors.green}${colors.bright}${this.existingFiles}${colors.reset}`);
    console.log(`❌ Faltando (obrigatórios): ${colors.red}${colors.bright}${this.missingFiles}${colors.reset}`);
    console.log(`⚠️  Opcionais (próximas etapas): ${colors.yellow}${colors.bright}${this.optionalMissing}${colors.reset}`);

    if (this.missingFiles === 0) {
      console.log('');
      this.printBox('         ✅ ESTRUTURA COMPLETA E CORRETA! ✅         ', colors.green);
      this.printBox('      Todos os arquivos obrigatórios presentes!      ', colors.green);
      console.log(`\n${colors.green}🎉 Projeto pronto para desenvolvimento!${colors.reset}`);
      console.log(`${colors.green}🚀 Execute 'pnpm dev' para iniciar${colors.reset}`);
      process.exit(0);
    } else {
      console.log('');
      this.printBox('          ❌ ARQUIVOS FALTANDO NA ESTRUTURA! ❌      ', colors.red);
      
      console.log(`\n${colors.red}${colors.bright}📋 Lista de arquivos/diretórios faltantes:${colors.reset}`);
      console.log('─'.repeat(50));
      this.missingList.forEach(missing => {
        console.log(`${colors.red}  • ${missing}${colors.reset}`);
      });
      
      console.log(`\n${colors.yellow}💡 Dica: Execute os scripts de setup para criar os arquivos faltantes${colors.reset}`);
      console.log(`${colors.yellow}   ./scripts/setup.sh (Linux/Mac) ou scripts\\setup.ps1 (Windows)${colors.reset}`);
      console.log(`${colors.yellow}   Ou use: pnpm setup${colors.reset}`);
      process.exit(1);
    }
  }
}

// Executar verificação
const checker = new ProjectChecker();
checker.runCheck();