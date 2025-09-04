import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import argon2 from 'argon2'
import { cryptoWaitReady, signatureVerify } from '@polkadot/util-crypto'

// Schemas
const RegisterSchema = z.object({
  walletAddress: z.string().min(47).max(48),
  signature: z.string(),
  message: z.string(),
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  termsAccepted: z.boolean(),
  termsVersion: z.string(),
})

const LoginSchema = z.object({
  walletAddress: z.string().min(47).max(48),
  signature: z.string(),
  message: z.string(),
})

const NonceRequestSchema = z.object({
  walletAddress: z.string().min(47).max(48),
})

const authRoutes: FastifyPluginAsync = async (server) => {
  await cryptoWaitReady()

  // Get nonce for signing
  server.post('/nonce', async (request, reply) => {
    const { walletAddress } = NonceRequestSchema.parse(request.body)
    
    // Generate a random nonce
    const nonce = Math.floor(Math.random() * 1000000000).toString()
    const timestamp = Date.now()
    
    // Store nonce in Redis with 5 minute expiry
    const nonceKey = `nonce:${walletAddress}`
    await server.redis.setex(nonceKey, 300, JSON.stringify({ nonce, timestamp }))
    
    // Create message to sign
    const message = `Sign this message to authenticate with Bazari.\n\nAddress: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${timestamp}\n\nThis signature will not cost any fees.`
    
    return {
      message,
      nonce,
      timestamp,
    }
  })

  // Register new user
  server.post('/register', async (request, reply) => {
    const data = RegisterSchema.parse(request.body)
    
    // Verify terms acceptance
    if (!data.termsAccepted) {
      return reply.code(400).send({
        error: 'Terms not accepted',
        message: 'You must accept the terms of service to register',
      })
    }
    
    // Verify signature
    const isValid = await verifySignature(
      data.message,
      data.signature,
      data.walletAddress
    )
    
    if (!isValid) {
      return reply.code(401).send({
        error: 'Invalid signature',
        message: 'The signature could not be verified',
      })
    }
    
    // Verify nonce from message
    const nonceMatch = data.message.match(/Nonce: (\d+)/)
    if (!nonceMatch) {
      return reply.code(400).send({
        error: 'Invalid message',
        message: 'The message format is invalid',
      })
    }
    
    const nonce = nonceMatch[1]
    const nonceKey = `nonce:${data.walletAddress}`
    const storedNonceData = await server.redis.get(nonceKey)
    
    if (!storedNonceData) {
      return reply.code(401).send({
        error: 'Nonce expired',
        message: 'The nonce has expired. Please request a new one.',
      })
    }
    
    const { nonce: storedNonce } = JSON.parse(storedNonceData)
    
    if (nonce !== storedNonce) {
      return reply.code(401).send({
        error: 'Invalid nonce',
        message: 'The nonce does not match',
      })
    }
    
    // Delete used nonce
    await server.redis.del(nonceKey)
    
    // Check if user already exists
    const existingUser = await server.prisma.user.findUnique({
      where: { walletAddress: data.walletAddress },
    })
    
    if (existingUser) {
      return reply.code(409).send({
        error: 'User exists',
        message: 'A user with this wallet address already exists',
      })
    }
    
    // Check username uniqueness
    if (data.username) {
      const existingUsername = await server.prisma.user.findUnique({
        where: { username: data.username },
      })
      
      if (existingUsername) {
        return reply.code(409).send({
          error: 'Username taken',
          message: 'This username is already taken',
        })
      }
    }
    
    // Check email uniqueness
    if (data.email) {
      const existingEmail = await server.prisma.user.findUnique({
        where: { email: data.email },
      })
      
      if (existingEmail) {
        return reply.code(409).send({
          error: 'Email taken',
          message: 'This email is already registered',
        })
      }
    }
    
    // Create user
    const user = await server.prisma.user.create({
      data: {
        walletAddress: data.walletAddress,
        username: data.username,
        email: data.email,
        name: data.name,
        termsAccepted: data.termsAccepted,
        termsAcceptedAt: new Date(),
        termsVersion: data.termsVersion,
      },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })
    
    // Create session
    const token = server.jwt.sign({
      id: user.id,
      walletAddress: user.walletAddress,
      role: user.role,
    })
    
    await server.prisma.session.create({
      data: {
        userId: user.id,
        token,
        deviceInfo: request.headers['user-agent'] ? { userAgent: request.headers['user-agent'] } : {},
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })
    
    // Update last login
    await server.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })
    
    return {
      user,
      token,
    }
  })

  // Login existing user
  server.post('/login', async (request, reply) => {
    const data = LoginSchema.parse(request.body)
    
    // Verify signature
    const isValid = await verifySignature(
      data.message,
      data.signature,
      data.walletAddress
    )
    
    if (!isValid) {
      return reply.code(401).send({
        error: 'Invalid signature',
        message: 'The signature could not be verified',
      })
    }
    
    // Verify nonce
    const nonceMatch = data.message.match(/Nonce: (\d+)/)
    if (!nonceMatch) {
      return reply.code(400).send({
        error: 'Invalid message',
        message: 'The message format is invalid',
      })
    }
    
    const nonce = nonceMatch[1]
    const nonceKey = `nonce:${data.walletAddress}`
    const storedNonceData = await server.redis.get(nonceKey)
    
    if (!storedNonceData) {
      return reply.code(401).send({
        error: 'Nonce expired',
        message: 'The nonce has expired. Please request a new one.',
      })
    }
    
    const { nonce: storedNonce } = JSON.parse(storedNonceData)
    
    if (nonce !== storedNonce) {
      return reply.code(401).send({
        error: 'Invalid nonce',
        message: 'The nonce does not match',
      })
    }
    
    // Delete used nonce
    await server.redis.del(nonceKey)
    
    // Find user
    const user = await server.prisma.user.findUnique({
      where: { walletAddress: data.walletAddress },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        role: true,
        status: true,
        verified: true,
        language: true,
        theme: true,
        createdAt: true,
      },
    })
    
    if (!user) {
      return reply.code(404).send({
        error: 'User not found',
        message: 'No user found with this wallet address',
      })
    }
    
    // Check if user is banned
    if (user.status === 'BANNED') {
      return reply.code(403).send({
        error: 'Account banned',
        message: 'Your account has been banned',
      })
    }
    
    // Create session
    const token = server.jwt.sign({
      id: user.id,
      walletAddress: user.walletAddress,
      role: user.role,
    })
    
    await server.prisma.session.create({
      data: {
        userId: user.id,
        token,
        deviceInfo: request.headers['user-agent'] ? { userAgent: request.headers['user-agent'] } : {},
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })
    
    // Update last login
    await server.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })
    
    return {
      user,
      token,
    }
  })

  // Logout
  server.post('/logout', { 
    preHandler: server.authenticate 
  }, async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '')
    
    if (token) {
      // Delete session
      await server.prisma.session.deleteMany({
        where: { 
          token,
          userId: request.user.id,
        },
      })
      
      // Add token to blacklist in Redis
      const decoded = server.jwt.decode(token) as any
      const ttl = decoded.exp - Math.floor(Date.now() / 1000)
      if (ttl > 0) {
        await server.redis.setex(`blacklist:${token}`, ttl, '1')
      }
    }
    
    return { success: true }
  })

  // Refresh token
  server.post('/refresh', { 
    preHandler: server.authenticate 
  }, async (request, reply) => {
    const oldToken = request.headers.authorization?.replace('Bearer ', '')
    
    // Create new token
    const newToken = server.jwt.sign({
      id: request.user.id,
      walletAddress: request.user.walletAddress,
      role: request.user.role,
    })
    
    // Update session
    if (oldToken) {
      await server.prisma.session.updateMany({
        where: { 
          token: oldToken,
          userId: request.user.id,
        },
        data: {
          token: newToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })
    }
    
    return { token: newToken }
  })

  // Get current user
  server.get('/me', { 
    preHandler: server.authenticate 
  }, async (request, reply) => {
    const user = await server.prisma.user.findUnique({
      where: { id: request.user.id },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        avatarCid: true,
        coverImage: true,
        coverImageCid: true,
        language: true,
        theme: true,
        notifications: true,
        role: true,
        status: true,
        verified: true,
        createdAt: true,
        _count: {
          select: {
            daos: true,
            products: true,
            services: true,
            orders: true,
          },
        },
      },
    })
    
    if (!user) {
      return reply.code(404).send({
        error: 'User not found',
        message: 'User not found',
      })
    }
    
    return user
  })

  // Delete account
  server.delete('/account', { 
    preHandler: server.authenticate 
  }, async (request, reply) => {
    // Delete all user sessions
    await server.prisma.session.deleteMany({
      where: { userId: request.user.id },
    })
    
    // Delete user (cascades to related records)
    await server.prisma.user.delete({
      where: { id: request.user.id },
    })
    
    return { success: true }
  })
}

// Helper function to verify signature
async function verifySignature(
  message: string,
  signature: string,
  address: string
): Promise<boolean> {
  try {
    const result = signatureVerify(message, signature, address)
    return result.isValid
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

export default authRoutes