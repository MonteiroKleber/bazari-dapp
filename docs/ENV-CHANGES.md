# 📋 Resumo das Mudanças nas Variáveis de Ambiente

## ✅ Variáveis MANTIDAS (já existiam)
- `NODE_ENV=development`
- `DATABASE_URL=postgresql://bazari:bazari@localhost:5432/bazari_db`
- `JWT_SECRET=change-this-secret-in-production-please-use-a-strong-secret`
- `CHAIN_ENDPOINT=ws://localhost:9944`
- `IPFS_API_URL=http://localhost:5001`
- `IPFS_GATEWAY=http://localhost:8080`
- `REDIS_URL=redis://localhost:6379`
- `CORS_ORIGIN=http://localhost:5173,http://localhost:3000`
- `OPENSEARCH_HOST=http://localhost:9200`
- `OPENSEARCH_USERNAME=admin`
- `OPENSEARCH_PASSWORD=admin`
- `RATE_LIMIT_MAX=100`
- `RATE_LIMIT_WINDOW=60000`

## ➕ Variáveis ADICIONADAS (novas)
- `JWT_EXPIRES_IN=7d` - Tempo de expiração do token JWT
- `BCRYPT_ROUNDS=10` - Rounds para hash bcrypt
- `LOG_LEVEL=info` - Nível de log (debug, info, warn, error)

## 🔄 Variáveis ADAPTADAS no código
| Antes | Agora | Descrição |
|-------|-------|-----------|
| `PORT` | `API_PORT` | Porta do servidor API |
| `HOST` | `API_HOST` | Host do servidor API |
| `BLOCKCHAIN_WS_URL` | `CHAIN_ENDPOINT` | Endpoint da blockchain |
| `IPFS_GATEWAY_URL` | `IPFS_GATEWAY` | Gateway do IPFS |

## 🗄️ Mudanças no Banco de Dados
| Antes | Agora |
|-------|-------|
| Database: `bazari_dev` | Database: `bazari_db` |
| Usuário: `postgres` | Usuário: `bazari` |
| Senha: `postgres` | Senha: `bazari` |

## 🌐 Mudanças nas Portas
| Serviço | Porta Anterior | Porta Atual |
|---------|----------------|-------------|
| Backend API | 3001 | **3333** |
| Frontend | 5173 | 5173 (sem mudança) |
| Blockchain | 9944 | 9944 (sem mudança) |
| IPFS | 5001/8080 | 5001/8080 (sem mudança) |

## 📝 Arquivo `.env` Completo Atualizado

```bash
# API Configuration
NODE_ENV=development
API_PORT=3333
API_HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://bazari:bazari@localhost:5432/bazari_db

# JWT
JWT_SECRET=change-this-secret-in-production-please-use-a-strong-secret
JWT_EXPIRES_IN=7d

# Blockchain
CHAIN_ENDPOINT=ws://localhost:9944

# IPFS
IPFS_API_URL=http://localhost:5001
IPFS_GATEWAY=http://localhost:8080

# Redis
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# OpenSearch (optional)
OPENSEARCH_HOST=http://localhost:9200
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=admin

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# Security
BCRYPT_ROUNDS=10
LOG_LEVEL=info
```

## 🔧 Comandos de Setup Atualizados

```bash
# Criar usuário e database PostgreSQL
sudo -u postgres psql <<EOF
CREATE USER bazari WITH PASSWORD 'bazari';
CREATE DATABASE bazari_db OWNER bazari;
GRANT ALL PRIVILEGES ON DATABASE bazari_db TO bazari;
EOF

# Testar conexão
psql -U bazari -d bazari_db -c "SELECT version();"
```

## 🚀 URLs de Acesso Atualizadas

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3333 ⚠️ (mudou de 3001)
- **Health Check**: http://localhost:3333/health
- **Prisma Studio**: http://localhost:5555

## ⚠️ Atenção

1. **Atualizar `.env` existente**: Se você já tem um arquivo `.env`, atualize as variáveis conforme acima
2. **Frontend config**: O arquivo `apps/web/.env.local` deve apontar para a porta 3333:
   ```
   VITE_API_URL=http://localhost:3333
   ```
3. **Migrations**: Execute as migrations no novo banco:
   ```bash
   cd apps/api
   npx prisma migrate dev
   ```