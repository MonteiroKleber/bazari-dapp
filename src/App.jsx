import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import MainLayout from '@layout/MainLayout'
import ModuloAcesso, { AuthGuard } from '@modules/acesso/ModuloAcesso'
import ProfileModule from '@modules/perfil'
import { useAuth } from '@modules/acesso/useAuthStore'
import { useTranslation } from '@i18n/useTranslation'

// ===============================
// TEST STYLES COMPONENT (temporário)
// ===============================
const TestStyles = () => {
  return (
    <div className="min-h-screen bg-bazari-light p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-bazari-primary mb-4">
            🎨 Teste de Estilos Bazari
          </h1>
          <p className="text-bazari-dark/70 text-lg">
            Verificando se TailwindCSS + cores customizadas estão funcionando
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-bazari">
          <h2 className="text-2xl font-semibold text-bazari-dark mb-6">
            Paleta de Cores Oficial
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bazari-primary text-white p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Primária #8B0000</h3>
              <p className="text-sm opacity-90">Vermelho terroso - resistência e povo</p>
            </div>
            
            <div className="bg-bazari-secondary text-bazari-dark p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Secundária #FFB300</h3>
              <p className="text-sm opacity-80">Dourado queimado - riqueza e esperança</p>
            </div>
            
            <div className="bg-bazari-dark text-white p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Escuro #1C1C1C</h3>
              <p className="text-sm opacity-90">Preto fosco - descentralização e poder</p>
            </div>
            
            <div className="bg-bazari-light border-2 border-bazari-primary text-bazari-dark p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Claro #F5F1E0</h3>
              <p className="text-sm opacity-80">Areia clara - simplicidade, papel e rua</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-bazari">
          <h2 className="text-2xl font-semibold text-bazari-dark mb-6">
            Status do Sistema
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-bazari-dark/70">TailwindCSS</span>
              <span className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
                ✅ Funcionando
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-bazari-dark/70">Cores Bazari</span>
              <span className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
                ✅ Carregadas
              </span>
            </div>
          </div>
        </div>

        <div className="text-center text-bazari-dark/60 py-8">
          <p>Se você pode ver este teste com as cores corretas, os estilos estão funcionando! 🎉</p>
          <div className="mt-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-bazari-primary text-white px-6 py-3 rounded-xl hover:bg-bazari-primary-hover transition-colors"
            >
              Voltar ao App
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===============================
// DASHBOARD COMPONENT
// ===============================
const Dashboard = () => {
  const { t } = useTranslation()
  const { user } = useAuth() // Usar dados reais do usuário
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-bazari-primary to-bazari-primary-light rounded-2xl p-6 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          {t('common.welcome')}, {user?.name || 'Usuário'}! 👋
        </h1>
        <p className="text-bazari-light/90">
          {t('acesso.subtitle')}
        </p>
        <div className="mt-4 text-sm opacity-90">
          <p>Endereço: <span className="font-mono text-xs">{user?.address}</span></p>
          <p>Conta criada: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Saldo BZR"
          value="1,247.50"
          subtitle="BZR"
          trend="+12.5%"
          trendUp={true}
          icon="💰"
        />
        <StatCard
          title="Reputação"
          value="4.8"
          subtitle="/5.0"
          trend="+0.2"
          trendUp={true}
          icon="⭐"
        />
        <StatCard
          title="Negócios"
          value="3"
          subtitle="ativos"
          trend="+1"
          trendUp={true}
          icon="🏪"
        />
        <StatCard
          title="Trabalhos"
          value="12"
          subtitle="completados"
          trend="+4"
          trendUp={true}
          icon="✅"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActionsCard />
        <RecentActivityCard />
      </div>
    </div>
  )
}

// ===============================
// STAT CARD COMPONENT
// ===============================
const StatCard = ({ title, value, subtitle, trend, trendUp, icon }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-bazari hover:shadow-bazari-lg transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
          trendUp 
            ? 'text-success bg-success/10' 
            : 'text-error bg-error/10'
        }`}>
          {trend}
        </span>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-baseline">
        <span className="text-2xl font-bold text-bazari-dark">{value}</span>
        <span className="text-gray-500 text-sm ml-1">{subtitle}</span>
      </div>
    </div>
  )
}

// ===============================
// QUICK ACTIONS CARD
// ===============================
const QuickActionsCard = () => {
  const { t } = useTranslation()
  
  const actions = [
    { icon: '💸', label: 'Enviar BZR', color: 'bazari-primary' },
    { icon: '📦', label: 'Criar Produto', color: 'bazari-secondary' },
    { icon: '🗳️', label: 'Votar DAO', color: 'info' },
    { icon: '💼', label: 'Buscar Trabalho', color: 'success' }
  ]
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-bazari">
      <h3 className="text-lg font-semibold text-bazari-dark mb-4">
        Ações Rápidas
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className="flex flex-col items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
          >
            <span className="text-2xl mb-2">{action.icon}</span>
            <span className="text-sm font-medium text-bazari-dark text-center">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ===============================
// RECENT ACTIVITY CARD
// ===============================
const RecentActivityCard = () => {
  const activities = [
    {
      type: 'payment',
      description: 'Pagamento recebido de Maria Silva',
      amount: '+125.50 BZR',
      time: '2h atrás',
      positive: true
    },
    {
      type: 'vote',
      description: 'Votou na proposta #47 da DAO',
      amount: null,
      time: '5h atrás',
      positive: null
    },
    {
      type: 'purchase',
      description: 'Comprou token do Café Central',
      amount: '-50.00 BZR',
      time: '1d atrás',
      positive: false
    },
    {
      type: 'work',
      description: 'Trabalho "Design Logo" concluído',
      amount: '+300.00 BZR',
      time: '2d atrás',
      positive: true
    }
  ]
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-bazari">
      <h3 className="text-lg font-semibold text-bazari-dark mb-4">
        Atividade Recente
      </h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-bazari-dark">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
            {activity.amount && (
              <span className={`text-sm font-semibold ${
                activity.positive 
                  ? 'text-success' 
                  : 'text-error'
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
    </div>
  )
}

// ===============================
// TEMPORARY PLACEHOLDER COMPONENTS
// ===============================
const PerfilPage = () => <ProfileModule />

const MarketplacePage = () => (
  <div className="bg-white rounded-xl p-8 shadow-bazari text-center">
    <h2 className="text-2xl font-bold text-bazari-dark mb-4">Módulo Marketplace</h2>
    <p className="text-gray-600">Em desenvolvimento - Etapa 5</p>
  </div>
)

const WalletPage = () => (
  <div className="bg-white rounded-xl p-8 shadow-bazari text-center">
    <h2 className="text-2xl font-bold text-bazari-dark mb-4">Módulo Carteira</h2>
    <p className="text-gray-600">Em desenvolvimento - Etapa 4</p>
  </div>
)

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
          {/* Rota de teste de estilos - sem autenticação */}
          <Route path="/test-styles" element={<TestStyles />} />
          
          {/* Rotas principais - com autenticação */}
          <Route path="/*" element={
            <AuthGuard fallback={<ModuloAcesso />}>
              <MainLayout>
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/perfil" element={<PerfilPage />} />
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    <Route path="/wallet" element={<WalletPage />} />
                    <Route path="/dao" element={<DAOPage />} />
                    <Route path="/dex" element={<DEXPage />} />
                    <Route path="/trabalho" element={<TrabalhoPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AnimatePresence>
              </MainLayout>
            </AuthGuard>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App