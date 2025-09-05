// apps/web/src/App.tsx
import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useWalletStore } from '@/store/wallet'
import Landing from '@/pages/Landing'
import Auth from '@/pages/Auth'
import Dashboard from '@/pages/Dashboard'
import Wallet from '@/pages/Wallet'
import Layout from './components/Layout'

function App() {
  const { isInitialized, isLocked, connectBlockchain } = useWalletStore()
  const location = useLocation()

  useEffect(() => {
    // Auto-connect to blockchain if wallet is initialized and unlocked
    const initializeApp = async () => {
      if (isInitialized && !isLocked) {
        try {
          await connectBlockchain()
        } catch (error) {
          console.error('Failed to connect to blockchain:', error)
        }
      }
    }

    initializeApp()
  }, [isInitialized, isLocked, connectBlockchain])

  // Rotas públicas (não precisam de autenticação)
  const publicRoutes = ['/', '/auth', '/landing']
  const isPublicRoute = publicRoutes.includes(location.pathname)

  // Se não tem wallet e não está em rota pública, redireciona
  if (!isInitialized && !isPublicRoute) {
    return <Navigate to="/" replace />
  }

  // Se tem wallet mas está bloqueada e não está em rota pública
  if (isInitialized && isLocked && !isPublicRoute) {
    return <Navigate to="/auth?mode=unlock" replace />
  }

  // Se tem wallet desbloqueada e está na landing ou auth, redireciona para dashboard
  if (isInitialized && !isLocked && (location.pathname === '/' || location.pathname === '/auth')) {
    return <Navigate to="/dashboard" replace />
  }

  // Rotas principais
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Rotas protegidas */}
      {isInitialized && !isLocked ? (
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wallet" element={<Wallet />} />
        </Route>
      ) : null}
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App