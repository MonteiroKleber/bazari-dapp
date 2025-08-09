// ===============================
// ACESSO MODULE INDEX - Bazari dApp
// ===============================

// Main module component
import ModuloAcesso, { AuthGuard, useAuthGuard } from './ModuloAcesso'

// Store and hooks
import useAuthStore, {
  useAuth,
  useLogin,
  useCreateAccount,
  useImportAccount,
  useAuthNavigation
} from './useAuthStore'

// Individual screens (if needed elsewhere)
import TelaInicial from './TelaInicial'
import TelaLogin from './TelaLogin'
import TelaCriarConta from './TelaCriarConta'
import TelaImportarConta from './TelaImportarConta'

// Export everything
export {
  // Main components
  ModuloAcesso,
  AuthGuard,
  useAuthGuard,
  
  // Store and hooks
  useAuthStore,
  useAuth,
  useLogin,
  useCreateAccount,
  useImportAccount,
  useAuthNavigation,
  
  // Screens
  TelaInicial,
  TelaLogin,
  TelaCriarConta,
  TelaImportarConta
}

// Default export
export default ModuloAcesso