// apps/web/src/pages/Dashboard.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Wallet, 
  Send, 
  ArrowUpRight, 
  ArrowDownLeft, 
  LogOut, 
  Copy, 
  Settings,
  Bell,
  Grid,
  TrendingUp,
  Users,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
  Plus,
  Shield,
  Key,
  Download
} from 'lucide-react'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { useAuthStore } from '@store/auth'
import { useWalletStore } from '@store/wallet'
import { useCopyToClipboard } from '@hooks/useCopyToClipboard'
import { cn } from '@lib/utils'

// Componente de Modal de Envio (integrado com blockchain)
const SendModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t } = useTranslation()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const { api, activeAccount } = useWalletStore()
  
  const handleSend = async () => {
    if (!api || !activeAccount || !recipient || !amount) return
    
    setLoading(true)
    try {
      // Integração real com blockchain
      const tx = api.tx.balances.transfer(recipient, parseFloat(amount) * 1e12)
      await tx.signAndSend(activeAccount.address)
      onClose()
    } catch (error) {
      console.error('Transfer error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-bazari-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bazari-black border border-bazari-red/20 rounded-2xl p-6 max-w-md w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-bazari-sand mb-4">{t('transaction.sendBZR')}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-bazari-sand/80 mb-2">
              {t('transaction.recipientAddress')}
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-4 py-3 bg-bazari-black/50 border border-bazari-red/30 rounded-lg text-bazari-sand focus:ring-2 focus:ring-bazari-red focus:border-transparent"
              placeholder={t('wallet.address')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-bazari-sand/80 mb-2">
              {t('transaction.amountBZR')}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-bazari-black/50 border border-bazari-red/30 rounded-lg text-bazari-sand focus:ring-2 focus:ring-bazari-red focus:border-transparent"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-bazari-red/20"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading || !recipient || !amount}
            className="flex-1 bg-bazari-red hover:bg-bazari-red/80"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.send')}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [copiedText, copy] = useCopyToClipboard()
  
  const { user, logout } = useAuthStore()
  const { 
    activeAccount, 
    balances, 
    fetchBalances, 
    api,
    isConnected 
  } = useWalletStore()
  
  const [showSendModal, setShowSendModal] = useState(false)
  const [showBalance, setShowBalance] = useState(true)
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])
  
  // Buscar balances ao montar o componente
  useEffect(() => {
    loadBalances()
    loadTransactions()
    
    // Atualizar balances a cada 30 segundos
    const interval = setInterval(() => {
      loadBalances()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [activeAccount])
  
  const loadBalances = async () => {
    if (!activeAccount) return
    
    setIsLoadingBalances(true)
    try {
      await fetchBalances()
    } catch (error) {
      console.error('Error loading balances:', error)
    } finally {
      setIsLoadingBalances(false)
    }
  }
  
  const loadTransactions = async () => {
    if (!api || !activeAccount) return
    
    try {
      // Buscar transações reais da blockchain
      const lastHeader = await api.rpc.chain.getHeader()
      const blockNumber = lastHeader.number.toNumber()
      
      const txs = []
      // Buscar últimos 10 blocos
      for (let i = Math.max(0, blockNumber - 10); i <= blockNumber; i++) {
        const blockHash = await api.rpc.chain.getBlockHash(i)
        const block = await api.rpc.chain.getBlock(blockHash)
        
        block.block.extrinsics.forEach((ex, index) => {
          const { method: { args, method, section } } = ex
          
          if (section === 'balances' && method === 'transfer') {
            const [to, amount] = args
            const from = ex.signer?.toString()
            
            if (from === activeAccount.address || to.toString() === activeAccount.address) {
              txs.push({
                hash: ex.hash.toString(),
                type: to.toString() === activeAccount.address ? 'receive' : 'send',
                from,
                to: to.toString(),
                amount: amount.toString(),
                timestamp: new Date().toISOString(),
                status: 'confirmed'
              })
            }
          }
        })
      }
      
      setTransactions(txs.reverse())
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }
  
  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }
  
  const handleCopyAddress = () => {
    if (activeAccount) {
      copy(activeAccount.address)
    }
  }
  
  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }
  
  const formatBalance = (balance: any) => {
    if (!balance) return '0.00'
    const value = parseFloat(balance) / 1e12
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  }
  
  return (
    <div className="min-h-screen bg-bazari-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-bazari-red to-bazari-gold shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">{t('dashboard.title')}</h1>
              
              <div className="flex items-center space-x-2 text-sm">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="text-xs text-bazari-sand/60">
                  {isConnected ? t('status.connected') : t('status.disconnected')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-bazari-sand/60 hover:text-bazari-gold hover:bg-bazari-gold/10"
              >
                <Bell className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-bazari-sand/60 hover:text-bazari-gold hover:bg-bazari-gold/10"
              >
                <Settings className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-bazari-red hover:text-bazari-red/80 hover:bg-bazari-red/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('actions.exit')}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Wallet Info Card */}
        <Card className="mb-6 border-bazari-red/20 bg-gradient-to-br from-bazari-black to-bazari-black/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-bazari-sand">{t('wallet.myMainWallet')}</CardTitle>
                <CardDescription className="text-bazari-sand/60">
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="font-mono">{formatAddress(activeAccount?.address || '')}</span>
                    <button
                      onClick={handleCopyAddress}
                      className="text-bazari-gold hover:text-bazari-gold/80 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {copiedText && (
                      <span className="text-xs text-green-500 animate-pulse">{t('common.copied')}</span>
                    )}
                  </div>
                </CardDescription>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-bazari-sand/60 hover:text-bazari-gold hover:bg-bazari-gold/10"
                >
                  {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={loadBalances}
                  disabled={isLoadingBalances}
                  className="text-bazari-sand/60 hover:text-bazari-gold hover:bg-bazari-gold/10"
                >
                  <RefreshCw className={cn("w-5 h-5", isLoadingBalances && "animate-spin")} />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Balances Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* BZR Balance */}
              <div className="bg-bazari-black/50 rounded-xl p-4 border border-bazari-red/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-bazari-sand/60">BZR</span>
                  <span className="text-xs bg-bazari-red/20 text-bazari-red px-2 py-1 rounded">{t('wallet.native')}</span>
                </div>
                <div className="text-2xl font-bold text-bazari-sand">
                  {showBalance ? formatBalance(balances?.BZR?.available || '0') : '••••'}
                </div>
                <div className="text-xs text-bazari-sand/50 mt-1">
                  ≈ $ {showBalance ? '0.00' : '••••'}
                </div>
              </div>
              
              {/* LIVO Balance */}
              <div className="bg-bazari-black/50 rounded-xl p-4 border border-bazari-gold/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-bazari-sand/60">LIVO</span>
                  <span className="text-xs bg-bazari-gold/20 text-bazari-gold px-2 py-1 rounded">{t('dashboard.cashback')}</span>
                </div>
                <div className="text-2xl font-bold text-bazari-sand">
                  {showBalance ? formatBalance(balances?.LIVO?.balance || '0') : '••••'}
                </div>
                <div className="text-xs text-bazari-sand/50 mt-1">
                  ≈ $ {showBalance ? '0.00' : '••••'}
                </div>
              </div>
              
              {/* Total Value */}
              <div className="bg-gradient-to-br from-bazari-red/20 to-bazari-gold/20 rounded-xl p-4 border border-bazari-red/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-bazari-sand/60">{t('dashboard.totalBalance')}</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-bazari-sand">
                  $ {showBalance ? '0.00' : '••••'}
                </div>
                <div className="text-xs text-green-500 mt-1">
                  +0.00% (24h)
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowSendModal(true)}
                className="flex-1 bg-bazari-red hover:bg-bazari-red/80"
              >
                <Send className="w-4 h-4 mr-2" />
                {t('common.send')}
              </Button>
              
              <Button
                variant="outline"
                className="flex-1 border-bazari-gold/30 hover:bg-bazari-gold/10"
              >
                <ArrowDownLeft className="w-4 h-4 mr-2" />
                {t('common.receive')}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/wallet')}
                className="flex-1 border-bazari-red/30 hover:bg-bazari-red/10"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {t('common.manage')}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Transactions */}
        <Card className="border-bazari-red/20 bg-bazari-black/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-bazari-sand">{t('dashboard.recentActivity')}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/wallet')}
                className="text-bazari-gold hover:text-bazari-gold/80"
              >
                {t('common.viewAll')}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 text-bazari-sand/30 mx-auto mb-3" />
                <p className="text-bazari-sand/50">{t('dashboard.noTransactions')}</p>
                <p className="text-sm text-bazari-sand/30 mt-1">{t('dashboard.startTransacting')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx, index) => (
                  <div
                    key={tx.hash}
                    className="flex items-center justify-between p-3 rounded-lg bg-bazari-black/30 hover:bg-bazari-black/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {tx.type === 'send' ? (
                        <ArrowUpRight className="w-5 h-5 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5 text-green-500" />
                      )}
                      
                      <div>
                        <p className="text-sm font-medium text-bazari-sand">
                          {tx.type === 'send' ? t('transaction.sent') : t('transaction.received')}
                        </p>
                        <p className="text-xs text-bazari-sand/50">
                          {formatAddress(tx.type === 'send' ? tx.to : tx.from)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={cn(
                        "font-bold",
                        tx.type === 'send' ? "text-red-500" : "text-green-500"
                      )}>
                        {tx.type === 'send' ? '-' : '+'} {formatBalance(tx.amount)} BZR
                      </p>
                      <p className="text-xs text-bazari-sand/50">
                        {new Date(tx.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      {/* Send Modal */}
      <SendModal isOpen={showSendModal} onClose={() => setShowSendModal(false)} />
    </div>
  )
}