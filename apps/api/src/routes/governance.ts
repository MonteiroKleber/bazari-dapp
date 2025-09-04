import { FastifyPluginAsync } from 'fastify'

const governanceRoutes: FastifyPluginAsync = async (server) => {
  // List proposals
  server.get('/proposals', async (request, reply) => {
    const proposals = await server.prisma.proposal.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        status: true,
        votesFor: true,
        votesAgainst: true,
        votesAbstain: true,
        createdAt: true,
        dao: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        proposer: {
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
    
    return proposals.map(p => ({
      ...p,
      votesFor: p.votesFor.toString(),
      votesAgainst: p.votesAgainst.toString(),
      votesAbstain: p.votesAbstain.toString(),
    }))
  })

  // Get proposal by ID
  server.get('/proposals/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    const proposal = await server.prisma.proposal.findUnique({
      where: { id },
      include: {
        dao: true,
        proposer: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            avatar: true,
          },
        },
        votes: {
          select: {
            vote: true,
            weight: true,
            reason: true,
            voter: {
              select: {
                username: true,
                walletAddress: true,
              },
            },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    
    if (!proposal) {
      return reply.code(404).send({
        error: 'Not found',
        message: 'Proposal not found',
      })
    }
    
    return {
      ...proposal,
      votesFor: proposal.votesFor.toString(),
      votesAgainst: proposal.votesAgainst.toString(),
      votesAbstain: proposal.votesAbstain.toString(),
      amountRequested: proposal.amountRequested?.toString(),
      votes: proposal.votes.map(v => ({
        ...v,
        weight: v.weight.toString(),
      })),
    }
  })
}

export default governanceRoutes