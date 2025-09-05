// Arquivo: apps/web/src/pages/Dashboard.tsx
// Dashboard com integração real com a blockchain

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
  Loader2
} from 'lucide-react'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { useAuthStore } from '@store/auth'
import { useWalletStore } from '@store/wallet'
import { useCopyToClipboard } from '@hooks/useCopyToClipboard'
import { cn } from '@lib/utils'

// Componente de Modal de Envio (será implementado depois)
const SendModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-bazari-black border border-bazari-red/20 rounded-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-bazari-sand mb-4">Enviar Tokens</h2>
        <p className="text-bazari-sand/60">Funcionalidade em desenvolvimento...</p>
        <Button className="mt-4" onClick={onClose}>Fechar</Button>
      </div>
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
    if (!activeAccount || !api || !isConnected) return
    
    try {
      // Buscar eventos de Transfer da blockchain
      const lastHeader = await api.rpc.chain.getHeader()
      const blockNumber = lastHeader.number.toNumber()
      
      // Buscar últimos 10 blocos de eventos
      const txs = []
      for (let i = Math.max(1, blockNumber - 10); i <= blockNumber; i++) {
        const blockHash = await api.rpc.chain.getBlockHash(i)
        const events = await api.query.system.events.at(blockHash)
        
        events.forEach((record: any) => {
          const { event } = record
          if (event.section === 'balances' && event.method === 'Transfer') {
            const [from, to, amount] = event.data
            
            // Verificar se a transação envolve nossa conta
            if (from.toString() === activeAccount.address || to.toString() === activeAccount.address) {
              txs.push({
                id: `${blockHash.toString()}-${txs.length}`,
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
      <header className="border-b border-bazari-red/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-bazari-red to-bazari-gold rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-bazari-sand">Bazari Dashboard</h1>
                <p className="text-sm text-bazari-sand/60">
                  {user?.username || user?.email || 'Usuário'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status de Conexão */}
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="text-xs text-bazari-sand/60">
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-bazari-sand/60 hover:text-bazari-sand"
              >
                <Bell className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-bazari-sand/60 hover:text-bazari-sand"
              >
                <Settings className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-bazari-red hover:text-bazari-red/80"
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
                <CardTitle className="text-bazari-sand">Minha Carteira</CardTitle>
                <CardDescription className="text-bazari-sand/60">
                  <div className="flex items-center space-x-2">
                    <span>{formatAddress(activeAccount?.address || '')}</span>
                    <button
                      onClick={handleCopyAddress}
                      className="text-bazari-gold hover:text-bazari-gold/80 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {copiedText && (
                      <span className="text-xs text-green-500">Copiado!</span>
                    )}
                  </div>
                </CardDescription>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefreshBalances}
                disabled={isLoadingBalances}
                className="text-bazari-sand/60 hover:text-bazari-sand"
              >
                {isLoadingBalances ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* BZR Balance */}
              <div className="bg-bazari-black/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-bazari-sand/60">BZR</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-bazari-sand">
                  {isLoadingBalances ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    balances.bzr.toLocaleString('pt-BR', { maximumFractionDigits: 4 })
                  )}
                </p>
                <p className="text-xs text-bazari-sand/40 mt-1">
                  Token nativo da rede
                </p>
              </div>
              
              {/* LIVO Balance */}
              <div className="bg-bazari-black/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-bazari-sand/60">LIVO</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-bazari-sand">
                  {isLoadingBalances ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    balances.livo.toLocaleString('pt-BR', { maximumFractionDigits: 4 })
                  )}
                </p>
                <p className="text-xs text-bazari-sand/40 mt-1">
                  Tokens de cashback
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button 
                className="bg-bazari-red hover:bg-bazari-red/90"
                onClick={() => setShowSendModal(true)}
                disabled={!isConnected}
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
              <Button 
                variant="outline"
                className="border-bazari-red/20 text-bazari-sand hover:bg-bazari-red/10"
                disabled={!isConnected}
              >
                <ArrowDownLeft className="w-4 h-4 mr-2" />
                Receber
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card 
            className="border-bazari-red/10 bg-bazari-black/50 hover:bg-bazari-black/70 cursor-pointer transition-colors"
            onClick={() => navigate('/wallet')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Wallet className="w-8 h-8 text-bazari-gold mb-2" />
              <span className="text-sm text-bazari-sand">Carteira</span>
            </CardContent>
          </Card>
          
          <Card 
            className="border-bazari-red/10 bg-bazari-black/50 hover:bg-bazari-black/70 cursor-pointer transition-colors"
            onClick={() => navigate('/marketplace')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Grid className="w-8 h-8 text-bazari-gold mb-2" />
              <span className="text-sm text-bazari-sand">Marketplace</span>
            </CardContent>
          </Card>
          
          <Card 
            className="border-bazari-red/10 bg-bazari-black/50 hover:bg-bazari-black/70 cursor-pointer transition-colors"
            onClick={() => navigate('/dao')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Users className="w-8 h-8 text-bazari-gold mb-2" />
              <span className="text-sm text-bazari-sand">DAO</span>
            </CardContent>
          </Card>
          
          <Card 
            className="border-bazari-red/10 bg-bazari-black/50 hover:bg-bazari-black/70 cursor-pointer transition-colors"
            onClick={() => navigate('/profile')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Settings className="w-8 h-8 text-bazari-gold mb-2" />
              <span className="text-sm text-bazari-sand">Perfil</span>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Transactions */}
        <Card className="border-bazari-red/20 bg-bazari-black/50">
          <CardHeader>
            <CardTitle className="text-bazari-sand">Transações Recentes</CardTitle>
            <CardDescription className="text-bazari-sand/60">
              Últimas movimentações on-chain da sua carteira
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-bazari-sand/40 py-8">
                {isConnected 
                  ? 'Nenhuma transação encontrada nos últimos blocos' 
                  : 'Conectando com a blockchain...'}
              </p>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div 
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-bazari-black/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        tx.type === 'received' 
                          ? "bg-green-500/10 text-green-500" 
                          : "bg-red-500/10 text-red-500"
                      )}>
                        {tx.type === 'received' ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-bazari-sand">
                          {tx.type === 'received' ? 'Recebido' : 'Enviado'}
                        </p>
                        <p className="text-xs text-bazari-sand/40">
                          Bloco #{tx.blockNumber}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-medium",
                        tx.type === 'received' ? "text-green-500" : "text-red-500"
                      )}>
                        {tx.type === 'received' ? '+' : '-'}{tx.amount} {tx.token}
                      </p>
                      <p className="text-xs text-bazari-sand/40">
                        {tx.type === 'received' 
                          ? `De: ${formatAddress(tx.from)}`
                          : `Para: ${formatAddress(tx.to)}`
                        }
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