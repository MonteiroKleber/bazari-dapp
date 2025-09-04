import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react'
import { useWallet } from '@hooks/useWallet'
import { cn } from '@lib/utils'

interface Transaction {
  id: string
  from: string
  to: string
  amount: string
  token: string
  type: 'send' | 'receive' | 'swap' | 'stake'
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: string
  txHash?: string
  fee?: string
}

interface TransactionHistoryProps {
  transactions: Transaction[]
  compact?: boolean
}

export function TransactionHistory({ transactions, compact = false }: TransactionHistoryProps) {
  const { activeAccount, formatBalance } = useWallet()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'send' | 'receive'>('all')
  
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.txHash?.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesFilter = true
    if (filterType === 'send') {
      matchesFilter = tx.from === activeAccount?.address
    } else if (filterType === 'receive') {
      matchesFilter = tx.to === activeAccount?.address
    }
    
    return matchesSearch && matchesFilter
  })

  const getTransactionIcon = (tx: Transaction) => {
    if (tx.from === activeAccount?.address) {
      return <ArrowUpRight className="h-5 w-5 text-red-500" />
    }
    return <ArrowDownLeft className="h-5 w-5 text-green-500" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return `${minutes} min atrás`
      }
      return `${hours}h atrás`
    } else if (days === 1) {
      return 'Ontem'
    } else if (days < 7) {
      return `${days} dias atrás`
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-bazari-gold/30 mx-auto mb-4" />
        <p className="text-bazari-sand/50">Nenhuma transação ainda</p>
        <p className="text-sm text-bazari-sand/30 mt-2">
          Suas transações aparecerão aqui
        </p>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {filteredTransactions.slice(0, 5).map((tx) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-3 rounded-lg bg-bazari-black/30 hover:bg-bazari-black/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {getTransactionIcon(tx)}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {tx.from === activeAccount?.address ? 'Enviado' : 'Recebido'}
                  </span>
                  {getStatusIcon(tx.status)}
                </div>
                <span className="text-xs text-bazari-sand/50">
                  {formatDate(tx.timestamp)}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <p className={cn(
                "font-bold",
                tx.from === activeAccount?.address ? "text-red-500" : "text-green-500"
              )}>
                {tx.from === activeAccount?.address ? '-' : '+'} {formatBalance(tx.amount)}
              </p>
              <p className="text-xs text-bazari-sand/50">{tx.token}</p>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-bazari-sand/50" />
          <input
            type="text"
            placeholder="Buscar por endereço ou hash..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-bazari-black/50 border border-bazari-gold/30 text-white placeholder-bazari-sand/50 focus:border-bazari-gold focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            className={cn(
              "px-4 py-2 rounded-lg transition-colors",
              filterType === 'all' 
                ? "bg-bazari-gold text-bazari-black" 
                : "bg-bazari-black/50 text-bazari-sand hover:bg-bazari-gold/10"
            )}
            onClick={() => setFilterType('all')}
          >
            Todas
          </button>
          <button
            className={cn(
              "px-4 py-2 rounded-lg transition-colors",
              filterType === 'send' 
                ? "bg-bazari-gold text-bazari-black" 
                : "bg-bazari-black/50 text-bazari-sand hover:bg-bazari-gold/10"
            )}
            onClick={() => setFilterType('send')}
          >
            Enviadas
          </button>
          <button
            className={cn(
              "px-4 py-2 rounded-lg transition-colors",
              filterType === 'receive' 
                ? "bg-bazari-gold text-bazari-black" 
                : "bg-bazari-black/50 text-bazari-sand hover:bg-bazari-gold/10"
            )}
            onClick={() => setFilterType('receive')}
          >
            Recebidas
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <AnimatePresence>
        <div className="space-y-3">
          {filteredTransactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-lg bg-bazari-black/30 hover:bg-bazari-black/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getTransactionIcon(tx)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-white">
                        {tx.from === activeAccount?.address ? 'Envio para' : 'Recebido de'}
                      </span>
                      <code className="text-sm bg-bazari-black/50 px-2 py-1 rounded text-bazari-sand/70">
                        {tx.from === activeAccount?.address 
                          ? shortenAddress(tx.to)
                          : shortenAddress(tx.from)
                        }
                      </code>
                      {getStatusIcon(tx.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-bazari-sand/50">
                      <span>{formatDate(tx.timestamp)}</span>
                      {tx.txHash && (
                        <>
                          <span>•</span>
                          <a
                            href={`https://explorer.bazari.io/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-bazari-gold transition-colors"
                          >
                            {shortenAddress(tx.txHash)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </>
                      )}
                      {tx.fee && (
                        <>
                          <span>•</span>
                          <span>Taxa: {formatBalance(tx.fee)} BZR</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={cn(
                    "text-lg font-bold",
                    tx.from === activeAccount?.address ? "text-red-500" : "text-green-500"
                  )}>
                    {tx.from === activeAccount?.address ? '-' : '+'} {formatBalance(tx.amount)}
                  </p>
                  <p className="text-sm text-bazari-sand/50">{tx.token}</p>
                  <p className={cn(
                    "text-xs mt-1",
                    tx.status === 'confirmed' ? "text-green-500" :
                    tx.status === 'failed' ? "text-red-500" :
                    "text-yellow-500"
                  )}>
                    {tx.status === 'confirmed' ? 'Confirmada' :
                     tx.status === 'failed' ? 'Falhou' :
                     'Pendente'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
      
      {filteredTransactions.length === 0 && (
        <div className="text-center py-8">
          <Search className="h-8 w-8 text-bazari-gold/30 mx-auto mb-3" />
          <p className="text-bazari-sand/50">Nenhuma transação encontrada</p>
          <p className="text-sm text-bazari-sand/30 mt-1">
            Tente ajustar seus filtros
          </p>
        </div>
      )}
    </div>
  )
}