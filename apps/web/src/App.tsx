import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'

// Importar páginas
const Landing = lazy(() => import('./pages/Landing'))
const Auth = lazy(() => import('./pages/Auth'))
const Wallet = lazy(() => import('./pages/Wallet'))


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
  return (
    <div className="min-h-screen bg-bazari-black">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/marketplace" element={<ComingSoon title="Marketplace" />} />
          <Route path="/dao" element={<ComingSoon title="DAO" />} />
          <Route path="/studio" element={<ComingSoon title="Studio" />} />
          <Route path="/p2p" element={<ComingSoon title="P2P" />} />
          <Route path="/social" element={<ComingSoon title="Social" />} />
          <Route path="/dashboard" element={<ComingSoon title="Dashboard" />} />
          <Route path="/profile" element={<ComingSoon title="Profile" />} />
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