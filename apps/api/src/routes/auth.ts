import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import crypto from 'crypto'
import { hexToU8a, isHex, stringToU8a } from '@polkadot/util'
import { signatureVerify } from '@polkadot/util-crypto'

// Validation schemas
const registerSchema = z.object({
  walletAddress: z.string().min(48).max(48),
  signature: z.string(),
  message: z.string(),
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional()
})

const loginSchema = z.object({
  walletAddress: z.string().min(48).max(48),
  signature: z.string(),
  message: z.string()
})

const authRoutes: FastifyPluginAsync = async (server) => {
  // ==================== UTILITY FUNCTIONS ====================
  
  function generateNonce(): string {
    return crypto.randomBytes(32).toString('hex')
  }

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
      server.log.error('Signature verification failed:', error)
      return false
    }
  }

  function validateMessage(message: string): {
    valid: boolean
    action?: string
    nonce?: string
    timestamp?: string
    domain?: string
  } {
    try {
      const parsed = JSON.parse(message)
      
      if (!parsed.action || !parsed.nonce || !parsed.timestamp || !parsed.domain) {
        return { valid: false }
      }
      
      const messageTime = new Date(parsed.timestamp).getTime()
      const now = Date.now()
      
      if (isNaN(messageTime) || Math.abs(now - messageTime) > 5 * 60 * 1000) {
        server.log.warn('Message timestamp out of range')
        return { valid: false }
      }
      
      const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || ['http://localhost:5173']
      
      if (!allowedOrigins.includes(parsed.domain)) {
        server.log.error(`Invalid domain: ${parsed.domain}. Allowed: ${allowedOrigins.join(', ')}`)
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
      server.log.error('Message validation failed:', error)
      return { valid: false }
    }
  }

  async function checkNonce(nonce: string): Promise<boolean> {
    const key = `nonce:${nonce}`
    const exists = await server.redis.get(key)
    
    if (exists) {
      server.log.warn(`Nonce already used: ${nonce}`)
      return false
    }
    
    await server.redis.setex(key, 300, '1')
    return true
  }

  async function createSession(userId: string, walletAddress: string, reply: any) {
    const sessionId = crypto.randomBytes(32).toString('hex')
    const sessionData = {
      userId,
      walletAddress,
      createdAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
    }
    
    await server.redis.setex(
      `session:${sessionId}`,
      7 * 24 * 60 * 60,
      JSON.stringify(sessionData)
    )
    
    reply.setCookie('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    })
    
    return sessionId
  }

  // ==================== ROUTES ====================
  
  // GET /me - rota que o frontend está pedindo
  server.get('/me', async (request, reply) => {
    const sessionId = request.cookies?.session
    
    if (!sessionId) {
      return reply.code(401).send({
        authenticated: false,
        message: 'Not authenticated'
      })
    }
    
    const sessionData = await server.redis.get(`session:${sessionId}`)
    
    if (!sessionData) {
      return reply.code(401).send({
        authenticated: false,
        message: 'Session expired'
      })
    }
    
    const session = JSON.parse(sessionData)
    const user = await server.prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true
      }
    })
    
    return reply.send({
      authenticated: true,
      user
    })
  })

  // GET /nonce
  server.get('/nonce', async (request, reply) => {
    const nonce = generateNonce()
    const timestamp = new Date().toISOString()
    
    return reply.send({
      nonce,
      timestamp,
      domain: process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:5173'
    })
  })

  // POST /register
  server.post('/register', async (request, reply) => {
    try {
      const body = registerSchema.parse(request.body)
      
      const messageValidation = validateMessage(body.message)
      if (!messageValidation.valid || messageValidation.action !== 'register') {
        return reply.code(400).send({
          error: 'Invalid message format or action'
        })
      }
      
      const nonceValid = await checkNonce(messageValidation.nonce!)
      if (!nonceValid) {
        return reply.code(400).send({
          error: 'Invalid or expired nonce'
        })
      }
      
      const isValidSignature = await verifyPolkadotSignature(
        body.message,
        body.signature,
        body.walletAddress
      )
      
      if (!isValidSignature) {
        return reply.code(401).send({
          error: 'Invalid signature'
        })
      }
      
      const existingUser = await server.prisma.user.findUnique({
        where: { walletAddress: body.walletAddress }
      })
      
      if (existingUser) {
        return reply.code(409).send({
          error: 'Wallet already registered'
        })
      }
      
      const user = await server.prisma.user.create({
        data: {
          walletAddress: body.walletAddress,
          username: body.username,
          email: body.email
        }
      })
      
      await createSession(user.id, user.walletAddress, reply)
      
      server.log.info(`New user registered: ${user.walletAddress}`)
      
      return reply.code(201).send({
        success: true,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email
        }
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Validation error',
          details: error.errors
        })
      }
      
      server.log.error('Registration error:', error)
      return reply.code(500).send({
        error: 'Registration failed'
      })
    }
  })

  // POST /login
  server.post('/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body)
      
      const messageValidation = validateMessage(body.message)
      if (!messageValidation.valid || messageValidation.action !== 'login') {
        return reply.code(400).send({
          error: 'Invalid message format or action'
        })
      }
      
      const nonceValid = await checkNonce(messageValidation.nonce!)
      if (!nonceValid) {
        return reply.code(400).send({
          error: 'Invalid or expired nonce'
        })
      }
      
      const isValidSignature = await verifyPolkadotSignature(
        body.message,
        body.signature,
        body.walletAddress
      )
      
      if (!isValidSignature) {
        return reply.code(401).send({
          error: 'Invalid signature'
        })
      }
      
      const user = await server.prisma.user.findUnique({
        where: { walletAddress: body.walletAddress }
      })
      
      if (!user) {
        return reply.code(404).send({
          error: 'User not found'
        })
      }
      
      await createSession(user.id, user.walletAddress, reply)
      
      await server.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      })
      
      server.log.info(`User logged in: ${user.walletAddress}`)
      
      return reply.send({
        success: true,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email
        }
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Validation error',
          details: error.errors
        })
      }
      
      server.log.error('Login error:', error)
      return reply.code(500).send({
        error: 'Login failed'
      })
    }
  })

  // POST /logout
  server.post('/logout', {
    preHandler: server.authenticate
  }, async (request, reply) => {
    try {
      const sessionId = request.cookies?.session
      
      if (sessionId) {
        await server.redis.del(`session:${sessionId}`)
        await server.redis.setex(
          `blacklist:${sessionId}`,
          7 * 24 * 60 * 60,
          '1'
        )
        reply.clearCookie('session')
      }
      
      server.log.info(`User logged out: ${request.user?.walletAddress}`)
      
      return reply.send({
        success: true,
        message: 'Logged out successfully'
      })
    } catch (error) {
      server.log.error('Logout error:', error)
      return reply.code(500).send({
        error: 'Logout failed'
      })
    }
  })

  // GET /verify
  server.get('/verify', {
    preHandler: server.authenticate
  }, async (request, reply) => {
    const user = await server.prisma.user.findUnique({
      where: { id: request.user?.id },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true,
        createdAt: true,
        lastLogin: true
      }
    })
    
    if (!user) {
      return reply.code(404).send({
        error: 'User not found'
      })
    }
    
    return reply.send({
      authenticated: true,
      user
    })
  })

  // POST /refresh
  server.post('/refresh', {
    preHandler: server.authenticate
  }, async (request, reply) => {
    try {
      const oldSessionId = request.cookies?.session
      const userId = request.user?.id
      const walletAddress = request.user?.walletAddress
      
      if (!oldSessionId || !userId || !walletAddress) {
        return reply.code(401).send({
          error: 'Invalid session'
        })
      }
      
      await server.redis.del(`session:${oldSessionId}`)
      
      const newSessionId = await createSession(userId, walletAddress, reply)
      
      server.log.info(`Session refreshed for user: ${walletAddress}`)
      
      return reply.send({
        success: true,
        message: 'Session refreshed'
      })
    } catch (error) {
      server.log.error('Refresh error:', error)
      return reply.code(500).send({
        error: 'Failed to refresh session'
      })
    }
  })
}

export default authRoutes
