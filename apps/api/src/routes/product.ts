import { FastifyPluginAsync } from 'fastify'

const productRoutes: FastifyPluginAsync = async (server) => {
  // List products
  server.get('/', async (request, reply) => {
    const products = await server.prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        title: true,
        description: true,
        priceBzr: true,
        images: true,
        categoryId: true,
        dao: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    
    return products.map(p => ({
      ...p,
      priceBzr: p.priceBzr.toString(),
    }))
  })

  // Get product by ID
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    const product = await server.prisma.product.findUnique({
      where: { id },
      include: {
        dao: true,
        user: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            avatar: true,
          },
        },
      },
    })
    
    if (!product) {
      return reply.code(404).send({
        error: 'Not found',
        message: 'Product not found',
      })
    }
    
    return {
      ...product,
      priceBzr: product.priceBzr.toString(),
    }
  })
}

export default productRoutes