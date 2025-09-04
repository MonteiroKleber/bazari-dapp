import { useState } from 'react'
import { Wallet, ChevronRight } from 'lucide-react'
import { useStore } from '@/store'

export function WalletConnect() {
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
          className="ml-2 px-3 py-1 text-sm bg-bazari-red/20 text-bazari-sand rounded-lg"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-bazari-red to-bazari-gold text-bazari-sand rounded-xl"
    >
      <Wallet className="h-4 w-4" />
      <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
      <ChevronRight className="h-4 w-4" />
    </button>
  )
}
