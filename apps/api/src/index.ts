// Arquivo: apps/api/src/index.ts
// Servidor backend Fastify principal

import Fastify from 'fastify'
import cors from '@fastify/cors'
import authRoutes from './routes/auth'

// Criar instância do servidor Fastify
const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'UTC',
        ignore: 'pid,hostname',
        colorize: true
      }
    }
  }
})

// Configurar CORS
server.register(cors, {
  origin: (origin, cb) => {
    // Permitir origens de desenvolvimento
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://localhost:5174', // Vite backup port
      'http://10.0.2.15:5173'  // Network access
    ]
    
    // Permitir requisições sem origin (ex: Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true)
    } else {
      cb(new Error(`Not allowed by CORS: ${origin}`), false)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
})

// Rota de health check
server.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }
})

// Rota raiz
server.get('/', async (request, reply) => {
  return {
    name: 'Bazari API',
    version: '0.1.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      docs: '/docs (not implemented yet)'
    }
  }
})

// Registrar rotas de autenticação
server.register(authRoutes, { prefix: '/api/auth' })

// Função para conectar com a blockchain (desabilitada para desenvolvimento)
async function connectToChain() {
  try {
    server.log.info('Blockchain connection disabled for development')
    // Em produção, adicionar conexão com Substrate aqui
    // const api = await ApiPromise.create({ provider: wsProvider })
  } catch (error) {
    server.log.error('Chain connection error:', error)
  }
}

// Função para iniciar o servidor
const start = async () => {
  try {
    // Configurações de porta e host
    const port = Number(process.env.PORT) || 3333
    const host = process.env.HOST || '0.0.0.0'
    
    // Conectar com blockchain
    await connectToChain()
    
    // Iniciar servidor
    await server.listen({ port, host })
    
    server.log.info(`Server listening on http://${host}:${port}`)
    server.log.info('Ready to accept connections')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

// Tratamento de shutdown gracioso
const gracefulShutdown = async () => {
  server.log.info('Shutting down gracefully...')
  
  try {
    await server.close()
    server.log.info('Server closed')
    process.exit(0)
  } catch (err) {
    server.log.error('Error during shutdown:', err)
    process.exit(1)
  }
}

// Registrar handlers de shutdown
process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  server.log.error('Uncaught Exception:', error)
  gracefulShutdown()
})

process.on('unhandledRejection', (reason, promise) => {
  server.log.error('Unhandled Rejection at:', promise, 'reason:', reason)
  gracefulShutdown()
})

// Iniciar servidor
start()