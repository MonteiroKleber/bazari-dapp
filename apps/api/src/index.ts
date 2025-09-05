// apps/api/src/index.ts
import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import { PrismaClient } from '@prisma/client'
import Redis from 'ioredis'
import { cryptoWaitReady, signatureVerify } from '@polkadot/util-crypto'
import { hexToU8a, isHex, u8aToHex, stringToU8a } from '@polkadot/util'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

// Initialize Polkadot crypto
await cryptoWaitReady()

// Initialize Prisma
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Initialize Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// Initialize Fastify with Pino logger
const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' 
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined
  }
})

// Register plugins
await app.register(cors, {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : true,
  credentials: true
})

await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  sign: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
})

await app.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  timeWindow: process.env.RATE_LIMIT_WINDOW || '15 minutes'
})

// Decorate Fastify with prisma and redis
app.decorate('prisma', prisma)
app.decorate('redis', redis)

// ==================== SECURITY UTILITIES ====================

class CryptoManager {
  /**
   * Derive encryption key from password using PBKDF2
   */
  static async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, derivedKey) => {
        if (err) reject(err)
        else resolve(derivedKey)
      })
    })
  }

  /**
   * Encrypt seed using AES-256-GCM
   */
  static async encryptSeed(seed: string, password: string): Promise<{
    encryptedSeed: string
    salt: string
    iv: string
    authTag: string
  }> {
    // Generate random salt and IV
    const salt = crypto.randomBytes(32)
    const iv = crypto.randomBytes(16)
    
    // Derive key from password
    const key = await this.deriveKey(password, salt)
    
    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
    
    // Encrypt seed
    const encrypted = Buffer.concat([
      cipher.update(seed, 'utf8'),
      cipher.final()
    ])
    
    // Get auth tag
    const authTag = cipher.getAuthTag()
    
    return {
      encryptedSeed: encrypted.toString('base64'),
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64')
    }
  }

  /**
   * Decrypt seed using AES-256-GCM
   */
  static async decryptSeed(
    encryptedSeed: string,
    password: string,
    salt: string,
    iv: string,
    authTag: string
  ): Promise<string> {
    // Convert from base64
    const encryptedBuffer = Buffer.from(encryptedSeed, 'base64')
    const saltBuffer = Buffer.from(salt, 'base64')
    const ivBuffer = Buffer.from(iv, 'base64')
    const authTagBuffer = Buffer.from(authTag, 'base64')
    
    // Derive key from password
    const key = await this.deriveKey(password, saltBuffer)
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, ivBuffer)
    decipher.setAuthTag(authTagBuffer)
    
    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final()
    ])
    
    return decrypted.toString('utf8')
  }
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
 * Generate secure session token
 */
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Check and mark nonce as used (prevent replay attacks)
 */
async function checkNonce(nonce: string): Promise<boolean> {
  const key = `nonce:${nonce}`
  const exists = await redis.get(key)
  
  if (exists) {
    return false // Nonce already used
  }
  
  // Mark nonce as used (expire in 5 minutes)
  await redis.setex(key, 300, '1')
  return true
}

// ==================== AUTH ROUTES ====================

app.post('/auth/register', async (request, reply) => {
  try {
    const { walletAddress, signature, message, seed, password } = request.body as any
    
    // Validate timestamp in message (prevent old signatures)
    const messageData = JSON.parse(message)
    const messageTime = new Date(messageData.timestamp).getTime()
    const now = Date.now()
    
    if (now - messageTime > 5 * 60 * 1000) {
      return reply.code(400).send({
        error: 'Message expired',
        message: 'A mensagem expirou. Por favor, tente novamente.'
      })
    }
    
    // Check nonce
    const nonceValid = await checkNonce(messageData.nonce)
    if (!nonceValid) {
      return reply.code(400).send({
        error: 'Invalid nonce',
        message: 'Nonce já utilizado. Por favor, tente novamente.'
      })
    }
    
    // Verify signature
    const isValidSignature = await verifyPolkadotSignature(message, signature, walletAddress)
    
    if (!isValidSignature) {
      // Log failed attempt
      await prisma.authLog.create({
        data: {
          action: 'REGISTER',
          success: false,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          message: 'Invalid signature'
        }
      })
      
      return reply.code(401).send({
        error: 'Invalid signature',
        message: 'A assinatura não corresponde ao endereço fornecido.'
      })
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress }
    })
    
    if (existingUser) {
      return reply.code(409).send({
        error: 'User already exists',
        message: 'Este endereço já está registrado.'
      })
    }
    
    // Encrypt seed with password
    const encrypted = await CryptoManager.encryptSeed(seed, password)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        walletAddress,
        encryptedSeed: encrypted.encryptedSeed,
        salt: encrypted.salt,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        lastLoginAt: new Date()
      }
    })
    
    // Create default account
    await prisma.account.create({
      data: {
        userId: user.id,
        address: walletAddress,
        name: 'Principal',
        derivationPath: '//default',
        isDefault: true
      }
    })
    
    // Generate session
    const sessionToken = generateSessionToken()
    const jwtToken = app.jwt.sign({ 
      userId: user.id, 
      walletAddress,
      sessionToken 
    })
    
    // Store session in Redis
    await redis.setex(
      `session:${sessionToken}`,
      7 * 24 * 60 * 60, // 7 days
      JSON.stringify({
        userId: user.id,
        walletAddress,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      })
    )
    
    // Create session in database
    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })
    
    // Log successful registration
    await prisma.authLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        success: true,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      }
    })
    
    app.log.info(`User registered: ${walletAddress}`)
    
    return reply.send({
      success: true,
      token: jwtToken,
      user: {
        id: user.id,
        walletAddress: user.walletAddress
      }
    })
  } catch (error) {
    app.log.error('Registration error:', error)
    return reply.code(500).send({
      error: 'Registration failed',
      message: 'Erro ao registrar usuário. Por favor, tente novamente.'
    })
  }
})

app.post('/auth/login', async (request, reply) => {
  try {
    const { walletAddress, signature, message, password } = request.body as any
    
    // Validate timestamp
    const messageData = JSON.parse(message)
    const messageTime = new Date(messageData.timestamp).getTime()
    const now = Date.now()
    
    if (now - messageTime > 5 * 60 * 1000) {
      return reply.code(400).send({
        error: 'Message expired',
        message: 'A mensagem expirou. Por favor, tente novamente.'
      })
    }
    
    // Check nonce
    const nonceValid = await checkNonce(messageData.nonce)
    if (!nonceValid) {
      return reply.code(400).send({
        error: 'Invalid nonce',
        message: 'Nonce já utilizado. Por favor, tente novamente.'
      })
    }
    
    // Verify signature
    const isValidSignature = await verifyPolkadotSignature(message, signature, walletAddress)
    
    if (!isValidSignature) {
      // Log failed attempt
      await prisma.authLog.create({
        data: {
          action: 'LOGIN',
          success: false,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          message: 'Invalid signature'
        }
      })
      
      return reply.code(401).send({
        error: 'Invalid signature',
        message: 'A assinatura não corresponde ao endereço fornecido.'
      })
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { walletAddress }
    })
    
    if (!user) {
      await prisma.authLog.create({
        data: {
          action: 'LOGIN',
          success: false,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          message: 'User not found'
        }
      })
      
      return reply.code(404).send({
        error: 'User not found',
        message: 'Usuário não encontrado. Por favor, registre-se primeiro.'
      })
    }
    
    // Try to decrypt seed to verify password
    try {
      await CryptoManager.decryptSeed(
        user.encryptedSeed,
        password,
        user.salt,
        user.iv,
        user.authTag
      )
    } catch (error) {
      await prisma.authLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          success: false,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          message: 'Invalid password'
        }
      })
      
      return reply.code(401).send({
        error: 'Invalid password',
        message: 'Senha incorreta.'
      })
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })
    
    // Generate session
    const sessionToken = generateSessionToken()
    const jwtToken = app.jwt.sign({ 
      userId: user.id, 
      walletAddress,
      sessionToken 
    })
    
    // Store session in Redis
    await redis.setex(
      `session:${sessionToken}`,
      7 * 24 * 60 * 60, // 7 days
      JSON.stringify({
        userId: user.id,
        walletAddress,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      })
    )
    
    // Create session in database
    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })
    
    // Log successful login
    await prisma.authLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        success: true,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      }
    })
    
    app.log.info(`User logged in: ${walletAddress}`)
    
    return reply.send({
      success: true,
      token: jwtToken,
      user: {
        id: user.id,
        walletAddress: user.walletAddress
      },
      seed: null // Never return seed
    })
  } catch (error) {
    app.log.error('Login error:', error)
    return reply.code(500).send({
      error: 'Login failed',
      message: 'Erro ao fazer login. Por favor, tente novamente.'
    })
  }
})

app.post('/auth/logout', async (request, reply) => {
  try {
    // Verify JWT
    await request.jwtVerify()
    const { sessionToken } = request.user as any
    
    // Remove session from Redis
    await redis.del(`session:${sessionToken}`)
    
    // Remove session from database
    await prisma.session.deleteMany({
      where: { token: sessionToken }
    })
    
    app.log.info(`User logged out: ${(request.user as any).walletAddress}`)
    
    return reply.send({ success: true })
  } catch (error) {
    app.log.error('Logout error:', error)
    return reply.code(500).send({
      error: 'Logout failed',
      message: 'Erro ao fazer logout.'
    })
  }
})

// ==================== WALLET ROUTES ====================

app.get('/wallet/seed', async (request, reply) => {
  try {
    // Verify JWT
    await request.jwtVerify()
    const { userId, sessionToken } = request.user as any
    
    // Verify session in Redis
    const session = await redis.get(`session:${sessionToken}`)
    if (!session) {
      return reply.code(401).send({
        error: 'Session expired',
        message: 'Sessão expirada. Por favor, faça login novamente.'
      })
    }
    
    // Get password from request body or header
    const password = request.headers['x-wallet-password'] as string
    
    if (!password) {
      return reply.code(400).send({
        error: 'Password required',
        message: 'Senha necessária para acessar a seed.'
      })
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return reply.code(404).send({
        error: 'User not found',
        message: 'Usuário não encontrado.'
      })
    }
    
    try {
      // Decrypt seed
      const seed = await CryptoManager.decryptSeed(
        user.encryptedSeed,
        password,
        user.salt,
        user.iv,
        user.authTag
      )
      
      // Return encrypted for transport (client will decrypt)
      const transportKey = crypto.randomBytes(32)
      const transportIv = crypto.randomBytes(16)
      const cipher = crypto.createCipheriv('aes-256-gcm', transportKey, transportIv)
      const encrypted = Buffer.concat([cipher.update(seed, 'utf8'), cipher.final()])
      const authTag = cipher.getAuthTag()
      
      return reply.send({
        encryptedSeed: encrypted.toString('base64'),
        transportKey: transportKey.toString('base64'),
        transportIv: transportIv.toString('base64'),
        transportAuthTag: authTag.toString('base64')
      })
    } catch (error) {
      return reply.code(401).send({
        error: 'Invalid password',
        message: 'Senha incorreta.'
      })
    }
  } catch (error) {
    app.log.error('Get seed error:', error)
    return reply.code(500).send({
      error: 'Failed to get seed',
      message: 'Erro ao buscar seed.'
    })
  }
})

app.get('/wallet/accounts', async (request, reply) => {
  try {
    // Verify JWT
    await request.jwtVerify()
    const { userId } = request.user as any
    
    // Get accounts
    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' }
      ]
    })
    
    return reply.send({ accounts })
  } catch (error) {
    app.log.error('Get accounts error:', error)
    return reply.code(500).send({
      error: 'Failed to get accounts',
      message: 'Erro ao buscar contas.'
    })
  }
})

app.post('/wallet/accounts', async (request, reply) => {
  try {
    // Verify JWT
    await request.jwtVerify()
    const { userId } = request.user as any
    const { address, name, derivationPath } = request.body as any
    
    // Verify signature for address creation
    const { signature, message } = request.body as any
    const isValidSignature = await verifyPolkadotSignature(message, signature, address)
    
    if (!isValidSignature) {
      return reply.code(401).send({
        error: 'Invalid signature',
        message: 'Assinatura inválida para criar conta.'
      })
    }
    
    // Create account
    const account = await prisma.account.create({
      data: {
        userId,
        address,
        name: name || `Conta ${derivationPath}`,
        derivationPath,
        isDefault: false
      }
    })
    
    return reply.send({ success: true, account })
  } catch (error) {
    app.log.error('Create account error:', error)
    return reply.code(500).send({
      error: 'Failed to create account',
      message: 'Erro ao criar conta.'
    })
  }
})

// ==================== HEALTH CHECK ====================

app.get('/health', async (request, reply) => {
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
  
  // Development mode - show error details
  return reply.code(500).send({
    error: error.name,
    message: error.message,
    stack: error.stack
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
    app.log.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    app.log.info(`🔐 JWT configured`)
    app.log.info(`💾 Database connected`)
    app.log.info(`📦 Redis connected`)
    app.log.info(`🔒 Rate limiting enabled`)
  } catch (error) {
    app.log.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()