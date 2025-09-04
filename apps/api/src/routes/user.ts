import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

const UpdateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  bio: z.string().max(500).optional(),
  language: z.enum(['pt-BR', 'en-US', 'es-ES']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z.record(z.boolean()).optional(),
})

const userRoutes: FastifyPluginAsync = async (server) => {
  // Get user profile
  server.get('/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params)
    
    const user = await server.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        avatarCid: true,
        coverImage: true,
        coverImageCid: true,
        verified: true,
        createdAt: true,
        _count: {
          select: {
            daos: true,
            products: true,
            services: true,
          },
        },
      },
    })
    
    if (!user) {
      return reply.code(404).send({
        error: 'Not found',
        message: 'User not found',
      })
    }
    
    return user
  })

  // Update profile
  server.patch('/:id', {
    preHandler: server.authenticate,
  }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params)
    const data = UpdateProfileSchema.parse(request.body)
    
    // Check if user is updating their own profile
    if (request.user.id !== id) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'You can only update your own profile',
      })
    }
    
    // Check username uniqueness
    if (data.username) {
      const existing = await server.prisma.user.findFirst({
        where: {
          username: data.username,
          id: { not: id },
        },
      })
      
      if (existing) {
        return reply.code(409).send({
          error: 'Username taken',
          message: 'This username is already taken',
        })
      }
    }
    
    // Check email uniqueness
    if (data.email) {
      const existing = await server.prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: id },
        },
      })
      
      if (existing) {
        return reply.code(409).send({
          error: 'Email taken',
          message: 'This email is already registered',
        })
      }
    }
    
    const updated = await server.prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        language: true,
        theme: true,
        notifications: true,
      },
    })
    
    return updated
  })

  // Upload avatar
  server.post('/:id/avatar', {
    preHandler: server.authenticate,
  }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params)
    
    if (request.user.id !== id) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'You can only update your own avatar',
      })
    }
    
    const data = await request.file()
    if (!data) {
      return reply.code(400).send({
        error: 'No file',
        message: 'No file uploaded',
      })
    }
    
    // Upload to IPFS
    const buffer = await data.toBuffer()
    const cid = await server.ipfs.addFile(buffer)
    
    // Pin the file
    await server.ipfs.pin(cid)
    
    // Update user
    const user = await server.prisma.user.update({
      where: { id },
      data: {
        avatarCid: cid,
        avatar: `${process.env.IPFS_GATEWAY || 'http://localhost:8080'}/ipfs/${cid}`,
      },
      select: {
        avatar: true,
        avatarCid: true,
      },
    })
    
    return user
  })

  // List user's DAOs
  server.get('/:id/daos', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params)
    
    const memberships = await server.prisma.daoMember.findMany({
      where: { userId: id },
      include: {
        dao: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            logo: true,
            category: true,
            verified: true,
            _count: {
              select: {
                members: true,
                products: true,
                services: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    })
    
    return memberships.map(m => ({
      ...m.dao,
      role: m.role,
      shares: m.shares.toString(),
      joinedAt: m.joinedAt,
    }))
  })

  // List user's products
  server.get('/:id/products', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params)
    
    const products = await server.prisma.product.findMany({
      where: { userId: id },
      select: {
        id: true,
        title: true,
        description: true,
        priceBzr: true,
        images: true,
        status: true,
        featured: true,
        createdAt: true,
        dao: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return products.map(p => ({
      ...p,
      priceBzr: p.priceBzr.toString(),
    }))
  })

  // List user's services
  server.get('/:id/services', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params)
    
    const services = await server.prisma.serviceOffering.findMany({
      where: { userId: id },
      select: {
        id: true,
        title: true,
        description: true,
        basePriceBzr: true,
        priceType: true,
        images: true,
        status: true,
        featured: true,
        createdAt: true,
        dao: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return services.map(s => ({
      ...s,
      basePriceBzr: s.basePriceBzr?.toString(),
    }))
  })
}

export default userRoutes