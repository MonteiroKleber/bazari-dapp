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
        <h2 className="text-xl font-bold text-bazari-sand mb-4">Enviar BZR</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-bazari-sand/80 mb-2">
              Endereço do destinatário
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-4 py-3 bg-bazari-black/50 border border-bazari-red/30 rounded-lg text-bazari-sand focus:ring-2 focus:ring-bazari-red focus:border-transparent placeholder-bazari-sand/40"
              placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-bazari-sand/80 mb-2">
              Quantidade
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-bazari-black/50 border border-bazari-red/30 rounded-lg text-bazari-sand focus:ring-2 focus:ring-bazari-red focus:border-transparent placeholder-bazari-sand/40"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button 
            className="flex-1 bg-bazari-black/50 hover:bg-bazari-black/70 border border-bazari-gold/30 text-bazari-sand"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button 
            className="flex-1 bg-bazari-red hover:bg-bazari-red/80"
            onClick={handleSend}
            disabled={loading || !recipient || !amount}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar'}
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
                type: to.toString() === activeAccount.address ? 'received' : 'sent',
                amount: Number(amount.toString()) / 1e12,
                token: 'BZR',
                from: from.toString(),
                to: to.toString(),
                blockNumber: i,
                timestamp: new Date().toISOString(), // Aproximado
                status: 'completed'
              })
            }
          }
        })
      }
      
      setTransactions(txs.reverse()) // Mais recentes primeiro
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }
  
  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }
  
  const handleCopyAddress = () => {
    if (activeAccount?.address) {
      copy(activeAccount.address)
    }
  }
  
  const handleRefreshBalances = () => {
    loadBalances()
    loadTransactions()
  }
  
  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return (
    <div className="min-h-screen bg-bazari-black">
      {/* Header */}
      <header className="border-b border-bazari-red/20 bg-bazari-black/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-bazari-red to-bazari-gold rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-bazari-sand">Dashboard Bazari</h1>
                <p className="text-sm text-bazari-sand/60">
                  {user?.username || user?.email || 'Usuário'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status de Conexão */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-bazari-black/50 rounded-lg border border-bazari-gold/20">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isConnected ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="text-xs text-bazari-sand/60">
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              
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
                Sair
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
                <CardTitle className="text-bazari-sand">Minha Carteira Principal</CardTitle>
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
                      <span className="text-xs text-green-500 animate-pulse">Copiado!</span>
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
                  {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefreshBalances}
                  disabled={isLoadingBalances}
                  className="text-bazari-sand/60 hover:text-bazari-gold hover:bg-bazari-gold/10"
                >
                  {isLoadingBalances ? 
                    <Loader2 className="w-5 h-5 animate-spin" /> : 
                    <RefreshCw className="w-5 h-5" />
                  }
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Saldo BZR */}
              <div className="bg-bazari-black/50 rounded-xl p-4 border border-bazari-red/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-bazari-sand/60 text-sm">Saldo BZR</span>
                  <div className="w-8 h-8 bg-bazari-red/20 rounded-lg flex items-center justify-center">
                    <span className="text-bazari-red text-sm">🔴</span>
                  </div>
                </div>
                <p className={cn(
                  "text-2xl font-bold text-bazari-sand",
                  !showBalance && "blur-sm select-none"
                )}>
                  {showBalance ? 
                    `${parseFloat(balances?.BZR?.available || '0').toFixed(4)} BZR` : 
                    '••••••••'
                  }
                </p>
                <p className={cn(
                  "text-sm text-bazari-sand/50 mt-1",
                  !showBalance && "blur-sm select-none"
                )}>
                  ≈ ${showBalance ? (parseFloat(balances?.BZR?.available || '0') * 0.5).toFixed(2) : '••••'}
                </p>
              </div>
              
              {/* Saldo LIVO */}
              <div className="bg-bazari-black/50 rounded-xl p-4 border border-bazari-gold/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-bazari-sand/60 text-sm">Cashback LIVO</span>
                  <div className="w-8 h-8 bg-bazari-gold/20 rounded-lg flex items-center justify-center">
                    <span className="text-bazari-gold text-sm">🟡</span>
                  </div>
                </div>
                <p className={cn(
                  "text-2xl font-bold text-bazari-sand",
                  !showBalance && "blur-sm select-none"
                )}>
                  {showBalance ? 
                    `${parseFloat(balances?.LIVO?.balance || '0').toFixed(2)} LIVO` : 
                    '••••••••'
                  }
                </p>
                <p className={cn(
                  "text-sm text-bazari-sand/50 mt-1",
                  !showBalance && "blur-sm select-none"
                )}>
                  ≈ ${showBalance ? (parseFloat(balances?.LIVO?.balance || '0') * 0.1).toFixed(2) : '••••'}
                </p>
              </div>
              
              {/* Total Portfolio */}
              <div className="bg-gradient-to-br from-bazari-red/10 to-bazari-gold/10 rounded-xl p-4 border border-bazari-gold/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-bazari-sand/60 text-sm">Valor Total</span>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className={cn(
                  "text-2xl font-bold text-bazari-sand",
                  !showBalance && "blur-sm select-none"
                )}>
                  {showBalance ? 
                    `$${(
                      (parseFloat(balances?.BZR?.available || '0') * 0.5) +
                      (parseFloat(balances?.LIVO?.balance || '0') * 0.1)
                    ).toFixed(2)}` : 
                    '••••••••'
                  }
                </p>
                <p className="text-sm text-green-500 mt-1">
                  +12.5% ↑
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <Button
                onClick={() => setShowSendModal(true)}
                className="bg-bazari-red hover:bg-bazari-red/80 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
              
              <Button
                variant="outline"
                className="border-bazari-gold/30 hover:bg-bazari-gold/10 text-bazari-sand"
              >
                <ArrowDownLeft className="w-4 h-4 mr-2" />
                Receber
              </Button>
              
              <Button
                variant="outline"
                className="border-bazari-gold/30 hover:bg-bazari-gold/10 text-bazari-sand"
              >
                <Key className="w-4 h-4 mr-2" />
                Backup
              </Button>
              
              <Button
                variant="outline"
                className="border-bazari-gold/30 hover:bg-bazari-gold/10 text-bazari-sand"
              >
                <Shield className="w-4 h-4 mr-2" />
                Segurança
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Grid de Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Card de Estatísticas */}
          <Card className="border-bazari-red/20 bg-bazari-black/50">
            <CardHeader>
              <CardTitle className="text-bazari-sand text-lg">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-bazari-sand/60 text-sm">Transações (24h)</span>
                  <span className="text-bazari-sand font-semibold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-bazari-sand/60 text-sm">Volume (24h)</span>
                  <span className="text-bazari-sand font-semibold">1,245 BZR</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-bazari-sand/60 text-sm">Taxa Média</span>
                  <span className="text-bazari-sand font-semibold">0.001 BZR</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Card de Rede */}
          <Card className="border-bazari-red/20 bg-bazari-black/50">
            <CardHeader>
              <CardTitle className="text-bazari-sand text-lg">Status da Rede</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-bazari-sand/60 text-sm">Bloco Atual</span>
                  <span className="text-bazari-sand font-semibold">#{transactions[0]?.blockNumber || '...'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-bazari-sand/60 text-sm">Validadores</span>
                  <span className="text-bazari-sand font-semibold">21 ativos</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-bazari-sand/60 text-sm">TPS</span>
                  <span className="text-bazari-sand font-semibold">~1,000</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Card de Recompensas */}
          <Card className="border-bazari-gold/20 bg-gradient-to-br from-bazari-black/50 to-bazari-gold/5">
            <CardHeader>
              <CardTitle className="text-bazari-sand text-lg">Recompensas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-bazari-sand/60 text-sm">Cashback Acumulado</span>
                  <span className="text-bazari-gold font-semibold">+2.5 LIVO</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-bazari-sand/60 text-sm">Próximo Resgate</span>
                  <span className="text-bazari-sand font-semibold">em 3 dias</span>
                </div>
                <Button 
                  size="sm" 
                  className="w-full mt-2 bg-bazari-gold hover:bg-bazari-gold/80 text-bazari-black"
                >
                  Resgatar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Transactions Table */}
        <Card className="border-bazari-red/20 bg-bazari-black/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-bazari-sand">Histórico de Transações</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-bazari-sand/60 hover:text-bazari-gold"
              >
                Ver todas
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.hash}
                    className="flex items-center justify-between p-3 bg-bazari-black/30 rounded-lg border border-bazari-red/10 hover:border-bazari-gold/30 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        tx.type === 'received' ? "bg-green-500/20" : "bg-red-500/20"
                      )}>
                        {tx.type === 'received' ? 
                          <ArrowDownLeft className="w-5 h-5 text-green-500" /> : 
                          <ArrowUpRight className="w-5 h-5 text-red-500" />
                        }
                      </div>
                      
                      <div>
                        <p className="text-bazari-sand font-medium">
                          {tx.type === 'received' ? 'Recebido' : 'Enviado'}
                        </p>
                        <p className="text-xs text-bazari-sand/50">
                          {tx.type === 'received' ? 
                            `De: ${formatAddress(tx.from)}` : 
                            `Para: ${formatAddress(tx.to)}`
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={cn(
                        "font-semibold",
                        tx.type === 'received' ? "text-green-500" : "text-bazari-sand"
                      )}>
                        {tx.type === 'received' ? '+' : '-'}{tx.amount} {tx.token}
                      </p>
                      <p className="text-xs text-bazari-sand/50">
                        {formatDate(tx.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-bazari-sand/60">Nenhuma transação encontrada</p>
                <p className="text-sm text-bazari-sand/40 mt-2">
                  Suas transações aparecerão aqui
                </p>
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