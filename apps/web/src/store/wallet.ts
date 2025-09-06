// apps/web/src/store/wallet.ts
// Wallet Store com Zero-Knowledge e Segurança Aprimorada
// ✅ PBKDF2 com 310.000 iterações
// ✅ Auto-lock por inatividade
// ✅ Seed NUNCA sai do dispositivo
// ✅ CORREÇÃO: Persist configurado corretamente

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Keyring } from '@polkadot/keyring'
import { 
  mnemonicGenerate, 
  cryptoWaitReady, 
  randomAsU8a,
  signatureVerify,
  mnemonicValidate
} from '@polkadot/util-crypto'
import { 
  stringToU8a, 
  u8aToHex, 
  hexToU8a, 
  u8aToString 
} from '@polkadot/util'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'

// ==================== SECURITY CONSTANTS ====================
const PBKDF2_ITERATIONS = 310000 // 3x stronger than before
const AUTO_LOCK_MS = 5 * 60 * 1000 // 5 minutes
const SESSION_CHECK_INTERVAL = 30 * 1000 // 30 seconds

// ==================== ENHANCED SECURITY MANAGER ====================
class SecurityManager {
  private static keyring: Keyring | null = null
  private static currentPair: KeyringPair | null = null
  private static autoLockTimer: NodeJS.Timeout | null = null
  
  /**
   * Initialize keyring (only once)
   */
  static async initializeKeyring(): Promise<void> {
    if (!this.keyring) {
      await cryptoWaitReady()
      this.keyring = new Keyring({ type: 'sr25519', ss58Format: 42 })
      console.log('✅ Keyring initialized with sr25519')
    }
  }
  
  /**
   * Derive encryption key from password using Web Crypto API
   * Now with 310,000 iterations for enhanced security
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
    
    // Derive key with enhanced iterations
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: PBKDF2_ITERATIONS, // 310,000 iterations
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }
  
  /**
   * Encrypt seed with AES-GCM
   */
  private static async encryptSeed(
    seed: string, 
    password: string
  ): Promise<{ encryptedSeed: string; salt: string; iv: string }> {
    const encoder = new TextEncoder()
    const seedData = encoder.encode(seed)
    
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(32))
    const iv = crypto.getRandomValues(new Uint8Array(12))
    
    // Derive key
    const key = await this.deriveKey(password, salt)
    
    // Encrypt
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      seedData
    )
    
    return {
      encryptedSeed: u8aToHex(new Uint8Array(encryptedBuffer)),
      salt: u8aToHex(salt),
      iv: u8aToHex(iv)
    }
  }
  
  /**
   * Decrypt seed with AES-GCM
   */
  private static async decryptSeed(
    encryptedSeed: string,
    password: string,
    salt: string,
    iv: string
  ): Promise<string> {
    try {
      const encryptedBuffer = hexToU8a(encryptedSeed)
      const saltBuffer = hexToU8a(salt)
      const ivBuffer = hexToU8a(iv)
      
      // Derive key
      const key = await this.deriveKey(password, saltBuffer)
      
      // Decrypt
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuffer },
        key,
        encryptedBuffer
      )
      
      const decoder = new TextDecoder()
      return decoder.decode(decryptedBuffer)
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt wallet. Incorrect password.')
    }
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
    
    // Generate new mnemonic
    const mnemonic = mnemonicGenerate(12)
    console.log('🔑 Generated new 12-word mnemonic')
    
    // Create keypair
    const pair = this.keyring!.addFromMnemonic(mnemonic)
    this.currentPair = pair
    
    // Encrypt mnemonic
    const encrypted = await this.encryptSeed(mnemonic, password)
    
    console.log('✅ Account created and encrypted:', pair.address)
    
    return {
      mnemonic,
      address: pair.address,
      ...encrypted
    }
  }
  
  /**
   * Import existing account from mnemonic
   */
  static async importAccount(mnemonic: string, password: string): Promise<{
    address: string
    encryptedSeed: string
    salt: string
    iv: string
  }> {
    await this.initializeKeyring()
    
    // Validate mnemonic
    if (!mnemonicValidate(mnemonic)) {
      throw new Error('Invalid mnemonic phrase')
    }
    
    // Create keypair
    const pair = this.keyring!.addFromMnemonic(mnemonic)
    this.currentPair = pair
    
    // Encrypt mnemonic
    const encrypted = await this.encryptSeed(mnemonic, password)
    
    console.log('✅ Account imported and encrypted:', pair.address)
    
    return {
      address: pair.address,
      ...encrypted
    }
  }
  
  /**
   * Unlock existing account
   * CORREÇÃO: Melhor validação e mensagens de erro
   */
  static async unlockAccount(
    password: string,
    encryptedSeed: string | null,
    salt: string | null,
    iv: string | null
  ): Promise<{ address: string }> {
    // Validar dados primeiro
    if (!encryptedSeed || !salt || !iv) {
      throw new Error('Wallet data not found. Please import your wallet or create a new one.')
    }
    
    await this.initializeKeyring()
    
    try {
      // Decrypt mnemonic
      const mnemonic = await this.decryptSeed(encryptedSeed, password, salt, iv)
      
      // Validate decrypted mnemonic
      if (!mnemonicValidate(mnemonic)) {
        throw new Error('Decrypted data is not a valid mnemonic')
      }
      
      // Restore keypair
      const pair = this.keyring!.addFromMnemonic(mnemonic)
      this.currentPair = pair
      
      console.log('🔓 Account unlocked:', pair.address)
      
      return { address: pair.address }
    } catch (error: any) {
      // Melhor tratamento de erros
      if (error.message.includes('decrypt') || error.message.includes('Incorrect password')) {
        throw new Error('Incorrect password')
      }
      throw error
    }
  }
  
  /**
   * Sign message with current account
   */
  static signMessage(message: string): string {
    if (!this.currentPair) {
      throw new Error('No account unlocked')
    }
    
    const messageU8a = stringToU8a(message)
    const signature = this.currentPair.sign(messageU8a)
    
    return u8aToHex(signature)
  }
  
  /**
   * Lock wallet and clear sensitive data
   */
  static lock(): void {
    // Clear keypair from memory
    if (this.currentPair) {
      // Attempt to clear sensitive data
      this.currentPair = null
    }
    
    // Clear auto-lock timer
    if (this.autoLockTimer) {
      clearTimeout(this.autoLockTimer)
      this.autoLockTimer = null
    }
    
    console.log('🔒 Wallet locked and memory cleared')
  }
  
  /**
   * Start auto-lock timer
   */
  static startAutoLockTimer(callback: () => void): void {
    // Clear existing timer
    if (this.autoLockTimer) {
      clearTimeout(this.autoLockTimer)
    }
    
    // Set new timer
    this.autoLockTimer = setTimeout(() => {
      console.log('⏰ Auto-locking wallet due to inactivity')
      callback()
    }, AUTO_LOCK_MS)
  }
  
  /**
   * Reset auto-lock timer on activity
   */
  static resetAutoLockTimer(callback: () => void): void {
    this.startAutoLockTimer(callback)
  }
}

// ==================== WALLET STORE ====================
interface Account {
  address: string
  name: string
}

interface WalletState {
  // Wallet state
  isInitialized: boolean
  isLocked: boolean
  
  // Accounts
  accounts: Account[]
  activeAccount: Account | null
  
  // Encrypted data (stored locally)
  encryptedSeed: string | null
  salt: string | null
  iv: string | null
  
  // Balances
  balances: Record<string, any> | null
  
  // Connection
  api: ApiPromise | null
  isConnected: boolean
  
  // Auto-lock
  lastActivityAt: number
  autoLockEnabled: boolean
  
  // Actions
  createWallet: (password: string) => Promise<{ mnemonic: string; address: string }>
  importWallet: (mnemonic: string, password: string) => Promise<{ address: string }>
  unlock: (password: string) => Promise<void>
  lock: () => void
  signMessage: (message: string) => Promise<string>
  connectBlockchain: () => Promise<void>
  fetchBalances: () => Promise<void>
  resetActivity: () => void
  clearWallet: () => void
}

// CORREÇÃO PRINCIPAL: Persist configurado corretamente
export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      isInitialized: false,
      isLocked: true,
      accounts: [],
      activeAccount: null,
      encryptedSeed: null,
      salt: null,
      iv: null,
      balances: null,
      api: null,
      isConnected: false,
      lastActivityAt: Date.now(),
      autoLockEnabled: true,
      
      // Create new wallet
      createWallet: async (password: string) => {
        const state = get()
        
        if (state.isInitialized) {
          throw new Error('Wallet already initialized')
        }
        
        const result = await SecurityManager.createAccount(password)
        
        const account: Account = {
          address: result.address,
          name: 'Account 1'
        }
        
        set({
          isInitialized: true,
          isLocked: false,
          accounts: [account],
          activeAccount: account,
          encryptedSeed: result.encryptedSeed,
          salt: result.salt,
          iv: result.iv,
          lastActivityAt: Date.now()
        })
        
        // Start auto-lock timer
        if (get().autoLockEnabled) {
          SecurityManager.startAutoLockTimer(() => {
            get().lock()
          })
        }
        
        // Connect to blockchain
        await get().connectBlockchain()
        
        return {
          mnemonic: result.mnemonic,
          address: result.address
        }
      },
      
      // Import existing wallet
      importWallet: async (mnemonic: string, password: string) => {
        const result = await SecurityManager.importAccount(mnemonic, password)
        
        const account: Account = {
          address: result.address,
          name: 'Imported Account'
        }
        
        set({
          isInitialized: true,
          isLocked: false,
          accounts: [account],
          activeAccount: account,
          encryptedSeed: result.encryptedSeed,
          salt: result.salt,
          iv: result.iv,
          lastActivityAt: Date.now()
        })
        
        // Start auto-lock timer
        if (get().autoLockEnabled) {
          SecurityManager.startAutoLockTimer(() => {
            get().lock()
          })
        }
        
        // Connect to blockchain
        await get().connectBlockchain()
        
        return { address: result.address }
      },
      
      // Unlock wallet - CORRIGIDO com validação
      unlock: async (password: string) => {
        const state = get()
        
        if (!state.isInitialized) {
          throw new Error('No wallet found. Please create or import a wallet first.')
        }
        
        if (!state.isLocked) {
          console.log('Wallet already unlocked')
          return
        }
        
        // Validar dados antes de tentar descriptografar
        if (!state.encryptedSeed || !state.salt || !state.iv) {
          console.error('Missing wallet data:', {
            hasEncryptedSeed: !!state.encryptedSeed,
            hasSalt: !!state.salt,
            hasIv: !!state.iv
          })
          throw new Error('Wallet data corrupted. Please import your wallet again using your seed phrase.')
        }
        
        try {
          const result = await SecurityManager.unlockAccount(
            password,
            state.encryptedSeed,
            state.salt,
            state.iv
          )
          
          // Find matching account
          const account = state.accounts.find(acc => acc.address === result.address)
          
          if (!account) {
            throw new Error('Account mismatch after unlock')
          }
          
          set({
            isLocked: false,
            activeAccount: account,
            lastActivityAt: Date.now()
          })
          
          // Start auto-lock timer
          if (get().autoLockEnabled) {
            SecurityManager.startAutoLockTimer(() => {
              get().lock()
            })
          }
          
          // Connect to blockchain
          await get().connectBlockchain()
          
          console.log('✅ Wallet unlocked successfully')
        } catch (error: any) {
          console.error('Unlock failed:', error)
          throw error
        }
      },
      
      // Lock wallet - CORRIGIDO para manter dados criptografados
      lock: () => {
        SecurityManager.lock()
        
        // IMPORTANTE: Mantém os dados criptografados!
        set((state) => ({
          ...state,
          isLocked: true,
          activeAccount: null,
          balances: null,
          api: null,
          isConnected: false
          // Mantém: isInitialized, accounts, encryptedSeed, salt, iv
        }))
        
        console.log('🔒 Wallet locked')
      },
      
      // Sign message
      signMessage: async (message: string) => {
        const state = get()
        
        if (state.isLocked) {
          throw new Error('Wallet is locked')
        }
        
        if (!state.activeAccount) {
          throw new Error('No active account')
        }
        
        // Reset activity timer
        if (state.autoLockEnabled) {
          SecurityManager.resetAutoLockTimer(() => {
            get().lock()
          })
        }
        
        return SecurityManager.signMessage(message)
      },
      
      // Connect to blockchain
      connectBlockchain: async () => {
        const state = get()
        
        if (state.api && state.isConnected) {
          console.log('Already connected to blockchain')
          return
        }
        
        try {
          const wsProvider = new WsProvider(
            import.meta.env.VITE_BLOCKCHAIN_WS || 'ws://localhost:9944'
          )
          
          const api = await ApiPromise.create({ provider: wsProvider })
          await api.isReady
          
          set({
            api,
            isConnected: true
          })
          
          console.log('✅ Connected to blockchain')
          
          // Fetch initial balances
          await get().fetchBalances()
        } catch (error) {
          console.error('Failed to connect to blockchain:', error)
          set({
            api: null,
            isConnected: false
          })
        }
      },
      
      // Fetch balances
      fetchBalances: async () => {
        const state = get()
        
        if (!state.api || !state.isConnected || !state.activeAccount) {
          return
        }
        
        try {
          const { data: balance } = await state.api.query.system.account(
            state.activeAccount.address
          ) as any
          
          set({
            balances: {
              free: balance.free.toString(),
              reserved: balance.reserved.toString(),
              frozen: balance.frozen?.toString() || '0'
            }
          })
        } catch (error) {
          console.error('Failed to fetch balances:', error)
        }
      },
      
      // Reset activity timer
      resetActivity: () => {
        const state = get()
        
        set({ lastActivityAt: Date.now() })
        
        if (!state.isLocked && state.autoLockEnabled) {
          SecurityManager.resetAutoLockTimer(() => {
            get().lock()
          })
        }
      },
      
      // Clear wallet (factory reset)
      clearWallet: () => {
        SecurityManager.lock()
        
        set({
          isInitialized: false,
          isLocked: true,
          accounts: [],
          activeAccount: null,
          encryptedSeed: null,
          salt: null,
          iv: null,
          balances: null,
          api: null,
          isConnected: false,
          lastActivityAt: Date.now()
        })
        
        console.log('🗑️ Wallet data cleared')
      }
    }),
    {
      name: 'wallet-store',
      // CORREÇÃO PRINCIPAL: Partialize para persistir apenas dados serializáveis
      partialize: (state) => ({
        isInitialized: state.isInitialized,
        isLocked: state.isLocked,
        accounts: state.accounts,
        activeAccount: state.activeAccount,
        encryptedSeed: state.encryptedSeed,
        salt: state.salt,
        iv: state.iv,
        autoLockEnabled: state.autoLockEnabled,
        lastActivityAt: state.lastActivityAt
        // NÃO persistir: api, balances, isConnected (reconecta ao unlock)
      })
    }
  )
)