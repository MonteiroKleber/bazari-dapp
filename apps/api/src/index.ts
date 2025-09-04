import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import websocket from '@fastify/websocket'
import { PrismaClient } from '@prisma/client'
import { getChainClient } from '@bazari/chain-client'
// import Redis from 'ioredis'
import pino from 'pino'

// Import routes
import authRoutes from './routes/auth'
import walletRoutes from './routes/wallet'
import userRoutes from './routes/user'
import daoRoutes from './routes/dao'
import productRoutes from './routes/product'
import orderRoutes from './routes/order'
import governanceRoutes from './routes/governance'

// Import plugins
import prismaPlugin from './plugins/prisma'
// import redisPlugin from './plugins/redis'
import chainPlugin from './plugins/chain'
import ipfsPlugin from './plugins/ipfs'
import authPlugin from './plugins/auth'

// Create logger
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
})

// Create Fastify instance
const server = Fastify({
  logger,
  trustProxy: true,
})

// Register plugins
async function registerPlugins() {
  // Security
  await server.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })

  // CORS
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true,
  })

  // Rate limiting
  await server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    // redis: new Redis(process.env.REDIS_URL || 'redis://localhost:6379'),
  })

  // JWT
  await server.register(jwt, {
    secret: process.env.JWT_SECRET || 'change-this-secret-in-production',
    sign: {
      expiresIn: '7d',
    },
  })

  // Multipart for file uploads
  await server.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 5,
    },
  })

  // WebSocket support
  await server.register(websocket)

  // Custom plugins
  await server.register(prismaPlugin)
  // await server.register(redisPlugin)
  await server.register(chainPlugin)
  await server.register(ipfsPlugin)
  await server.register(authPlugin)
}

// Register routes
async function registerRoutes() {
  // API routes
  await server.register(authRoutes, { prefix: '/api/auth' })
  await server.register(walletRoutes, { prefix: '/api/wallet' })
  await server.register(userRoutes, { prefix: '/api/users' })
  await server.register(daoRoutes, { prefix: '/api/daos' })
  await server.register(productRoutes, { prefix: '/api/products' })
  await server.register(orderRoutes, { prefix: '/api/orders' })
  await server.register(governanceRoutes, { prefix: '/api/governance' })

  // Health check
  server.get('/health', async (request, reply) => {
    const checks = {
      server: 'ok',
      database: 'unknown',
      redis: 'unknown',
      chain: 'unknown',
      ipfs: 'unknown',
    }

    try {
      // Check database
      await server.prisma.$queryRaw`SELECT 1`
      checks.database = 'ok'
    } catch (error) {
      checks.database = 'error'
    }

    try {
      // Check Redis
      const pong = await server.redis.ping()
      checks.redis = pong === 'PONG' ? 'ok' : 'error'
    } catch (error) {
      checks.redis = 'error'
    }

    try {
      // Check blockchain connection
      if (server.chain.isReady) {
        checks.chain = 'ok'
      }
    } catch (error) {
      checks.chain = 'error'
    }

    try {
      // Check IPFS
      const version = await server.ipfs.version()
      checks.ipfs = version ? 'ok' : 'error'
    } catch (error) {
      checks.ipfs = 'error'
    }

    const allHealthy = Object.values(checks).every(status => status === 'ok')
    
    return reply
      .code(allHealthy ? 200 : 503)
      .send({
        status: allHealthy ? 'healthy' : 'unhealthy',
        checks,
        timestamp: new Date().toISOString(),
      })
  })

  // Root route
  server.get('/', async (request, reply) => {
    return {
      name: 'Bazari API',
      version: '0.1.0',
      status: 'running',
      docs: '/docs',
      health: '/health',
    }
  })

  // 404 handler
  server.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      error: 'Not Found',
      message: 'The requested resource was not found',
      path: request.url,
    })
  })
}

// Error handler
server.setErrorHandler((error, request, reply) => {
  server.log.error(error)

  if (error.validation) {
    reply.code(400).send({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: error.validation,
    })
  } else if (error.statusCode) {
    reply.code(error.statusCode).send({
      error: error.name || 'Error',
      message: error.message,
    })
  } else {
    reply.code(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    })
  }
})

// Graceful shutdown
async function gracefulShutdown() {
  server.log.info('Shutting down gracefully...')
  
  try {
    await server.close()
    await server.prisma.$disconnect()
    await server.redis.quit()
    await server.chain.disconnect()
    process.exit(0)
  } catch (error) {
    server.log.error('Error during shutdown:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Start server
async function start() {
  try {
    // Register plugins and routes
    await registerPlugins()
    await registerRoutes()

    // Connect to blockchain
    await server.chain.connect()
    server.log.info('Connected to BazariChain')

    // Start listening
    const port = parseInt(process.env.API_PORT || '3333', 10)
    const host = process.env.API_HOST || '0.0.0.0'
    
    await server.listen({ port, host })
    server.log.info(`Server listening on http://${host}:${port}`)
  } catch (error) {
    server.log.error(error)
    process.exit(1)
  }
}

// Start the server
start()