// Arquivo: apps/web/src/store/wallet.ts
// Store de wallet com integração real com a blockchain

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Keyring } from '@polkadot/keyring'
import { mnemonicGenerate, cryptoWaitReady } from '@polkadot/util-crypto'
import { stringToU8a, u8aToHex } from '@polkadot/util'
import { ApiPromise, WsProvider } from '@polkadot/api'

interface Account {
  address: string
  name: string
  publicKey: string
  meta?: any
}

interface Balance {
  free: string
  reserved: string
  frozen: string
  flags: string
}

interface WalletState {
  // Estado
  isInitialized: boolean
  isLocked: boolean
  accounts: Account[]
  activeAccount: Account | null
  seed: string | null
  isCreatingVault: boolean
  isUnlocking: boolean
  error: string | null
  balances: {
    bzr: number
    livo: number
  }
  
  // Conexão blockchain
  api: ApiPromise | null
  isConnected: boolean
  
  // Ações
  init: () => Promise<void>
  connectToChain: () => Promise<void>
  fetchBalances: () => Promise<void>
  hasVault: () => Promise<boolean>
  generateSeed: () => Promise<string>
  createVault: (password: string, seed: string) => Promise<boolean>
  unlockVault: (password: string) => Promise<boolean>
  lockVault: () => Promise<void>
  createAccount: (name?: string) => Promise<Account>
  getAccounts: () => Promise<Account[]>
  setActiveAccount: (address: string) => void
  signMessage: (address: string, message: string) => Promise<string>
  signTransaction: (address: string, payload: any) => Promise<string>
  clearError: () => void
}

const STORAGE_KEY = 'bazari_vault'
const WS_PROVIDER = process.env.VITE_WS_PROVIDER || 'ws://127.0.0.1:9944'

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      isInitialized: false,
      isLocked: true,
      accounts: [],
      activeAccount: null,
      seed: null,
      isCreatingVault: false,
      isUnlocking: false,
      error: null,
      balances: {
        bzr: 0,
        livo: 0
      },
      api: null,
      isConnected: false,
      
      init: async () => {
        try {
          console.log('Wallet init: Starting crypto initialization...')
          await cryptoWaitReady()
          console.log('Wallet init: Crypto ready!')
          
          const vaultData = localStorage.getItem(STORAGE_KEY)
          if (vaultData) {
            console.log('Wallet init: Vault exists, locked')
            set({ isInitialized: true, isLocked: true })
          } else {
            console.log('Wallet init: No vault found')
            set({ isInitialized: true, isLocked: false })
          }
          
          // Conectar com a blockchain
          await get().connectToChain()
        } catch (error: any) {
          console.error('Wallet init error:', error)
          set({ error: error.message })
        }
      },
      
      connectToChain: async () => {
        try {
          const { api } = get()
          if (api && api.isConnected) {
            console.log('Already connected to chain')
            return
          }
          
          console.log('Connecting to chain at:', WS_PROVIDER)
          const provider = new WsProvider(WS_PROVIDER)
          const newApi = await ApiPromise.create({ provider })
          
          await newApi.isReady
          console.log('Chain connected:', await newApi.rpc.system.chain())
          
          set({ 
            api: newApi, 
            isConnected: true 
          })
          
          // Buscar balances após conectar
          const { activeAccount } = get()
          if (activeAccount) {
            await get().fetchBalances()
          }
        } catch (error: any) {
          console.error('Failed to connect to chain:', error)
          set({ 
            error: 'Falha ao conectar com a blockchain',
            isConnected: false 
          })
        }
      },
      
      fetchBalances: async () => {
        try {
          const { api, activeAccount } = get()
          
          if (!api || !api.isConnected) {
            console.log('API not connected, connecting...')
            await get().connectToChain()
          }
          
          if (!activeAccount) {
            console.log('No active account')
            return
          }
          
          console.log('Fetching balances for:', activeAccount.address)
          
          // Buscar balance de BZR (token nativo)
          const { data: balance } = await api!.query.system.account(activeAccount.address) as any
          
          console.log('Raw balance data:', balance.toJSON())
          
          const bzrBalance = Number(balance.free.toString()) / 1e12 // Converter de unidades mínimas
          
          // Buscar balance de LIVO (se existir pallet de tokens/assets)
          let livoBalance = 0
          try {
            // Tentar buscar LIVO do pallet de assets/tokens se existir
            if (api!.query.tokens) {
              const livoData = await api!.query.tokens.accounts(activeAccount.address, 'LIVO')
              livoBalance = Number(livoData.toString()) / 1e12
            }
          } catch (e) {
            console.log('LIVO token query not available')
          }
          
          console.log('Balances:', { bzr: bzrBalance, livo: livoBalance })
          
          set({
            balances: {
              bzr: bzrBalance,
              livo: livoBalance
            }
          })
        } catch (error: any) {
          console.error('Error fetching balances:', error)
          set({ error: 'Erro ao buscar saldos' })
        }
      },
      
      hasVault: async () => {
        try {
          await cryptoWaitReady()
          const vaultData = localStorage.getItem(STORAGE_KEY)
          const exists = !!vaultData
          console.log('hasVault:', exists)
          return exists
        } catch (error) {
          console.error('hasVault error:', error)
          return false
        }
      },
      
      generateSeed: async () => {
        try {
          console.log('generateSeed: Ensuring crypto ready...')
          await cryptoWaitReady()
          console.log('generateSeed: Generating mnemonic...')
          
          const mnemonic = mnemonicGenerate(24)
          console.log('generateSeed: Mnemonic generated, length:', mnemonic.split(' ').length)
          
          set({ seed: mnemonic })
          return mnemonic
        } catch (error: any) {
          console.error('generateSeed error:', error)
          throw error
        }
      },
      
      createVault: async (password: string, seed: string) => {
        try {
          console.log('createVault: Starting...')
          console.log('createVault: Password length:', password?.length)
          console.log('createVault: Seed words:', seed?.split(' ').length)
          
          set({ isCreatingVault: true, error: null })
          
          console.log('createVault: Ensuring crypto ready...')
          await cryptoWaitReady()
          console.log('createVault: Crypto ready!')
          
          if (!password || !seed) {
            throw new Error('Password e seed são obrigatórios')
          }
          
          console.log('createVault: Creating keyring...')
          const keyring = new Keyring({ 
            type: 'sr25519', 
            ss58Format: 0
          })
          console.log('createVault: Keyring created')
          
          console.log('createVault: Adding account from seed...')
          const pair = keyring.addFromUri(seed, { name: 'Main Account' })
          console.log('createVault: Account created, address:', pair.address)
          
          const account: Account = {
            address: pair.address,
            name: 'Main Account',
            publicKey: u8aToHex(pair.publicKey)
          }
          console.log('createVault: Account object:', account)
          
          const vaultData = {
            seed: btoa(seed),
            accounts: [account],
            activeAccount: account,
            createdAt: Date.now()
          }
          
          console.log('createVault: Saving vault to localStorage...')
          localStorage.setItem(STORAGE_KEY, JSON.stringify(vaultData))
          console.log('createVault: Vault saved!')
          
          const globalWindow = window as any
          globalWindow.__bazariKeyring = keyring
          globalWindow.__bazariPair = pair
          console.log('createVault: Keyring saved to memory')
          
          set({
            accounts: [account],
            activeAccount: account,
            isLocked: false,
            isCreatingVault: false,
            isInitialized: true,
            seed: null
          })
          
          // Conectar com a chain e buscar balances
          await get().connectToChain()
          await get().fetchBalances()
          
          console.log('createVault: Success! State updated.')
          return true
          
        } catch (error: any) {
          console.error('createVault error:', error)
          set({ 
            error: error.message || 'Falha ao criar carteira',
            isCreatingVault: false
          })
          return false
        }
      },
      
      unlockVault: async (password: string) => {
        try {
          console.log('unlockVault: Starting...')
          set({ isUnlocking: true, error: null })
          
          await cryptoWaitReady()
          console.log('unlockVault: Crypto ready')
          
          const vaultData = localStorage.getItem(STORAGE_KEY)
          if (!vaultData) {
            throw new Error('Carteira não encontrada')
          }
          
          const vault = JSON.parse(vaultData)
          console.log('unlockVault: Vault loaded')
          
          const seed = atob(vault.seed)
          
          console.log('unlockVault: Recreating keyring...')
          const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 })
          const pair = keyring.addFromUri(seed, { name: vault.accounts[0].name })
          console.log('unlockVault: Keyring recreated, address:', pair.address)
          
          const globalWindow = window as any
          globalWindow.__bazariKeyring = keyring
          globalWindow.__bazariPair = pair
          
          set({
            accounts: vault.accounts,
            activeAccount: vault.activeAccount,
            isLocked: false,
            isUnlocking: false,
            isInitialized: true
          })
          
          // Conectar com a chain e buscar balances
          await get().connectToChain()
          await get().fetchBalances()
          
          console.log('unlockVault: Success!')
          return true
          
        } catch (error: any) {
          console.error('unlockVault error:', error)
          set({ 
            error: error.message || 'Senha incorreta',
            isUnlocking: false
          })
          return false
        }
      },
      
      lockVault: async () => {
        console.log('lockVault: Locking...')
        const globalWindow = window as any
        delete globalWindow.__bazariKeyring
        delete globalWindow.__bazariPair
        
        // Desconectar da chain
        const { api } = get()
        if (api) {
          await api.disconnect()
        }
        
        set({
          isLocked: true,
          activeAccount: null,
          balances: { bzr: 0, livo: 0 },
          api: null,
          isConnected: false
        })
        console.log('lockVault: Locked!')
      },
      
      createAccount: async (name?: string) => {
        const { accounts } = get()
        const globalWindow = window as any
        const pair = globalWindow.__bazariPair
        
        if (!pair) {
          throw new Error('Carteira bloqueada')
        }
        
        const account: Account = {
          address: pair.address,
          name: name || `Account ${accounts.length + 1}`,
          publicKey: u8aToHex(pair.publicKey)
        }
        
        const vaultData = localStorage.getItem(STORAGE_KEY)
        if (vaultData) {
          const vault = JSON.parse(vaultData)
          vault.accounts.push(account)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(vault))
        }
        
        set({
          accounts: [...accounts, account]
        })
        
        return account
      },
      
      getAccounts: async () => {
        const { accounts } = get()
        return accounts
      },
      
      setActiveAccount: (address: string) => {
        const { accounts } = get()
        const account = accounts.find(a => a.address === address)
        
        if (account) {
          set({ activeAccount: account })
          
          const vaultData = localStorage.getItem(STORAGE_KEY)
          if (vaultData) {
            const vault = JSON.parse(vaultData)
            vault.activeAccount = account
            localStorage.setItem(STORAGE_KEY, JSON.stringify(vault))
          }
          
          // Buscar balances da nova conta ativa
          get().fetchBalances()
        }
      },
      
      signMessage: async (address: string, message: string) => {
        try {
          console.log('signMessage: Starting...')
          console.log('signMessage: Address:', address)
          console.log('signMessage: Message:', message)
          
          const globalWindow = window as any
          const pair = globalWindow.__bazariPair
          
          if (!pair) {
            throw new Error('Carteira bloqueada')
          }
          
          if (pair.address !== address) {
            console.log('signMessage: Address mismatch!')
            console.log('Pair address:', pair.address)
            console.log('Requested address:', address)
            throw new Error('Endereço não corresponde à conta ativa')
          }
          
          console.log('signMessage: Signing...')
          const messageU8a = stringToU8a(message)
          const signature = pair.sign(messageU8a)
          const signatureHex = u8aToHex(signature)
          
          console.log('signMessage: Signature generated:', signatureHex.substring(0, 20) + '...')
          return signatureHex
          
        } catch (error: any) {
          console.error('signMessage error:', error)
          throw error
        }
      },
      
      signTransaction: async (address: string, payload: any) => {
        const globalWindow = window as any
        const pair = globalWindow.__bazariPair
        
        if (!pair) {
          throw new Error('Carteira bloqueada')
        }
        
        if (pair.address !== address) {
          throw new Error('Endereço não corresponde à conta ativa')
        }
        
        const signature = pair.sign(payload)
        return u8aToHex(signature)
      },
      
      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'bazari-wallet-store',
      partialize: (state) => ({
        isInitialized: state.isInitialized,
        isLocked: state.isLocked
      })
    }
  )
)