import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthNavigation, useAuth } from './useAuthStore'
import TelaInicial from './TelaInicial'
import TelaLogin from './TelaLogin'
import TelaCriarConta from './TelaCriarConta'
import TelaImportarConta from './TelaImportarConta'

// ===============================
// MÓDULO DE ACESSO - GERENCIADOR
// ===============================
const ModuloAcesso = ({ onAuthSuccess }) => {
  const { currentScreen, initialize } = useAuthNavigation()
  const { isAuthenticated, user, isLoading } = useAuth()

  // Inicializar auth ao carregar
  React.useEffect(() => {
    const isLoggedIn = initialize()
    
    // Se já está logado, chamar callback de sucesso
    if (isLoggedIn && onAuthSuccess) {
      onAuthSuccess(user)
    }
  }, [initialize, onAuthSuccess, user])

  // Se carregando, mostrar loading
  if (isLoading) {
    return <LoadingScreen />
  }

  // Se autenticado, notificar sucesso
  React.useEffect(() => {
    if (isAuthenticated && user && onAuthSuccess) {
      onAuthSuccess(user)
    }
  }, [isAuthenticated, user, onAuthSuccess])

  // Se já está autenticado, não mostrar telas de acesso
  if (isAuthenticated) {
    return null
  }

  // Renderizar tela baseada no estado atual
  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <TelaLogin />
      case 'create':
        return <TelaCriarConta />
      case 'import':
        return <TelaImportarConta />
      default:
        return <TelaInicial />
    }
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ===============================
// LOADING SCREEN COMPONENT
// ===============================
const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bazari-light via-white to-bazari-light/50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* Logo */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-16 h-16 bg-bazari-primary rounded-2xl flex items-center justify-center shadow-bazari-lg mx-auto mb-4"
        >
          <span className="text-2xl font-bold text-white">B</span>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-bazari-primary mb-2">
            Bazari
          </h2>
          <p className="text-bazari-dark/70">
            Inicializando...
          </p>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          className="flex justify-center space-x-1 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-bazari-primary rounded-full"
              animate={{
                y: [0, -8, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

// ===============================
// AUTH GUARD COMPONENT
// ===============================
export const AuthGuard = ({ children, fallback = <ModuloAcesso /> }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return fallback
  }

  return children
}

// ===============================
// HOOK PARA USAR EM OUTROS COMPONENTES
// ===============================
export const useAuthGuard = () => {
  const { isAuthenticated, user, logout } = useAuth()
  
  return {
    isAuthenticated,
    user,
    logout,
    requireAuth: (callback) => {
      if (isAuthenticated) {
        return callback()
      } else {
        console.warn('Ação requer autenticação')
        return null
      }
    }
  }
}

export default ModuloAcesso