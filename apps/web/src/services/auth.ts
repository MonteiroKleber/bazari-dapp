// apps/web/src/services/auth.ts
// Serviço de autenticação com segurança completa

import { useWalletStore } from '@/store/wallet'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

interface AuthResponse {
  success: boolean
  token?: string
  user?: {
    id: string
    walletAddress: string
  }
  error?: string
  message?: string
}

class AuthService {
  private token: string | null = null
  
  constructor() {
    // Load token from localStorage
    this.token = localStorage.getItem('bazari_token')
  }
  
  /**
   * Generate nonce for signature
   */
  private generateNonce(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
  
  /**
   * Create message for signing
   */
  private createSignMessage(action: string): string {
    return JSON.stringify({
      action,
      timestamp: new Date().toISOString(),
      nonce: this.generateNonce(),
      domain: window.location.origin
    })
  }
  
  /**
   * Set auth token
   */
  private setToken(token: string): void {
    this.token = token
    localStorage.setItem('bazari_token', token)
  }
  
  /**
   * Clear auth token
   */
  private clearToken(): void {
    this.token = null
    localStorage.removeItem('bazari_token')
  }
  
  /**
   * Get auth headers
   */
  getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    
    return headers
  }
  
  /**
   * Register new user
   */
  async register(password: string): Promise<AuthResponse> {
    try {
      // Create wallet
      const walletStore = useWalletStore.getState()
      const { mnemonic, address } = await walletStore.createWallet(password)
      
      // Create and sign message
      const message = this.createSignMessage('register')
      const signature = await walletStore.signMessage(message)
      
      // Register with backend
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          signature,
          message,
          seed: mnemonic, // Backend will encrypt this
          password // Backend will use this for additional encryption
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }
      
      if (data.token) {
        this.setToken(data.token)
      }
      
      return data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }
  
  /**
   * Login existing user
   */
  async login(address: string, password: string): Promise<AuthResponse> {
    try {
      // Create and sign message
      const message = this.createSignMessage('login')
      
      // Get wallet store and unlock
      const walletStore = useWalletStore.getState()
      
      // If wallet not initialized, we need to fetch encrypted seed from backend first
      if (!walletStore.isInitialized) {
        // First, make a pre-auth request to check if user exists
        const checkResponse = await fetch(`${API_URL}/auth/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address })
        })
        
        if (!checkResponse.ok) {
          throw new Error('Usuário não encontrado')
        }
      }
      
      // Unlock wallet and sign
      await walletStore.unlock(password)
      const signature = await walletStore.signMessage(message)
      
      // Login with backend
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          signature,
          message,
          password // Backend will verify password against encrypted seed
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        walletStore.lock() // Lock wallet on failed login
        throw new Error(data.message || 'Login failed')
      }
      
      if (data.token) {
        this.setToken(data.token)
      }
      
      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }
  
  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call backend logout
      if (this.token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: this.getAuthHeaders()
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local state regardless of backend response
      this.clearToken()
      
      // Lock wallet
      const walletStore = useWalletStore.getState()
      walletStore.lock()
    }
  }
  
  /**
   * Verify if user is authenticated
   */
  async verifyAuth(): Promise<boolean> {
    if (!this.token) {
      return false
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })
      
      if (!response.ok) {
        this.clearToken()
        return false
      }
      
      return true
    } catch (error) {
      console.error('Auth verification error:', error)
      this.clearToken()
      return false
    }
  }
  
  /**
   * Get current auth token
   */
  getToken(): string | null {
    return this.token
  }
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.token !== null
  }
  
  /**
   * Recover wallet seed (requires password)
   */
  async recoverSeed(password: string): Promise<string> {
    if (!this.token) {
      throw new Error('Not authenticated')
    }
    
    try {
      const response = await fetch(`${API_URL}/wallet/seed`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'X-Wallet-Password': password
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to recover seed')
      }
      
      // Decrypt the transport-encrypted seed
      const transportKey = Uint8Array.from(atob(data.transportKey), c => c.charCodeAt(0))
      const transportIv = Uint8Array.from(atob(data.transportIv), c => c.charCodeAt(0))
      const transportAuthTag = Uint8Array.from(atob(data.transportAuthTag), c => c.charCodeAt(0))
      const encryptedSeed = Uint8Array.from(atob(data.encryptedSeed), c => c.charCodeAt(0))
      
      // Import transport key
      const key = await crypto.subtle.importKey(
        'raw',
        transportKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      )
      
      // Create combined ciphertext with auth tag
      const ciphertext = new Uint8Array(encryptedSeed.length + transportAuthTag.length)
      ciphertext.set(encryptedSeed)
      ciphertext.set(transportAuthTag, encryptedSeed.length)
      
      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: transportIv
        },
        key,
        ciphertext
      )
      
      const decoder = new TextDecoder()
      return decoder.decode(decrypted)
    } catch (error) {
      console.error('Seed recovery error:', error)
      throw error
    }
  }
}

// Export singleton instance
export const authService = new AuthService()

// Export types
export type { AuthResponse }