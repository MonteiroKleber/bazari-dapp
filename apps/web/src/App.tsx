// apps/web/src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// Importações lazy para code splitting
const Landing = lazy(() => import('./pages/Landing'))
const Auth = lazy(() => import('./pages/Auth'))
const Wallet = lazy(() => import('./pages/Wallet'))
const Dashboard = lazy(() => import('./pages/Dashboard'))


// Componente de Loading
function LoadingSpinner() {
  const { t } = useTranslation()
  
  return (
    <div className="min-h-screen bg-bazari-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-bazari-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-bazari-sand">{t('common.loading') || 'Carregando...'}</p>
      </div>
    </div>
  )
}

export default function App() {
  const { i18n } = useTranslation()

  // Verificar idioma salvo no localStorage ao montar
  useEffect(() => {
    const savedLanguage = localStorage.getItem('bazari_language')
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage)
    }
  }, [i18n])

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Rotas Protegidas (adicionar proteção depois) */}
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/dashboard" element={<Dashboard />} />

        
        {/* Rota 404 - Redirecionar para home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}