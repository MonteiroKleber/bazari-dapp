// packages/wallet-core/src/index.ts
import { Keyring } from '@polkadot/keyring'
import type { KeyringPair$Json } from '@polkadot/keyring/types'
import {
  mnemonicGenerate,
  mnemonicValidate,
  naclEncrypt,
  naclDecrypt,
  blake2AsHex
} from '@polkadot/util-crypto'
import { u8aToHex, hexToU8a, stringToU8a, u8aToString, u8aConcat } from '@polkadot/util'
import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { z } from 'zod'
import QRCode from 'qrcode'

// ---------------- Types ----------------

export interface WalletAccount {
  address: string
  name: string
  source: 'seed' | 'json' | 'hardware'
  derivationPath?: string
  publicKey: string
  encrypted: string // payload cifrado (nonce + encrypted) em hex
  meta: {
    whenCreated: number
    whenUsed?: number
    genesisHash?: string
  }
}

export interface WalletDB extends DBSchema {
  accounts: {
    key: string // address
    value: WalletAccount
    indexes: { 'by-name': string }
  }
  meta: {
    key: string
    value: { key: string; value: string }
  }
}

export interface WalletConfig {
  dbName?: string
  passwordMinLength?: number
  ss58Format?: number
}

const PasswordSchema = z.string().min(8).max(128)
const MnemonicSchema = z.string().refine(mnemonicValidate, {
  message: 'Invalid mnemonic phrase',
})

// ---------------- Classe ----------------

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

  // Init
  async init(password: string): Promise<void> {
    PasswordSchema.parse(password)

    this.db = await openDB<WalletDB>(this.config.dbName, 1, {
      upgrade: (db) => {
        const accounts = db.createObjectStore('accounts', { keyPath: 'address' })
        accounts.createIndex('by-name', 'name')
        db.createObjectStore('meta', { keyPath: 'key' })
      }
    })

    this.keyring = new Keyring({ type: 'sr25519', ss58Format: this.config.ss58Format })
    this.encryptionKey = await this.deriveKey(password)
    await this.loadAccounts()
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
    this.keyring = null
    this.encryptionKey = null
  }

  // Deriva chave de cifragem a partir da senha
  private async deriveKey(password: string): Promise<Uint8Array> {
    const salt = stringToU8a('bazari-wallet-salt')
    const passwordU8a = stringToU8a(password)
    const hash = blake2AsHex(u8aConcat(salt, passwordU8a), 256)
    return hexToU8a(hash)
  }

  // Criptografa bytes -> { encrypted, nonce }
  private encrypt(data: Uint8Array): { encrypted: Uint8Array; nonce: Uint8Array } {
    if (!this.encryptionKey) throw new Error('Wallet not initialized')
    const { encrypted, nonce } = naclEncrypt(
      data,
      this.encryptionKey
    ) as unknown as { encrypted: Uint8Array; nonce: Uint8Array }
    return { encrypted, nonce }
  }

  // Descriptografa bytes
  private decrypt(encrypted: Uint8Array, nonce: Uint8Array): Uint8Array | null {
    if (!this.encryptionKey) throw new Error('Wallet not initialized')
    return naclDecrypt(encrypted, nonce, this.encryptionKey)
  }

  // Carrega contas persistidas
  private async loadAccounts(): Promise<void> {
    if (!this.db || !this.keyring) throw new Error('Wallet not initialized')

    const accounts = await this.db.getAll('accounts')
    for (const account of accounts) {
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

  // Cria conta a partir de mnemônico
  async createAccount(name: string, mnemonic?: string): Promise<WalletAccount> {
    if (!this.db || !this.keyring) throw new Error('Wallet not initialized')

    const seed = mnemonic || mnemonicGenerate()
    MnemonicSchema.parse(seed)

    const pair = this.keyring.addFromUri(seed, { name })

    const seedU8a = stringToU8a(seed)
    const { encrypted, nonce } = this.encrypt(seedU8a)
    const encryptedHex = u8aToHex(u8aConcat(nonce, encrypted))

    const account: WalletAccount = {
      address: pair.address,
      name,
      source: 'seed',
      publicKey: u8aToHex(pair.publicKey),
      encrypted: encryptedHex,
      meta: {
        whenCreated: Date.now(),
        genesisHash: undefined,
      }
    }

    await this.db.put('accounts', account)
    return account
  }

  // Importa conta via JSON
  async importFromJson(json: KeyringPair$Json, password?: string, name?: string): Promise<WalletAccount> {
    if (!this.db || !this.keyring) throw new Error('Wallet not initialized')

    const pair = this.keyring.addFromJson(json)
    if (password) {
      pair.unlock(password)
    }

    const jsonU8a = stringToU8a(JSON.stringify(json))
    const { encrypted, nonce } = this.encrypt(jsonU8a)
    const encryptedHex = u8aToHex(u8aConcat(nonce, encrypted))

    const account: WalletAccount = {
      address: pair.address,
      name: name || (json.meta?.name as string) || 'Imported',
      source: 'json',
      publicKey: u8aToHex(pair.publicKey),
      encrypted: encryptedHex,
      meta: {
        whenCreated: Date.now(),
        genesisHash: (json.meta?.genesisHash ?? undefined) as string | undefined,
      },
    }

    await this.db.put('accounts', account)
    return account
  }

  // Lista contas persistidas (snapshot do DB)
  async getAccounts(): Promise<WalletAccount[]> {
    if (!this.db) throw new Error('Wallet not initialized')
    return this.db.getAll('accounts')
  }

  // Exporta keystore JSON (criptografado) para um endereço
  async exportAccount(address: string, password: string): Promise<KeyringPair$Json> {
    if (!this.keyring) throw new Error('Wallet not initialized')
    const pair = this.keyring.getPair(address)
    return pair.toJson(password)
  }

  // Remove conta
  async removeAccount(address: string): Promise<void> {
    if (!this.db || !this.keyring) throw new Error('Wallet not initialized')
    // @polkadot/keyring usa removePair(address) para excluir do keyring
    this.keyring.removePair(address)
    await this.db.delete('accounts', address)
  }

  // Renomeia conta
  async renameAccount(address: string, newName: string): Promise<void> {
    if (!this.db) throw new Error('Wallet not initialized')

    const account = await this.db.get('accounts', address)
    if (!account) throw new Error('Account not found')

    account.name = newName
    await this.db.put('accounts', account)
  }

  // QR do endereço
  async generateAddressQr(address: string): Promise<string> {
    return QRCode.toDataURL(address, { margin: 1, scale: 4 })
  }

  // --------- Helpers de cifragem arbitrária ---------

  async encryptText(plain: string): Promise<string> {
    const data = stringToU8a(plain)
    const { encrypted, nonce } = this.encrypt(data)
    return u8aToHex(u8aConcat(nonce, encrypted))
  }

  async decryptText(encryptedHex: string): Promise<string | null> {
    const bytes = hexToU8a(encryptedHex)
    const nonce = bytes.slice(0, 24)
    const encrypted = bytes.slice(24)
    const out = this.decrypt(encrypted, nonce)
    return out ? u8aToString(out) : null
  }

  // Rotaciona senha: recriptografa todos os payloads com a nova senha
  async rotatePassword(oldPassword: string, newPassword: string): Promise<void> {
    if (!this.db) throw new Error('Wallet not initialized')

    PasswordSchema.parse(oldPassword)
    PasswordSchema.parse(newPassword)

    const oldKey = await this.deriveKey(oldPassword)
    const newKey = await this.deriveKey(newPassword)

    // usa oldKey temporariamente para decriptar
    this.encryptionKey = oldKey

    const accounts = await this.db.getAll('accounts')

    for (const account of accounts) {
      const bytes = hexToU8a(account.encrypted)
      const nonce = bytes.slice(0, 24)
      const encrypted = bytes.slice(24)

      const decrypted = this.decrypt(encrypted, nonce)
      if (!decrypted) continue

      // recriptografa com newKey
      this.encryptionKey = newKey
      const { encrypted: newEncrypted, nonce: newNonce } = this.encrypt(decrypted)
      account.encrypted = u8aToHex(u8aConcat(newNonce, newEncrypted))

      // volta para oldKey para a próxima iteração
      this.encryptionKey = oldKey

      await this.db.put('accounts', account)
    }

    // ativa definitivamente a nova chave
    this.encryptionKey = newKey
  }

  // Apaga tudo do DB (não mexe na extensão/browser, apenas no storage local desta wallet)
  async wipe(): Promise<void> {
    if (this.db) {
      const accounts = await this.db.getAll('accounts')
      for (const a of accounts) {
        await this.db.delete('accounts', a.address)
      }
      this.db.close()
      this.db = null
    }
  }
}

// ---------------- Exports utilitários ----------------

export {
  mnemonicGenerate,
  mnemonicValidate
} from '@polkadot/util-crypto'

// default export (se quiser eliminar o aviso do tsup, podemos trocar para only-named)
export default WalletCore
