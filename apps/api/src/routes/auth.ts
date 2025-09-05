// Arquivo: apps/api/src/routes/auth.ts
// Rotas de autenticação sem Redis para desenvolvimento

import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

// Schemas de validação
const NonceRequestSchema = z.object({
  walletAddress: z.string().min(47).max(48)
})

const RegisterSchema = z.object({
  walletAddress: z.string().min(47).max(48),
  signature: z.string(),
  message: z.string(),
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  termsAccepted: z.boolean(),
  termsVersion: z.string()
})

const LoginSchema = z.object({
  walletAddress: z.string().min(47).max(48),
  signature: z.string(),
  message: z.string()
})

// Store em memória para desenvolvimento (em produção usar Redis/DB)
const nonceStore = new Map<string, { nonce: string; timestamp: number }>()
const userStore = new Map<string, any>()

// Limpar nonces expirados a cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of nonceStore.entries()) {
    if (now - value.timestamp > 300000) { // 5 minutos
      nonceStore.delete(key)
    }
  }
}, 300000)

const authRoutes: FastifyPluginAsync = async (server) => {
  
  // GET /api/auth/health
  server.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })
  
  // POST /api/auth/nonce
  server.post('/nonce', async (request, reply) => {
    try {
      const { walletAddress } = NonceRequestSchema.parse(request.body)
      
      // Gerar nonce aleatório
      const nonce = Math.floor(Math.random() * 1000000000).toString()
      const timestamp = Date.now()
      
      // Salvar nonce em memória
      nonceStore.set(walletAddress, { nonce, timestamp })
      
      // Criar mensagem para assinar
      const message = `Sign this message to authenticate with Bazari.\n\nAddress: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${timestamp}\n\nThis signature will not cost any fees.`
      
      server.log.info(`Nonce generated for ${walletAddress}: ${nonce}`)
      
      return reply.send({
        message,
        nonce,
        timestamp
      })
    } catch (error: any) {
      server.log.error('Nonce error:', error)
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Validation failed',
          issues: error.issues
        })
      }
      return reply.code(400).send({
        error: 'Invalid request',
        message: error.message
      })
    }
  })
  
  // POST /api/auth/register
  server.post('/register', async (request, reply) => {
    try {
      const data = RegisterSchema.parse(request.body)
      
      server.log.info(`Register request for ${data.walletAddress}`)
      
      // Verificar termos
      if (!data.termsAccepted) {
        return reply.code(400).send({
          error: 'Terms not accepted',
          message: 'You must accept the terms of service to register'
        })
      }
      
      // Para desenvolvimento, aceitar qualquer assinatura
      // Em produção, verificar assinatura com @polkadot/util-crypto
      
      // Verificar nonce
      const nonceMatch = data.message.match(/Nonce: (\d+)/)
      if (nonceMatch) {
        const nonce = nonceMatch[1]
        const storedNonce = nonceStore.get(data.walletAddress)
        
        if (storedNonce && storedNonce.nonce === nonce) {
          // Nonce válido, remover da store
          nonceStore.delete(data.walletAddress)
        }
        // Para dev, não falhar se nonce inválido
      }
      
      // Criar usuário
      const user = {
        id: `user_${Date.now()}`,
        walletAddress: data.walletAddress,
        username: data.username || null,
        email: data.email || null,
        name: data.name || null,
        role: 'user',
        verified: false,
        createdAt: new Date().toISOString()
      }
      
      // Salvar usuário em memória
      userStore.set(data.walletAddress, user)
      
      // Gerar token simples (em produção usar JWT)
      const token = Buffer.from(JSON.stringify({
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 dias
      })).toString('base64')
      
      server.log.info(`User registered successfully: ${user.id}`)
      
      return reply.send({
        user,
        token
      })
    } catch (error: any) {
      server.log.error('Register error:', error)
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Validation failed',
          issues: error.issues
        })
      }
      return reply.code(500).send({
        error: 'Registration failed',
        message: error.message || 'An unexpected error occurred'
      })
    }
  })
  
  // POST /api/auth/login
  server.post('/login', async (request, reply) => {
    try {
      const data = LoginSchema.parse(request.body)
      
      server.log.info(`Login request for ${data.walletAddress}`)
      
      // Buscar usuário
      let user = userStore.get(data.walletAddress)
      
      if (!user) {
        // Para desenvolvimento, auto-criar usuário
        user = {
          id: `user_${Date.now()}`,
          walletAddress: data.walletAddress,
          username: null,
          email: null,
          name: null,
          role: 'user',
          verified: false,
          createdAt: new Date().toISOString()
        }
        userStore.set(data.walletAddress, user)
        server.log.info(`Auto-created user for development: ${user.id}`)
      }
      
      // Gerar token
      const token = Buffer.from(JSON.stringify({
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000
      })).toString('base64')
      
      server.log.info(`User logged in successfully: ${user.id}`)
      
      return reply.send({
        user,
        token
      })
    } catch (error: any) {
      server.log.error('Login error:', error)
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Validation failed',
          issues: error.issues
        })
      }
      return reply.code(500).send({
        error: 'Login failed',
        message: error.message || 'An unexpected error occurred'
      })
    }
  })
  
  // POST /api/auth/logout
  server.post('/logout', async (request, reply) => {
    // Em produção, invalidar token
    server.log.info('Logout request')
    return reply.send({
      success: true,
      message: 'Logged out successfully'
    })
  })
  
  // POST /api/auth/refresh
  server.post('/refresh', async (request, reply) => {
    const authHeader = request.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        error: 'No token provided'
      })
    }
    
    try {
      const oldToken = authHeader.substring(7)
      const decoded = JSON.parse(Buffer.from(oldToken, 'base64').toString())
      
      // Verificar expiração
      if (decoded.exp && decoded.exp < Date.now()) {
        return reply.code(401).send({
          error: 'Token expired'
        })
      }
      
      // Renovar token
      const token = Buffer.from(JSON.stringify({
        ...decoded,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000
      })).toString('base64')
      
      server.log.info(`Token refreshed for user: ${decoded.id}`)
      
      return reply.send({ token })
    } catch (error: any) {
      server.log.error('Refresh token error:', error)
      return reply.code(401).send({
        error: 'Invalid token'
      })
    }
  })
}

export default authRoutes