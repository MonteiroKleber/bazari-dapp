import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Wallet,
  Users,
  ShoppingBag
} from 'lucide-react'

// Layouts and Components
import MainLayout from '@layout/MainLayout'
import { Card, Button } from '@components/BaseComponents'

// Modules
import { ModuloAcesso, AuthGuard, useAuth } from '@modules/acesso'
import ProfileModule from '@modules/perfil'
import WalletModule from '@modules/wallet'
import MarketplaceModule from '@modules/marketplace'

// Services
import { useTranslation } from '@i18n/useTranslation'

// ===============================
// DASHBOARD HOME
// ===============================
const Dashboard = () => {
  const { t } = useTranslation()
  const { user } = useAuth()

  // Mock data for dashboard
  const stats = [
    { 
      icon: Wallet, 
      title: 'Saldo Total', 
      value: 'R$ 1.625,65', 
      change: '+5.2%',
      trend: 'up',
      color: 'green'
    },
    { 
      icon: TrendingUp, 
      title: 'Tokens Possuídos', 
      value: '5', 
      change: '+2',
      trend: 'up',
      color: 'blue'
    },
    { 
      icon: Users, 
      title: 'Reputação', 
      value: '847', 
      change: '+12',
      trend: 'up',
      color: 'purple'
    },
    { 
      icon: ShoppingBag, 
      title: 'Transações', 
      value: '23', 
      change: '+3',
      trend: 'up',
      color: 'orange'
    }
  ]

  const activities = [
    {
      id: 1,
      type: 'receive',
      title: 'Pagamento recebido',
      description: 'João Silva enviou 50 BZR',
      time: '2 min atrás',
      amount: '+50 BZR',
      isPositive: true
    },
    {
      id: 2,
      type: 'trade',
      title: 'Token negociado',
      description: 'Trocou BZR por CAFÉ token',
      time: '1 hora atrás',
      amount: '+20 CAFÉ',
      isPositive: true
    },
    {
      id: 3,
      type: 'send',
      title: 'Pagamento enviado',
      description: 'Compra no marketplace',
      time: '3 horas atrás',
      amount: '-25 BZR',
      isPositive: false
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-bazari-primary to-bazari-primary-dark text-white rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-2">
          Bem-vindo de volta, {user?.name || 'Usuário'}! 👋
        </h1>
        <p className="opacity-90">
          Sua economia descentralizada está crescendo. Vamos ver o que há de novo hoje.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {stat.change}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-bazari-dark">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-bazari-dark mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Wallet size={24} />
            <span className="text-sm">Enviar</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <TrendingUp size={24} />
            <span className="text-sm">Negociar</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Users size={24} />
            <span className="text-sm">Conectar</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <ShoppingBag size={24} />
            <span className="text-sm">Comprar</span>
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-bazari-dark">Atividade Recente</h2>
          <Button variant="ghost" size="sm">Ver todas</Button>
        </div>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'receive' ? 'bg-green-100' :
                  activity.type === 'send' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  <Clock size={16} className={
                    activity.type === 'receive' ? 'text-green-600' :
                    activity.type === 'send' ? 'text-red-600' : 'text-blue-600'
                  } />
                </div>
                <div>
                  <div className="font-medium text-sm">{activity.title}</div>
                  <div className="text-xs text-gray-600">{activity.description}</div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              </div>
              {activity.amount && (
                <span className={`font-medium text-sm ${
                  activity.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {activity.amount}
                </span>
              )}
            </div>
          ))}
        </div>
        <button className="w-full mt-4 text-sm text-bazari-primary hover:text-bazari-primary-hover font-medium">
          Ver todas as atividades →
        </button>
      </Card>
    </div>
  )
}

// ===============================
// PAGE COMPONENTS
// ===============================

const PerfilPage = () => {
  console.log('PerfilPage carregando...') // Debug
  return <ProfileModule />
}

const WalletPage = () => {
  console.log('WalletPage carregando...') // Debug
  return <WalletModule />
}

const MarketplacePage = () => {
  console.log('MarketplacePage carregando...') // Debug
  return <MarketplaceModule />
}


const DAOPage = () => (
  <div className="bg-white rounded-xl p-8 shadow-bazari text-center">
    <h2 className="text-2xl font-bold text-bazari-dark mb-4">Módulo DAO</h2>
    <p className="text-gray-600">Em desenvolvimento - Etapa 7</p>
  </div>
)

const DEXPage = () => (
  <div className="bg-white rounded-xl p-8 shadow-bazari text-center">
    <h2 className="text-2xl font-bold text-bazari-dark mb-4">Módulo DEX</h2>
    <p className="text-gray-600">Em desenvolvimento - Etapa 8</p>
  </div>
)

const TrabalhoPage = () => (
  <div className="bg-white rounded-xl p-8 shadow-bazari text-center">
    <h2 className="text-2xl font-bold text-bazari-dark mb-4">Módulo Trabalho</h2>
    <p className="text-gray-600">Em desenvolvimento - Etapa 9</p>
  </div>
)

// ===============================
// MAIN APP COMPONENT
// ===============================
function App() {
  return (
    <Router future={{ 
      v7_startTransition: true,
      v7_relativeSplatPath: true 
    }}>
      <div className="App">
        <Routes>
          {/* Authentication Routes */}
          <Route path="/acesso/*" element={<ModuloAcesso />} />
          
          {/* Protected Routes */}
          <Route path="/*" element={
            <AuthGuard fallback={<ModuloAcesso />}>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/perfil" element={<PerfilPage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />
                  <Route path="/carteira" element={<WalletPage />} />
                  <Route path="/dao" element={<DAOPage />} />
                  <Route path="/dex" element={<DEXPage />} />
                  <Route path="/trabalho" element={<TrabalhoPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </MainLayout>
            </AuthGuard>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App