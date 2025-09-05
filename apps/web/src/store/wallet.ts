import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mnemonicGenerate } from '@polkadot/util-crypto'

interface Account {
  address: string
  name: string
  publicKey: string
  source: string
  meta?: {
    whenCreated?: number
    genesisHash?: string
  }
}

interface Balance {
  BZR: {
    free: string
    reserved: string
    frozen: string
    available: string
    pendingIn: string
    pendingOut: string
  }
  LIVO: {
    balance: string
    pendingIn: string
    pendingOut: string
  }
}

interface Transaction {
  id: string
  from: string
  to: string
  amount: string
  token: string
  type: string
  status: string
  timestamp: string
  txHash?: string
}

interface WalletState {
  // Vault
  hasVault: () => Promise<boolean>
  isUnlocked: boolean
  vaultCreated: boolean
  
  // Accounts
  accounts: Account[]
  activeAccount: Account | null
  
  // Balances & Transactions
  balances: Balance | null
  transactions: Transaction[]
  
  // Loading states
  isCreatingVault: boolean
  isUnlocking: boolean
  isLoading: boolean
  isSending: boolean
  
  // Error
  error: string | null
  
  // Actions
  generateSeed: () => Promise<string>
  createVault: (password: string, seed: string) => Promise<boolean>
  unlockVault: (password: string) => Promise<boolean>
  lockVault: () => Promise<void>
  
  createAccount: (options: {
    name: string
    derivationType: 'derive' | 'new' | 'import'
    seed?: string
    derivationPath?: string
  }) => Promise<Account | null>
  
  setActiveAccount: (account: Account) => void
  renameAccount: (address: string, name: string) => Promise<void>
  deleteAccount: (address: string) => Promise<void>
  exportSeed: (address: string, password: string) => Promise<string>
  
  fetchBalances: (address: string) => Promise<void>
  fetchTransactions: (address: string) => Promise<void>
  
  sendTransaction: (params: {
    to: string
    amount: string
    token: 'BZR' | 'LIVO'
  }) => Promise<string | null>
  
  clearError: () => void
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

// Simulated wallet storage (in production, use IndexedDB or secure storage)
const WALLET_STORAGE_KEY = 'bazari_wallet_vault'

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Check if vault exists in localStorage
      hasVault: async () => {
        try {
          const vaultData = localStorage.getItem(WALLET_STORAGE_KEY)
          return !!vaultData
        } catch (error) {
          console.error('Error checking vault:', error)
          return false
        }
      },
      
      isUnlocked: false,
      vaultCreated: false,
      accounts: [],
      activeAccount: null,
      balances: null,
      transactions: [],
      
      isCreatingVault: false,
      isUnlocking: false,
      isLoading: false,
      isSending: false,
      
      error: null,
      
      generateSeed: async () => {
        try {
          // Generate a 24-word mnemonic
          const seed = mnemonicGenerate(24)
          return seed
        } catch (error: any) {
          console.error('Error generating seed:', error)
          set({ error: error.message })
          throw error
        }
      },
      
      createVault: async (password: string, seed: string) => {
        set({ isCreatingVault: true, error: null })
        
        try {
          // Validate inputs
          if (!password || password.length < 8) {
            throw new Error('Password must be at least 8 characters')
          }
          
          if (!seed || seed.split(' ').length < 12) {
            throw new Error('Invalid seed phrase')
          }
          
          // Generate account from seed
          const address = `5${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
          const publicKey = `0x${Math.random().toString(16).substring(2, 66)}`
          
          const account: Account = {
            address,
            name: 'Main Account',
            publicKey,
            source: 'seed',
            meta: {
              whenCreated: Date.now()
            }
          }
          
          // Store vault (in production, encrypt with password)
          const vaultData = {
            encrypted: btoa(JSON.stringify({ seed, password })), // Simple encoding for demo
            accounts: [account],
            createdAt: Date.now()
          }
          
          localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(vaultData))
          
          // Set initial balance (mock data)
          const initialBalance: Balance = {
            BZR: {
              free: '1000.00',
              reserved: '0.00',
              frozen: '0.00',
              available: '1000.00',
              pendingIn: '0.00',
              pendingOut: '0.00'
            },
            LIVO: {
              balance: '100.00',
              pendingIn: '0.00',
              pendingOut: '0.00'
            }
          }
          
          set({
            accounts: [account],
            activeAccount: account,
            balances: initialBalance,
            isUnlocked: true,
            vaultCreated: true,
            isCreatingVault: false,
            error: null
          })
          
          return true
        } catch (error: any) {
          console.error('Error creating vault:', error)
          set({
            error: error.message,
            isCreatingVault: false
          })
          return false
        }
      },
      
      unlockVault: async (password: string) => {
        set({ isUnlocking: true, error: null })
        
        try {
          const vaultData = localStorage.getItem(WALLET_STORAGE_KEY)
          if (!vaultData) {
            throw new Error('No vault found')
          }
          
          const vault = JSON.parse(vaultData)
          const decrypted = JSON.parse(atob(vault.encrypted))
          
          if (decrypted.password !== password) {
            throw new Error('Invalid password')
          }
          
          // Mock balance data
          const balance: Balance = {
            BZR: {
              free: '1000.00',
              reserved: '0.00',
              frozen: '0.00',
              available: '1000.00',
              pendingIn: '0.00',
              pendingOut: '0.00'
            },
            LIVO: {
              balance: '100.00',
              pendingIn: '0.00',
              pendingOut: '0.00'
            }
          }
          
          set({
            accounts: vault.accounts || [],
            activeAccount: vault.accounts?.[0] || null,
            balances: balance,
            isUnlocked: true,
            vaultCreated: true,
            isUnlocking: false,
            error: null
          })
          
          return true
        } catch (error: any) {
          console.error('Error unlocking vault:', error)
          set({
            error: error.message,
            isUnlocking: false
          })
          return false
        }
      },
      
      lockVault: async () => {
        set({
          isUnlocked: false,
          accounts: [],
          activeAccount: null,
          balances: null,
          transactions: []
        })
      },
      
      createAccount: async (options) => {
        const { name, derivationType, seed, derivationPath } = options
        
        try {
          // Mock account creation
          const newAccount: Account = {
            address: `5${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
            name,
            publicKey: `0x${Math.random().toString(16).substring(2, 66)}`,
            source: derivationType,
            meta: {
              whenCreated: Date.now()
            }
          }
          
          const currentAccounts = get().accounts
          const updatedAccounts = [...currentAccounts, newAccount]
          
          // Update vault in storage
          const vaultData = localStorage.getItem(WALLET_STORAGE_KEY)
          if (vaultData) {
            const vault = JSON.parse(vaultData)
            vault.accounts = updatedAccounts
            localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(vault))
          }
          
          set({
            accounts: updatedAccounts,
            activeAccount: newAccount
          })
          
          return newAccount
        } catch (error: any) {
          console.error('Error creating account:', error)
          set({ error: error.message })
          return null
        }
      },
      
      setActiveAccount: (account: Account) => {
        set({ activeAccount: account })
      },
      
      renameAccount: async (address: string, name: string) => {
        const accounts = get().accounts.map(acc =>
          acc.address === address ? { ...acc, name } : acc
        )
        
        // Update vault in storage
        const vaultData = localStorage.getItem(WALLET_STORAGE_KEY)
        if (vaultData) {
          const vault = JSON.parse(vaultData)
          vault.accounts = accounts
          localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(vault))
        }
        
        set({ accounts })
      },
      
      deleteAccount: async (address: string) => {
        const accounts = get().accounts.filter(acc => acc.address !== address)
        const activeAccount = get().activeAccount
        
        // Update vault in storage
        const vaultData = localStorage.getItem(WALLET_STORAGE_KEY)
        if (vaultData) {
          const vault = JSON.parse(vaultData)
          vault.accounts = accounts
          localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(vault))
        }
        
        set({
          accounts,
          activeAccount: activeAccount?.address === address ? accounts[0] || null : activeAccount
        })
      },
      
      exportSeed: async (address: string, password: string) => {
        try {
          const vaultData = localStorage.getItem(WALLET_STORAGE_KEY)
          if (!vaultData) {
            throw new Error('No vault found')
          }
          
          const vault = JSON.parse(vaultData)
          const decrypted = JSON.parse(atob(vault.encrypted))
          
          if (decrypted.password !== password) {
            throw new Error('Invalid password')
          }
          
          return decrypted.seed
        } catch (error: any) {
          console.error('Error exporting seed:', error)
          set({ error: error.message })
          throw error
        }
      },
      
      fetchBalances: async (address: string) => {
        set({ isLoading: true })
        
        try {
          // Mock API call - in production, fetch from blockchain/API
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Mock balance with some randomness
          const balance: Balance = {
            BZR: {
              free: (Math.random() * 10000).toFixed(2),
              reserved: '0.00',
              frozen: '0.00',
              available: (Math.random() * 10000).toFixed(2),
              pendingIn: '0.00',
              pendingOut: '0.00'
            },
            LIVO: {
              balance: (Math.random() * 1000).toFixed(2),
              pendingIn: '0.00',
              pendingOut: '0.00'
            }
          }
          
          set({
            balances: balance,
            isLoading: false
          })
        } catch (error: any) {
          console.error('Error fetching balances:', error)
          set({
            error: error.message,
            isLoading: false
          })
        }
      },
      
      fetchTransactions: async (address: string) => {
        set({ isLoading: true })
        
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Mock transactions
          const mockTransactions: Transaction[] = [
            {
              id: '1',
              from: address,
              to: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
              amount: '100.00',
              token: 'BZR',
              type: 'sent',
              status: 'completed',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              txHash: '0x' + Math.random().toString(16).substring(2, 66)
            },
            {
              id: '2',
              from: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
              to: address,
              amount: '50.00',
              token: 'LIVO',
              type: 'received',
              status: 'completed',
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              txHash: '0x' + Math.random().toString(16).substring(2, 66)
            }
          ]
          
          set({
            transactions: mockTransactions,
            isLoading: false
          })
        } catch (error: any) {
          console.error('Error fetching transactions:', error)
          set({
            error: error.message,
            isLoading: false
          })
        }
      },
      
      sendTransaction: async (params) => {
        set({ isSending: true, error: null })
        
        try {
          // Mock transaction
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          const txHash = '0x' + Math.random().toString(16).substring(2, 66)
          
          // Update balance (mock)
          const currentBalance = get().balances
          if (currentBalance) {
            const updatedBalance = { ...currentBalance }
            if (params.token === 'BZR') {
              const newAmount = parseFloat(updatedBalance.BZR.available) - parseFloat(params.amount)
              updatedBalance.BZR.available = newAmount.toFixed(2)
              updatedBalance.BZR.free = newAmount.toFixed(2)
            } else {
              const newAmount = parseFloat(updatedBalance.LIVO.balance) - parseFloat(params.amount)
              updatedBalance.LIVO.balance = newAmount.toFixed(2)
            }
            set({ balances: updatedBalance })
          }
          
          // Add to transactions
          const newTransaction: Transaction = {
            id: Date.now().toString(),
            from: get().activeAccount?.address || '',
            to: params.to,
            amount: params.amount,
            token: params.token,
            type: 'sent',
            status: 'completed',
            timestamp: new Date().toISOString(),
            txHash
          }
          
          set({
            transactions: [newTransaction, ...get().transactions],
            isSending: false
          })
          
          return txHash
        } catch (error: any) {
          console.error('Error sending transaction:', error)
          set({
            error: error.message,
            isSending: false
          })
          return null
        }
      },
      
      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'bazari-wallet-store',
      partialize: (state) => ({
        vaultCreated: state.vaultCreated,
        isUnlocked: state.isUnlocked
      })
    }
  )
)