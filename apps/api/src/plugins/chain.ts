import fp from 'fastify-plugin'
import { ChainClient, Keyring } from '@bazari/chain-client'

declare module 'fastify' {
  interface FastifyInstance {
    chain: ChainClient
    keyring?: Keyring
  }
}

export default fp(async (server) => {
  const chainClient = new ChainClient({
    endpoint: process.env.CHAIN_ENDPOINT || 'ws://localhost:9944',
  })

  // Listen to chain events
  chainClient.on('connected', () => {
    server.log.info('Connected to BazariChain')
  })

  chainClient.on('disconnected', () => {
    server.log.warn('Disconnected from BazariChain')
  })

  chainClient.on('error', (error) => {
    server.log.error('Chain error:', error)
  })

  chainClient.on('block', (blockNumber) => {
    server.log.debug(`New block: ${blockNumber}`)
  })

  // Listen for transfers to update database
  chainClient.on('transfer', async ({ from, to, amount, token }) => {
    try {
      // Update transaction status if it exists
      await server.prisma.transaction.updateMany({
        where: {
          fromAddress: from,
          toAddress: to,
          amount: amount,
          token: token,
          status: 'PENDING',
        },
        data: {
          status: 'CONFIRMED',
        },
      })
    } catch (error) {
      server.log.error('Error updating transaction:', error)
    }
  })

  server.decorate('chain', chainClient)

  // In development, also expose keyring for testing
  if (process.env.NODE_ENV === 'development') {
    const keyring = new Keyring({ type: 'sr25519' })
    server.decorate('keyring', keyring)
  }

  server.addHook('onClose', async (server) => {
    await server.chain.disconnect()
  })
})