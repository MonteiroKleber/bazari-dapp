import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Wallet,
  Send,
  LogOut,
  Copy,
  Shield,
  TrendingUp,
  Activity,
  User,
  Bell,
  Settings,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  Users,
  ArrowUpDown
} from 'lucide-react'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { useAuthStore } from '@store/auth'
import { useWalletStore } from '@store/wallet'
import { SendModal } from '@components/wallet/SendModal'
import { useCopyToClipboard } from '@hooks/useCopyToClipboard'
import { formatCurrency, truncateAddress } from '@lib/utils'

export default function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [copiedText, copy] = useCopyToClipboard()
  
  const { user, logout } = useAuthStore()
  const { 
    activeAccount,
    balances,
    transactions,
    isLoading,
    fetchBalances,
    fetchTransactions
  } = useWalletStore()
  
  const [showSendModal, setShowSendModal] = useState(false)
  const [selectedToken, setSelectedToken] = useState<'BZR' | 'LIVO'>('BZR')
  
  useEffect(() => {
    if (activeAccount) {
      fetchBalances(activeAccount.address)
      fetchTransactions(activeAccount.address)
    }
  }, [activeAccount, fetchBalances, fetchTransactions])
  
  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }
  
  const handleCopyAddress = () => {
    if (activeAccount) {
      copy(activeAccount.address)
    }
  }
  
  const handleSendTokens = (token: 'BZR' | 'LIVO') => {
    setSelectedToken(token)
    setShowSendModal(true)
  }
  
  // Quick Stats
  const stats = [
    {
      title: t('dashboard.stats.totalBalance'),
      value: formatCurrency(parseFloat(balances?.BZR?.available || '0') * 0.5),
      change: '+12.5%',
      icon: Wallet,
      trend: 'up'
    },
    {
      title: 'BZR',
      value: balances?.BZR?.available || '0',
      change: '+5.2%',
      icon: CreditCard,
      trend: 'up'
    },
    {
      title: t('dashboard.cashback'),
      value: balances?.LIVO?.balance || '0',
      change: '+18.7%',
      icon: TrendingUp,
      trend: 'up'
    },
    {
      title: t('dashboard.stats.transactions'),
      value: transactions?.length || '0',
      change: '24h',
      icon: Activity,
      trend: 'neutral'
    }
  ]
  
  // Recent activities
  const recentActivities = transactions?.slice(0, 5).map(tx => ({
    id: tx.id,
    type: tx.type === 'sent' ? t('dashboard.stats.sent') : t('dashboard.stats.received'),
    amount: tx.amount,
    token: tx.token,
    address: tx.type === 'sent' ? tx.to : tx.from,
    timestamp: tx.timestamp,
    icon: tx.type === 'sent' ? ArrowUpRight : ArrowDownLeft,
    color: tx.type === 'sent' ? 'text-red-500' : 'text-green-500'
  })) || []
  
  return (
    <div className="min-h-screen bg-bazari-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-bazari-red to-bazari-gold p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{t('dashboard.title')}</h1>
                <p className="text-white/80 text-sm">
                  {t('dashboard.welcome')}, {user?.username || 'Cidadão Bazari'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => navigate('/profile')}
              >
                <Settings className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <Bell className="w-5 h-5" />
              </Button>
              
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('common.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Account Info Card */}
        {activeAccount && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-bazari-black/50 border-bazari-red/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-bazari-red to-bazari-gold rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-bazari-sand/60">{t('dashboard.activeAccount')}</p>
                      <p className="font-semibold text-bazari-sand">{activeAccount.name}</p>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs text-bazari-sand/60">
                          {truncateAddress(activeAccount.address)}
                        </code>
                        <button
                          onClick={handleCopyAddress}
                          className="text-bazari-gold hover:text-bazari-gold/80"
                        >
                          <Copy size={14} />
                        </button>
                        {copiedText && (
                          <span className="text-xs text-green-500">{t('common.copied')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleSendTokens('BZR')}
                      className="bg-bazari-red hover:bg-bazari-red/80"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {t('dashboard.sendTokens', { token: 'BZR' })}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/wallet')}
                      className="border-bazari-gold/30 hover:bg-bazari-gold/10"
                    >
                      {t('dashboard.manageWallet')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-bazari-black/50 border-bazari-red/20 hover:border-bazari-gold/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-bazari-gold/10 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-bazari-gold" />
                      </div>
                      <span className={`text-sm ${
                        stat.trend === 'up' ? 'text-green-500' :
                        stat.trend === 'down' ? 'text-red-500' :
                        'text-bazari-sand/60'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-sm text-bazari-sand/60 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-bazari-sand">{stat.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
        
        {/* Recent Activity & Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-bazari-black/50 border-bazari-red/20">
            <CardHeader>
              <CardTitle className="text-bazari-sand">{t('dashboard.recentActivity')}</CardTitle>
              <CardDescription className="text-bazari-sand/60">
                {t('wallet.transactionsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-bazari-gold" />
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity) => {
                    const ActivityIcon = activity.icon
                    return (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 bg-bazari-black/30 rounded-xl hover:bg-bazari-black/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            activity.type === t('dashboard.stats.sent') ? 'bg-red-500/10' : 'bg-green-500/10'
                          }`}>
                            <ActivityIcon className={`w-4 h-4 ${activity.color}`} />
                          </div>
                          <div>
                            <p className="font-medium text-bazari-sand">{activity.type}</p>
                            <p className="text-xs text-bazari-sand/60">
                              {truncateAddress(activity.address)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-bazari-sand">
                            {activity.amount} {activity.token}
                          </p>
                          <p className="text-xs text-bazari-sand/60">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  
                  <Button
                    variant="outline"
                    className="w-full border-bazari-gold/30 hover:bg-bazari-gold/10"
                    onClick={() => navigate('/wallet')}
                  >
                    {t('dashboard.viewAllTransactions')}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-bazari-sand/60">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('dashboard.noTransactions')}</p>
                  <p className="text-sm mt-1">
                    {t('dashboard.startTransacting')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card className="bg-bazari-black/50 border-bazari-red/20">
            <CardHeader>
              <CardTitle className="text-bazari-sand">{t('dashboard.quickActions')}</CardTitle>
              <CardDescription className="text-bazari-sand/60">
                {t('modules.title')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="border-bazari-gold/30 hover:bg-bazari-gold/10 h-auto py-4 flex-col"
                  onClick={() => navigate('/marketplace')}
                >
                  <Shield className="w-6 h-6 mb-2 text-bazari-gold" />
                  <span>{t('dashboard.actions.marketplace')}</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="border-bazari-gold/30 hover:bg-bazari-gold/10 h-auto py-4 flex-col"
                  onClick={() => navigate('/dao')}
                >
                  <Users className="w-6 h-6 mb-2 text-bazari-gold" />
                  <span>{t('dashboard.actions.subdaos')}</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="border-bazari-gold/30 hover:bg-bazari-gold/10 h-auto py-4 flex-col"
                  onClick={() => navigate('/p2p')}
                >
                  <ArrowUpDown className="w-6 h-6 mb-2 text-bazari-gold" />
                  <span>{t('dashboard.actions.p2p')}</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="border-bazari-gold/30 hover:bg-bazari-gold/10 h-auto py-4 flex-col"
                  onClick={() => navigate('/profile')}
                >
                  <User className="w-6 h-6 mb-2 text-bazari-gold" />
                  <span>{t('dashboard.actions.profile')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Send Modal */}
      {showSendModal && (
        <SendModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          defaultToken={selectedToken}
        />
      )}
    </div>
  )
}