# 🔒 Etapa 2 - Sistema Seguro para Produção

## ✅ O que foi implementado

### 1. **Segurança Crítica** ✓
- ✅ **AES-256-GCM** para criptografia de seed
- ✅ **PBKDF2** com 100.000 iterações para derivação de chave
- ✅ **JWT real** com secret aleatório
- ✅ **Verificação de assinaturas Polkadot** com `@polkadot/util-crypto`
- ✅ **Nonce único** para prevenir replay attacks
- ✅ **Timestamp** com expiração de 5 minutos

### 2. **Backend Robusto** ✓
- ✅ **PostgreSQL** com Prisma ORM
- ✅ **Redis** para sessões e nonces
- ✅ **Rate limiting** configurável
- ✅ **Logs estruturados** com Pino
- ✅ **Validação completa** de assinaturas sr25519
- ✅ **Tratamento de erros** apropriado

### 3. **Frontend Seguro** ✓
- ✅ **Keyring isolado** (removido de `window.__bazariKeyring`)
- ✅ **Store seguro** com Zustand + persist
- ✅ **Reconexão automática** com blockchain
- ✅ **Tratamento de erros** robusto
- ✅ **Criptografia no cliente** com Web Crypto API

### 4. **Infraestrutura** ✓
- ✅ **Variáveis de ambiente** (.env)
- ✅ **Health check** endpoint
- ✅ **Graceful shutdown**
- ✅ **Docker ready** (compose files disponíveis)

## 📋 Pré-requisitos

```bash
# Verificar instalações
node --version      # >= 18.x
pnpm --version      # >= 8.x
postgres --version  # >= 14.x
redis-cli --version # >= 6.x
```

## 🚀 Como executar

### 1. **Setup inicial** (executar apenas uma vez)

```bash
# Dar permissão ao script
chmod +x setup-etapa2.sh

# Executar setup completo
./setup-etapa2.sh
```

Este script irá:
- Configurar o banco de dados PostgreSQL
- Configurar o Redis
- Instalar todas as dependências
- Criar arquivos .env com secrets seguros
- Executar migrations do Prisma

### 2. **Iniciar a blockchain** (em terminal separado)

```bash
cd apps/bazari-chain
./target/release/bazari-node --dev

# Ou se ainda não compilou:
cargo build --release
./target/release/bazari-node --dev
```

### 3. **Iniciar o sistema**

```bash
# Na raiz do projeto
pnpm dev
```

Isso iniciará:
- Backend (Fastify): http://localhost:3001
- Frontend (Vite): http://localhost:5173

### 4. **Verificar saúde do sistema**

```bash
# Health check do backend
curl http://localhost:3001/health

# Resposta esperada:
{
  "status": "healthy",
  "timestamp": "2025-01-XX...",
  "checks": {
    "server": "ok",
    "database": "ok",
    "redis": "ok",
    "blockchain": "ok"
  }
}
```

## 🔐 Arquitetura de Segurança

### Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant B as Backend
    participant BC as Blockchain
    participant R as Redis
    participant DB as PostgreSQL

    U->>F: Criar conta + senha
    F->>F: Gerar mnemonic (12 palavras)
    F->>F: Criar keypair sr25519
    F->>F: Criptografar seed (AES-GCM)
    F->>F: Assinar mensagem
    F->>B: POST /auth/register
    B->>B: Verificar assinatura
    B->>R: Verificar/salvar nonce
    B->>B: Criptografar seed (PBKDF2+AES)
    B->>DB: Salvar usuário
    B->>R: Criar sessão
    B->>F: JWT token
    F->>BC: Conectar e buscar saldo
```

### Camadas de Segurança

1. **Cliente (Frontend)**
   - Seed NUNCA sai descriptografada
   - Criptografia AES-GCM local
   - Keyring isolado em memória

2. **Transporte**
   - HTTPS em produção
   - JWT com expiração
   - Assinaturas sr25519

3. **Servidor (Backend)**
   - Verificação de assinaturas
   - Rate limiting
   - Nonce único
   - PBKDF2 + salt único

4. **Armazenamento**
   - Seed criptografada no banco
   - Salt + IV únicos por usuário
   - Redis para sessões temporárias

## 🧪 Testando a Segurança

### 1. Criar nova conta

1. Acesse http://localhost:5173
2. Clique em "Criar Carteira"
3. Digite uma senha forte
4. **ANOTE A SEED PHRASE** (12 palavras)
5. Confirme a criação

### 2. Verificar segurança

```bash
# Verificar que a seed está criptografada no banco
psql -U postgres -d bazari_dev -c "SELECT encryptedSeed, salt, iv FROM \"User\";"

# Verificar sessão no Redis
redis-cli KEYS "session:*"

# Tentar requisição sem token (deve falhar)
curl http://localhost:3001/wallet/accounts

# Com token (deve funcionar)
curl -H "Authorization: Bearer SEU_TOKEN" http://localhost:3001/wallet/accounts
```

### 3. Teste de replay attack

```javascript
// Este teste deve FALHAR (nonce já usado)
const message = '{"action":"login","timestamp":"2025-01-01T00:00:00.000Z","nonce":"abc123"}'
const signature = "0x..." // assinatura antiga

fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletAddress: '...',
    signature,
    message,
    password: '...'
  })
})
// Resposta: {"error": "Invalid nonce"}
```

## 🔧 Configurações de Produção

### 1. Variáveis de ambiente

```bash
# apps/api/.env (PRODUÇÃO)
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/bazari_prod
REDIS_URL=redis://:password@redis-host:6379
JWT_SECRET=<use-secret-muito-forte-gerado-aleatoriamente>
RATE_LIMIT_MAX=50
RATE_LIMIT_WINDOW=15m
```

### 2. HTTPS/TLS

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Monitoramento

```javascript
// Adicionar ao backend
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
})
```

## 📊 Métricas de Segurança

| Métrica | Valor | Status |
|---------|-------|--------|
| Criptografia de Seed | AES-256-GCM | ✅ |
| Derivação de Chave | PBKDF2 100k iter | ✅ |
| Assinaturas | sr25519 verificadas | ✅ |
| Sessões | Redis com TTL | ✅ |
| Rate Limit | 100 req/15min | ✅ |
| Nonce | Único, 5min TTL | ✅ |
| Logs | Estruturados (Pino) | ✅ |
| Erros | Tratados sem expor info | ✅ |

## 🐛 Troubleshooting

### PostgreSQL não conecta
```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

### Redis não conecta
```bash
sudo systemctl status redis-server
sudo systemctl restart redis-server
redis-cli ping  # Deve retornar PONG
```

### Blockchain não conecta
```bash
# Verificar se está rodando na porta correta
lsof -i :9944
# Se não, iniciar novamente
cd apps/bazari-chain && ./target/release/bazari-node --dev
```

### Erro de CORS
```javascript
// Adicionar ao frontend vite.config.ts
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
}
```

## ✅ Checklist Final

- [ ] PostgreSQL rodando
- [ ] Redis rodando
- [ ] Blockchain rodando
- [ ] Backend sem erros
- [ ] Frontend conectando
- [ ] Health check OK
- [ ] Login funcionando
- [ ] Saldos aparecendo
- [ ] Seed criptografada no banco
- [ ] Sessão no Redis

## 📝 Notas Importantes

1. **NUNCA** commitar arquivos `.env` reais
2. **SEMPRE** fazer backup das seed phrases
3. **TROCAR** JWT_SECRET em produção
4. **HABILITAR** HTTPS em produção
5. **CONFIGURAR** firewall apropriado
6. **MONITORAR** logs e métricas
7. **TESTAR** recovery de desastres

---

**Etapa 2 Completa!** 🎉 

Sistema pronto para produção com todas as camadas de segurança implementadas.