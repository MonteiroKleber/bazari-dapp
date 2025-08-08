import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, Home, User, ShoppingBag, Wallet, 
  Users, TrendingUp, Briefcase, Search, 
  Bell, Settings, Globe, ChevronDown, LogOut 
} from 'lucide-react'
import { useTranslation, useLanguage } from '@i18n/useTranslation'
import { useAuth } from '@modules/acesso/useAuthStore'
import { Avatar, Button, Badge } from '@components/BaseComponents'

// ===============================
// HEADER COMPONENT
// ===============================
const Header = ({ onMenuToggle, user }) => {
  const { t } = useTranslation()
  const [showNotifications, setShowNotifications] = React.useState(false)
  const [showUserMenu, setShowUserMenu] = React.useState(false)

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        {/* Left side - Logo + Menu toggle */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <Menu size={24} />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-bazari-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <h1 className="text-xl font-bold text-bazari-primary hidden sm:block">
              Bazari
            </h1>
          </div>
        </div>

        {/* Center - Search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('common.search')}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:border-bazari-primary focus:ring-2 focus:ring-bazari-primary/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Right side - Notifications + User */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell size={20} />
              <Badge 
                variant="error" 
                size="sm" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                3
              </Badge>
            </Button>

            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-bazari-lg border border-gray-100 z-50"
              >
                <div className="p-4">
                  <h3 className="font-semibold text-bazari-dark mb-3">Notificações</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-bazari-light rounded-lg">
                      <p className="text-sm text-bazari-dark">Nova proposta DAO criada</p>
                      <p className="text-xs text-gray-600 mt-1">há 2 horas</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-bazari-dark">Pagamento recebido: 50 BZR</p>
                      <p className="text-xs text-gray-600 mt-1">há 5 horas</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50"
            >
              <Avatar
                src={user?.avatar}
                alt={user?.name}
                fallback={user?.name}
                size="sm"
              />
              <ChevronDown size={16} className="text-gray-600 hidden sm:block" />
            </button>

            {showUserMenu && (
              <UserMenu onClose={() => setShowUserMenu(false)} />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

// ===============================
// USER MENU COMPONENT
// ===============================
const UserMenu = ({ onClose }) => {
  const { t, language, setLanguage, availableLanguages } = useTranslation()
  const { user, logout } = useAuth()
  
  const languageNames = {
    pt: 'Português',
    en: 'English',
    es: 'Español'
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-bazari-lg border border-gray-100 z-50"
    >
      <div className="p-2">
        <div className="px-3 py-2 border-b border-gray-100 mb-2">
          <p className="text-sm font-semibold text-bazari-dark">
            {user?.name || 'Usuário Bazari'}
          </p>
          <p className="text-xs text-gray-600 font-mono">
            {user?.address ? `${user.address.substring(0, 12)}...` : 'Carregando...'}
          </p>
        </div>
        
        <button className="w-full text-left px-3 py-2 text-sm text-bazari-dark hover:bg-gray-50 rounded-lg flex items-center space-x-2">
          <User size={16} />
          <span>{t('perfil.my_profile')}</span>
        </button>
        
        <button className="w-full text-left px-3 py-2 text-sm text-bazari-dark hover:bg-gray-50 rounded-lg flex items-center space-x-2">
          <Settings size={16} />
          <span>Configurações</span>
        </button>
        
        {/* Language Selector */}
        <div className="px-3 py-2 border-t border-gray-100 mt-2">
          <div className="flex items-center space-x-2 mb-2">
            <Globe size={16} />
            <span className="text-sm text-bazari-dark">Idioma</span>
          </div>
          <div className="space-y-1">
            {availableLanguages.map(lang => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang)
                  onClose()
                }}
                className={`w-full text-left px-2 py-1 text-sm rounded ${
                  language === lang 
                    ? 'bg-bazari-primary text-white' 
                    : 'text-bazari-dark hover:bg-gray-50'
                }`}
              >
                {languageNames[lang]}
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="border-t border-gray-100 mt-2 pt-2">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/5 rounded-lg flex items-center space-x-2"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ===============================
// SIDEBAR COMPONENT
// ===============================
const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  
  const menuItems = [
    { icon: Home, label: t('navigation.home'), path: '/', active: true },
    { icon: User, label: t('navigation.profile'), path: '/perfil' },
    { icon: ShoppingBag, label: t('navigation.marketplace'), path: '/marketplace' },
    { icon: Wallet, label: t('navigation.wallet'), path: '/wallet' },
    { icon: Users, label: t('navigation.dao'), path: '/dao' },
    { icon: TrendingUp, label: t('navigation.dex'), path: '/dex' },
    { icon: Briefcase, label: t('navigation.work'), path: '/trabalho' }
  ]

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isOpen ? 'open' : 'closed'}
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
          lg:relative lg:translate-x-0 lg:z-auto
          ${isOpen ? 'block' : 'hidden lg:block'}
        `}
      >
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-bazari-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <h1 className="text-xl font-bold text-bazari-primary">Bazari</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.path}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left
                  transition-colors duration-200
                  ${item.active 
                    ? 'bg-bazari-primary text-white shadow-bazari' 
                    : 'text-gray-700 hover:bg-bazari-light hover:text-bazari-primary'
                  }
                `}
                onClick={onClose}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Footer info */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-bazari-light p-4 rounded-xl">
            <p className="text-sm text-bazari-dark font-medium mb-1">
              Saldo BZR
            </p>
            <p className="text-lg font-bold text-bazari-primary">
              1,247.50 BZR
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

// ===============================
// MAIN LAYOUT COMPONENT
// ===============================
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const { user } = useAuth() // Usar dados reais do usuário

  return (
    <div className="min-h-screen bg-bazari-light/30">
      {/* Header */}
      <Header 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
        user={user}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout