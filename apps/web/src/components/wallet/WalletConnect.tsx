// apps/web/src/components/wallet/WalletConnect.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Wallet, ChevronRight } from 'lucide-react'
import { useStore } from '@/store'

interface WalletConnectProps {
  variant?: 'default' | 'compact'
}

export function WalletConnect({ variant = 'default' }: WalletConnectProps) {
  const { t } = useTranslation()
  const { wallet, connectWallet, disconnectWallet } = useStore()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connectWallet()
    } finally {
      setIsConnecting(false)
    }
  }

  if (wallet?.connected) {
    return (
      <div className="flex items-center gap-2 bg-bazari-black/50 border border-bazari-red/20 rounded-xl px-4 py-2">
        <span className="text-sm text-bazari-sand">{wallet.bzrBalance} BZR</span>
        <button
          onClick={disconnectWallet}
          className="ml-2 px-3 py-1 text-sm bg-bazari-red/20 text-bazari-sand rounded-lg hover:bg-bazari-red/30 transition-colors"
        >
          {t('actions.disconnect')}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-bazari-red to-bazari-gold text-bazari-sand rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Wallet className="h-4 w-4" />
      <span>{isConnecting ? t('status.connecting') : t('actions.connectWallet')}</span>
      <ChevronRight className="h-4 w-4" />
    </button>
  )
}