console.log('1. Starting...')

import Fastify from 'fastify'
console.log('2. Fastify imported')

import cors from '@fastify/cors'
console.log('3. cors imported')

import cookie from '@fastify/cookie'
console.log('4. cookie imported')

import jwt from '@fastify/jwt'
console.log('5. jwt imported')

import rateLimit from '@fastify/rate-limit'
console.log('6. rateLimit imported')

import { PrismaClient } from '@prisma/client'
console.log('7. PrismaClient imported')

import Redis from 'ioredis'
console.log('8. Redis imported')

import crypto from 'crypto'
console.log('9. crypto imported')

import { hexToU8a, isHex, stringToU8a } from '@polkadot/util'
console.log('10. polkadot/util imported')

import { signatureVerify } from '@polkadot/util-crypto'
console.log('11. polkadot/util-crypto imported')

console.log('12. Trying to import authPlugin...')
import authPlugin from './plugins/auth'
console.log('13. authPlugin imported')

console.log('14. Trying to import authRoutes...')
import authRoutes from './routes/auth'
console.log('15. authRoutes imported')

console.log('ALL IMPORTS OK!')
