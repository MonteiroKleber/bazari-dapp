import { ApiPromise, WsProvider } from '@polkadot/api'
import { Keyring } from '@polkadot/keyring'
import { KeyringPair } from '@polkadot/keyring/types'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { EventEmitter } from 'eventemitter3'
import type { 
  SubmittableExtrinsic,
  AugmentedEvent
} from '@polkadot/api/types'
import { BN } from '@polkadot/util'

export interface ChainConfig {
  endpoint: string
  types?: Record<string, any>
  rpc?: Record<string, any>
}

export interface TransferOptions {
  from: KeyringPair
  to: string
  amount: string | BN
  token?: 'BZR' | 'LIVO'
}

export interface AccountBalance {
  free: BN
  reserved: BN
  frozen: BN
  flags: BN
}

export interface ChainEvents {
  connected: []
  disconnected: []
  ready: []
  error: [Error]
  block: [number]
  transfer: [{ from: string; to: string; amount: string; token: string }]
  balanceUpdate: [{ address: string; balance: AccountBalance }]
}

export class BazariChainClient extends EventEmitter<ChainEvents> {
  private api: ApiPromise | null = null
  private wsProvider: WsProvider | null = null
  private keyring: Keyring | null = null
  private config: ChainConfig
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor(config: ChainConfig) {
    super()
    this.config = config
  }

  async connect(): Promise<void> {
    try {
      // Wait for crypto to be ready
      await cryptoWaitReady()

      // Initialize keyring
      this.keyring = new Keyring({ type: 'sr25519', ss58Format: 42 })

      // Create WebSocket provider
      this.wsProvider = new WsProvider(this.config.endpoint)

      // Custom types for BazariChain
      const types = {
        Address: 'MultiAddress',
        LookupSource: 'MultiAddress',
        Balance: 'u128',
        DaoId: 'u32',
        ProposalId: 'u32',
        ProductId: 'u64',
        OrderId: 'u64',
        ...this.config.types
      }

      // Custom RPC methods
      const rpc = {
        dao: {
          getDao: {
            description: 'Get DAO by ID',
            params: [
              {
                name: 'daoId',
                type: 'DaoId'
              }
            ],
            type: 'Option<DaoInfo>'
          },
          listDaos: {
            description: 'List all DAOs',
            params: [],
            type: 'Vec<DaoInfo>'
          }
        },
        marketplace: {
          getProduct: {
            description: 'Get product by ID',
            params: [
              {
                name: 'productId',
                type: 'ProductId'
              }
            ],
            type: 'Option<Product>'
          },
          getOrder: {
            description: 'Get order by ID',
            params: [
              {
                name: 'orderId',
                type: 'OrderId'
              }
            ],
            type: 'Option<Order>'
          }
        },
        ...this.config.rpc
      }

      // Create API instance
      this.api = await ApiPromise.create({
        provider: this.wsProvider,
        types,
        rpc
      })

      // Wait for chain to be ready
      await this.api.isReady

      this.isConnected = true
      this.reconnectAttempts = 0

      // Subscribe to new blocks
      this.subscribeToBlocks()

      // Setup event listeners
      this.setupEventListeners()

      this.emit('connected')
      this.emit('ready')
    } catch (error) {
      this.emit('error', error as Error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect()
      this.api = null
    }
    if (this.wsProvider) {
      this.wsProvider.disconnect()
      this.wsProvider = null
    }
    this.isConnected = false
    this.emit('disconnected')
  }

  private async reconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('error', new Error('Max reconnection attempts reached'))
      return
    }

    this.reconnectAttempts++
    console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)

    await new Promise(resolve => setTimeout(resolve, 2000 * this.reconnectAttempts))
    
    try {
      await this.connect()
    } catch (error) {
      console.error('Reconnection failed:', error)
      await this.reconnect()
    }
  }

  private subscribeToBlocks(): void {
    if (!this.api) return

    this.api.rpc.chain.subscribeNewHeads((header) => {
      this.emit('block', header.number.toNumber())
    }).catch(error => {
      console.error('Block subscription error:', error)
      this.emit('error', error)
    })
  }

  private setupEventListeners(): void {
    if (!this.api) return

    // Listen for system events
    this.api.query.system.events((events) => {
      events.forEach((record) => {
        const { event } = record
        
        // Handle transfer events
        if (event.section === 'balances' && event.method === 'Transfer') {
          const [from, to, amount] = event.data
          this.emit('transfer', {
            from: from.toString(),
            to: to.toString(),
            amount: amount.toString(),
            token: 'BZR'
          })
        }

        // Handle LIVO transfer events (cashback token)
        if (event.section === 'cashback' && event.method === 'Rewarded') {
          const [to, amount] = event.data
          this.emit('transfer', {
            from: 'system',
            to: to.toString(),
            amount: amount.toString(),
            token: 'LIVO'
          })
        }
      })
    }).catch(error => {
      console.error('Event subscription error:', error)
      this.emit('error', error)
    })
  }

  // Account management
  addAccount(seed: string, meta?: Record<string, any>): KeyringPair {
    if (!this.keyring) throw new Error('Keyring not initialized')
    return this.keyring.addFromUri(seed, meta)
  }

  addAccountFromJson(json: any, password?: string): KeyringPair {
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
    return account.data as any
  }

  async getLivoBalance(address: string): Promise<BN> {
    if (!this.api) throw new Error('API not connected')
    
    // Query LIVO balance from cashback pallet
    const balance = await (this.api.query as any).cashback.balances(address)
    return new BN(balance.toString())
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
        tx = (this.api!.tx as any).cashback.transfer(to, amountBN)
      } else {
        reject(new Error(`Unsupported token: ${token}`))
        return
      }

      tx.signAndSend(from, { nonce: -1 }, ({ status, events, dispatchError }) => {
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
    metadata: string
  ): Promise<string> {
    if (!this.api) throw new Error('API not connected')

    return new Promise((resolve, reject) => {
      let unsub: (() => void) | null = null

      const tx = (this.api!.tx as any).daoRegistry.createDao(name, description, metadata)

      tx.signAndSend(creator, { nonce: -1 }, ({ status, dispatchError }) => {
        if (status.isFinalized) {
          if (dispatchError) {
            reject(new Error('Failed to create DAO'))
          } else {
            resolve(status.asFinalized.toString())
          }
          if (unsub) unsub()
        }
      }).then((unsubscribe: () => void) => {
        unsub = unsubscribe
      }).catch(reject)
    })
  }

  // Marketplace operations
  async createProduct(
    seller: KeyringPair,
    daoId: number,
    title: string,
    priceBzr: string,
    metadataCid: string
  ): Promise<string> {
    if (!this.api) throw new Error('API not connected')

    return new Promise((resolve, reject) => {
      let unsub: (() => void) | null = null

      const tx = (this.api!.tx as any).marketplace.createProduct(
        daoId,
        title,
        priceBzr,
        metadataCid
      )

      tx.signAndSend(seller, { nonce: -1 }, ({ status, dispatchError }) => {
        if (status.isFinalized) {
          if (dispatchError) {
            reject(new Error('Failed to create product'))
          } else {
            resolve(status.asFinalized.toString())
          }
          if (unsub) unsub()
        }
      }).then((unsubscribe: () => void) => {
        unsub = unsubscribe
      }).catch(reject)
    })
  }

  async createOrder(
    buyer: KeyringPair,
    productId: number,
    quantity: number
  ): Promise<string> {
    if (!this.api) throw new Error('API not connected')

    return new Promise((resolve, reject) => {
      let unsub: (() => void) | null = null

      const tx = (this.api!.tx as any).marketplace.createOrder(productId, quantity)

      tx.signAndSend(buyer, { nonce: -1 }, ({ status, dispatchError }) => {
        if (status.isFinalized) {
          if (dispatchError) {
            reject(new Error('Failed to create order'))
          } else {
            resolve(status.asFinalized.toString())
          }
          if (unsub) unsub()
        }
      }).then((unsubscribe: () => void) => {
        unsub = unsubscribe
      }).catch(reject)
    })
  }

  // Utility methods
  formatBalance(balance: BN, decimals: number = 12): string {
    const divisor = new BN(10).pow(new BN(decimals))
    const beforeDecimal = balance.div(divisor).toString()
    const afterDecimal = balance.mod(divisor).toString().padStart(decimals, '0')
    
    // Remove trailing zeros
    const trimmedAfterDecimal = afterDecimal.replace(/0+$/, '')
    
    if (trimmedAfterDecimal.length === 0) {
      return beforeDecimal
    }
    
    return `${beforeDecimal}.${trimmedAfterDecimal}`
  }

  parseBalance(amount: string, decimals: number = 12): BN {
    const [whole, fraction = ''] = amount.split('.')
    const fractionPadded = fraction.padEnd(decimals, '0').slice(0, decimals)
    const combined = whole + fractionPadded
    return new BN(combined)
  }

  // Development utilities
  async fundAccount(address: string, amount: string = '1000000000000000'): Promise<void> {
    if (!this.api) throw new Error('API not connected')
    
    // In development, use Alice to fund accounts
    const alice = this.keyring!.addFromUri('//Alice')
    await this.transfer({
      from: alice,
      to: address,
      amount: new BN(amount)
    })
  }

  // Getters
  get isReady(): boolean {
    return this.isConnected && this.api !== null
  }

  get chainApi(): ApiPromise | null {
    return this.api
  }

  get genesisHash(): string {
    if (!this.api) throw new Error('API not connected')
    return this.api.genesisHash.toString()
  }

  get chainName(): string {
    if (!this.api) throw new Error('API not connected')
    return this.api.runtimeChain.toString()
  }

  get chainVersion(): string {
    if (!this.api) throw new Error('API not connected')
    return this.api.runtimeVersion.toString()
  }
}

// Export types and utilities
export { Keyring, KeyringPair } from '@polkadot/keyring'
export type { KeypairType, KeyringOptions } from '@polkadot/keyring/types'
export { cryptoWaitReady, mnemonicGenerate, mnemonicValidate } from '@polkadot/util-crypto'
export { BN } from '@polkadot/util'

// Default instance for development
let defaultClient: BazariChainClient | null = null

export function getChainClient(endpoint?: string): BazariChainClient {
  if (!defaultClient) {
    defaultClient = new BazariChainClient({
      endpoint: endpoint || process.env.CHAIN_ENDPOINT || 'ws://localhost:9944'
    })
  }
  return defaultClient
}

export default BazariChainClient