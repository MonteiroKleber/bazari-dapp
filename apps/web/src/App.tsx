import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@store/auth'
import { useWalletStore } from '@store/wallet'
import Loading from '@components/Loading'
import Layout from '@components/Layout'

// Lazy load pages
const Landing = lazy(() => import('@pages/Landing'))
const Auth = lazy(() => import('@pages/Auth'))
const Wallet = lazy(() => import('@pages/Wallet'))

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const { isUnlocked } = useWalletStore()
  
  if (!isAuthenticated || !isUnlocked) {
    return <Navigate to="/auth" replace />
  }
  
  return <>{children}</>
}

function App() {
  const { refreshToken } = useAuthStore()
  
  useEffect(() => {
    // Try to refresh token on app load
    refreshToken()
  }, [])

  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected Routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/wallet/*" element={<Wallet />} />
                  <Route path="/marketplace" element={<div>Marketplace - Em breve</div>} />
                  <Route path="/dao" element={<div>DAOs - Em breve</div>} />
                  <Route path="/studio" element={<div>Studio - Em breve</div>} />
                  <Route path="/p2p" element={<div>P2P/Câmbio - Em breve</div>} />
                  <Route path="/social" element={<div>Rede Social - Em breve</div>} />
                  <Route path="/profile" element={<div>Perfil - Em breve</div>} />
                  <Route path="/dashboard" element={<div>Dashboard - Em breve</div>} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App