import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  Send, 
  QrCode, 
  Copy, 
  Eye, 
  EyeOff,
  Plus,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Settings,
  Key,
  Download,
  Upload,
  Shield,
  Loader2
} from 'lucide-react'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { useWalletStore } from '@store/wallet'
import { useAuthStore } from '@store/auth'
import { useCopyToClipboard } from '@hooks/useCopyToClipboard'
import { cn, formatCurrency, truncateAddress } from '@lib/utils'
import QRCodeModal from '@components/wallet/QRCodeModal'
import { SendModal } from '@components/wallet/SendModal'
import AccountModal from '@components/wallet/AccountModal'
import TransactionList from '@components/wallet/TransactionList'

export default function WalletPage() {
  const { t, i18n } = useTranslation()
  const [copiedText, copy] = useCopyToClipboard()
  
  const { user } = useAuthStore()
  const { 
    accounts,
    activeAccount,
    balances,
    transactions,
    isLoading,
    fetchBalances,
    fetchTransactions,
    setActiveAccount,
    createAccount
  } = useWalletStore()
  
  const [showBalance, setShowBalance] = useState(true)
  const [showQRCode, setShowQRCode] = useState(false)
  const [showSend, setShowSend] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [selectedToken, setSelectedToken] = useState<'BZR' | 'LIVO'>('BZR')
  
  useEffect(() => {
    if (activeAccount) {
      fetchBalances(activeAccount.address)
      fetchTransactions(activeAccount.address)
    }
  }, [activeAccount])
  
  const handleCopyAddress = () => {
    if (activeAccount) {
      copy(activeAccount.address)
    }
  }
  
  const handleRefresh = () => {
    if (activeAccount) {
      fetchBalances(activeAccount.address)
      fetchTransactions(activeAccount.address)
    }
  }
  
  const tokens = [
    {
      symbol: 'BZR',
      name: 'Bazari',
      balance: balances?.BZR?.available || '0',
      value: parseFloat(balances?.BZR?.available || '0') * 0.5, // Mock price
      icon: '🔴',
      color: 'text-bazari-red'
    },
    {
      symbol: 'LIVO',
      name: 'Cashback',
      balance: balances?.LIVO?.balance || '0',
      value: parseFloat(balances?.LIVO?.balance || '0') * 0.1, // Mock price
      icon: '🟡',
      color: 'text-bazari-gold'
    }
  ]
  
  return (
    <div className="min-h-screen bg-bazari-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-bazari-red to-bazari-gold p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Wallet className="w-6 h-6 mr-2" />
              {t('wallet.title')}
            </h1>
            
            <div className="flex items-center space-x-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleRefresh}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowAccountModal(true)}
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Account Selector */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white/60 text-sm mb-1">{t('wallet.activeAccount')}</p>
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-white">
                    {activeAccount?.name || 'Account 1'}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-white/80 text-sm font-mono">
                      {activeAccount ? truncateAddress(activeAccount.address) : '...'}
                    </span>
                    <button
                      onClick={handleCopyAddress}
                      className="text-white/60 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-white/60 hover:text-white"
              >
                {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {copiedText && (
              <div className="mt-2 text-xs text-green-400">
                {t('common.copied')}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto p-6">
        {/* Balance Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {tokens.map((token) => (
            <Card key={token.symbol} className="border-bazari-red/20 bg-bazari-black/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{token.icon}</span>
                    <div>
                      <h3 className="font-semibold text-bazari-sand">{token.symbol}</h3>
                      <p className="text-sm text-bazari-sand/60">{token.name}</p>
                    </div>
                  </div>
                  
                  {token.symbol === 'BZR' && (
                    <div className="px-2 py-1 bg-bazari-red/20 rounded-lg">
                      <span className="text-xs text-bazari-red">{t('wallet.native')}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-bazari-sand/60 mb-1">{t('wallet.balance')}</p>
                      <p className={cn(
                        "text-2xl font-bold",
                        token.color,
                        !showBalance && "blur-sm select-none"
                      )}>
                        {showBalance ? token.balance : '••••••'} {token.symbol}
                      </p>
                    </div>
                    
                    <p className={cn(
                      "text-sm text-bazari-sand/60",
                      !showBalance && "blur-sm select-none"
                    )}>
                      ≈ ${showBalance ? token.value.toFixed(2) : '••••'}
                    </p>
                  </div>
                  
                  {token.symbol === 'BZR' && balances?.BZR && (
                    <div className="pt-2 border-t border-bazari-red/10 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-bazari-sand/60">{t('wallet.reserved')}</span>
                        <span className="text-bazari-sand">{balances.BZR.reserved} BZR</span>
                      </div>
                      {parseFloat(balances.BZR.pendingIn) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-500/60">{t('wallet.pendingIn')}</span>
                          <span className="text-green-500">+{balances.BZR.pendingIn} BZR</span>
                        </div>
                      )}
                      {parseFloat(balances.BZR.pendingOut) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-red-500/60">{t('wallet.pendingOut')}</span>
                          <span className="text-red-500">-{balances.BZR.pendingOut} BZR</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedToken(token.symbol as 'BZR' | 'LIVO')
                      setShowSend(true)
                    }}
                    className="flex-1"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    {t('wallet.send')}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedToken(token.symbol as 'BZR' | 'LIVO')
                      setShowQRCode(true)
                    }}
                    className="flex-1"
                  >
                    <QrCode className="w-4 h-4 mr-1" />
                    {t('wallet.receive')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Button
            variant="outline"
            className="border-bazari-red/20 hover:bg-bazari-red/10"
            onClick={() => setShowAccountModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('wallet.newAccount')}
          </Button>
          
          <Button
            variant="outline"
            className="border-bazari-red/20 hover:bg-bazari-red/10"
          >
            <Key className="w-4 h-4 mr-2" />
            {t('wallet.exportSeed')}
          </Button>
          
          <Button
            variant="outline"
            className="border-bazari-red/20 hover:bg-bazari-red/10"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('wallet.backup')}
          </Button>
          
          <Button
            variant="outline"
            className="border-bazari-red/20 hover:bg-bazari-red/10"
          >
            <Shield className="w-4 h-4 mr-2" />
            {t('wallet.security')}
          </Button>
        </div>
        
        {/* Transactions */}
        <Card className="border-bazari-red/20 bg-bazari-black/50">
          <CardHeader>
            <CardTitle className="text-bazari-sand">
              {t('wallet.recentTransactions')}
            </CardTitle>
            <CardDescription className="text-bazari-sand/60">
              {t('wallet.transactionsDescription')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <TransactionList 
              transactions={transactions}
              currentAddress={activeAccount?.address}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Modals */}
      {showQRCode && activeAccount && (
        <QRCodeModal
          isOpen={showQRCode}
          onClose={() => setShowQRCode(false)}
          address={activeAccount.address}
          token={selectedToken}
        />
      )}
      
      {showSend && activeAccount && (
        <SendModal
          isOpen={showSend}
          onClose={() => setShowSend(false)}
          fromAddress={activeAccount.address}
          token={selectedToken}
          balance={selectedToken === 'BZR' ? balances?.BZR?.available : balances?.LIVO?.balance}
        />
      )}
      
      {showAccountModal && (
        <AccountModal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          accounts={accounts}
          activeAccount={activeAccount}
          onSelectAccount={setActiveAccount}
          onCreateAccount={createAccount}
        />
      )}
    </div>
  )
}