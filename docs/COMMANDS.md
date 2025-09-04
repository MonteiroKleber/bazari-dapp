# 📋 Comandos Disponíveis - Bazari

Este documento lista todos os comandos disponíveis no ecossistema Bazari.

## 🚀 Comandos Rápidos

### Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Iniciar desenvolvimento (todos os apps)
pnpm dev

# Iniciar apenas o web app
pnpm -F @bazari/web dev

# Iniciar apenas a API
pnpm -F @bazari/api dev
```

### Build & Deploy

```bash
# Build para produção
pnpm build

# Preview do build
pnpm preview

# Deploy (após configurar)
pnpm deploy
```

### Testes & Qualidade

```bash
# Rodar testes
pnpm test

# Rodar testes com coverage
pnpm test:coverage

# Linting
pnpm lint

# Formatação
pnpm format

# Type checking
pnpm type-check
```

## 📦 Scripts do Package.json (Raiz)

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia todos os apps em modo desenvolvimento |
| `pnpm build` | Build de produção de todos os apps |
| `pnpm test` | Executa todos os testes |
| `pnpm lint` | Verifica linting em todos os apps |
| `pnpm clean` | Remove node_modules e artifacts de build |
| `pnpm format` | Formata código com Prettier |

## 🐳 Docker Commands

### Desenvolvimento

```bash
# Subir serviços
docker-compose -f infra/docker-compose.dev.yml up -d

# Parar serviços
docker-compose -f infra/docker-compose.dev.yml down

# Ver logs
docker-compose -f infra/docker-compose.dev.yml logs -f

# Limpar volumes
docker-compose -f infra/docker-compose.dev.yml down -v
```

### Produção

```bash
# Build das imagens
docker-compose -f infra/docker-compose.prod.yml build

# Deploy
docker-compose -f infra/docker-compose.prod.yml up -d
```

## 🗄️ Database Commands (Quando API estiver pronta)

```bash
# Criar migração
pnpm -F @bazari/api prisma migrate dev --name nome_da_migracao

# Aplicar migrações
pnpm -F @bazari/api prisma migrate deploy

# Reset do banco
pnpm -F @bazari/api prisma migrate reset

# Seed do banco
pnpm -F @bazari/api prisma db seed

# Abrir Prisma Studio
pnpm -F @bazari/api prisma studio
```

## 🔧 Makefile Commands

O projeto inclui um Makefile com comandos convenientes:

```bash
# Ver todos os comandos disponíveis
make help

# Setup inicial
make setup

# Desenvolvimento
make dev

# Build
make build

# Docker
make docker-up
make docker-down
make docker-restart

# Limpeza completa
make fresh
```

## 🎯 Comandos por Módulo

### Web App (`apps/web`)

```bash
cd apps/web

# Desenvolvimento
pnpm dev

# Build
pnpm build

# Preview
pnpm preview

# Linting
pnpm lint

# Testes
pnpm test
```

### API (`apps/api`) - Quando implementada

```bash
cd apps/api

# Desenvolvimento
pnpm dev

# Build
pnpm build

# Start produção
pnpm start

# Testes
pnpm test

# Migrações
pnpm prisma migrate dev

# Studio
pnpm prisma studio
```

### Chain (`apps/bazari-chain`) - Quando implementada

```bash
cd apps/bazari-chain

# Build
cargo build --release

# Desenvolvimento
cargo run -- --dev

# Testes
cargo test

# Benchmark
cargo bench
```

## 🛠️ Utilitários

### Verificar versões

```bash
# Versões instaladas
make version

# Node version
node -v

# pnpm version
pnpm -v

# Docker version
docker --version
```

### Análise de Bundle

```bash
# Analisar tamanho do bundle
pnpm -F @bazari/web build --analyze
```

### Atualizar Dependências

```bash
# Verificar dependências desatualizadas
pnpm outdated

# Atualizar dependências (interativo)
pnpm up -i

# Atualizar todas as dependências
pnpm up --latest
```

## 🔍 Debug & Troubleshooting

### Logs

```bash
# Ver logs do Docker
docker-compose -f infra/docker-compose.dev.yml logs [serviço]

# Logs do PostgreSQL
docker logs bazari-postgres

# Logs do IPFS
docker logs bazari-ipfs
```

### Portas em Uso

```bash
# Verificar portas em uso
lsof -i :5173  # Web app
lsof -i :3333  # API
lsof -i :5432  # PostgreSQL
lsof -i :5001  # IPFS API
lsof -i :8080  # IPFS Gateway
```

### Limpar Cache

```bash
# Limpar cache do pnpm
pnpm store prune

# Limpar cache do turbo
turbo daemon clean

# Limpar tudo e reinstalar
make fresh
```

## 📱 PWA Commands

```bash
# Gerar ícones PWA
pnpm -F @bazari/web pwa-assets-generator

# Testar service worker
pnpm -F @bazari/web dev --https
```

## 🌐 i18n Commands

```bash
# Extrair strings para tradução
pnpm -F @bazari/web i18n:extract

# Validar traduções
pnpm -F @bazari/web i18n:validate
```

## 🔐 Segurança

```bash
# Audit de segurança
pnpm audit

# Fix vulnerabilidades
pnpm audit --fix

# Verificar licenças
pnpm licenses list
```

## 📊 Performance

```bash
# Lighthouse CI
pnpm -F @bazari/web lighthouse

# Bundle analyzer
pnpm -F @bazari/web analyze

# Medir performance
pnpm -F @bazari/web perf
```

## 🎨 Storybook (Quando configurado)

```bash
# Iniciar Storybook
pnpm -F @bazari/ui-kit storybook

# Build Storybook
pnpm -F @bazari/ui-kit build-storybook
```

---

💡 **Dica**: Use `make help` para ver comandos rápidos disponíveis no Makefile.