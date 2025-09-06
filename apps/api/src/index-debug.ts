console.log('=== INICIANDO SERVIDOR BAZARI ===')

import Fastify from 'fastify'
console.log('✓ Fastify importado')

import cors from '@fastify/cors'
console.log('✓ cors importado')

import cookie from '@fastify/cookie'
console.log('✓ cookie importado')

import jwt from '@fastify/jwt'
console.log('✓ jwt importado')

import rateLimit from '@fastify/rate-limit'
console.log('✓ rateLimit importado')

import { PrismaClient } from '@prisma/client'
console.log('✓ PrismaClient importado')

import Redis from 'ioredis'
console.log('✓ Redis importado')

console.log('Criando instâncias...')

// Testar Prisma
try {
  const prisma = new PrismaClient()
  console.log('✓ Prisma criado')
  
  // Testar conexão
  await prisma.$connect()
  console.log('✓ Prisma conectado')
} catch (error) {
  console.error('❌ Erro no Prisma:', error)
  process.exit(1)
}

// Testar Redis
try {
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
  console.log('✓ Redis criado')
  
  // Testar conexão
  await redis.ping()
  console.log('✓ Redis conectado')
} catch (error) {
  console.error('❌ Erro no Redis:', error)
  process.exit(1)
}

console.log('✓ Todas as conexões OK!')

// Criar servidor simples
const app = Fastify({ logger: true })

app.get('/test', async () => {
  return { status: 'ok' }
})

const start = async () => {
  try {
    await app.listen({ port: 3333, host: '0.0.0.0' })
    console.log('🚀 Servidor rodando em http://0.0.0.0:3333')
  } catch (err) {
    console.error('Erro ao iniciar:', err)
    process.exit(1)
  }
}

start()