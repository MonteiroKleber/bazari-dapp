import '@fastify/jwt'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      walletAddress: string  
      role: string
    }
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      id: string
      walletAddress: string
      role: string
    }
  }
}
