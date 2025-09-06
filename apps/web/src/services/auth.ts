// apps/web/src/services/auth.ts
// Serviço de autenticação com Zero-Knowledge - SEGURO PARA PRODUÇÃO
// ⚠️ NUNCA envia seed ou senha para o backend

import { useWalletStore } from '@/store/wallet'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

interface AuthResponse {
  success: boolean
  user?: {
    id: string
    walletAddress: string
    username?: string
    email?: string
  }
  error?: string
  message?: string
}

interface NonceResponse {
  nonce: string
  timestamp: string
  message: string
}

class AuthService {
  /**
   * Get authentication nonce from server
   * This prevents replay attacks
   */
  async getNonce(walletAddress: string): Promise<NonceResponse> {
    const response = await fetch(`${API_URL}/api/auth/nonce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({ walletAddress })
    })
    
    if (!response.ok) {
      throw new Error('Failed to get nonce')
    }
    
    return response.json()
  }
  
  /**
   * Create message for signing with domain validation
   */
  private createSignMessage(action: string, nonce: string): string {
    return JSON.stringify({
      action,
      timestamp: new Date().toISOString(),
      nonce,
      domain: window.location.origin, // Critical for security
      chainId: 'bazari-mainnet' // Or testnet
    })
  }
  
  /**
   * Register new user - Zero-Knowledge approach
   * ✅ Creates wallet locally
   * ✅ Sends only address and signature
   * ❌ NEVER sends seed or password
   */
  async register(
    password: string, 
    username?: string,
    email?: string
  ): Promise<AuthResponse> {
    try {
      // 1. Create wallet locally (seed never leaves device)
      const walletStore = useWalletStore.getState()
      const { address } = await walletStore.createWallet(password)
      
      // 2. Get nonce from server
      const { nonce, message: serverMessage } = await this.getNonce(address)
      
      // 3. Create and sign message locally
      const message = this.createSignMessage('register', nonce)
      const signature = await walletStore.signMessage(message)
      
      // 4. Send ONLY public data to backend
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Use cookies for session
        body: JSON.stringify({
          walletAddress: address,
          signature,
          message,
          username,
          email,
          // ❌ REMOVED: seed, password - NEVER send these!
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        // If registration fails, lock wallet
        walletStore.lock()
        throw new Error(data.message || 'Registration failed')
      }
      
      console.log('✅ User registered with zero-knowledge proof')
      return data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }
  
  /**
   * Login existing user - Zero-Knowledge approach
   * ✅ Unlocks wallet locally with password
   * ✅ Signs challenge with local key
   * ❌ NEVER sends password to server
   */
  async login(password: string): Promise<AuthResponse> {
    try {
      const walletStore = useWalletStore.getState()
      
      // 1. Unlock wallet locally (password never leaves device)
      await walletStore.unlock(password)
      const address = walletStore.activeAccount?.address
      
      if (!address) {
        throw new Error('No wallet found')
      }
      
      // 2. Get nonce from server
      const { nonce } = await this.getNonce(address)
      
      // 3. Create and sign message locally
      const message = this.createSignMessage('login', nonce)
      const signature = await walletStore.signMessage(message)
      
      // 4. Send ONLY signature proof to backend
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Use cookies for session
        body: JSON.stringify({
          walletAddress: address,
          signature,
          message
          // ❌ REMOVED: password - NEVER send!
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        walletStore.lock() // Lock wallet on failed login
        throw new Error(data.message || 'Login failed')
      }
      
      console.log('✅ User logged in with zero-knowledge proof')
      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }
  
  /**
   * Logout user
   * Clears server session and locks wallet locally
   */
  async logout(): Promise<void> {
    try {
      // Notify backend to clear session
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include' // Important for cookies
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always lock wallet locally, regardless of server response
      const walletStore = useWalletStore.getState()
      walletStore.lock()
    }
  }
  
  /**
   * Verify if user is authenticated
   */
  async verifyAuth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        method: 'GET',
        credentials: 'include' // Use cookies
      })
      
      return response.ok
    } catch (error) {
      console.error('Auth verification error:', error)
      return false
    }
  }
  
  /**
   * Refresh authentication session
   */
  async refreshSession(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Session refresh failed')
      }
    } catch (error) {
      console.error('Session refresh error:', error)
      throw error
    }
  }
  
  /**
   * Recover wallet seed - 100% LOCAL
   * ✅ Uses encrypted seed stored locally
   * ❌ NEVER contacts server for seed
   */
  async recoverSeed(password: string): Promise<string> {
    try {
      const walletStore = useWalletStore.getState()
      
      // Get encrypted seed from local storage
      const { encryptedSeed, salt, iv } = walletStore
      
      if (!encryptedSeed || !salt || !iv) {
        throw new Error('No encrypted seed found locally')
      }
      
      // Decrypt locally using WebCrypto API
      const encoder = new TextEncoder()
      const passwordBuffer = encoder.encode(password)
      
      // Import password as key
      const passwordKey = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveKey']
      )
      
      // Derive decryption key
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: Uint8Array.from(atob(salt), c => c.charCodeAt(0)),
          iterations: 310000, // Updated to stronger iteration count
          hash: 'SHA-256'
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      )
      
      // Decrypt seed
      const encryptedBuffer = Uint8Array.from(atob(encryptedSeed), c => c.charCodeAt(0))
      const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0))
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuffer },
        key,
        encryptedBuffer
      )
      
      const decoder = new TextDecoder()
      const seed = decoder.decode(decrypted)
      
      console.log('✅ Seed recovered locally without server')
      return seed
    } catch (error) {
      console.error('Seed recovery error:', error)
      throw new Error('Failed to decrypt seed. Wrong password?')
    }
  }
  
  /**
   * Import existing wallet - Zero-Knowledge
   */
  async importWallet(
    seedPhrase: string,
    password: string
  ): Promise<AuthResponse> {
    try {
      const walletStore = useWalletStore.getState()
      
      // 1. Import wallet locally
      const { address } = await walletStore.importWallet(seedPhrase, password)
      
      // 2. Get nonce from server
      const { nonce } = await this.getNonce(address)
      
      // 3. Sign message
      const message = this.createSignMessage('import', nonce)
      const signature = await walletStore.signMessage(message)
      
      // 4. Register/login with signature only
      const response = await fetch(`${API_URL}/api/auth/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          walletAddress: address,
          signature,
          message
          // ❌ NEVER send seedPhrase!
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        walletStore.lock()
        throw new Error(data.message || 'Import failed')
      }
      
      return data
    } catch (error) {
      console.error('Import error:', error)
      throw error
    }
  }
  
  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Not authenticated')
      }
      
      return response.json()
    } catch (error) {
      console.error('Get user error:', error)
      throw error
    }
  }
}

// Export singleton instance
export const authService = new AuthService()

// Export types
export type { AuthResponse, NonceResponse }