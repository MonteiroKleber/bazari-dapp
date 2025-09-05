// Arquivo: apps/web/src/store/auth.ts
// Store de gerenciamento de autenticação

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  
  // Ações
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
          console.log('Starting login process...')
          
          // Importar o store de wallet
          const { getState } = useWalletStore
          const walletState = getState()
          
          if (!walletState.activeAccount) {
            throw new Error('Nenhuma conta ativa na carteira')
          }
          
          const walletAddress = walletState.activeAccount.address
          console.log('Wallet address:', walletAddress)
          
          // 1. Solicitar nonce do backend
          console.log('Requesting nonce from backend...')
          const nonceResponse = await fetch(`${API_URL}/api/auth/nonce`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress })
          })
          
          if (!nonceResponse.ok) {
            const error = await nonceResponse.json()
            throw new Error(error.message || 'Falha ao obter nonce')
          }
          
          const { message, nonce } = await nonceResponse.json()
          console.log('Received nonce:', nonce)
          console.log('Message to sign:', message)
          
          // 2. Assinar mensagem com a wallet
          console.log('Signing message with wallet...')
          const signature = await walletState.signMessage(walletAddress, message)
          console.log('Signature generated:', signature)
          
          // 3. Fazer login com assinatura
          console.log('Sending login request...')
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
            throw new Error(error.message || 'Falha no login')
          }
          
          const { user, token } = await loginResponse.json()
          console.log('Login successful!', user)
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          return true
        } catch (error: any) {
          console.error('Login error:', error)
          set({
            error: error.message || 'Falha no login',
            isLoading: false,
            isAuthenticated: false
          })
          return false
        }
      },
      
      register: async (data) => {
        try {
          set({ isLoading: true, error: null })
          console.log('Starting registration process...')
          
          // Importar o store de wallet
          const { getState } = useWalletStore
          const walletState = getState()
          
          if (!walletState.activeAccount) {
            throw new Error('Nenhuma conta ativa na carteira')
          }
          
          const walletAddress = walletState.activeAccount.address
          console.log('Wallet address:', walletAddress)
          
          // 1. Solicitar nonce do backend
          console.log('Requesting nonce from backend...')
          const nonceResponse = await fetch(`${API_URL}/api/auth/nonce`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress })
          })
          
          if (!nonceResponse.ok) {
            const errorText = await nonceResponse.text()
            console.error('Nonce request failed:', errorText)
            
            // Tentar parsear como JSON
            try {
              const error = JSON.parse(errorText)
              throw new Error(error.message || 'Falha ao obter nonce')
            } catch {
              throw new Error('Falha ao obter nonce: ' + errorText)
            }
          }
          
          const { message, nonce } = await nonceResponse.json()
          console.log('Received nonce:', nonce)
          console.log('Message to sign:', message)
          
          // 2. Assinar mensagem com a wallet
          console.log('Signing message with wallet...')
          const signature = await walletState.signMessage(walletAddress, message)
          console.log('Signature generated:', signature)
          
          // 3. Registrar com assinatura
          console.log('Sending registration request with data:', {
            walletAddress,
            username: data.username,
            email: data.email,
            termsAccepted: data.termsAccepted,
            termsVersion: data.termsVersion
          })
          
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
            const errorText = await registerResponse.text()
            console.error('Registration failed:', errorText)
            
            try {
              const error = JSON.parse(errorText)
              throw new Error(error.message || 'Falha no registro')
            } catch {
              throw new Error('Falha no registro: ' + errorText)
            }
          }
          
          const { user, token } = await registerResponse.json()
          console.log('Registration successful!', user)
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          return true
        } catch (error: any) {
          console.error('Registration error:', error)
          set({
            error: error.message || 'Falha no registro',
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
            // Notificar backend do logout
            await fetch(`${API_URL}/api/auth/logout`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }).catch(() => {}) // Ignorar erros no logout
          }
          
          // Bloquear wallet
          const { getState } = useWalletStore
          const walletState = getState()
          await walletState.lockVault()
          
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
          
          if (response.ok) {
            const { token: newToken } = await response.json()
            set({ token: newToken })
          }
        } catch (error) {
          console.error('Failed to refresh token:', error)
        }
      },
      
      updateProfile: async (data: Partial<User>) => {
        const { token, user } = get()
        if (!token || !user) return
        
        try {
          set({ isLoading: true })
          
          const response = await fetch(`${API_URL}/api/users/${user.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
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
      
      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'bazari-auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Import do store de wallet (deve estar no mesmo diretório)
import { useWalletStore } from './wallet'