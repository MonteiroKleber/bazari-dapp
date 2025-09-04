import { useEffect, useState } from 'react'
import { useWalletStore } from '@store/wallet'
import { useAuthStore } from '@store/auth'

export function useWallet() {
  const walletStore = useWalletStore()
  const authStore = useAuthStore()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initWallet = async () => {
      try {
        // Check if vault exists
        const hasVault = await walletStore.hasVault()
        
        // If authenticated but wallet locked, try to unlock
        if (authStore.isAuthenticated && hasVault && !walletStore.isUnlocked) {
          // This would typically prompt for password
          // For now, just set as ready
          setIsReady(true)
        } else {
          setIsReady(true)
        }
      } catch (error) {
        console.error('Failed to initialize wallet:', error)
        setIsReady(true)
      }
    }
    
    initWallet()
  }, [authStore.isAuthenticated])

  return {
    ...walletStore,
    isReady,
    isConnected: walletStore.isUnlocked && walletStore.activeAccount !== null,
    address: walletStore.activeAccount?.address || null,
    shortAddress: walletStore.activeAccount
      ? `${walletStore.activeAccount.address.slice(0, 6)}...${walletStore.activeAccount.address.slice(-4)}`
      : null,
    formatBalance: (amount: string, decimals = 12) => {
      const value = parseFloat(amount) / Math.pow(10, decimals)
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      }).format(value)
    }
  }
}