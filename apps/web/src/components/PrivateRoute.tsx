// apps/web/src/components/PrivateRoute.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useWalletStore } from '@/store/wallet'

interface PrivateRouteProps {
  children: React.ReactNode
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()
  const { isInitialized, isLocked } = useWalletStore()
  
  // Verificar se a wallet está inicializada e desbloqueada
  const hasAccess = isInitialized && !isLocked && isAuthenticated
  
  if (!hasAccess) {
    // Redirecionar para auth salvando a localização que tentou acessar
    return <Navigate to="/auth" state={{ from: location }} replace />
  }
  
  return <>{children}</>
}