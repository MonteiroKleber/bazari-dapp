import { FastifyPluginAsync } from 'fastify'

const orderRoutes: FastifyPluginAsync = async (server) => {
  // Get user's orders
  server.get('/my', {
    preHandler: server.authenticate,
  }, async (request, reply) => {
    const orders = await server.prisma.order.findMany({
      where: { buyerId: request.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                title: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return orders.map(order => ({
      ...order,
      subtotalBzr: order.subtotalBzr.toString(),
      taxBzr: order.taxBzr.toString(),
      feeBzr: order.feeBzr.toString(),
      totalBzr: order.totalBzr.toString(),
      items: order.items.map(item => ({
        ...item,
        priceBzr: item.priceBzr.toString(),
        totalBzr: item.totalBzr.toString(),
      })),
    }))
  })

  // Get order by ID
  server.get('/:id', {
    preHandler: server.authenticate,
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    
    const order = await server.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })
    
    if (!order) {
      return reply.code(404).send({
        error: 'Not found',
        message: 'Order not found',
      })
    }
    
    // Check if user owns this order
    if (order.buyerId !== request.user.id && order.sellerId !== request.user.id) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'You do not have access to this order',
      })
    }
    
    return {
      ...order,
      subtotalBzr: order.subtotalBzr.toString(),
      taxBzr: order.taxBzr.toString(),
      feeBzr: order.feeBzr.toString(),
      totalBzr: order.totalBzr.toString(),
      items: order.items.map(item => ({
        ...item,
        priceBzr: item.priceBzr.toString(),
        totalBzr: item.totalBzr.toString(),
      })),
    }
  })
}

export default orderRoutes