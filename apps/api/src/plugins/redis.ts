import fp from 'fastify-plugin'
import Redis from 'ioredis'

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis
  }
}

export default fp(async (server) => {
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
  })

  redis.on('connect', () => {
    server.log.info('Redis connected')
  })

  redis.on('error', (error) => {
    server.log.error('Redis error:', error)
  })

  server.decorate('redis', redis)

  server.addHook('onClose', async (server) => {
    await server.redis.quit()
  })
})