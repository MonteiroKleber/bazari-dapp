import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import WalletCore from '@bazari/wallet-core'

interface User {
  id: string
  walletAddress: string
  username?: string
  email?: string
  name?: string
  bio?: string
  avatar?: string
  role: string
  verified: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: () => Promise<boolean>
  register: (data: {
    username?: string
    email?: string
    termsAccepted: boolean
    termsVersion: string
  }) => Promise<boolean>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  clearError: () => void
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async () => {
        try {
          set({ isLoading: true, error: null })
          
          // Get wallet instance
          const wallet = new WalletCore()
          await wallet.init()
          
          const accounts = await wallet.getAccounts()
          if (accounts.length === 0) {
            throw new Error('No accounts found in wallet')
          }
          
          const activeAccount = accounts[0]
          const walletAddress = activeAccount.address
          
          // Request nonce from backend
          const nonceResponse = await fetch(`${API_URL}/api/auth/nonce`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress })
          })
          
          if (!nonceResponse.ok) {
            throw new Error('Failed to get nonce')
          }
          
          const { message, nonce } = await nonceResponse.json()
          
          // Sign message with wallet
          const signature = await wallet.signMessage(walletAddress, message)
          
          // Login with signature
          const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletAddress,
              signature,
              message
            })
          })
          
          if (!loginResponse.ok) {
            const error = await loginResponse.json()
            throw new Error(error.message || 'Login failed')
          }
          
          const { user, token } = await loginResponse.json()
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          return true
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
            isAuthenticated: false
          })
          return false
        }
      },
      
      register: async (data) => {
        try {
          set({ isLoading: true, error: null })
          
          // Get wallet instance
          const wallet = new WalletCore()
          await wallet.init()
          
          const accounts = await wallet.getAccounts()
          if (accounts.length === 0) {
            throw new Error('No accounts found in wallet')
          }
          
          const activeAccount = accounts[0]
          const walletAddress = activeAccount.address
          
          // Request nonce
          const nonceResponse = await fetch(`${API_URL}/api/auth/nonce`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress })
          })
          
          if (!nonceResponse.ok) {
            throw new Error('Failed to get nonce')
          }
          
          const { message, nonce } = await nonceResponse.json()
          
          // Sign message
          const signature = await wallet.signMessage(walletAddress, message)
          
          // Register with signature
          const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletAddress,
              signature,
              message,
              username: data.username,
              email: data.email,
              termsAccepted: data.termsAccepted,
              termsVersion: data.termsVersion
            })
          })
          
          if (!registerResponse.ok) {
            const error = await registerResponse.json()
            throw new Error(error.message || 'Registration failed')
          }
          
          const { user, token } = await registerResponse.json()
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          return true
        } catch (error: any) {
          set({
            error: error.message || 'Registration failed',
            isLoading: false,
            isAuthenticated: false
          })
          return false
        }
      },
      
      logout: async () => {
        try {
          set({ isLoading: true })
          
          const { token } = get()
          if (token) {
            // Notify backend of logout
            await fetch(`${API_URL}/api/auth/logout`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }).catch(() => {}) // Ignore errors on logout
          }
          
          // Lock wallet
          const wallet = new WalletCore()
          await wallet.init()
          await wallet.lockVault()
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            error: error.message,
            isLoading: false
          })
        }
      },
      
      refreshToken: async () => {
        const { token } = get()
        if (!token) return
        
        try {
          const response = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (!response.ok) throw new Error('Failed to refresh token')
          
          const { token: newToken } = await response.json()
          set({ token: newToken })
        } catch (error: any) {
          // If refresh fails, logout
          get().logout()
        }
      },
      
      updateProfile: async (data) => {
        const { token, user } = get()
        if (!token || !user) throw new Error('Not authenticated')
        
        try {
          set({ isLoading: true, error: null })
          
          const response = await fetch(`${API_URL}/api/users/${user.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to update profile')
          }
          
          const updatedUser = await response.json()
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            error: error.message,
            isLoading: false
          })
          throw error
        }
      },
      
      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user
      })
    }
  )
)

// Auto refresh token
setInterval(() => {
  const { refreshToken, isAuthenticated } = useAuthStore.getState()
  if (isAuthenticated) {
    refreshToken()
  }
}, 10 * 60 * 1000) // Every 10 minutes