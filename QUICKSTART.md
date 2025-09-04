# 🚀 Bazari - Guia de Início Rápido

## ✅ Etapa 1 Concluída - Setup + Landing Page

### 📦 O que foi entregue

#### Estrutura do Monorepo ✅
- Configuração completa com **pnpm** e **Turbo**
- Estrutura de pastas organizada (`apps/`, `packages/`, `infra/`)
- Scripts de desenvolvimento e build configurados

#### Landing Page Completa ✅
- Design responsivo seguindo a identidade visual Bazari
- Internacionalização (i18n) com **3 idiomas** (PT-BR, EN-US, ES-ES)
- Animações com **Framer Motion**
- PWA configurado e pronto
- Módulos do sistema com navegação preparada

#### Infraestrutura Docker ✅
- PostgreSQL
- Redis
- IPFS
- OpenSearch
- Docker Compose para desenvolvimento e produção

#### Ferramentas de Desenvolvimento ✅
- ESLint + Prettier configurados
- TypeScript com paths aliases
- Husky para git hooks
- VSCode settings otimizados
- Makefile com comandos úteis

#### Componentes Base ✅
- Sistema de UI com Tailwind CSS 3.4.3
- Componentes shadcn/ui adaptados
- Hooks customizados
- Store com Zustand

## 🎯 Como Rodar o Projeto

### Pré-requisitos

Certifique-se de ter instalado:
- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Docker** e **Docker Compose**
- **Git**

### Instalação Rápida

```bash
# 1. Clone o repositório (quando estiver no GitHub)
git clone https://github.com/bazari/bazari.git
cd bazari

# 2. Instale as dependências
pnpm install

# 3. Configure o ambiente
cp .env.example .env.local

# 4. Inicie os serviços Docker
docker-compose -f infra/docker-compose.dev.yml up -d

# 5. Rode o projeto
pnpm dev
```

### Ou use o script de setup automático:

#### Linux/Mac:
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

#### Windows (PowerShell):
```powershell
./scripts/setup.ps1
```

### Ou use o Makefile:
```bash
make setup
make dev
```

## 🌐 Acessar o Sistema

Após iniciar o desenvolvimento, acesse:

- **🌐 Web App**: http://localhost:5173
- **📊 Adminer (DB)**: http://localhost:8081
- **🗄️ IPFS Gateway**: http://localhost:8080
- **🔍 OpenSearch**: http://localhost:9200

### Credenciais do Adminer:
- **Sistema**: PostgreSQL
- **Servidor**: postgres
- **Usuário**: bazari
- **Senha**: bazari
- **Base de dados**: bazari_db

## 📁 Estrutura de Arquivos Criados

```
bazari/
├── 📁 apps/
│   └── 📁 web/                    # App React/Vite
│       ├── src/
│       │   ├── components/        # Componentes React
│       │   ├── pages/            # Páginas (Landing)
│       │   ├── hooks/            # Hooks customizados
│       │   ├── lib/              # Utilidades e i18n
│       │   ├── locales/          # Traduções
│       │   ├── store/            # Estado global
│       │   ├── App.tsx           # App principal
│       │   └── main.tsx          # Entry point
│       ├── public/               # Assets públicos
│       ├── package.json          # Dependências
│       └── vite.config.ts        # Config Vite
│
├── 📁 packages/                   # Pacotes compartilhados (futuro)
│
├── 📁 infra/
│   ├── docker-compose.dev.yml    # Docker desenvolvimento
│   ├── docker-compose.prod.yml   # Docker produção
│   └── ipfs/                     # Config IPFS
│
├── 📁 scripts/
│   ├── setup.sh                  # Setup Linux/Mac
│   ├── setup.ps1                 # Setup Windows
│   └── clean.sh                  # Limpeza
│
├── 📁 docs/
│   └── COMMANDS.md               # Documentação de comandos
│
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions CI/CD
│
├── package.json                   # Raiz do monorepo
├── pnpm-workspace.yaml           # Config workspace
├── turbo.json                    # Config Turbo
├── Makefile                      # Comandos úteis
├── README.md                     # Documentação principal
├── CONTRIBUTING.md               # Guia de contribuição
├── LICENSE                       # Licença MIT
└── .env.example                  # Variáveis de ambiente
```

## 🎨 Identidade Visual Implementada

- **🔴 Vermelho terroso** (#8B0000) - Cor principal
- **🟡 Dourado queimado** (#FFB300) - Acentos
- **⚫ Preto fosco** (#1C1C1C) - Fundo
- **⚪ Areia clara** (#F5F1E0) - Texto/contraste

## 🧪 Testar a Landing Page

1. Acesse http://localhost:5173
2. Teste a troca de idiomas (canto superior direito)
3. Navegue pelos módulos (cada card leva a uma rota preparada)
4. Teste a responsividade (redimensione a janela)
5. Verifique as animações ao fazer scroll

## 📱 PWA

O app já está configurado como PWA. Para testar:

1. Abra no Chrome/Edge
2. Procure o ícone de "Instalar" na barra de endereços
3. Instale e teste como app desktop/mobile

## 🌍 Internacionalização

Três idiomas disponíveis:
- 🇧🇷 Português (pt-BR) - padrão
- 🇺🇸 Inglês (en-US)
- 🇪🇸 Espanhol (es-ES)

Arquivos de tradução em: `apps/web/src/locales/`

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
pnpm dev              # Inicia tudo
make dev             # Alternativa com Make

# Apenas o web
pnpm -F @bazari/web dev

# Docker
make docker-up       # Sobe serviços
make docker-down     # Para serviços
make docker-restart  # Reinicia

# Limpeza
make clean           # Limpa build artifacts
make fresh          # Reinstala tudo do zero

# Outros
make help           # Ver todos os comandos
make status         # Status dos serviços
```

## ✨ Próximas Etapas

A Etapa 1 está **100% completa** e funcional! 

Próximas implementações:
- **Etapa 2**: Backend API (Fastify + Prisma)
- **Etapa 3**: Wallet nativa (sr25519)
- **Etapa 4**: Integração blockchain (Substrate)
- **Etapa 5**: Marketplace
- **Etapa 6**: DAOs
- **Etapa 7**: Studio
- **Etapa 8**: Deploy

## 🐛 Troubleshooting

### Porta em uso?
```bash
lsof -i :5173  # Verificar porta
kill -9 [PID]  # Matar processo
```

### Docker não inicia?
```bash
docker-compose -f infra/docker-compose.dev.yml logs [serviço]
docker-compose -f infra/docker-compose.dev.yml down -v  # Reset total
```

### Erro de permissão?
```bash
chmod +x scripts/*.sh  # Linux/Mac
```

### Cache corrompido?
```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

## 📞 Suporte

Em caso de dúvidas ou problemas:
- Verifique a documentação em `/docs`
- Consulte o `CONTRIBUTING.md`
- Abra uma issue no GitHub

---

**🎉 Parabéns! A Etapa 1 do Ecossistema Bazari está pronta para uso!**

*Economia popular, democrática e sustentável através da blockchain.*