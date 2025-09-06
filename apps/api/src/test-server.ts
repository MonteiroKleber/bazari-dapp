import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import { PrismaClient } from '@prisma/client'
import Redis from 'ioredis'

console.log('Creating instances...')
const prisma = new PrismaClient()
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

const app = Fastify({
  logger: {
    level: 'info',
    transport: { target: 'pino-pretty', options: { colorize: true } }
  }
})

app.decorate('prisma', prisma)
app.decorate('redis', redis)

const start = async () => {
  console.log('Registering plugins...')
  
  await app.register(cors, {
    origin: true,
    credentials: true
  })
  
  await app.register(cookie, {
    secret: 'test-secret'
  })
  
  app.get('/test', async () => ({ status: 'ok' }))
  
  console.log('Starting server...')
  await app.listen({ port: 3333, host: '0.0.0.0' })
  console.log('✅ Server running on 3333')
}

start().catch(err => {
  console.error('ERROR:', err)
  process.exit(1)
})