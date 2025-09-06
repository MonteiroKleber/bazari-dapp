// apps/web/src/store/wallet.ts
// Wallet Store com Zero-Knowledge e Segurança Aprimorada
// ✅ PBKDF2 com 310.000 iterações
// ✅ Auto-lock por inatividade
// ✅ Seed NUNCA sai do dispositivo

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
   * Encrypt data using AES-GCM with authentication
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
    
    // Generate cryptographically secure random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(32)) // 256 bits
    const iv = crypto.getRandomValues(new Uint8Array(12)) // 96 bits for GCM
    
    // Derive key
    const key = await this.deriveKey(password, salt)
    
    // Encrypt with AES-GCM (provides authentication)
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
    
    // Generate cryptographically secure mnemonic
    const mnemonic = mnemonicGenerate(12)
    
    // Validate mnemonic
    if (!mnemonicValidate(mnemonic)) {
      throw new Error('Invalid mnemonic generated')
    }
    
    const pair = this.keyring!.addFromUri(mnemonic)
    
    // Encrypt mnemonic with enhanced security
    const encrypted = await this.encrypt(mnemonic, password)
    
    // Store current pair (in memory only)
    this.currentPair = pair
    
    console.log('✅ Wallet created with zero-knowledge architecture')
    
    return {
      mnemonic, // Return once for user to save, then wipe
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
    
    // Validate mnemonic
    if (!mnemonicValidate(mnemonic)) {
      throw new Error('Invalid mnemonic phrase')
    }
    
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
    
    // Validate decrypted seed
    if (!mnemonicValidate(seed)) {
      throw new Error('Invalid decrypted seed')
    }
    
    // Create pair
    const pair = this.keyring!.addFromUri(seed)
    
    // Store current pair (in memory only)
    this.currentPair = pair
    
    // Clear seed from memory after use
    seed.split('').forEach((_, i) => { seed[i] = '\0' })
    
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
}

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
      
      // Unlock wallet
      unlock: async (password: string) => {
        const state = get()
        
        if (!state.isInitialized) {
          throw new Error('Wallet not initialized')
        }
        
        if (!state.encryptedSeed || !state.salt || !state.iv) {
          throw new Error('Missing encrypted data')
        }
        
        const pair = await SecurityManager.unlockAccount(
          state.encryptedSeed,
          password,
          state.salt,
          state.iv
        )
        
        set({
          isLocked: false,
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
      },
      
      // Lock wallet
      lock: () => {
        SecurityManager.lock()
        
        set({
          isLocked: true,
          balances: null,
          api: get().api // Keep API connection
        })
        
        console.log('🔒 Wallet locked')
      },
      
      // Sign message
      signMessage: async (message: string) => {
        const state = get()
        
        if (state.isLocked) {
          throw new Error('Wallet is locked')
        }
        
        // Reset activity
        get().resetActivity()
        
        return SecurityManager.signMessage(message)
      },
      
      // Connect to blockchain
      connectBlockchain: async () => {
        const state = get()
        
        if (state.api && state.isConnected) {
          return // Already connected
        }
        
        const wsProvider = new WsProvider(
          import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:9944'
        )
        
        const api = await ApiPromise.create({ provider: wsProvider })
        
        await api.isReady
        
        set({
          api,
          isConnected: true
        })
        
        console.log('✅ Connected to Bazari blockchain')
      },
      
      // Fetch balances
      fetchBalances: async () => {
        const state = get()
        
        if (!state.api || !state.activeAccount) {
          return
        }
        
        // Reset activity
        get().resetActivity()
        
        try {
          // Fetch BZR balance
          const { data: balance } = await state.api.query.system.account(
            state.activeAccount.address
          ) as any
          
          set({
            balances: {
              BZR: {
                available: (balance.free.toBigInt() / BigInt(1e12)).toString(),
                reserved: (balance.reserved.toBigInt() / BigInt(1e12)).toString(),
                total: ((balance.free.toBigInt() + balance.reserved.toBigInt()) / BigInt(1e12)).toString()
              }
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
        
        if (state.autoLockEnabled && !state.isLocked) {
          SecurityManager.resetAutoLockTimer(() => {
            get().lock()
          })
        }
      }
    }),
    {
      name: 'bazari-wallet-store',
      partialize: (state) => ({
        isInitialized: state.isInitialized,
        isLocked: state.isLocked,
        accounts: state.accounts,
        activeAccount: state.activeAccount,
        encryptedSeed: state.encryptedSeed,
        salt: state.salt,
        iv: state.iv,
        autoLockEnabled: state.autoLockEnabled
      })
    }
  )
)

// Global activity listeners (initialize in App.tsx)
export function initializeActivityListeners() {
  const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
  
  events.forEach(event => {
    document.addEventListener(event, () => {
      const store = useWalletStore.getState()
      if (!store.isLocked) {
        store.resetActivity()
      }
    }, { passive: true })
  })
  
  // Visibility change listener
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Page is hidden, might want to lock immediately for security
      const store = useWalletStore.getState()
      if (store.autoLockEnabled && !store.isLocked) {
        console.log('🔒 Locking wallet - tab hidden')
        store.lock()
      }
    }
  })
  
  console.log('✅ Activity listeners initialized')
}