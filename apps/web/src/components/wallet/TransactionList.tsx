import { useTranslation } from 'react-i18next'
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { formatDateTime, truncateAddress } from '@lib/utils'

interface Transaction {
  id: string
  from: string
  to: string
  amount: string
  token: string
  type: string
  status: string
  timestamp: string
  txHash?: string
}

interface TransactionListProps {
  transactions: Transaction[]
  currentAddress?: string
  isLoading?: boolean
}

export default function TransactionList({
  transactions,
  currentAddress,
  isLoading = false
}: TransactionListProps) {
  const { t } = useTranslation()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-bazari-gold animate-spin" />
      </div>
    )
  }
  
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-bazari-sand/60">
          {t('wallet.noTransactions')}
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const isIncoming = tx.to === currentAddress
        const isOutgoing = tx.from === currentAddress
        
        return (
          <div
            key={tx.id}
            className="p-3 rounded-xl border border-bazari-red/10 hover:border-bazari-red/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isIncoming ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {isIncoming ? (
                    <ArrowDownLeft className="w-5 h-5 text-green-500" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-red-500" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-bazari-sand">
                      {isIncoming ? t('wallet.received') : t('wallet.sent')}
                    </span>
                    {tx.status === 'PENDING' && (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    )}
                    {tx.status === 'CONFIRMED' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {tx.status === 'FAILED' && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  
                  <p className="text-sm text-bazari-sand/60">
                    {isIncoming ? t('wallet.from') : t('wallet.to')}:{' '}
                    <span className="font-mono">
                      {truncateAddress(isIncoming ? tx.from : tx.to)}
                    </span>
                  </p>
                  
                  <p className="text-xs text-bazari-sand/40">
                    {formatDateTime(tx.timestamp)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold ${
                  isIncoming ? 'text-green-500' : 'text-red-500'
                }`}>
                  {isIncoming ? '+' : '-'}{tx.amount} {tx.token}
                </p>
                
                {tx.txHash && (
                  <a
                    href={`https://explorer.bazari.io/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-bazari-gold hover:text-bazari-gold/80"
                  >
                    {t('wallet.viewOnExplorer')}
                  </a>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}