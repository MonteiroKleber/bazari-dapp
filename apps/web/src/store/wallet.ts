// apps/web/src/store/wallet.ts
// Store de wallet com segurança completa para produção

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Keyring } from '@polkadot/keyring'
import { 
  mnemonicGenerate, 
  cryptoWaitReady, 
  randomAsU8a,
  signatureVerify
} from '@polkadot/util-crypto'
import { 
  stringToU8a, 
  u8aToHex, 
  hexToU8a, 
  u8aToString 
} from '@polkadot/util'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'

// ==================== SECURITY MANAGER ====================

class SecurityManager {
  private static keyring: Keyring | null = null
  private static currentPair: KeyringPair | null = null
  
  /**
   * Initialize keyring (only once)
   */
  static async initializeKeyring(): Promise<void> {
    if (!this.keyring) {
      await cryptoWaitReady()
      this.keyring = new Keyring({ type: 'sr25519', ss58Format: 42 })
    }
  }
  
  /**
   * Derive encryption key from password using Web Crypto API
   */
  private static async deriveKey(
    password: string, 
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(password)
    
    // Import password
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    )
    
    // Derive key
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }
  
  /**
   * Encrypt data using AES-GCM
   */
  static async encrypt(
    data: string, 
    password: string
  ): Promise<{
    encrypted: string
    salt: string
    iv: string
  }> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))
    
    // Derive key
    const key = await this.deriveKey(password, salt)
    
    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    )
    
    return {
      encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      salt: btoa(String.fromCharCode(...salt)),
      iv: btoa(String.fromCharCode(...iv))
    }
  }
  
  /**
   * Decrypt data using AES-GCM
   */
  static async decrypt(
    encryptedData: string,
    password: string,
    salt: string,
    iv: string
  ): Promise<string> {
    // Convert from base64
    const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
    const saltBuffer = Uint8Array.from(atob(salt), c => c.charCodeAt(0))
    const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0))
    
    // Derive key
    const key = await this.deriveKey(password, saltBuffer)
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuffer },
      key,
      encryptedBuffer
    )
    
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  }
  
  /**
   * Create new account with mnemonic
   */
  static async createAccount(password: string): Promise<{
    mnemonic: string
    address: string
    encryptedSeed: string
    salt: string
    iv: string
  }> {
    await this.initializeKeyring()
    
    const mnemonic = mnemonicGenerate(12)
    const pair = this.keyring!.addFromUri(mnemonic)
    
    // Encrypt mnemonic
    const encrypted = await this.encrypt(mnemonic, password)
    
    // Store current pair (in memory only)
    this.currentPair = pair
    
    return {
      mnemonic,
      address: pair.address,
      encryptedSeed: encrypted.encrypted,
      salt: encrypted.salt,
      iv: encrypted.iv
    }
  }
  
  /**
   * Import existing account
   */
  static async importAccount(
    mnemonic: string, 
    password: string
  ): Promise<{
    address: string
    encryptedSeed: string
    salt: string
    iv: string
  }> {
    await this.initializeKeyring()
    
    const pair = this.keyring!.addFromUri(mnemonic)
    
    // Encrypt mnemonic
    const encrypted = await this.encrypt(mnemonic, password)
    
    // Store current pair (in memory only)
    this.currentPair = pair
    
    return {
      address: pair.address,
      encryptedSeed: encrypted.encrypted,
      salt: encrypted.salt,
      iv: encrypted.iv
    }
  }
  
  /**
   * Unlock account with password
   */
  static async unlockAccount(
    encryptedSeed: string,
    password: string,
    salt: string,
    iv: string
  ): Promise<KeyringPair> {
    await this.initializeKeyring()
    
    // Decrypt seed
    const seed = await this.decrypt(encryptedSeed, password, salt, iv)
    
    // Create pair
    const pair = this.keyring!.addFromUri(seed)
    
    // Store current pair (in memory only)
    this.currentPair = pair
    
    return pair
  }
  
  /**
   * Sign message with current account
   */
  static async signMessage(message: string): Promise<string> {
    if (!this.currentPair) {
      throw new Error('No account unlocked')
    }
    
    const messageU8a = stringToU8a(message)
    const signature = this.currentPair.sign(messageU8a)
    
    return u8aToHex(signature)
  }
  
  /**
   * Sign transaction
   */
  static async signTransaction(transaction: any): Promise<any> {
    if (!this.currentPair) {
      throw new Error('No account unlocked')
    }
    
    return await transaction.signAndSend(this.currentPair)
  }
  
  /**
   * Lock account (clear from memory)
   */
  static lock(): void {
    this.currentPair = null
  }
  
  /**
   * Get current address
   */
  static getCurrentAddress(): string | null {
    return this.currentPair?.address || null
  }
  
  /**
   * Check if account is locked
   */
  static isLocked(): boolean {
    return this.currentPair === null
  }
}

// ==================== BLOCKCHAIN CONNECTION ====================

class BlockchainConnection {
  private static api: ApiPromise | null = null
  private static reconnectTimer: NodeJS.Timeout | null = null
  private static listeners: Set<(api: ApiPromise) => void> = new Set()
  
  /**
   * Connect to blockchain with auto-reconnect
   */
  static async connect(): Promise<ApiPromise> {
    if (this.api?.isConnected) {
      return this.api
    }
    
    const wsProvider = new WsProvider(
      import.meta.env.VITE_WS_PROVIDER || 'ws://127.0.0.1:9944'
    )
    
    // Setup auto-reconnect
    wsProvider.on('disconnected', () => {
      console.log('Blockchain disconnected, attempting reconnect...')
      this.scheduleReconnect()
    })
    
    wsProvider.on('connected', () => {
      console.log('Blockchain connected')
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }
    })
    
    wsProvider.on('error', (error) => {
      console.error('Blockchain connection error:', error)
      this.scheduleReconnect()
    })
    
    this.api = await ApiPromise.create({ provider: wsProvider })
    
    // Notify listeners
    this.listeners.forEach(listener => listener(this.api!))
    
    return this.api
  }
  
  /**
   * Schedule reconnection attempt
   */
  private static scheduleReconnect(): void {
    if (this.reconnectTimer) return
    
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null
      try {
        await this.connect()
      } catch (error) {
        console.error('Reconnection failed:', error)
        this.scheduleReconnect()
      }
    }, 5000) // Retry every 5 seconds
  }
  
  /**
   * Get current API instance
   */
  static getApi(): ApiPromise | null {
    return this.api
  }
  
  /**
   * Subscribe to connection changes
   */
  static onConnect(listener: (api: ApiPromise) => void): () => void {
    this.listeners.add(listener)
    
    // Call immediately if already connected
    if (this.api?.isConnected) {
      listener(this.api)
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }
  
  /**
   * Disconnect from blockchain
   */
  static async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    if (this.api) {
      await this.api.disconnect()
      this.api = null
    }
  }
}

// ==================== STORE TYPES ====================

interface Account {
  address: string
  name: string
  balanceBZR: string
  balanceLIVO: string
}

interface Transaction {
  hash: string
  from: string
  to: string
  amount: string
  token: 'BZR' | 'LIVO'
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
}

interface WalletState {
  // Account data
  isInitialized: boolean
  isLocked: boolean
  currentAddress: string | null
  accounts: Account[]
  
  // Encrypted data (stored)
  encryptedSeed: string | null
  salt: string | null
  iv: string | null
  
  // Blockchain
  isConnected: boolean
  chainInfo: any | null
  
  // Transactions
  transactions: Transaction[]
  
  // Actions
  createWallet: (password: string) => Promise<{ mnemonic: string; address: string }>
  importWallet: (mnemonic: string, password: string) => Promise<void>
  unlock: (password: string) => Promise<void>
  lock: () => void
  
  // Blockchain
  connectBlockchain: () => Promise<void>
  disconnectBlockchain: () => Promise<void>
  updateBalances: () => Promise<void>
  
  // Transactions
  sendTransaction: (to: string, amount: string, token: 'BZR' | 'LIVO') => Promise<string>
  
  // Signing
  signMessage: (message: string) => Promise<string>
  
  // Account management
  deriveAccount: (path: string, name: string) => Promise<void>
  setCurrentAccount: (address: string) => void
  
  // Clear all data
  reset: () => void
}

// ==================== WALLET STORE ====================

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      isInitialized: false,
      isLocked: true,
      currentAddress: null,
      accounts: [],
      encryptedSeed: null,
      salt: null,
      iv: null,
      isConnected: false,
      chainInfo: null,
      transactions: [],
      
      // Create new wallet
      createWallet: async (password: string) => {
        try {
          const result = await SecurityManager.createAccount(password)
          
          set({
            isInitialized: true,
            isLocked: false,
            currentAddress: result.address,
            accounts: [{
              address: result.address,
              name: 'Principal',
              balanceBZR: '0',
              balanceLIVO: '0'
            }],
            encryptedSeed: result.encryptedSeed,
            salt: result.salt,
            iv: result.iv
          })
          
          // Auto-connect to blockchain
          await get().connectBlockchain()
          
          return {
            mnemonic: result.mnemonic,
            address: result.address
          }
        } catch (error) {
          console.error('Failed to create wallet:', error)
          throw error
        }
      },
      
      // Import existing wallet
      importWallet: async (mnemonic: string, password: string) => {
        try {
          const result = await SecurityManager.importAccount(mnemonic, password)
          
          set({
            isInitialized: true,
            isLocked: false,
            currentAddress: result.address,
            accounts: [{
              address: result.address,
              name: 'Principal',
              balanceBZR: '0',
              balanceLIVO: '0'
            }],
            encryptedSeed: result.encryptedSeed,
            salt: result.salt,
            iv: result.iv
          })
          
          // Auto-connect to blockchain
          await get().connectBlockchain()
        } catch (error) {
          console.error('Failed to import wallet:', error)
          throw error
        }
      },
      
      // Unlock wallet
      unlock: async (password: string) => {
        const { encryptedSeed, salt, iv } = get()
        
        if (!encryptedSeed || !salt || !iv) {
          throw new Error('No wallet to unlock')
        }
        
        try {
          await SecurityManager.unlockAccount(encryptedSeed, password, salt, iv)
          
          set({ isLocked: false })
          
          // Auto-connect to blockchain
          await get().connectBlockchain()
        } catch (error) {
          console.error('Failed to unlock wallet:', error)
          throw new Error('Senha incorreta')
        }
      },
      
      // Lock wallet
      lock: () => {
        SecurityManager.lock()
        set({ isLocked: true })
      },
      
      // Connect to blockchain
      connectBlockchain: async () => {
        try {
          const api = await BlockchainConnection.connect()
          
          // Get chain info
          const [chain, nodeName, nodeVersion] = await Promise.all([
            api.rpc.system.chain(),
            api.rpc.system.name(),
            api.rpc.system.version()
          ])
          
          set({
            isConnected: true,
            chainInfo: {
              chain: chain.toString(),
              nodeName: nodeName.toString(),
              nodeVersion: nodeVersion.toString()
            }
          })
          
          // Subscribe to connection changes
          BlockchainConnection.onConnect(async () => {
            set({ isConnected: true })
            await get().updateBalances()
          })
          
          // Update balances
          await get().updateBalances()
        } catch (error) {
          console.error('Failed to connect to blockchain:', error)
          set({ isConnected: false })
          throw error
        }
      },
      
      // Disconnect from blockchain
      disconnectBlockchain: async () => {
        await BlockchainConnection.disconnect()
        set({ isConnected: false, chainInfo: null })
      },
      
      // Update balances
      updateBalances: async () => {
        const api = BlockchainConnection.getApi()
        if (!api) return
        
        const { accounts } = get()
        
        try {
          const updatedAccounts = await Promise.all(
            accounts.map(async (account) => {
              // Get BZR balance
              const { data: { free } } = await api.query.system.account(account.address) as any
              
              return {
                ...account,
                balanceBZR: free.toString(),
                balanceLIVO: '0' // TODO: Query LIVO balance from custom pallet
              }
            })
          )
          
          set({ accounts: updatedAccounts })
        } catch (error) {
          console.error('Failed to update balances:', error)
        }
      },
      
      // Send transaction
      sendTransaction: async (to: string, amount: string, token: 'BZR' | 'LIVO') => {
        const api = BlockchainConnection.getApi()
        if (!api) throw new Error('Not connected to blockchain')
        
        if (SecurityManager.isLocked()) {
          throw new Error('Wallet is locked')
        }
        
        try {
          const transfer = api.tx.balances.transfer(to, amount)
          
          // Add to pending transactions
          const pendingTx: Transaction = {
            hash: '',
            from: SecurityManager.getCurrentAddress()!,
            to,
            amount,
            token,
            status: 'pending',
            timestamp: Date.now()
          }
          
          set(state => ({
            transactions: [pendingTx, ...state.transactions]
          }))
          
          // Sign and send
          const hash = await SecurityManager.signTransaction(transfer)
          
          // Update transaction with hash
          set(state => ({
            transactions: state.transactions.map(tx =>
              tx.timestamp === pendingTx.timestamp
                ? { ...tx, hash: hash.toString(), status: 'confirmed' as const }
                : tx
            )
          }))
          
          // Update balances after transaction
          setTimeout(() => get().updateBalances(), 3000)
          
          return hash.toString()
        } catch (error) {
          // Mark transaction as failed
          set(state => ({
            transactions: state.transactions.map(tx =>
              tx.status === 'pending' && tx.from === SecurityManager.getCurrentAddress()
                ? { ...tx, status: 'failed' as const }
                : tx
            )
          }))
          
          throw error
        }
      },
      
      // Sign message
      signMessage: async (message: string) => {
        if (SecurityManager.isLocked()) {
          throw new Error('Wallet is locked')
        }
        
        return await SecurityManager.signMessage(message)
      },
      
      // Derive new account
      deriveAccount: async (path: string, name: string) => {
        // This would derive a new account from the seed
        // Implementation depends on your derivation strategy
        console.log('Deriving account:', path, name)
      },
      
      // Set current account
      setCurrentAccount: (address: string) => {
        set({ currentAddress: address })
      },
      
      // Reset everything
      reset: () => {
        SecurityManager.lock()
        BlockchainConnection.disconnect()
        
        set({
          isInitialized: false,
          isLocked: true,
          currentAddress: null,
          accounts: [],
          encryptedSeed: null,
          salt: null,
          iv: null,
          isConnected: false,
          chainInfo: null,
          transactions: []
        })
      }
    }),
    {
      name: 'bazari-wallet',
      partialize: (state) => ({
        isInitialized: state.isInitialized,
        encryptedSeed: state.encryptedSeed,
        salt: state.salt,
        iv: state.iv,
        accounts: state.accounts.map(acc => ({
          address: acc.address,
          name: acc.name
        }))
      })
    }
  )
)