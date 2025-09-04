import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import WalletCore, { Account } from '@bazari/wallet-core'
import { mnemonicGenerate } from '@polkadot/util-crypto'

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

// Wallet instance
let walletInstance: WalletCore | null = null

const getWalletInstance = async () => {
  if (!walletInstance) {
    walletInstance = new WalletCore()
    await walletInstance.init()
  }
  return walletInstance
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      hasVault: async () => {
        const wallet = await getWalletInstance()
        return wallet.hasVault()
      },
      
      isUnlocked: false,
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
          const seed = mnemonicGenerate(24)
          return seed
        } catch (error: any) {
          set({ error: error.message })
          throw error
        }
      },
      
      createVault: async (password: string, seed?: string) => {
        try {
          set({ isCreatingVault: true, error: null })
          
          const wallet = await getWalletInstance()
          
          // Create vault with provided seed or generate new one
          const masterSeed = await wallet.createVault(password)
          
          // Get accounts
          const accounts = await wallet.getAccounts()
          
          set({
            isCreatingVault: false,
            isUnlocked: true,
            accounts,
            activeAccount: accounts[0] || null,
            error: null
          })
          
          return true
        } catch (error: any) {
          set({
            isCreatingVault: false,
            error: error.message || 'Failed to create vault'
          })
          return false
        }
      },
      
      unlockVault: async (password: string) => {
        try {
          set({ isUnlocking: true, error: null })
          
          const wallet = await getWalletInstance()
          const result = await wallet.unlockVault(password)
          
          if (!result.success) {
            throw new Error(result.error || 'Failed to unlock vault')
          }
          
          // Get accounts
          const accounts = await wallet.getAccounts()
          
          // Get active account from storage or use first
          const storedActive = get().activeAccount
          const activeAccount = storedActive && accounts.find(a => a.address === storedActive.address) 
            ? storedActive 
            : accounts[0] || null
          
          set({
            isUnlocking: false,
            isUnlocked: true,
            accounts,
            activeAccount,
            error: null
          })
          
          // Fetch balances for active account
          if (activeAccount) {
            get().fetchBalances(activeAccount.address)
            get().fetchTransactions(activeAccount.address)
          }
          
          return true
        } catch (error: any) {
          set({
            isUnlocking: false,
            isUnlocked: false,
            error: error.message || 'Failed to unlock vault'
          })
          return false
        }
      },
      
      lockVault: async () => {
        try {
          const wallet = await getWalletInstance()
          await wallet.lockVault()
          
          set({
            isUnlocked: false,
            accounts: [],
            activeAccount: null,
            balances: null,
            transactions: [],
            error: null
          })
        } catch (error: any) {
          set({ error: error.message })
        }
      },
      
      createAccount: async (options) => {
        try {
          set({ isLoading: true, error: null })
          
          const wallet = await getWalletInstance()
          const account = await wallet.createAccount(options)
          
          const accounts = await wallet.getAccounts()
          
          set({
            isLoading: false,
            accounts,
            activeAccount: account,
            error: null
          })
          
          // Fetch balances for new account
          get().fetchBalances(account.address)
          
          return account
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to create account'
          })
          return null
        }
      },
      
      setActiveAccount: (account: Account) => {
        set({ activeAccount: account })
        
        // Fetch data for new active account
        get().fetchBalances(account.address)
        get().fetchTransactions(account.address)
      },
      
      renameAccount: async (address: string, name: string) => {
        try {
          set({ isLoading: true, error: null })
          
          const wallet = await getWalletInstance()
          await wallet.renameAccount(address, name)
          
          const accounts = await wallet.getAccounts()
          const activeAccount = get().activeAccount
          
          set({
            isLoading: false,
            accounts,
            activeAccount: activeAccount?.address === address
              ? { ...activeAccount, name }
              : activeAccount,
            error: null
          })
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to rename account'
          })
          throw error
        }
      },
      
      deleteAccount: async (address: string) => {
        try {
          set({ isLoading: true, error: null })
          
          const wallet = await getWalletInstance()
          await wallet.deleteAccount(address)
          
          const accounts = await wallet.getAccounts()
          const activeAccount = get().activeAccount
          
          set({
            isLoading: false,
            accounts,
            activeAccount: activeAccount?.address === address
              ? accounts[0] || null
              : activeAccount,
            error: null
          })
          
          // Fetch data for new active account
          const newActive = get().activeAccount
          if (newActive) {
            get().fetchBalances(newActive.address)
            get().fetchTransactions(newActive.address)
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to delete account'
          })
          throw error
        }
      },
      
      exportSeed: async (address: string, password: string) => {
        try {
          const wallet = await getWalletInstance()
          
          // First unlock with password to verify
          const unlockResult = await wallet.unlockVault(password)
          if (!unlockResult.success) {
            throw new Error('Invalid password')
          }
          
          // Export seed
          const seed = await wallet.exportSeed(address)
          return seed
        } catch (error: any) {
          throw new Error(error.message || 'Failed to export seed')
        }
      },
      
      fetchBalances: async (address: string) => {
        try {
          const response = await fetch(`${API_URL}/api/balances/${address}`)
          
          if (!response.ok) throw new Error('Failed to fetch balances')
          
          const balances = await response.json()
          
          set({ balances })
        } catch (error: any) {
          console.error('Failed to fetch balances:', error)
          // Set default balances on error
          set({
            balances: {
              BZR: {
                free: '0',
                reserved: '0',
                frozen: '0',
                available: '0',
                pendingIn: '0',
                pendingOut: '0'
              },
              LIVO: {
                balance: '0',
                pendingIn: '0',
                pendingOut: '0'
              }
            }
          })
        }
      },
      
      fetchTransactions: async (address: string) => {
        try {
          const response = await fetch(`${API_URL}/api/transactions/${address}`)
          
          if (!response.ok) throw new Error('Failed to fetch transactions')
          
          const transactions = await response.json()
          
          set({ transactions })
        } catch (error: any) {
          console.error('Failed to fetch transactions:', error)
          set({ transactions: [] })
        }
      },
      
      sendTransaction: async (params) => {
        try {
          set({ isSending: true, error: null })
          
          const activeAccount = get().activeAccount
          if (!activeAccount) throw new Error('No active account')
          
          const wallet = await getWalletInstance()
          
          // Prepare transaction
          const response = await fetch(`${API_URL}/api/transactions/prepare`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: activeAccount.address,
              ...params
            })
          })
          
          if (!response.ok) throw new Error('Failed to prepare transaction')
          
          const { transaction, nonce } = await response.json()
          
          // Sign transaction
          const signature = await wallet.signTransaction(
            activeAccount.address,
            transaction
          )
          
          // Submit transaction
          const submitResponse = await fetch(`${API_URL}/api/transactions/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transaction,
              signature,
              nonce
            })
          })
          
          if (!submitResponse.ok) throw new Error('Failed to submit transaction')
          
          const { txHash } = await submitResponse.json()
          
          // Save to local history
          await wallet.saveTransaction({
            from: activeAccount.address,
            to: params.to,
            amount: params.amount,
            token: params.token || 'BZR',
            type: 'transfer',
            status: 'pending',
            txHash
          })
          
          set({ isSending: false, error: null })
          
          // Refresh balances and transactions
          get().fetchBalances(activeAccount.address)
          get().fetchTransactions(activeAccount.address)
          
          return txHash
        } catch (error: any) {
          set({
            isSending: false,
            error: error.message || 'Failed to send transaction'
          })
          return null
        }
      },
      
      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        activeAccount: state.activeAccount
      })
    }
  )
)