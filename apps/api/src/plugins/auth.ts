import fp from 'fastify-plugin'
import { FastifyRequest, FastifyReply } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    authenticateOptional: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
  
  interface FastifyRequest {
    user?: {
      id: string
      walletAddress: string
      role: string
    }
  }
}

export default fp(async (server) => {
  // Mandatory authentication
  server.decorate('authenticate', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        reply.code(401).send({
          error: 'Unauthorized',
          message: 'No token provided',
        })
        return
      }

      // Check if token is blacklisted
      const isBlacklisted = await server.redis.get(`blacklist:${token}`)
      if (isBlacklisted) {
        reply.code(401).send({
          error: 'Unauthorized',
          message: 'Token has been revoked',
        })
        return
      }

      // Verify token
      const decoded = server.jwt.verify(token) as any
      
      // Check if session exists
      const session = await server.prisma.session.findUnique({
        where: { token },
      })
      
      if (!session) {
        reply.code(401).send({
          error: 'Unauthorized',
          message: 'Invalid session',
        })
        return
      }
      
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        await server.prisma.session.delete({
          where: { id: session.id },
        })
        reply.code(401).send({
          error: 'Unauthorized',
          message: 'Session expired',
        })
        return
      }
      
      // Get user
      const user = await server.prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          walletAddress: true,
          role: true,
          status: true,
        },
      })
      
      if (!user) {
        reply.code(401).send({
          error: 'Unauthorized',
          message: 'User not found',
        })
        return
      }
      
      // Check if user is banned
      if (user.status === 'BANNED') {
        reply.code(403).send({
          error: 'Forbidden',
          message: 'Account banned',
        })
        return
      }
      
      request.user = {
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role,
      }
    } catch (error) {
      server.log.error('Authentication error:', error)
      reply.code(401).send({
        error: 'Unauthorized',
        message: 'Invalid token',
      })
    }
  })

  // Optional authentication
  server.decorate('authenticateOptional', async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return // No token, continue without authentication
      }

      // Check if token is blacklisted
      const isBlacklisted = await server.redis.get(`blacklist:${token}`)
      if (isBlacklisted) {
        return // Token revoked, continue without authentication
      }

      // Verify token
      const decoded = server.jwt.verify(token) as any
      
      // Check if session exists
      const session = await server.prisma.session.findUnique({
        where: { token },
      })
      
      if (!session) {
        return // Invalid session, continue without authentication
      }
      
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        await server.prisma.session.delete({
          where: { id: session.id },
        })
        return // Session expired, continue without authentication
      }
      
      // Get user
      const user = await server.prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          walletAddress: true,
          role: true,
          status: true,
        },
      })
      
      if (!user || user.status === 'BANNED') {
        return // User not found or banned, continue without authentication
      }
      
      request.user = {
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role,
      }
    } catch (error) {
      // Invalid token, continue without authentication
      server.log.debug('Optional auth failed:', error)
    }
  })
})