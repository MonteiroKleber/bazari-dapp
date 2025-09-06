// apps/api/src/plugins/auth.ts
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
      role?: string
    }
  }
}

export default fp(async (server) => {
  /**
   * Mandatory authentication using httpOnly cookies
   * ✅ Reads session from cookie, not Bearer token
   * ✅ Validates session in Redis
   * ✅ Checks blacklist
   */
  server.decorate('authenticate', async (request, reply) => {
    try {
      // Read session from httpOnly cookie
      const sessionId = request.cookies?.session
      
      if (!sessionId) {
        reply.code(401).send({
          error: 'Unauthorized',
          message: 'No session cookie found',
        })
        return
      }

      // Check if session is blacklisted
      const isBlacklisted = await server.redis.get(`blacklist:${sessionId}`)
      if (isBlacklisted) {
        // Clear the cookie if blacklisted
        reply.setCookie('session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 0 // Expire immediately
        })
        
        reply.code(401).send({
          error: 'Unauthorized',
          message: 'Session has been revoked',
        })
        return
      }

      // Get session from Redis
      const sessionData = await server.redis.get(`session:${sessionId}`)
      
      if (!sessionData) {
        // Clear invalid cookie
        reply.setCookie('session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 0
        })
        
        reply.code(401).send({
          error: 'Unauthorized',
          message: 'Session expired or invalid',
        })
        return
      }
      
      // Parse session data
      const session = JSON.parse(sessionData)
      
      // Check if session is expired
      if (session.expiresAt && session.expiresAt < Date.now()) {
        // Delete expired session
        await server.redis.del(`session:${sessionId}`)
        
        // Clear cookie
        reply.setCookie('session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 0
        })
        
        reply.code(401).send({
          error: 'Unauthorized',
          message: 'Session expired',
        })
        return
      }
      
      // Get user from database
      const user = await server.prisma.user.findUnique({
        where: { id: session.userId },
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
        // Blacklist the session
        await server.redis.setex(
          `blacklist:${sessionId}`,
          7 * 24 * 60 * 60, // 7 days
          '1'
        )
        
        // Clear session
        await server.redis.del(`session:${sessionId}`)
        
        // Clear cookie
        reply.setCookie('session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 0
        })
        
        reply.code(403).send({
          error: 'Forbidden',
          message: 'Account has been banned',
        })
        return
      }
      
      // Attach user to request
      request.user = {
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role || 'USER',
      }
      
      // Optional: Update session activity
      const updatedSession = {
        ...session,
        lastActivityAt: Date.now()
      }
      
      // Refresh session TTL
      await server.redis.setex(
        `session:${sessionId}`,
        7 * 24 * 60 * 60, // 7 days
        JSON.stringify(updatedSession)
      )
      
    } catch (error) {
      server.log.error('Authentication error:', error)
      
      // Clear potentially corrupted cookie
      reply.setCookie('session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0
      })
      
      reply.code(401).send({
        error: 'Unauthorized',
        message: 'Authentication failed',
      })
    }
  })

  /**
   * Optional authentication using httpOnly cookies
   * ✅ Same as mandatory but doesn't fail if no session
   */
  server.decorate('authenticateOptional', async (request, reply) => {
    try {
      // Read session from cookie
      const sessionId = request.cookies?.session
      
      if (!sessionId) {
        return // No session, continue without authentication
      }

      // Check if session is blacklisted
      const isBlacklisted = await server.redis.get(`blacklist:${sessionId}`)
      if (isBlacklisted) {
        // Clear blacklisted cookie silently
        reply.setCookie('session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 0
        })
        return // Continue without authentication
      }

      // Get session from Redis
      const sessionData = await server.redis.get(`session:${sessionId}`)
      
      if (!sessionData) {
        // Clear invalid cookie silently
        reply.setCookie('session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 0
        })
        return // Continue without authentication
      }
      
      // Parse session
      const session = JSON.parse(sessionData)
      
      // Check if expired
      if (session.expiresAt && session.expiresAt < Date.now()) {
        // Clean up expired session
        await server.redis.del(`session:${sessionId}`)
        
        // Clear cookie silently
        reply.setCookie('session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 0
        })
        return // Continue without authentication
      }
      
      // Get user
      const user = await server.prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          walletAddress: true,
          role: true,
          status: true,
        },
      })
      
      if (!user || user.status === 'BANNED') {
        // If user not found or banned, clean up silently
        if (user?.status === 'BANNED') {
          await server.redis.setex(`blacklist:${sessionId}`, 7 * 24 * 60 * 60, '1')
          await server.redis.del(`session:${sessionId}`)
        }
        
        // Clear cookie
        reply.setCookie('session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 0
        })
        return // Continue without authentication
      }
      
      // Attach user to request
      request.user = {
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role || 'USER',
      }
      
      // Update session activity
      const updatedSession = {
        ...session,
        lastActivityAt: Date.now()
      }
      
      // Refresh session TTL
      await server.redis.setex(
        `session:${sessionId}`,
        7 * 24 * 60 * 60,
        JSON.stringify(updatedSession)
      )
      
    } catch (error) {
      // Log but don't fail for optional auth
      server.log.debug('Optional auth failed:', error)
      
      // Clear potentially corrupted cookie silently
      reply.setCookie('session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0
      })
      // Continue without authentication
    }
  })
  
  /**
   * Helper to blacklist a session (for logout, ban, etc)
   */
  server.decorate('blacklistSession', async (sessionId: string) => {
    if (!sessionId) return
    
    // Add to blacklist
    await server.redis.setex(
      `blacklist:${sessionId}`,
      7 * 24 * 60 * 60, // 7 days
      '1'
    )
    
    // Delete session
    await server.redis.del(`session:${sessionId}`)
  })
  
  /**
   * Helper to validate session without full authentication
   */
  server.decorate('validateSession', async (sessionId: string) => {
    if (!sessionId) return null
    
    // Check blacklist
    const isBlacklisted = await server.redis.get(`blacklist:${sessionId}`)
    if (isBlacklisted) return null
    
    // Get session
    const sessionData = await server.redis.get(`session:${sessionId}`)
    if (!sessionData) return null
    
    const session = JSON.parse(sessionData)
    
    // Check expiry
    if (session.expiresAt && session.expiresAt < Date.now()) {
      await server.redis.del(`session:${sessionId}`)
      return null
    }
    
    return session
  })
})

// Type declarations for new helpers
declare module 'fastify' {
  interface FastifyInstance {
    blacklistSession: (sessionId: string) => Promise<void>
    validateSession: (sessionId: string) => Promise<any>
  }
}