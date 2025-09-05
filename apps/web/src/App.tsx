import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { useAuthStore } from '@store/auth'
import { useWalletStore } from '@store/wallet'

// Importar páginas
const Landing = lazy(() => import('./pages/Landing'))
const Auth = lazy(() => import('./pages/Auth'))
const Wallet = lazy(() => import('./pages/Wallet'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-bazari-black flex items-center justify-center">
      <div className="animate-pulse">
        <div className="h-12 w-12 border-4 border-bazari-red border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }
  
  return <>{children}</>
}

// Auth Route Component (redirects if already authenticated)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

// Páginas placeholder temporárias
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-bazari-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-bazari-red mb-4">{title}</h1>
        <p className="text-bazari-sand">Em breve...</p>
      </div>
    </div>
  )
}

export default function App() {
  const { isAuthenticated } = useAuthStore()
  const { hasVault } = useWalletStore()
  
  // Check vault status on app load
  useEffect(() => {
    const checkVault = async () => {
      const vaultExists = await hasVault()
      // Logic to handle vault status if needed
    }
    checkVault()
  }, [hasVault])
  
  return (
    <div className="min-h-screen bg-bazari-black">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          
          {/* Auth Route - redirects to dashboard if authenticated */}
          <Route 
            path="/auth" 
            element={
              <AuthRoute>
                <Auth />
              </AuthRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute>
                <ComingSoon title="Marketplace" />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dao"
            element={
              <ProtectedRoute>
                <ComingSoon title="DAO" />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/studio"
            element={
              <ProtectedRoute>
                <ComingSoon title="Studio" />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/p2p"
            element={
              <ProtectedRoute>
                <ComingSoon title="P2P" />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/social"
            element={
              <ProtectedRoute>
                <ComingSoon title="Social" />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ComingSoon title="Perfil" />
              </ProtectedRoute>
            }
          />
          
          {/* 404 Route */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen bg-bazari-black flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-bazari-red mb-4">404</h1>
                  <p className="text-xl text-bazari-sand">Página não encontrada</p>
                </div>
              </div>
            } 
          />
        </Routes>
      </Suspense>
    </div>
  )
}