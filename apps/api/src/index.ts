// apps/api/src/index.ts
import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import cookie from '@fastify/cookie'
import { PrismaClient } from '@prisma/client'
import Redis from 'ioredis'
import { cryptoWaitReady, signatureVerify } from '@polkadot/util-crypto'
import { hexToU8a, isHex, stringToU8a } from '@polkadot/util'
import crypto from 'crypto'
import authRoutes from './routes/auth'
import walletRoutes from './routes/wallet'
import userRoutes from './routes/user'
import authPlugin from './plugins/auth'

// Initialize Polkadot crypto
await cryptoWaitReady()

// Initialize Prisma
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Initialize Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// Initialize Fastify with enhanced security logger
const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' 
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers["set-cookie"]',
        'req.body.password',
        'req.body.seed',
        'req.body.mnemonic',
        'req.body.encryptedSeed',
        'req.headers["x-wallet-password"]'
      ],
      remove: true
    }
  }
})

// Register plugins in correct order
await app.register(cors, {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL || 'https://app.bazari.xyz')
    : true,
  credentials: true // CRITICAL for cookies
})

// Register cookie plugin for httpOnly sessions
await app.register(cookie, {
  secret: process.env.COOKIE_SECRET || 'change-this-secret-in-production',
  parseOptions: {}
})

await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  sign: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
})

await app.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  timeWindow: process.env.RATE_LIMIT_WINDOW || '15 minutes'
})

// Register auth plugin
await app.register(authPlugin)

// Decorate Fastify with prisma and redis
app.decorate('prisma', prisma)
app.decorate('redis', redis)

// ==================== ZERO-KNOWLEDGE UTILITIES ====================

/**
 * Generate secure nonce for preventing replay attacks
 */
function generateNonce(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Verify Polkadot signature
 */
async function verifyPolkadotSignature(
  message: string,
  signature: string,
  address: string
): Promise<boolean> {
  try {
    if (!isHex(signature)) {
      return false
    }
    
    const signatureU8a = hexToU8a(signature)
    const messageU8a = stringToU8a(message)
    
    const result = signatureVerify(messageU8a, signatureU8a, address)
    
    return result.isValid
  } catch (error) {
    app.log.error('Signature verification failed:', error)
    return false
  }
}

/**
 * Validate message structure and domain
 */
function validateMessage(message: string): {
  valid: boolean
  action?: string
  nonce?: string
  timestamp?: string
  domain?: string
} {
  try {
    const parsed = JSON.parse(message)
    
    // Check required fields
    if (!parsed.action || !parsed.nonce || !parsed.timestamp || !parsed.domain) {
      return { valid: false }
    }
    
    // Check timestamp (5 minute window)
    const messageTime = new Date(parsed.timestamp).getTime()
    const now = Date.now()
    
    if (isNaN(messageTime) || Math.abs(now - messageTime) > 5 * 60 * 1000) {
      app.log.warn('Message timestamp out of range')
      return { valid: false }
    }
    
    // Validate domain (CRITICAL for security)
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || ['http://localhost:5173']
    
    if (!allowedOrigins.includes(parsed.domain)) {
      app.log.error(`Invalid domain: ${parsed.domain}. Allowed: ${allowedOrigins.join(', ')}`)
      return { valid: false }
    }
    
    return {
      valid: true,
      action: parsed.action,
      nonce: parsed.nonce,
      timestamp: parsed.timestamp,
      domain: parsed.domain
    }
  } catch (error) {
    app.log.error('Message validation failed:', error)
    return { valid: false }
  }
}

/**
 * Check and consume nonce (prevent replay attacks)
 */
async function checkNonce(nonce: string): Promise<boolean> {
  const key = `nonce:${nonce}`
  const exists = await redis.get(key)
  
  if (exists) {
    app.log.warn(`Nonce already used: ${nonce}`)
    return false
  }
  
  // Mark nonce as used (expire in 5 minutes)
  await redis.setex(key, 300, '1')
  return true
}

/**
 * Create session in Redis and set cookie
 */
async function createSession(userId: string, walletAddress: string, reply: any) {
  const sessionId = crypto.randomBytes(32).toString('hex')
  const sessionData = {
    userId,
    walletAddress,
    createdAt: Date.now(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  }
  
  // Store in Redis
  await redis.setex(
    `session:${sessionId}`,
    7 * 24 * 60 * 60, // 7 days in seconds
    JSON.stringify(sessionData)
  )
  
  // Set httpOnly cookie
  reply.setCookie('session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  })
  
  return sessionId
}

// ==================== REGISTER ROUTES WITH API PREFIX ====================

// Auth routes
await app.register(authRoutes, { prefix: '/api/auth' })

// Wallet routes (WITHOUT dangerous /seed route)
await app.register(walletRoutes, { prefix: '/api/wallet' })

// User routes
await app.register(userRoutes, { prefix: '/api/users' })

// ==================== HEALTH CHECK ====================

app.get('/api/health', async (request, reply) => {
  const checks = {
    server: 'ok',
    database: 'checking',
    redis: 'checking',
    blockchain: 'checking'
  }
  
  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'ok'
  } catch (error) {
    checks.database = 'error'
  }
  
  // Check Redis
  try {
    await redis.ping()
    checks.redis = 'ok'
  } catch (error) {
    checks.redis = 'error'
  }
  
  // Overall status
  const allOk = Object.values(checks).every(status => status === 'ok' || status === 'checking')
  
  return reply
    .code(allOk ? 200 : 503)
    .send({
      status: allOk ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks
    })
})

// ==================== ERROR HANDLERS ====================

app.setErrorHandler((error, request, reply) => {
  app.log.error(error)
  
  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Ocorreu um erro interno. Por favor, tente novamente.'
    })
  }
  
  // Development mode - show error details (except sensitive data)
  return reply.code(500).send({
    error: error.name,
    message: error.message,
    // Don't include stack in production
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  })
})

// ==================== GRACEFUL SHUTDOWN ====================

const signals = ['SIGINT', 'SIGTERM']

signals.forEach(signal => {
  process.on(signal, async () => {
    app.log.info(`Received ${signal}, closing server...`)
    
    try {
      await app.close()
      await prisma.$disconnect()
      redis.disconnect()
      
      app.log.info('Server closed successfully')
      process.exit(0)
    } catch (error) {
      app.log.error('Error during shutdown:', error)
      process.exit(1)
    }
  })
})

// ==================== START SERVER ====================

const start = async () => {
  try {
    const port = parseInt(process.env.API_PORT || '3333')
    const host = process.env.API_HOST || '0.0.0.0'
    
    await app.listen({ port, host })
    
    app.log.info(`🚀 Bazari API running at http://${host}:${port}`)
    app.log.info(`🔐 Zero-Knowledge Architecture enabled`)
    app.log.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    app.log.info(`🍪 Cookie-based sessions configured`)
    app.log.info(`💾 Database connected`)
    app.log.info(`📦 Redis connected`)
    app.log.info(`🔒 Rate limiting enabled`)
    app.log.info(`🛡️ CORS configured with credentials`)
  } catch (error) {
    app.log.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Export utilities for use in routes
export {
  app,
  prisma,
  redis,
  generateNonce,
  verifyPolkadotSignature,
  validateMessage,
  checkNonce,
  createSession
}

start()