import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { BN } from '@polkadot/util'

// Schemas
const GetBalanceSchema = z.object({
  address: z.string().min(47).max(48),
})

const TransferSchema = z.object({
  from: z.string().min(47).max(48),
  to: z.string().min(47).max(48),
  amount: z.string(),
  token: z.enum(['BZR', 'LIVO']).default('BZR'),
  signature: z.string(),
  message: z.string(),
})

const TransactionHistorySchema = z.object({
  address: z.string().min(47).max(48).optional(),
  type: z.enum(['TRANSFER', 'PURCHASE', 'DAO_FUNDING', 'CASHBACK', 'FEE', 'OTHER']).optional(),
  token: z.enum(['BZR', 'LIVO']).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'FAILED']).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

const EstimateFeeSchema = z.object({
  from: z.string().min(47).max(48),
  to: z.string().min(47).max(48),
  amount: z.string(),
  token: z.enum(['BZR', 'LIVO']).default('BZR'),
})

const walletRoutes: FastifyPluginAsync = async (server) => {
  // Get balance for an address
  server.get('/balance/:address', async (request, reply) => {
    const { address } = GetBalanceSchema.parse(request.params)
    
    try {
      // Get BZR balance from chain
      const bzrBalance = await server.chain.getBalance(address)
      
      // Get LIVO balance from chain
      const livoBalance = await server.chain.getLivoBalance(address)
      
      // Get pending transactions
      const pendingTxs = await server.prisma.transaction.findMany({
        where: {
          OR: [
            { fromAddress: address },
            { toAddress: address },
          ],
          status: 'PENDING',
        },
      })
      
      // Calculate pending amounts
      let pendingBzrOut = new BN(0)
      let pendingBzrIn = new BN(0)
      let pendingLivoOut = new BN(0)
      let pendingLivoIn = new BN(0)
      
      for (const tx of pendingTxs) {
        const amount = new BN(tx.amount.toString())
        
        if (tx.token === 'BZR') {
          if (tx.fromAddress === address) {
            pendingBzrOut = pendingBzrOut.add(amount)
          } else {
            pendingBzrIn = pendingBzrIn.add(amount)
          }
        } else if (tx.token === 'LIVO') {
          if (tx.fromAddress === address) {
            pendingLivoOut = pendingLivoOut.add(amount)
          } else {
            pendingLivoIn = pendingLivoIn.add(amount)
          }
        }
      }
      
      return {
        address,
        balances: {
          BZR: {
            free: server.chain.formatBalance(bzrBalance.free),
            reserved: server.chain.formatBalance(bzrBalance.reserved),
            frozen: server.chain.formatBalance(bzrBalance.frozen),
            available: server.chain.formatBalance(
              bzrBalance.free.sub(bzrBalance.frozen)
            ),
            pendingIn: server.chain.formatBalance(pendingBzrIn),
            pendingOut: server.chain.formatBalance(pendingBzrOut),
          },
          LIVO: {
            balance: server.chain.formatBalance(livoBalance),
            pendingIn: server.chain.formatBalance(pendingLivoIn),
            pendingOut: server.chain.formatBalance(pendingLivoOut),
          },
        },
        pendingTransactions: pendingTxs.length,
      }
    } catch (error) {
      server.log.error('Error getting balance:', error)
      return reply.code(500).send({
        error: 'Balance fetch failed',
        message: 'Failed to fetch balance from blockchain',
      })
    }
  })

  // Transfer tokens
  server.post('/transfer', {
    preHandler: server.authenticate,
  }, async (request, reply) => {
    const data = TransferSchema.parse(request.body)
    
    // Verify the sender owns the from address
    const user = await server.prisma.user.findUnique({
      where: { id: request.user.id },
    })
    
    if (user?.walletAddress !== data.from) {
      return reply.code(403).send({
        error: 'Unauthorized',
        message: 'You can only send from your own wallet',
      })
    }
    
    try {
      // Create pending transaction record
      const transaction = await server.prisma.transaction.create({
        data: {
          fromAddress: data.from,
          toAddress: data.to,
          type: 'TRANSFER',
          token: data.token,
          amount: data.amount,
          status: 'PENDING',
          metadata: {
            initiatedBy: request.user.id,
            signature: data.signature,
          },
        },
      })
      
      // Get keypair from chain client (in production, this would be handled differently)
      // For now, we'll use the development accounts
      const keyring = server.chain.keyring
      const fromAccount = keyring?.getPair(data.from)
      
      if (!fromAccount) {
        // In production, the client would sign and submit the transaction
        // For development, we'll use a test account
        const alice = keyring?.addFromUri('//Alice')
        
        // Execute transfer on chain
        const txHash = await server.chain.transfer({
          from: alice!,
          to: data.to,
          amount: data.amount,
          token: data.token,
        })
        
        // Update transaction record
        await server.prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            chainTxHash: txHash,
            status: 'CONFIRMED',
          },
        })
        
        return {
          success: true,
          transactionId: transaction.id,
          txHash,
          amount: data.amount,
          token: data.token,
          from: data.from,
          to: data.to,
        }
      }
      
      // Execute transfer on chain
      const txHash = await server.chain.transfer({
        from: fromAccount,
        to: data.to,
        amount: data.amount,
        token: data.token,
      })
      
      // Update transaction record
      await server.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          chainTxHash: txHash,
          status: 'CONFIRMED',
        },
      })
      
      return {
        success: true,
        transactionId: transaction.id,
        txHash,
        amount: data.amount,
        token: data.token,
        from: data.from,
        to: data.to,
      }
    } catch (error: any) {
      server.log.error('Transfer error:', error)
      
      // Update transaction as failed if it exists
      if (request.body.transactionId) {
        await server.prisma.transaction.update({
          where: { id: request.body.transactionId },
          data: {
            status: 'FAILED',
            metadata: {
              error: error.message,
            },
          },
        })
      }
      
      return reply.code(500).send({
        error: 'Transfer failed',
        message: error.message || 'Failed to execute transfer',
      })
    }
  })

  // Get transaction history
  server.get('/transactions', async (request, reply) => {
    const query = TransactionHistorySchema.parse(request.query)
    
    const where: any = {}
    
    if (query.address) {
      where.OR = [
        { fromAddress: query.address },
        { toAddress: query.address },
      ]
    }
    
    if (query.type) {
      where.type = query.type
    }
    
    if (query.token) {
      where.token = query.token
    }
    
    if (query.status) {
      where.status = query.status
    }
    
    const [transactions, total] = await Promise.all([
      server.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      server.prisma.transaction.count({ where }),
    ])
    
    return {
      transactions,
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + query.limit < total,
      },
    }
  })

  // Get transaction by ID
  server.get('/transactions/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params)
    
    const transaction = await server.prisma.transaction.findUnique({
      where: { id },
    })
    
    if (!transaction) {
      return reply.code(404).send({
        error: 'Not found',
        message: 'Transaction not found',
      })
    }
    
    return transaction
  })

  // Estimate transaction fee
  server.post('/estimate-fee', async (request, reply) => {
    const data = EstimateFeeSchema.parse(request.body)
    
    try {
      // In Substrate, we can estimate fees by creating a transaction without sending it
      const api = server.chain.chainApi
      if (!api) {
        throw new Error('Chain API not connected')
      }
      
      const amount = server.chain.parseBalance(data.amount)
      
      let tx
      if (data.token === 'BZR') {
        tx = api.tx.balances.transferKeepAlive(data.to, amount)
      } else {
        tx = (api.tx as any).cashback.transfer(data.to, amount)
      }
      
      // Get payment info (fees)
      const paymentInfo = await tx.paymentInfo(data.from)
      
      return {
        estimatedFee: server.chain.formatBalance(paymentInfo.partialFee.toBn()),
        token: 'BZR', // Fees are always in BZR
      }
    } catch (error: any) {
      server.log.error('Fee estimation error:', error)
      return reply.code(500).send({
        error: 'Fee estimation failed',
        message: error.message || 'Failed to estimate transaction fee',
      })
    }
  })

  // Get supported tokens
  server.get('/tokens', async (request, reply) => {
    return {
      tokens: [
        {
          symbol: 'BZR',
          name: 'Bazari',
          decimals: 12,
          type: 'native',
          icon: '/icons/bzr.svg',
        },
        {
          symbol: 'LIVO',
          name: 'Bazari Cashback',
          decimals: 12,
          type: 'cashback',
          icon: '/icons/livo.svg',
        },
      ],
    }
  })

  // Get chain info
  server.get('/chain-info', async (request, reply) => {
    try {
      return {
        name: server.chain.chainName,
        version: server.chain.chainVersion,
        genesisHash: server.chain.genesisHash,
        isConnected: server.chain.isReady,
        endpoint: process.env.CHAIN_ENDPOINT || 'ws://localhost:9944',
      }
    } catch (error) {
      return {
        name: 'BazariChain',
        version: 'unknown',
        genesisHash: 'unknown',
        isConnected: false,
        endpoint: process.env.CHAIN_ENDPOINT || 'ws://localhost:9944',
      }
    }
  })

  // Fund account (development only)
  if (process.env.NODE_ENV === 'development') {
    server.post('/faucet', {
      preHandler: server.authenticate,
    }, async (request, reply) => {
      const { address, amount } = z.object({
        address: z.string().min(47).max(48),
        amount: z.string().default('1000'),
      }).parse(request.body)
      
      try {
        // Fund with BZR from Alice account
        const amountWithDecimals = server.chain.parseBalance(amount).toString()
        await server.chain.fundAccount(address, amountWithDecimals)
        
        // Record transaction
        await server.prisma.transaction.create({
          data: {
            fromAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', // Alice
            toAddress: address,
            type: 'OTHER',
            token: 'BZR',
            amount: amountWithDecimals,
            status: 'CONFIRMED',
            metadata: {
              source: 'faucet',
              userId: request.user.id,
            },
          },
        })
        
        return {
          success: true,
          amount,
          token: 'BZR',
          address,
          message: `Funded ${amount} BZR to ${address}`,
        }
      } catch (error: any) {
        server.log.error('Faucet error:', error)
        return reply.code(500).send({
          error: 'Faucet failed',
          message: error.message || 'Failed to fund account',
        })
      }
    })
  }
}

export default walletRoutes