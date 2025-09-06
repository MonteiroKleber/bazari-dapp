// apps/api/src/routes/auth.ts
// Backend Auth Routes com Zero-Knowledge e Cookie-Based Sessions
// Usando variáveis de ambiente EXISTENTES do projeto

import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { signatureVerify } from '@polkadot/util-crypto'
import { hexToU8a, isHex, stringToU8a } from '@polkadot/util'
import crypto from 'crypto'

// ==================== SCHEMAS ====================
const nonceSchema = z.object({
  walletAddress: z.string().min(47).max(48)
})

const authSchema = z.object({
  walletAddress: z.string().min(47).max(48),
  signature: z.string(),
  message: z.string(),
  username: z.string().optional(),
  email: z.string().email().optional()
})

// ==================== AUTH ROUTES ====================
const authRoutes: FastifyPluginAsync = async (server) => {
  
  // Helper: Generate secure nonce
  function generateNonce(): string {
    return crypto.randomBytes(32).toString('hex')
  }
  
  // Helper: Verify Polkadot signature
  async function verifySignature(
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
  
  // Helper: Validate message structure and domain
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
        server.log.warn('Message timestamp out of range')
        return { valid: false }
      }
      
      // Validate domain using CORS_ORIGIN from existing env
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
  
  // Helper: Check and consume nonce (prevent replay)
  async function checkNonce(nonce: string): Promise<boolean> {
    const key = `nonce:${nonce}`
    
    // Check if nonce exists (already used)
    const exists = await server.redis.get(key)
    if (exists) {
      server.log.warn(`Nonce already used: ${nonce}`)
      return false
    }
    
    // Mark nonce as used (expire in 5 minutes)
    await server.redis.setex(key, 300, '1')
    return true
  }
  
  // Helper: Create session
  async function createSession(userId: string, walletAddress: string) {
    const sessionId = crypto.randomBytes(32).toString('hex')
    const sessionData = {
      userId,
      walletAddress,
      createdAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    }
    
    // Store in Redis
    await server.redis.setex(
      `session:${sessionId}`,
      7 * 24 * 60 * 60, // 7 days in seconds
      JSON.stringify(sessionData)
    )
    
    return sessionId
  }
  
  // ==================== ROUTES ====================
  
  // POST /api/auth/nonce - Generate nonce for signing
  server.post('/nonce', {
    schema: {
      body: nonceSchema
    }
  }, async (request, reply) => {
    try {
      const { walletAddress } = request.body
      
      const nonce = generateNonce()
      const timestamp = new Date().toISOString()
      
      // Store nonce temporarily
      await server.redis.setex(`nonce:${nonce}`, 300, walletAddress)
      
      // Use first origin from CORS_ORIGIN as default domain
      const defaultDomain = process.env.CORS_ORIGIN?.split(',')[0].trim() || 'http://localhost:5173'
      
      const message = JSON.stringify({
        action: 'auth',
        nonce,
        timestamp,
        domain: defaultDomain
      })
      
      server.log.info(`Nonce generated for ${walletAddress}`)
      
      return reply.send({
        nonce,
        timestamp,
        message
      })
    } catch (error: any) {
      server.log.error('Nonce generation error:', error)
      return reply.code(500).send({
        error: 'Failed to generate nonce',
        message: error.message
      })
    }
  })
  
  // POST /api/auth/register - Register with signature only (NO SEED/PASSWORD!)
  server.post('/register', {
    schema: {
      body: authSchema
    }
  }, async (request, reply) => {
    try {
      const { walletAddress, signature, message, username, email } = request.body
      
      // 1. Validate message structure and domain
      const messageValidation = validateMessage(message)
      if (!messageValidation.valid || messageValidation.action !== 'register') {
        return reply.code(400).send({
          error: 'Invalid message',
          message: 'Message validation failed'
        })
      }
      
      // 2. Check nonce (prevent replay)
      const nonceValid = await checkNonce(messageValidation.nonce!)
      if (!nonceValid) {
        return reply.code(400).send({
          error: 'Invalid nonce',
          message: 'Nonce already used or expired'
        })
      }
      
      // 3. Verify signature
      const signatureValid = await verifySignature(message, signature, walletAddress)
      if (!signatureValid) {
        return reply.code(401).send({
          error: 'Invalid signature',
          message: 'Signature verification failed'
        })
      }
      
      // 4. Check if user exists
      const existingUser = await server.prisma.user.findUnique({
        where: { walletAddress }
      })
      
      if (existingUser) {
        return reply.code(409).send({
          error: 'User exists',
          message: 'Wallet address already registered'
        })
      }
      
      // 5. Create user (NO seed or password stored!)
      const user = await server.prisma.user.create({
        data: {
          walletAddress,
          username,
          email
          // NO encryptedSeed, salt, iv, authTag!
        }
      })
      
      // 6. Create session
      const sessionId = await createSession(user.id, walletAddress)
      
      // 7. Set cookie
      reply.setCookie('session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      })
      
      server.log.info(`User registered: ${user.id}`)
      
      return reply.send({
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      })
    } catch (error: any) {
      server.log.error('Registration error:', error)
      return reply.code(500).send({
        error: 'Registration failed',
        message: error.message
      })
    }
  })
  
  // POST /api/auth/login - Login with signature only (NO PASSWORD!)
  server.post('/login', {
    schema: {
      body: z.object({
        walletAddress: z.string(),
        signature: z.string(),
        message: z.string()
      })
    }
  }, async (request, reply) => {
    try {
      const { walletAddress, signature, message } = request.body
      
      // 1. Validate message
      const messageValidation = validateMessage(message)
      if (!messageValidation.valid || messageValidation.action !== 'login') {
        return reply.code(400).send({
          error: 'Invalid message',
          message: 'Message validation failed'
        })
      }
      
      // 2. Check nonce
      const nonceValid = await checkNonce(messageValidation.nonce!)
      if (!nonceValid) {
        return reply.code(400).send({
          error: 'Invalid nonce',
          message: 'Nonce already used or expired'
        })
      }
      
      // 3. Verify signature
      const signatureValid = await verifySignature(message, signature, walletAddress)
      if (!signatureValid) {
        return reply.code(401).send({
          error: 'Invalid signature',
          message: 'Signature verification failed'
        })
      }
      
      // 4. Get user
      const user = await server.prisma.user.findUnique({
        where: { walletAddress }
      })
      
      if (!user) {
        return reply.code(404).send({
          error: 'User not found',
          message: 'No user with this wallet address'
        })
      }
      
      // 5. Create session
      const sessionId = await createSession(user.id, walletAddress)
      
      // 6. Set cookie
      reply.setCookie('session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      })
      
      server.log.info(`User logged in: ${user.id}`)
      
      return reply.send({
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      })
    } catch (error: any) {
      server.log.error('Login error:', error)
      return reply.code(500).send({
        error: 'Login failed',
        message: error.message
      })
    }
  })
  
  // POST /api/auth/import - Import wallet (similar to login)
  server.post('/import', {
    schema: {
      body: z.object({
        walletAddress: z.string(),
        signature: z.string(),
        message: z.string()
      })
    }
  }, async (request, reply) => {
    try {
      const { walletAddress, signature, message } = request.body
      
      // Same validation as login
      const messageValidation = validateMessage(message)
      if (!messageValidation.valid || messageValidation.action !== 'import') {
        return reply.code(400).send({
          error: 'Invalid message'
        })
      }
      
      const nonceValid = await checkNonce(messageValidation.nonce!)
      if (!nonceValid) {
        return reply.code(400).send({
          error: 'Invalid nonce'
        })
      }
      
      const signatureValid = await verifySignature(message, signature, walletAddress)
      if (!signatureValid) {
        return reply.code(401).send({
          error: 'Invalid signature'
        })
      }
      
      // Create or get user
      let user = await server.prisma.user.findUnique({
        where: { walletAddress }
      })
      
      if (!user) {
        user = await server.prisma.user.create({
          data: { walletAddress }
        })
      }
      
      const sessionId = await createSession(user.id, walletAddress)
      
      reply.setCookie('session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      })
      
      return reply.send({
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email
        }
      })
    } catch (error: any) {
      server.log.error('Import error:', error)
      return reply.code(500).send({
        error: 'Import failed',
        message: error.message
      })
    }
  })
  
  // POST /api/auth/logout - Clear session
  server.post('/logout', async (request, reply) => {
    try {
      const sessionId = request.cookies.session
      
      if (sessionId) {
        // Blacklist session
        await server.redis.del(`session:${sessionId}`)
        
        // Add to blacklist with TTL (using JWT_EXPIRES_IN config)
        const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
        const ttl = expiresIn.includes('d') 
          ? parseInt(expiresIn) * 24 * 60 * 60 
          : parseInt(expiresIn)
        
        await server.redis.setex(
          `blacklist:${sessionId}`,
          ttl,
          '1'
        )
      }
      
      // Clear cookie
      reply.setCookie('session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0 // Expire immediately
      })
      
      server.log.info('User logged out')
      
      return reply.send({
        success: true,
        message: 'Logged out successfully'
      })
    } catch (error: any) {
      server.log.error('Logout error:', error)
      return reply.code(500).send({
        error: 'Logout failed'
      })
    }
  })
  
  // POST /api/auth/refresh - Refresh session
  server.post('/refresh', async (request, reply) => {
    try {
      const sessionId = request.cookies.session
      
      if (!sessionId) {
        return reply.code(401).send({
          error: 'No session'
        })
      }
      
      // Check blacklist
      const blacklisted = await server.redis.get(`blacklist:${sessionId}`)
      if (blacklisted) {
        return reply.code(401).send({
          error: 'Session blacklisted'
        })
      }
      
      // Get session
      const sessionData = await server.redis.get(`session:${sessionId}`)
      if (!sessionData) {
        return reply.code(401).send({
          error: 'Session expired'
        })
      }
      
      const session = JSON.parse(sessionData)
      
      // Create new session
      const newSessionId = await createSession(session.userId, session.walletAddress)
      
      // Invalidate old session
      await server.redis.del(`session:${sessionId}`)
      
      // Set new cookie
      reply.setCookie('session', newSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      })
      
      return reply.send({
        success: true,
        message: 'Session refreshed'
      })
    } catch (error: any) {
      server.log.error('Refresh error:', error)
      return reply.code(500).send({
        error: 'Refresh failed'
      })
    }
  })
  
  // GET /api/auth/me - Get current user
  server.get('/me', async (request, reply) => {
    try {
      const sessionId = request.cookies.session
      
      if (!sessionId) {
        return reply.code(401).send({
          error: 'Not authenticated'
        })
      }
      
      // Check blacklist
      const blacklisted = await server.redis.get(`blacklist:${sessionId}`)
      if (blacklisted) {
        return reply.code(401).send({
          error: 'Session blacklisted'
        })
      }
      
      // Get session
      const sessionData = await server.redis.get(`session:${sessionId}`)
      if (!sessionData) {
        return reply.code(401).send({
          error: 'Session expired'
        })
      }
      
      const session = JSON.parse(sessionData)
      
      // Get user
      const user = await server.prisma.user.findUnique({
        where: { id: session.userId }
      })
      
      if (!user) {
        return reply.code(404).send({
          error: 'User not found'
        })
      }
      
      return reply.send({
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      })
    } catch (error: any) {
      server.log.error('Get user error:', error)
      return reply.code(500).send({
        error: 'Failed to get user'
      })
    }
  })
  
  // GET /api/auth/verify - Verify session
  server.get('/verify', async (request, reply) => {
    try {
      const sessionId = request.cookies.session
      
      if (!sessionId) {
        return reply.code(401).send({ valid: false })
      }
      
      const blacklisted = await server.redis.get(`blacklist:${sessionId}`)
      if (blacklisted) {
        return reply.code(401).send({ valid: false })
      }
      
      const sessionData = await server.redis.get(`session:${sessionId}`)
      if (!sessionData) {
        return reply.code(401).send({ valid: false })
      }
      
      return reply.send({ valid: true })
    } catch (error) {
      return reply.code(401).send({ valid: false })
    }
  })
}

export default authRoutes