import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/auth'
import { useWalletStore } from '@store/wallet'

export function useAuth() {
  const navigate = useNavigate()
  const authStore = useAuthStore()
  const walletStore = useWalletStore()
  
  useEffect(() => {
    // Check if token is still valid on mount
    if (authStore.token) {
      authStore.refreshToken()
    }
  }, [])
  
  const logout = async () => {
    await authStore.logout()
    await walletStore.lockVault()
    navigate('/auth')
  }
  
  return {
    ...authStore,
    logout
  }
}

export function useRequireAuth() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth')
    }
  }, [isAuthenticated, navigate])
  
  return isAuthenticated
}