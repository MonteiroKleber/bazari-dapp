// apps/web/src/store/auth.ts
// Auth Store com Cookie-Based Authentication (Zero-Knowledge)
// ✅ Sem token em localStorage (prevenção XSS)
// ✅ Usa cookies httpOnly via credentials: 'include'
// ✅ Corrige lockVault() → lock()

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useWalletStore } from './wallet'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

interface User {
  id: string
  walletAddress: string
  username?: string
  email?: string
  createdAt: string
  updatedAt: string
  role?: string
}

interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Session management (no token stored!)
  lastCheckAt: number
  
  // Actions
  login: (password: string) => Promise<void>
  register: (password: string, username?: string, email?: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  refreshSession: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  clearError: () => void
  importWallet: (seedPhrase: string, password: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      lastCheckAt: 0,
      
      // Login with zero-knowledge proof
      login: async (password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const walletStore = useWalletStore.getState()
          
          // 1. Unlock wallet locally
          await walletStore.unlock(password)
          
          const address = walletStore.activeAccount?.address
          if (!address) {
            throw new Error('No wallet found')
          }
          
          // 2. Get nonce from server
          const nonceResponse = await fetch(`${API_URL}/api/auth/nonce`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Critical for cookies
            body: JSON.stringify({ walletAddress: address })
          })
          
          if (!nonceResponse.ok) {
            throw new Error('Failed to get nonce')
          }
          
          const { nonce } = await nonceResponse.json()
          
          // 3. Create and sign message
          const message = JSON.stringify({
            action: 'login',
            timestamp: new Date().toISOString(),
            nonce,
            domain: window.location.origin
          })
          
          const signature = await walletStore.signMessage(message)
          
          // 4. Login with signature (NO PASSWORD!)
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Cookie will be set
            body: JSON.stringify({
              walletAddress: address,
              signature,
              message
              // ❌ NO password sent!
            })
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Login failed')
          }
          
          const { user } = await response.json()
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            lastCheckAt: Date.now()
          })
          
          console.log('✅ Logged in with zero-knowledge proof')
        } catch (error: any) {
          // Lock wallet on error
          const walletStore = useWalletStore.getState()
          walletStore.lock() // ✅ Fixed: was lockVault()
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message
          })
          
          throw error
        }
      },
      
      // Register with zero-knowledge
      register: async (password: string, username?: string, email?: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const walletStore = useWalletStore.getState()
          
          // 1. Create wallet locally
          const { address } = await walletStore.createWallet(password)
          
          // 2. Get nonce
          const nonceResponse = await fetch(`${API_URL}/api/auth/nonce`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ walletAddress: address })
          })
          
          if (!nonceResponse.ok) {
            throw new Error('Failed to get nonce')
          }
          
          const { nonce } = await nonceResponse.json()
          
          // 3. Sign message
          const message = JSON.stringify({
            action: 'register',
            timestamp: new Date().toISOString(),
            nonce,
            domain: window.location.origin
          })
          
          const signature = await walletStore.signMessage(message)
          
          // 4. Register with signature only
          const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Cookie will be set
            body: JSON.stringify({
              walletAddress: address,
              signature,
              message,
              username,
              email
              // ❌ NO seed or password!
            })
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Registration failed')
          }
          
          const { user } = await response.json()
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            lastCheckAt: Date.now()
          })
          
          console.log('✅ Registered with zero-knowledge proof')
        } catch (error: any) {
          const walletStore = useWalletStore.getState()
          walletStore.lock()
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message
          })
          
          throw error
        }
      },
      
      // Import wallet
      importWallet: async (seedPhrase: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const walletStore = useWalletStore.getState()
          
          // 1. Import wallet locally
          const { address } = await walletStore.importWallet(seedPhrase, password)
          
          // 2-4. Same flow as login
          const nonceResponse = await fetch(`${API_URL}/api/auth/nonce`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ walletAddress: address })
          })
          
          if (!nonceResponse.ok) {
            throw new Error('Failed to get nonce')
          }
          
          const { nonce } = await nonceResponse.json()
          
          const message = JSON.stringify({
            action: 'import',
            timestamp: new Date().toISOString(),
            nonce,
            domain: window.location.origin
          })
          
          const signature = await walletStore.signMessage(message)
          
          const response = await fetch(`${API_URL}/api/auth/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              walletAddress: address,
              signature,
              message
            })
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Import failed')
          }
          
          const { user } = await response.json()
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            lastCheckAt: Date.now()
          })
        } catch (error: any) {
          const walletStore = useWalletStore.getState()
          walletStore.lock()
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message
          })
          
          throw error
        }
      },
      
      // Logout
      logout: async () => {
        set({ isLoading: true })
        
        try {
          // Notify backend to clear session cookie
          await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include' // Important for cookie
          })
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          // Always clear local state
          const walletStore = useWalletStore.getState()
          walletStore.lock() // ✅ Fixed: was lockVault()
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },
      
      // Check authentication status
      checkAuth: async () => {
        try {
          const response = await fetch(`${API_URL}/api/auth/me`, {
            method: 'GET',
            credentials: 'include' // Use cookie
          })
          
          if (response.ok) {
            const { user } = await response.json()
            
            set({
              user,
              isAuthenticated: true,
              lastCheckAt: Date.now()
            })
          } else {
            set({
              user: null,
              isAuthenticated: false
            })
          }
        } catch (error) {
          console.error('Auth check error:', error)
          set({
            user: null,
            isAuthenticated: false
          })
        }
      },
      
      // Refresh session
      refreshSession: async () => {
        try {
          const response = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
          })
          
          if (!response.ok) {
            throw new Error('Session refresh failed')
          }
          
          set({ lastCheckAt: Date.now() })
        } catch (error) {
          console.error('Session refresh error:', error)
          // If refresh fails, logout
          await get().logout()
        }
      },
      
      // Update profile
      updateProfile: async (data: Partial<User>) => {
        const { user } = get()
        if (!user) return
        
        set({ isLoading: true })
        
        try {
          const response = await fetch(`${API_URL}/api/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Use cookie
            body: JSON.stringify(data)
          })
          
          if (!response.ok) {
            throw new Error('Failed to update profile')
          }
          
          const updatedUser = await response.json()
          
          set({
            user: updatedUser,
            isLoading: false
          })
        } catch (error: any) {
          set({
            error: error.message,
            isLoading: false
          })
        }
      },
      
      // Clear error
      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'bazari-auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
        // ❌ NO token stored!
      })
    }
  )
)

// Auto-check auth on app start (call in App.tsx)
export async function initializeAuth() {
  const store = useAuthStore.getState()
  await store.checkAuth()
  
  // Refresh session every 5 minutes
  setInterval(async () => {
    if (store.isAuthenticated) {
      await store.refreshSession()
    }
  }, 5 * 60 * 1000)
  
  console.log('✅ Auth initialized with cookie-based sessions')
}