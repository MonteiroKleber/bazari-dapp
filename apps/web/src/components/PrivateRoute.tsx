import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@store/auth'
import Loading from './Loading'

interface PrivateRouteProps {
  children: React.ReactNode
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuthStore()
  
  if (isLoading) {
    return <Loading />
  }
  
  if (!isAuthenticated) {
    // Redirect to auth page but save the location they were trying to go to
    return <Navigate to="/auth" state={{ from: location }} replace />
  }
  
  return <>{children}</>
}