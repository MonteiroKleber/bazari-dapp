// packages/chain-client/src/index.ts
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api'
import { KeyringPair$Json } from '@polkadot/keyring/types'
import { EventEmitter } from 'eventemitter3'
import BN from 'bn.js'
import type { SubmittableExtrinsic } from '@polkadot/api/types'
import type { ISubmittableResult } from '@polkadot/types/types'

// Types
export interface ChainClientConfig {
  wsEndpoint?: string
  types?: Record<string, any>
  rpc?: Record<string, any>
}

export interface AccountBalance {
  free: BN
  reserved: BN
  frozen: BN
}

export interface TransferOptions {
  from: KeyringPair
  to: string
  amount: string | BN
  token?: 'BZR' | 'LIVO'
}

export interface DaoInfo {
  id: string
  founder: string
  name: string
  description: string
  ipfsHash: string
  treasuryAddress: string
  memberCount: number
  proposalCount: number
  created: number
}

export interface ProposalInfo {
  id: number
  daoId: string
  proposer: string
  title: string
  description: string
  ipfsHash: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Executed'
  votesFor: BN
  votesAgainst: BN
  created: number
  deadline: number
}

export interface MarketplaceListing {
  id: string
  daoId: string
  seller: string
  title: string
  description: string
  price: BN
  ipfsHash: string
  category: string
  status: 'Active' | 'Sold' | 'Cancelled'
  created: number
}

// Re-export KeyringPair from the correct location
import Keyring from '@polkadot/keyring'
export type KeyringPair = ReturnType<InstanceType<typeof Keyring>['addFromUri']>

export class ChainClient extends EventEmitter {
  private api: ApiPromise | null = null
  private wsProvider: WsProvider | null = null
  private keyring: Keyring | null = null
  private config: ChainClientConfig

  constructor(config: ChainClientConfig = {}) {
    super()
    this.config = {
      wsEndpoint: config.wsEndpoint || 'ws://localhost:9944',
      types: config.types || {},
      rpc: config.rpc || {},
    }
  }

  // Connection management
  async connect(): Promise<void> {
    try {
      this.wsProvider = new WsProvider(this.config.wsEndpoint)
      
      this.api = await ApiPromise.create({
        provider: this.wsProvider,
        types: this.config.types,
        rpc: this.config.rpc,
      })

      await this.api.isReady

      // Initialize keyring
      this.keyring = new Keyring({ type: 'sr25519', ss58Format: 42 })

      // Listen to connected/disconnected events
      this.api.on('connected', () => {
        console.log('Connected to chain')
        this.emit('connected')
      })

      this.api.on('disconnected', () => {
        console.log('Disconnected from chain')
        this.emit('disconnected')
      })

      this.api.on('ready', () => {
        console.log('API ready')
        this.emit('ready')
      })

      this.api.on('error', (error: Error) => {
        console.error('API error:', error)
        this.emit('error', error)
      })

      console.log('Chain client connected successfully')
      this.emit('connected')
    } catch (error) {
      console.error('Failed to connect to chain:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect()
      this.api = null
      this.wsProvider = null
      this.keyring = null
      this.emit('disconnected')
    }
  }

  isConnected(): boolean {
    return this.api !== null && this.api.isConnected
  }

  // Chain information
  async getChainInfo(): Promise<any> {
    if (!this.api) throw new Error('API not connected')
    
    const [chain, nodeName, nodeVersion, chainType] = await Promise.all([
      this.api.rpc.system.chain(),
      this.api.rpc.system.name(),
      this.api.rpc.system.version(),
      this.api.rpc.system.chainType ? this.api.rpc.system.chainType() : Promise.resolve(null),
    ])

    return {
      chain: chain.toString(),
      nodeName: nodeName.toString(),
      nodeVersion: nodeVersion.toString(),
      chainType: chainType ? chainType.toString() : 'Development',
    }
  }

  async getBlock(hash?: string): Promise<any> {
    if (!this.api) throw new Error('API not connected')
    
    const signedBlock = hash
      ? await this.api.rpc.chain.getBlock(hash)
      : await this.api.rpc.chain.getBlock()
      
    return signedBlock.toJSON()
  }

  async getBlockNumber(): Promise<number> {
    if (!this.api) throw new Error('API not connected')
    
    const blockNumber = await this.api.query.system.number()
    return blockNumber.toNumber()
  }

  async getBlockHash(blockNumber?: number): Promise<string> {
    if (!this.api) throw new Error('API not connected')
    
    const blockHash = blockNumber !== undefined
      ? await this.api.rpc.chain.getBlockHash(blockNumber)
      : await this.api.rpc.chain.getBlockHash()
      
    return blockHash.toString()
  }

  // Event subscriptions
  subscribeNewHeads(callback: (header: any) => void): () => void {
    if (!this.api) throw new Error('API not connected')
    
    let unsubscribe: (() => void) | null = null
    
    this.api.rpc.chain.subscribeNewHeads((header) => {
      callback(header.toJSON())
    }).then(unsub => {
      unsubscribe = unsub
    })
    
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }

  subscribeEvents(callback: (events: any[]) => void): () => void {
    if (!this.api) throw new Error('API not connected')
    
    let unsubscribe: (() => void) | null = null
    
    this.api.query.system.events((events: any) => {
      const decoded = events.map((record: any) => {
        const { event, phase } = record
        const types = event.typeDef

        return {
          phase: phase.toString(),
          section: event.section,
          method: event.method,
          data: event.data.toString(),
          documentation: event.meta.docs.map((d: any) => d.toString()),
        }
      })
      
      callback(decoded)
    }).then(unsub => {
      unsubscribe = unsub
    })
    
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }

  // Keyring management
  addAccountFromSeed(seed: string, meta: Record<string, any> = {}): KeyringPair {
    if (!this.keyring) throw new Error('Keyring not initialized')
    return this.keyring.addFromUri(seed, meta)
  }

  addAccountFromJson(json: KeyringPair$Json, password?: string): KeyringPair {
    if (!this.keyring) throw new Error('Keyring not initialized')
    const pair = this.keyring.addFromJson(json)
    if (password) {
      pair.unlock(password)
    }
    return pair
  }

  getAccounts(): KeyringPair[] {
    if (!this.keyring) throw new Error('Keyring not initialized')
    return this.keyring.getPairs()
  }

  // Balance queries
  async getBalance(address: string): Promise<AccountBalance> {
    if (!this.api) throw new Error('API not connected')
    
    const account = await this.api.query.system.account(address)
    const data = account as any
    return {
      free: new BN(data.data.free.toString()),
      reserved: new BN(data.data.reserved.toString()),
      frozen: new BN(data.data.frozen?.toString() || '0')
    }
  }

  async getLivoBalance(address: string): Promise<BN> {
    if (!this.api) throw new Error('API not connected')
    
    // Query LIVO balance from cashback pallet
    const balance = await (this.api.query as any).cashback?.balances(address)
    return new BN(balance?.toString() || '0')
  }

  // Transfers
  async transfer(options: TransferOptions): Promise<string> {
    if (!this.api) throw new Error('API not connected')

    const { from, to, amount, token = 'BZR' } = options
    const amountBN = typeof amount === 'string' ? new BN(amount) : amount

    return new Promise((resolve, reject) => {
      let unsub: (() => void) | null = null
      let tx: SubmittableExtrinsic<'promise'>

      if (token === 'BZR') {
        tx = this.api!.tx.balances.transferKeepAlive(to, amountBN)
      } else if (token === 'LIVO') {
        tx = (this.api!.tx as any).cashback?.transfer(to, amountBN)
        if (!tx) {
          reject(new Error('LIVO transfer not available'))
          return
        }
      } else {
        reject(new Error(`Unsupported token: ${token}`))
        return
      }

      tx.signAndSend(from, { nonce: -1 }, (result: ISubmittableResult) => {
        const { status, dispatchError } = result
        
        if (status.isInBlock) {
          console.log(`Transaction included in block ${status.asInBlock}`)
        }

        if (status.isFinalized) {
          console.log(`Transaction finalized in block ${status.asFinalized}`)
          
          if (dispatchError) {
            let errorMessage = 'Transaction failed'
            
            if (dispatchError.isModule) {
              const decoded = this.api!.registry.findMetaError(dispatchError.asModule)
              errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs.join(' ')}`
            } else {
              errorMessage = dispatchError.toString()
            }
            
            reject(new Error(errorMessage))
          } else {
            resolve(status.asFinalized.toString())
          }

          if (unsub) unsub()
        }
      }).then(unsubscribe => {
        unsub = unsubscribe
      }).catch(reject)
    })
  }

  // DAO operations
  async createDao(
    creator: KeyringPair,
    name: string,
    description: string,
    ipfsHash: string
  ): Promise<string> {
    if (!this.api) throw new Error('API not connected')

    return new Promise((resolve, reject) => {
      let unsub: (() => void) | null = null

      const tx = (this.api!.tx as any).daoRegistry?.createDao(name, description, ipfsHash)
      if (!tx) {
        reject(new Error('DAO registry not available'))
        return
      }

      tx.signAndSend(creator, { nonce: -1 }, (result: ISubmittableResult) => {
        const { status, dispatchError } = result

        if (status.isFinalized) {
          if (dispatchError) {
            let errorMessage = 'Failed to create DAO'
            if (dispatchError.isModule) {
              const decoded = this.api!.registry.findMetaError(dispatchError.asModule)
              errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs.join(' ')}`
            }
            reject(new Error(errorMessage))
          } else {
            resolve(status.asFinalized.toString())
          }
          if (unsub) unsub()
        }
      }).then(unsubscribe => {
        unsub = unsubscribe
      }).catch(reject)
    })
  }

  // Marketplace operations
  async createListing(
    seller: KeyringPair,
    daoId: string,
    title: string,
    description: string,
    price: string | BN,
    category: string,
    ipfsHash: string
  ): Promise<string> {
    if (!this.api) throw new Error('API not connected')

    const priceBN = typeof price === 'string' ? new BN(price) : price

    return new Promise((resolve, reject) => {
      let unsub: (() => void) | null = null

      const tx = (this.api!.tx as any).marketplace?.createListing(
        daoId,
        title,
        description,
        priceBN,
        category,
        ipfsHash
      )

      if (!tx) {
        reject(new Error('Marketplace not available'))
        return
      }

      tx.signAndSend(seller, { nonce: -1 }, (result: ISubmittableResult) => {
        const { status, dispatchError } = result

        if (status.isFinalized) {
          if (dispatchError) {
            let errorMessage = 'Failed to create listing'
            if (dispatchError.isModule) {
              const decoded = this.api!.registry.findMetaError(dispatchError.asModule)
              errorMessage = `${decoded.section}.${decoded.name}`
            }
            reject(new Error(errorMessage))
          } else {
            resolve(status.asFinalized.toString())
          }
          if (unsub) unsub()
        }
      }).then(unsubscribe => {
        unsub = unsubscribe
      }).catch(reject)
    })
  }

  // Utility functions
  formatBalance(balance: BN, decimals: number = 12): string {
    const divisor = new BN(10).pow(new BN(decimals))
    const beforeDecimal = balance.div(divisor).toString()
    const afterDecimal = balance.mod(divisor).toString().padStart(decimals, '0')
    
    // Remove trailing zeros
    const trimmed = afterDecimal.replace(/0+$/, '')
    
    if (trimmed.length === 0) {
      return beforeDecimal
    }
    
    return `${beforeDecimal}.${trimmed}`
  }

  parseAmount(amount: string, decimals: number = 12): BN {
    const parts = amount.split('.')
    const wholePart = parts[0] || '0'
    const decimalPart = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals)
    
    const wholeValue = new BN(wholePart).mul(new BN(10).pow(new BN(decimals)))
    const decimalValue = new BN(decimalPart)
    
    return wholeValue.add(decimalValue)
  }
}

// Export utilities
export { BN } from 'bn.js'
export { mnemonicGenerate, mnemonicValidate } from '@polkadot/util-crypto'

// Default export
export default ChainClient