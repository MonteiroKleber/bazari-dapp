import { FastifyPluginAsync } from 'fastify'

const daoRoutes: FastifyPluginAsync = async (server) => {
  // List DAOs
  server.get('/', async (request, reply) => {
    const daos = await server.prisma.dao.findMany({
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
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    
    return daos
  })

  // Get DAO by slug
  server.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }
    
    const dao = await server.prisma.dao.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            members: true,
            products: true,
            services: true,
            proposals: true,
          },
        },
      },
    })
    
    if (!dao) {
      return reply.code(404).send({
        error: 'Not found',
        message: 'DAO not found',
      })
    }
    
    return dao
  })
}

export default daoRoutes