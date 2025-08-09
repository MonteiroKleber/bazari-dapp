// ===============================
// WALLET MAIN - CORRIGIDO
// ===============================

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  TrendingUp, 
  Send, 
  Download, 
  Eye,
  EyeOff,
  Copy,
  QrCode,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  Coins,
  Clock,
  DollarSign
} from 'lucide-react'

import { Button, Card, Badge, Avatar } from '@components/BaseComponents'
import { 
  useWallet, 
  useWalletUI, 
  useSendToken, 
  useReceiveToken
} from './useWalletStore'
import WalletService from '@services/WalletService'

// ===============================
// MAIN WALLET COMPONENT
// ===============================

const WalletMain = () => {
  const { activeTab, setActiveTab } = useWalletUI()
  
  useEffect(() => {
    // Carregar dados iniciais da carteira
    const interval = setInterval(() => {
      // Atualizar dados periodicamente (simular atualizações da blockchain)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Wallet },
    { id: 'tokens', label: 'Meus Tokens', icon: Coins },
    { id: 'transactions', label: 'Transações', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ]

  return (
    <div className="min-h-screen bg-bazari-bg pb-20">
      {/* Header da Carteira */}
      <WalletHeader />
      
      {/* Navegação por Abas */}
      <div className="px-4 mb-6">
        <div className="flex bg-white rounded-2xl p-1 shadow-bazari">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-bazari-primary text-white shadow-lg'
                    : 'text-gray-600 hover:text-bazari-primary hover:bg-bazari-primary/5'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="px-4">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'tokens' && <TokensTab />}
          {activeTab === 'transactions' && <TransactionsTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </motion.div>
      </div>
    </div>
  )
}

// ===============================
// WALLET HEADER
// ===============================

const WalletHeader = () => {
  const { walletData } = useWallet()
  const { openSendModal, openReceiveModal } = useSendToken()
  const [showBalance, setShowBalance] = React.useState(true)
  const [copied, setCopied] = React.useState(false)

  const copyAddress = () => {
    navigator.clipboard.writeText(walletData.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="px-4 pt-6 pb-8 bg-gradient-to-br from-bazari-primary to-bazari-primary-dark text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Minha Carteira</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm opacity-80">
              {WalletService.shortenAddress(walletData.address)}
            </span>
            <button
              onClick={copyAddress}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <Copy size={14} />
            </button>
            {copied && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs bg-white/20 px-2 py-1 rounded-full"
              >
                Copiado!
              </motion.span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <QrCode size={20} />
          </button>
        </div>
      </div>

      {/* Saldo Total */}
      <div className="text-center mb-6">
        <div className="text-3xl font-bold mb-1">
          {showBalance 
            ? WalletService.formatCurrency(walletData.portfolioValue)
            : '••••••'
          }
        </div>
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="opacity-80">Portfólio total</span>
          <Badge 
            variant={walletData.portfolioChange >= 0 ? 'success' : 'error'}
            className="text-xs"
          >
            {walletData.portfolioChange >= 0 ? '+' : ''}
            {walletData.portfolioChange.toFixed(2)}%
          </Badge>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="flex gap-3">
        <Button 
          variant="secondary"
          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={() => openSendModal()}
        >
          <Send size={18} />
          Enviar
        </Button>
        <Button 
          variant="secondary"
          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={() => openReceiveModal()}
        >
          <Download size={18} />
          Receber
        </Button>
        <Button 
          variant="secondary"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-4"
        >
          <Plus size={18} />
        </Button>
      </div>
    </div>
  )
}

// ===============================
// OVERVIEW TAB
// ===============================

const OverviewTab = () => {
  const { walletData } = useWallet()
  
  // Mock transactions data - removendo dependência de useTransactions
  const recentTransactions = [
    {
      id: '1',
      type: 'receive',
      description: 'Pagamento recebido',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      amount: 50,
      token: 'BZR',
      status: 'completed'
    },
    {
      id: '2',
      type: 'send',
      description: 'Compra no marketplace',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      amount: 25,
      token: 'BZR',
      status: 'completed'
    },
    {
      id: '3',
      type: 'trade',
      description: 'Troca BZR → JOAO',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      amount: 10,
      token: 'JOAO',
      status: 'completed'
    }
  ]
  
  const topTokens = walletData.tokens
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl mb-1">💰</div>
          <div className="text-sm text-gray-600 mb-1">Saldo BZR</div>
          <div className="font-bold text-lg">
            {WalletService.formatTokenAmount(walletData.balance.bzr)}
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl mb-1">🪙</div>
          <div className="text-sm text-gray-600 mb-1">Tokens</div>
          <div className="font-bold text-lg">{walletData.tokens.length}</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl mb-1">📊</div>
          <div className="text-sm text-gray-600 mb-1">Valor Total</div>
          <div className="font-bold text-lg">
            {WalletService.formatCurrency(walletData.portfolioValue)}
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl mb-1">⚡</div>
          <div className="text-sm text-gray-600 mb-1">Transações</div>
          <div className="font-bold text-lg">{recentTransactions.length}</div>
        </Card>
      </div>

      {/* Top Tokens */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Principais Tokens</h3>
          <button className="text-sm text-bazari-primary hover:text-bazari-primary-hover font-medium">
            Ver todos →
          </button>
        </div>
        
        <div className="space-y-3">
          {topTokens.map((token) => (
            <div key={token.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-bazari-primary/10 to-bazari-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">{token.icon}</span>
                </div>
                <div>
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-sm text-gray-600">{token.name}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium">
                  {WalletService.formatCurrency(token.value)}
                </div>
                <div className="text-sm text-gray-600">
                  {WalletService.formatTokenAmount(token.balance)} {token.symbol}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Atividade Recente */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Atividade Recente</h3>
          <button className="text-sm text-bazari-primary hover:text-bazari-primary-hover font-medium">
            Ver todas →
          </button>
        </div>
        
        <div className="space-y-3">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'send' 
                    ? 'bg-red-100 text-red-600'
                    : tx.type === 'receive'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {tx.type === 'send' ? (
                    <ArrowUpRight size={18} />
                  ) : tx.type === 'receive' ? (
                    <ArrowDownLeft size={18} />
                  ) : (
                    <span className="text-sm">{WalletService.getTransactionIcon(tx.type)}</span>
                  )}
                </div>
                <div>
                  <div className="font-medium">{tx.description}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(tx.timestamp).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`font-medium ${
                  tx.type === 'send' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {tx.type === 'send' ? '-' : '+'}
                  {WalletService.formatTokenAmount(tx.amount)} {tx.token}
                </div>
                <Badge variant={WalletService.getStatusColor(tx.status)} className="text-xs">
                  {tx.status === 'completed' ? 'Concluída' : 
                   tx.status === 'pending' ? 'Pendente' : 'Falhou'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ===============================
// PLACEHOLDER TABS (SIMPLIFICADAS)
// ===============================

const TokensTab = () => (
  <Card className="p-8 text-center">
    <Coins size={48} className="mx-auto mb-4 text-gray-400" />
    <h3 className="text-xl font-semibold mb-2">Meus Tokens</h3>
    <p className="text-gray-600">Lista detalhada de todos os tokens</p>
  </Card>
)

const TransactionsTab = () => (
  <Card className="p-8 text-center">
    <Clock size={48} className="mx-auto mb-4 text-gray-400" />
    <h3 className="text-xl font-semibold mb-2">Histórico de Transações</h3>
    <p className="text-gray-600">Lista completa de transações</p>
  </Card>
)

const AnalyticsTab = () => (
  <Card className="p-8 text-center">
    <BarChart3 size={48} className="mx-auto mb-4 text-gray-400" />
    <h3 className="text-xl font-semibold mb-2">Analytics do Portfólio</h3>
    <p className="text-gray-600">Gráficos e analytics do portfólio</p>
  </Card>
)

export default WalletMain