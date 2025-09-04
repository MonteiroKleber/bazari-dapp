// packages/wallet-core/src/index.ts
import Keyring from '@polkadot/keyring'
import { KeyringPair$Json } from '@polkadot/keyring/types'
import {
  mnemonicGenerate,
  mnemonicValidate,
  mnemonicToSeed,
  randomAsU8a,
  naclEncrypt,
  naclDecrypt,
  blake2AsHex
} from '@polkadot/util-crypto'
import { u8aToHex, hexToU8a, stringToU8a, u8aToString } from '@polkadot/util'
import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { z } from 'zod'
import QRCode from 'qrcode'

// Types
export type KeyringPair = ReturnType<InstanceType<typeof Keyring>['addFromUri']>

export interface WalletAccount {
  address: string
  name: string
  source: 'seed' | 'json' | 'hardware'
  derivationPath?: string
  publicKey: string
  encrypted: string // encrypted private key or seed
  meta: {
    whenCreated: number
    whenUsed?: number
    genesisHash?: string
  }
}

export interface WalletDB extends DBSchema {
  accounts: {
    key: string
    value: WalletAccount
    indexes: {
      'by-name': string
      'by-created': number
    }
  }
  settings: {
    key: string
    value: any
  }
}

export interface WalletConfig {
  dbName?: string
  passwordMinLength?: number
  ss58Format?: number
}

// Validation schemas
const PasswordSchema = z.string().min(8).max(128)
const MnemonicSchema = z.string().refine(mnemonicValidate, {
  message: 'Invalid mnemonic phrase',
})

// Wallet Core Class
export class WalletCore {
  private db: IDBPDatabase<WalletDB> | null = null
  private keyring: Keyring | null = null
  private config: Required<WalletConfig>
  private encryptionKey: Uint8Array | null = null

  constructor(config: WalletConfig = {}) {
    this.config = {
      dbName: config.dbName || 'bazari-wallet',
      passwordMinLength: config.passwordMinLength || 8,
      ss58Format: config.ss58Format || 42,
    }
  }

  // Initialize wallet
  async init(password: string): Promise<void> {
    // Validate password
    PasswordSchema.parse(password)

    // Derive encryption key from password
    this.encryptionKey = await this.deriveKey(password)

    // Open IndexedDB
    this.db = await openDB<WalletDB>(this.config.dbName, 1, {
      upgrade(db) {
        // Create accounts store
        const accountStore = db.createObjectStore('accounts', {
          keyPath: 'address',
        })
        accountStore.createIndex('by-name', 'name')
        accountStore.createIndex('by-created', 'meta.whenCreated')

        // Create settings store
        db.createObjectStore('settings')
      },
    })

    // Initialize keyring
    this.keyring = new Keyring({
      type: 'sr25519',
      ss58Format: this.config.ss58Format,
    })

    // Load existing accounts
    await this.loadAccounts()
  }

  // Derive encryption key from password
  private async deriveKey(password: string): Promise<Uint8Array> {
    const salt = stringToU8a('bazari-wallet-salt')
    const passwordU8a = stringToU8a(password)
    
    // Use blake2 for key derivation (simpler than argon2 in browser)
    const hash = blake2AsHex([...salt, ...passwordU8a], 256)
    return hexToU8a(hash)
  }

  // Encrypt data
  private encrypt(data: Uint8Array): { encrypted: Uint8Array; nonce: Uint8Array } {
    if (!this.encryptionKey) throw new Error('Wallet not initialized')
    
    const nonce = randomAsU8a(24)
    const encrypted = naclEncrypt(data, this.encryptionKey, nonce)
    
    return { encrypted, nonce }
  }

  // Decrypt data
  private decrypt(encrypted: Uint8Array, nonce: Uint8Array): Uint8Array | null {
    if (!this.encryptionKey) throw new Error('Wallet not initialized')
    
    return naclDecrypt(encrypted, nonce, this.encryptionKey)
  }

  // Load accounts from database
  private async loadAccounts(): Promise<void> {
    if (!this.db || !this.keyring) throw new Error('Wallet not initialized')

    const accounts = await this.db.getAll('accounts')
    
    for (const account of accounts) {
      // Decrypt and restore account
      const encryptedData = hexToU8a(account.encrypted)
      const nonce = encryptedData.slice(0, 24)
      const encrypted = encryptedData.slice(24)
      
      const decrypted = this.decrypt(encrypted, nonce)
      if (!decrypted) {
        console.error(`Failed to decrypt account ${account.address}`)
        continue
      }

      const seedOrJson = u8aToString(decrypted)
      
      try {
        if (account.source === 'seed') {
          this.keyring.addFromUri(seedOrJson, { name: account.name })
        } else if (account.source === 'json') {
          const json = JSON.parse(seedOrJson) as KeyringPair$Json
          this.keyring.addFromJson(json)
        }
      } catch (error) {
        console.error(`Failed to load account ${account.address}:`, error)
      }
    }
  }

  // Create new account from mnemonic
  async createAccount(name: string, mnemonic?: string): Promise<WalletAccount> {
    if (!this.db || !this.keyring) throw new Error('Wallet not initialized')

    // Generate or validate mnemonic
    const seed = mnemonic || mnemonicGenerate()
    MnemonicSchema.parse(seed)

    // Create keypair
    const pair = this.keyring.addFromUri(seed, { name })
    
    // Encrypt seed
    const seedU8a = stringToU8a(seed)
    const { encrypted, nonce } = this.encrypt(seedU8a)
    const encryptedHex = u8aToHex(new Uint8Array([...nonce, ...encrypted]))

    // Create account object
    const account: WalletAccount = {
      address: pair.address,
      name,
      source: 'seed',
      publicKey: u8aToHex(pair.publicKey),
      encrypted: encryptedHex,
      meta: {
        whenCreated: Date.now(),
      },
    }

    // Save to database
    await this.db.put('accounts', account)

    return account
  }

  // Import account from JSON
  async importFromJson(json: KeyringPair$Json, password?: string, name?: string): Promise<WalletAccount> {
    if (!this.db || !this.keyring) throw new Error('Wallet not initialized')

    // Add to keyring
    const pair = this.keyring.addFromJson(json)
    if (password) {
      pair.unlock(password)
    }

    // Encrypt JSON
    const jsonString = JSON.stringify(json)
    const jsonU8a = stringToU8a(jsonString)
    const { encrypted, nonce } = this.encrypt(jsonU8a)
    const encryptedHex = u8aToHex(new Uint8Array([...nonce, ...encrypted]))

    // Create account object
    const account: WalletAccount = {
      address: json.address,
      name: name || json.meta?.name || 'Imported Account',
      source: 'json',
      publicKey: u8aToHex(pair.publicKey),
      encrypted: encryptedHex,
      meta: {
        whenCreated: Date.now(),
        genesisHash: json.meta?.genesisHash,
      },
    }

    // Save to database
    await this.db.put('accounts', account)

    return account
  }

  // Get all accounts
  async getAccounts(): Promise<WalletAccount[]> {
    if (!this.db) throw new Error('Wallet not initialized')
    return await this.db.getAll('accounts')
  }

  // Get account by address
  async getAccount(address: string): Promise<WalletAccount | undefined> {
    if (!this.db) throw new Error('Wallet not initialized')
    return await this.db.get('accounts', address)
  }

  // Remove account
  async removeAccount(address: string): Promise<void> {
    if (!this.db || !this.keyring) throw new Error('Wallet not initialized')
    
    // Remove from keyring
    const pair = this.keyring.getPair(address)
    if (pair) {
      this.keyring.removePair(address)
    }
    
    // Remove from database
    await this.db.delete('accounts', address)
  }

  // Get keypair for signing
  getKeypair(address: string): KeyringPair | null {
    if (!this.keyring) throw new Error('Wallet not initialized')
    
    try {
      return this.keyring.getPair(address)
    } catch {
      return null
    }
  }

  // Export account as JSON
  async exportAccount(address: string, password: string): Promise<KeyringPair$Json> {
    if (!this.keyring) throw new Error('Wallet not initialized')
    
    const pair = this.keyring.getPair(address)
    if (!pair) throw new Error('Account not found')
    
    return pair.toJson(password)
  }

  // Change wallet password
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    if (!this.db) throw new Error('Wallet not initialized')
    
    // Validate passwords
    PasswordSchema.parse(oldPassword)
    PasswordSchema.parse(newPassword)
    
    // Verify old password
    const oldKey = await this.deriveKey(oldPassword)
    if (!oldKey.every((v, i) => v === this.encryptionKey![i])) {
      throw new Error('Invalid password')
    }
    
    // Derive new key
    const newKey = await this.deriveKey(newPassword)
    
    // Re-encrypt all accounts
    const accounts = await this.db.getAll('accounts')
    
    for (const account of accounts) {
      // Decrypt with old key
      const encryptedData = hexToU8a(account.encrypted)
      const nonce = encryptedData.slice(0, 24)
      const encrypted = encryptedData.slice(24)
      
      const decrypted = this.decrypt(encrypted, nonce)
      if (!decrypted) throw new Error('Failed to decrypt account')
      
      // Re-encrypt with new key
      this.encryptionKey = newKey
      const { encrypted: newEncrypted, nonce: newNonce } = this.encrypt(decrypted)
      account.encrypted = u8aToHex(new Uint8Array([...newNonce, ...newEncrypted]))
      
      // Save updated account
      await this.db.put('accounts', account)
    }
    
    this.encryptionKey = newKey
  }

  // Generate QR code for address
  async generateQRCode(address: string): Promise<string> {
    const dataUrl = await QRCode.toDataURL(address, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 256,
    })
    
    return dataUrl
  }

  // Backup wallet
  async backup(): Promise<string> {
    if (!this.db) throw new Error('Wallet not initialized')
    
    const accounts = await this.db.getAll('accounts')
    const settings = await this.db.getAll('settings')
    
    const backup = {
      version: 1,
      timestamp: Date.now(),
      accounts,
      settings,
    }
    
    return JSON.stringify(backup, null, 2)
  }

  // Restore wallet from backup
  async restore(backup: string, password: string): Promise<void> {
    const data = JSON.parse(backup)
    
    if (data.version !== 1) {
      throw new Error('Unsupported backup version')
    }
    
    // Re-initialize with new password
    await this.init(password)
    
    if (!this.db) throw new Error('Failed to initialize wallet')
    
    // Restore accounts
    for (const account of data.accounts) {
      await this.db.put('accounts', account)
    }
    
    // Restore settings
    for (const setting of data.settings) {
      await this.db.put('settings', setting)
    }
    
    // Reload accounts
    await this.loadAccounts()
  }

  // Lock wallet
  lock(): void {
    this.keyring = null
    this.encryptionKey = null
  }

  // Check if wallet is locked
  isLocked(): boolean {
    return this.keyring === null || this.encryptionKey === null
  }

  // Close wallet
  async close(): Promise<void> {
    this.lock()
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

// Export utilities
export {
  mnemonicGenerate,
  mnemonicValidate,
  mnemonicToSeed,
} from '@polkadot/util-crypto'

// Default export
export default WalletCore