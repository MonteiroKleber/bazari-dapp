import { Keyring, KeyringPair } from '@polkadot/keyring'
import { 
  cryptoWaitReady, 
  mnemonicGenerate, 
  mnemonicValidate,
  mnemonicToMiniSecret,
  naclEncrypt,
  naclDecrypt,
  randomAsU8a,
  blake2AsU8a
} from '@polkadot/util-crypto'
import { u8aToHex, hexToU8a, stringToU8a, u8aToString } from '@polkadot/util'
import { openDB, IDBPDatabase } from 'idb'
import argon2 from 'argon2-browser'
import QRCode from 'qrcode'
import { z } from 'zod'

// Schemas
const AccountSchema = z.object({
  address: z.string(),
  name: z.string(),
  derivationPath: z.string().optional(),
  seedId: z.string(),
  meta: z.record(z.any()).optional(),
  createdAt: z.number(),
  isExternal: z.boolean().default(false)
})

const VaultSchema = z.object({
  id: z.string(),
  encryptedSeeds: z.record(z.string()), // seedId -> encrypted seed
  accounts: z.array(AccountSchema),
  salt: z.string(),
  nonce: z.string(),
  createdAt: z.number(),
  lastUnlock: z.number().optional(),
  settings: z.object({
    autoLockMinutes: z.number().default(15),
    defaultNetwork: z.string().default('bazari')
  })
})

export type Account = z.infer<typeof AccountSchema>
export type Vault = z.infer<typeof VaultSchema>

export interface WalletConfig {
  dbName?: string
  autoLockMinutes?: number
  network?: 'bazari' | 'testnet' | 'development'
}

export interface CreateAccountOptions {
  name: string
  derivationType: 'derive' | 'new' | 'import'
  seed?: string
  derivationPath?: string
  password?: string
}

export interface UnlockResult {
  success: boolean
  error?: string
}

export interface TransactionRequest {
  from: string
  to: string
  amount: string
  token?: 'BZR' | 'LIVO'
}

class WalletCore {
  private db: IDBPDatabase | null = null
  private keyring: Keyring | null = null
  private vault: Vault | null = null
  private sessionKey: Uint8Array | null = null
  private autoLockTimer: NodeJS.Timeout | null = null
  private config: WalletConfig
  private activePairs: Map<string, KeyringPair> = new Map()

  constructor(config: WalletConfig = {}) {
    this.config = {
      dbName: 'bazari-wallet',
      autoLockMinutes: 15,
      network: 'development',
      ...config
    }
  }

  async init(): Promise<void> {
    await cryptoWaitReady()
    
    this.keyring = new Keyring({ 
      type: 'sr25519',
      ss58Format: 42 // Substrate generic format
    })

    // Open IndexedDB
    this.db = await openDB(this.config.dbName!, 1, {
      upgrade(db) {
        // Create vault store
        if (!db.objectStoreNames.contains('vault')) {
          db.createObjectStore('vault')
        }
        // Create transactions store for history
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { 
            keyPath: 'id',
            autoIncrement: true 
          })
          txStore.createIndex('from', 'from')
          txStore.createIndex('to', 'to')
          txStore.createIndex('timestamp', 'timestamp')
        }
      }
    })

    // Load vault if exists
    await this.loadVault()
  }

  private async loadVault(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    const vaultData = await this.db.get('vault', 'main')
    if (vaultData) {
      this.vault = VaultSchema.parse(vaultData)
    }
  }

  private async saveVault(): Promise<void> {
    if (!this.db || !this.vault) throw new Error('Database or vault not initialized')
    
    await this.db.put('vault', this.vault, 'main')
  }

  // Vault Management
  async hasVault(): Promise<boolean> {
    if (!this.db) await this.init()
    return this.vault !== null
  }

  async createVault(password: string): Promise<string> {
    if (this.vault) throw new Error('Vault already exists')
    
    // Generate master seed
    const masterSeed = mnemonicGenerate(24)
    const seedId = 'master'
    
    // Generate salt for key derivation
    const salt = randomAsU8a(32)
    const saltHex = u8aToHex(salt)
    
    // Derive encryption key from password using Argon2
    const key = await this.deriveKey(password, salt)
    
    // Encrypt master seed
    const nonce = randomAsU8a(24)
    const encryptedSeed = naclEncrypt(
      stringToU8a(masterSeed),
      nonce,
      key
    )
    
    // Create vault
    this.vault = {
      id: u8aToHex(randomAsU8a(16)),
      encryptedSeeds: {
        [seedId]: u8aToHex(encryptedSeed.encrypted)
      },
      accounts: [],
      salt: saltHex,
      nonce: u8aToHex(nonce),
      createdAt: Date.now(),
      settings: {
        autoLockMinutes: this.config.autoLockMinutes!,
        defaultNetwork: this.config.network!
      }
    }
    
    // Save vault
    await this.saveVault()
    
    // Store session key
    this.sessionKey = key
    this.startAutoLockTimer()
    
    // Create first account
    await this.createAccount({
      name: 'Account 1',
      derivationType: 'derive',
      derivationPath: '//0'
    })
    
    return masterSeed
  }

  async unlockVault(password: string): Promise<UnlockResult> {
    if (!this.vault) {
      return { success: false, error: 'No vault found' }
    }
    
    try {
      // Derive key from password
      const salt = hexToU8a(this.vault.salt)
      const key = await this.deriveKey(password, salt)
      
      // Try to decrypt master seed to verify password
      const encryptedMaster = hexToU8a(this.vault.encryptedSeeds['master'])
      const nonce = hexToU8a(this.vault.nonce)
      
      const decrypted = naclDecrypt(encryptedMaster, nonce, key)
      if (!decrypted) {
        return { success: false, error: 'Invalid password' }
      }
      
      // Store session key
      this.sessionKey = key
      this.vault.lastUnlock = Date.now()
      await this.saveVault()
      
      // Load all accounts into keyring
      await this.loadAccountsIntoKeyring()
      
      this.startAutoLockTimer()
      
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to unlock vault' }
    }
  }

  async lockVault(): Promise<void> {
    this.sessionKey = null
    this.activePairs.clear()
    if (this.keyring) {
      // Clear keyring pairs
      this.keyring.getPairs().forEach(pair => {
        this.keyring!.removePair(pair.address)
      })
    }
    this.stopAutoLockTimer()
  }

  isUnlocked(): boolean {
    return this.sessionKey !== null
  }

  private async loadAccountsIntoKeyring(): Promise<void> {
    if (!this.vault || !this.sessionKey || !this.keyring) return
    
    const nonce = hexToU8a(this.vault.nonce)
    
    for (const [seedId, encryptedSeed] of Object.entries(this.vault.encryptedSeeds)) {
      const decrypted = naclDecrypt(
        hexToU8a(encryptedSeed),
        nonce,
        this.sessionKey
      )
      
      if (decrypted) {
        const seed = u8aToString(decrypted)
        
        // Load accounts for this seed
        const accountsForSeed = this.vault.accounts.filter(acc => acc.seedId === seedId)
        
        for (const account of accountsForSeed) {
          const uri = account.derivationPath 
            ? `${seed}${account.derivationPath}`
            : seed
          
          const pair = this.keyring.addFromUri(uri, { name: account.name })
          this.activePairs.set(account.address, pair)
        }
      }
    }
  }

  // Account Management
  async createAccount(options: CreateAccountOptions): Promise<Account> {
    if (!this.vault || !this.sessionKey || !this.keyring) {
      throw new Error('Vault not unlocked')
    }
    
    let seed: string
    let seedId: string
    
    if (options.derivationType === 'import' && options.seed) {
      // Import new seed
      if (!mnemonicValidate(options.seed)) {
        throw new Error('Invalid mnemonic seed')
      }
      
      seed = options.seed
      seedId = u8aToHex(blake2AsU8a(options.seed, 128))
      
      // Encrypt and store new seed if not exists
      if (!this.vault.encryptedSeeds[seedId]) {
        const nonce = hexToU8a(this.vault.nonce)
        const encryptedSeed = naclEncrypt(
          stringToU8a(seed),
          nonce,
          this.sessionKey
        )
        this.vault.encryptedSeeds[seedId] = u8aToHex(encryptedSeed.encrypted)
      }
    } else {
      // Use master seed
      seedId = 'master'
      const encryptedMaster = hexToU8a(this.vault.encryptedSeeds['master'])
      const nonce = hexToU8a(this.vault.nonce)
      
      const decrypted = naclDecrypt(encryptedMaster, nonce, this.sessionKey)
      if (!decrypted) throw new Error('Failed to decrypt master seed')
      
      seed = u8aToString(decrypted)
    }
    
    // Generate keypair
    const uri = options.derivationPath 
      ? `${seed}${options.derivationPath}`
      : seed
    
    const pair = this.keyring.addFromUri(uri, { name: options.name })
    
    // Create account object
    const account: Account = {
      address: pair.address,
      name: options.name,
      derivationPath: options.derivationPath,
      seedId,
      meta: {},
      createdAt: Date.now(),
      isExternal: false
    }
    
    // Add to vault
    this.vault.accounts.push(account)
    this.activePairs.set(account.address, pair)
    
    // Save vault
    await this.saveVault()
    
    return account
  }

  async getAccounts(): Promise<Account[]> {
    if (!this.vault) return []
    return this.vault.accounts
  }

  async getAccount(address: string): Promise<Account | null> {
    if (!this.vault) return null
    return this.vault.accounts.find(acc => acc.address === address) || null
  }

  async renameAccount(address: string, newName: string): Promise<void> {
    if (!this.vault) throw new Error('No vault found')
    
    const account = this.vault.accounts.find(acc => acc.address === address)
    if (!account) throw new Error('Account not found')
    
    account.name = newName
    
    // Update keyring pair meta
    const pair = this.activePairs.get(address)
    if (pair) {
      pair.setMeta({ name: newName })
    }
    
    await this.saveVault()
  }

  async deleteAccount(address: string): Promise<void> {
    if (!this.vault) throw new Error('No vault found')
    
    const accountIndex = this.vault.accounts.findIndex(acc => acc.address === address)
    if (accountIndex === -1) throw new Error('Account not found')
    
    // Remove from vault
    this.vault.accounts.splice(accountIndex, 1)
    
    // Remove from keyring
    if (this.keyring) {
      this.keyring.removePair(address)
    }
    this.activePairs.delete(address)
    
    await this.saveVault()
  }

  // Signing
  async signMessage(address: string, message: string): Promise<string> {
    const pair = this.activePairs.get(address)
    if (!pair) throw new Error('Account not found or locked')
    
    const signature = pair.sign(stringToU8a(message))
    return u8aToHex(signature)
  }

  async signTransaction(address: string, transaction: any): Promise<string> {
    const pair = this.activePairs.get(address)
    if (!pair) throw new Error('Account not found or locked')
    
    // This will be integrated with polkadot/api for actual transaction signing
    const signature = pair.sign(transaction)
    return u8aToHex(signature)
  }

  // Export/Import
  async exportSeed(address: string): Promise<string> {
    if (!this.vault || !this.sessionKey) {
      throw new Error('Vault not unlocked')
    }
    
    const account = this.vault.accounts.find(acc => acc.address === address)
    if (!account) throw new Error('Account not found')
    
    const encryptedSeed = hexToU8a(this.vault.encryptedSeeds[account.seedId])
    const nonce = hexToU8a(this.vault.nonce)
    
    const decrypted = naclDecrypt(encryptedSeed, nonce, this.sessionKey)
    if (!decrypted) throw new Error('Failed to decrypt seed')
    
    return u8aToString(decrypted)
  }

  async generateQRCode(data: string): Promise<string> {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#1C1C1C',
        light: '#F5F1E0'
      }
    })
  }

  // Utility
  private async deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
    return await deriveKeyUtil(password, salt, 100000)
  }

  private startAutoLockTimer(): void {
    this.stopAutoLockTimer()
    
    if (this.config.autoLockMinutes && this.config.autoLockMinutes > 0) {
      this.autoLockTimer = setTimeout(() => {
        this.lockVault()
      }, this.config.autoLockMinutes * 60 * 1000)
    }
  }

  private stopAutoLockTimer(): void {
    if (this.autoLockTimer) {
      clearTimeout(this.autoLockTimer)
      this.autoLockTimer = null
    }
  }

  // Transaction History (stored locally)
  async saveTransaction(tx: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    await this.db.add('transactions', {
      ...tx,
      timestamp: Date.now()
    })
  }

  async getTransactions(address: string, limit = 50): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized')
    
    const fromTxs = await this.db.getAllFromIndex('transactions', 'from', address)
    const toTxs = await this.db.getAllFromIndex('transactions', 'to', address)
    
    const allTxs = [...fromTxs, ...toTxs]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
    
    return allTxs
  }
}

export default WalletCore