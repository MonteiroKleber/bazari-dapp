// src/layout/MainLayout.jsx - VERSÃO CORRIGIDA

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Menu, X, Bell, Search, Globe, LogOut, User, Settings,
  Home, Store, Wallet, Users, TrendingUp, Briefcase,
  ChevronRight
} from 'lucide-react'
import { Button, Avatar, Badge } from '@components/BaseComponents'
import { useTranslation } from '@i18n/useTranslation'
import { useAuth } from '@modules/acesso/useAuthStore'

// ===============================
// MAIN LAYOUT - CORRIGIDO
// ===============================
const MainLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const { t, language, setLanguage } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)

  // Log para debug
  React.useEffect(() => {
    console.log('🏗️ MainLayout renderizado - rota:', location.pathname)
  }, [location.pathname])

  // Fechar menus ao mudar rota
  React.useEffect(() => {
    setSidebarOpen(false)
    setNotificationsOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  // Menu items
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/perfil', label: 'Perfil', icon: User },
    { path: '/marketplace', label: 'Marketplace', icon: Store },
    { path: '/wallet', label: 'Carteira', icon: Wallet },
    { path: '/dao', label: 'DAO', icon: Users },
    { path: '/dex', label: 'DEX', icon: TrendingUp },
    { path: '/trabalho', label: 'Trabalho', icon: Briefcase }
  ]

  const handleNavigation = (path) => {
    console.log('🔄 Navegando para:', path)
    navigate(path)
  }

  const handleLogout = () => {
    console.log('🚪 Fazendo logout...')
    logout()
  }

  return (
    <div className="min-h-screen bg-bazari-light">
      {/* Header */}
      <Header 
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        notificationsOpen={notificationsOpen}
        setNotificationsOpen={setNotificationsOpen}
        userMenuOpen={userMenuOpen}
        setUserMenuOpen={setUserMenuOpen}
        onLogout={handleLogout}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Layout Principal */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          menuItems={menuItems}
          currentPath={location.pathname}
          isOpen={sidebarOpen}
          onNavigate={handleNavigation}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Overlays */}
      <NotificationOverlay 
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  )
}

// ===============================
// HEADER COMPONENT
// ===============================
const Header = ({ 
  user, 
  sidebarOpen, 
  setSidebarOpen, 
  notificationsOpen, 
  setNotificationsOpen,
  userMenuOpen,
  setUserMenuOpen,
  onLogout,
  language,
  setLanguage 
}) => (
  <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
    <div className="flex items-center justify-between h-16 px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        {/* Menu button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>

        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-bazari-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="hidden sm:block font-bold text-xl text-bazari-dark">
            Bazari
          </span>
        </div>

        {/* Search (desktop only) */}
        <div className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bazari-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-2">
        {/* Language selector */}
        <LanguageSelector language={language} setLanguage={setLanguage} />

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative"
          >
            <Bell size={20} />
            <Badge 
              variant="error" 
              size="sm" 
              className="absolute -top-1 -right-1 min-w-[20px] h-5"
            >
              3
            </Badge>
          </Button>
        </div>

        {/* User menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2"
          >
            <Avatar size="sm" name={user?.name || user?.address} />
            <span className="hidden sm:block text-sm font-medium text-bazari-dark">
              {user?.name || `${user?.address?.slice(0, 6)}...`}
            </span>
          </Button>

          {/* User dropdown */}
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-bazari-dark">
                    {user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {user?.address}
                  </p>
                </div>
                
                <button className="w-full px-4 py-2 text-left text-sm text-bazari-dark hover:bg-gray-50 flex items-center">
                  <Settings size={16} className="mr-2" />
                  Configurações
                </button>
                
                <button 
                  onClick={onLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center"
                >
                  <LogOut size={16} className="mr-2" />
                  Sair
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  </header>
)

// ===============================
// SIDEBAR COMPONENT
// ===============================
const Sidebar = ({ menuItems, currentPath, isOpen, onNavigate, onClose }) => (
  <>
    {/* Mobile overlay */}
    {isOpen && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
        onClick={onClose}
      />
    )}

    {/* Sidebar */}
    <motion.aside
      initial={false}
      animate={{ x: isOpen ? 0 : -280 }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg z-30 lg:z-10 lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)]"
    >
      <nav className="p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.path
            
            return (
              <motion.button
                key={item.path}
                onClick={() => {
                  console.log('📱 Sidebar navegação:', item.path)
                  onNavigate(item.path)
                }}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-bazari-primary text-white' 
                    : 'text-bazari-dark hover:bg-bazari-light'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <ChevronRight size={16} className="ml-auto" />
                )}
              </motion.button>
            )
          })}
        </div>
      </nav>
    </motion.aside>
  </>
)

// ===============================
// LANGUAGE SELECTOR
// ===============================
const LanguageSelector = ({ language, setLanguage }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const languages = [
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ]
  
  const currentLang = languages.find(lang => lang.code === language) || languages[0]

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1"
      >
        <Globe size={16} />
        <span className="hidden sm:block text-sm">{currentLang.flag}</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                  language === lang.code ? 'bg-bazari-light text-bazari-primary' : ''
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ===============================
// NOTIFICATION OVERLAY
// ===============================
const NotificationOverlay = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed right-4 top-20 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
        >
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-bazari-dark">Notificações</h3>
          </div>
          
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {[
              { id: 1, title: 'Novo negócio criado', time: '2h atrás', unread: true },
              { id: 2, title: 'Transação recebida', time: '5h atrás', unread: true },
              { id: 3, title: 'Proposta DAO aprovada', time: '1d atrás', unread: false }
            ].map((notification) => (
              <div key={notification.id} className={`p-3 rounded-lg border ${
                notification.unread ? 'bg-bazari-light border-bazari-primary' : 'bg-gray-50 border-gray-200'
              }`}>
                <p className="text-sm font-medium text-bazari-dark">
                  {notification.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {notification.time}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
)

export default MainLayout