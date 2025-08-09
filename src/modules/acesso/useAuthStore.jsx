// src/modules/acesso/useAuthStore.jsx - VERSÃO CORRIGIDA

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import authService from '@services/AuthService'

// ===============================
// AUTH STORE - CORRIGIDO
// ===============================
const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado da autenticação
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Estado das telas
      currentScreen: 'initial',
      showSeedConfirmation: false,
      generatedSeed: null,

      // Tentativas de login
      loginAttempts: 0,
      lastAttemptTime: null,
      isBlocked: false,

      // ===============================
      // INICIALIZAÇÃO
      // ===============================
      initialize: () => {
        console.log('🔄 Inicializando auth store...')
        set({ isLoading: true })
        
        try {
          const isLoggedIn = authService.isLoggedIn()
          const currentAccount = authService.getCurrentAccount()

          if (isLoggedIn && currentAccount) {
            console.log('✅ Sessão válida encontrada:', currentAccount.address)
            set({
              user: currentAccount,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              currentScreen: 'initial' // Reset screen
            })
            return true
          } else {
            console.log('❌ Nenhuma sessão válida encontrada')
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              currentScreen: get().checkExistingAccount() ? 'initial' : 'initial'
            })
            return false
          }
        } catch (error) {
          console.error('❌ Erro na inicialização:', error)
          set({
            isLoading: false,
            error: error.message,
            isAuthenticated: false,
            user: null
          })
          return false
        }
      },

      // Verificar se já existe conta
      checkExistingAccount: () => {
        return authService.hasExistingAccount()
      },

      // Navegar entre telas
      setScreen: (screen) => {
        console.log('🔄 Mudando tela para:', screen)
        set({ 
          currentScreen: screen,
          error: null 
        })
      },

      // ===============================
      // LOGIN
      // ===============================
      login: async (password) => {
        const state = get()
        
        // Verificar bloqueio
        if (state.isBlocked) {
          const timeLeft = Math.ceil((state.lastAttemptTime + 300000 - Date.now()) / 1000)
          throw new Error(`Muitas tentativas. Tente novamente em ${timeLeft}s`)
        }

        set({ isLoading: true, error: null })

        try {
          console.log('🔐 Tentando login...')
          const result = await authService.login(password)

          if (result.success) {
            console.log('✅ Login bem-sucedido:', result.user.address)
            
            set({
              user: result.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              loginAttempts: 0,
              lastAttemptTime: null,
              isBlocked: false,
              currentScreen: 'initial' // Reset screen
            })

            return { success: true, user: result.user }
          } else {
            console.log('❌ Login falhou:', result.error)
            
            const newAttempts = state.loginAttempts + 1
            const shouldBlock = newAttempts >= 5
            
            set({
              isLoading: false,
              error: result.error,
              loginAttempts: newAttempts,
              lastAttemptTime: shouldBlock ? Date.now() : state.lastAttemptTime,
              isBlocked: shouldBlock
            })

            return result
          }
        } catch (error) {
          console.error('❌ Erro no login:', error)
          
          const newAttempts = state.loginAttempts + 1
          const shouldBlock = newAttempts >= 5
          
          set({
            isLoading: false,
            error: error.message,
            loginAttempts: newAttempts,
            lastAttemptTime: shouldBlock ? Date.now() : state.lastAttemptTime,
            isBlocked: shouldBlock
          })

          return { success: false, error: error.message }
        }
      },

      // ===============================
      // CRIAR CONTA
      // ===============================
      createAccount: async (password) => {
        set({ isLoading: true, error: null })

        try {
          console.log('➕ Criando nova conta...')
          const result = await authService.createAccount(password)

          if (result.success) {
            console.log('✅ Conta criada:', result.user.address)
            
            set({
              user: result.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              generatedSeed: result.seedPhrase,
              showSeedConfirmation: true,
              currentScreen: 'create'
            })

            return result
          } else {
            set({
              isLoading: false,
              error: result.error
            })
            return result
          }
        } catch (error) {
          console.error('❌ Erro ao criar conta:', error)
          set({
            isLoading: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // Confirmar seed phrase
      confirmSeedPhrase: async (confirmedSeed) => {
        const state = get()
        
        if (!state.generatedSeed) {
          throw new Error('Nenhuma seed phrase para confirmar')
        }

        const isValid = authService.validateSeedPhrase(confirmedSeed.join(' '))
        
        if (isValid) {
          console.log('✅ Seed phrase confirmada')
          set({
            showSeedConfirmation: false,
            generatedSeed: null
          })
          return { success: true }
        } else {
          throw new Error('Seed phrase não confere')
        }
      },

      // ===============================
      // IMPORTAR CONTA
      // ===============================
      importAccount: async (seedPhrase, password) => {
        set({ isLoading: true, error: null })

        try {
          console.log('📥 Importando conta...')
          const result = await authService.importAccount(seedPhrase, password)

          if (result.success) {
            console.log('✅ Conta importada:', result.user.address)
            
            set({
              user: result.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              currentScreen: 'initial'
            })

            return result
          } else {
            set({
              isLoading: false,
              error: result.error
            })
            return result
          }
        } catch (error) {
          console.error('❌ Erro ao importar conta:', error)
          set({
            isLoading: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // ===============================
      // LOGOUT
      // ===============================
      logout: () => {
        console.log('🚪 Fazendo logout...')
        
        try {
          authService.logout()
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            currentScreen: 'initial',
            showSeedConfirmation: false,
            generatedSeed: null,
            loginAttempts: 0,
            lastAttemptTime: null,
            isBlocked: false
          })

          console.log('✅ Logout realizado')
        } catch (error) {
          console.error('❌ Erro no logout:', error)
        }
      },

      // ===============================
      // UTILITÁRIOS
      // ===============================
      clearError: () => {
        set({ error: null })
      },

      validatePassword: (password) => {
        return authService.validatePassword(password)
      },

      validateSeedPhrase: (seedPhrase) => {
        return authService.validateSeedPhrase(seedPhrase)
      },

      generateNewSeed: () => {
        const newSeed = authService.generateSeedPhrase()
        set({ generatedSeed: newSeed })
        return newSeed
      },

      resetLoginAttempts: () => {
        set({
          loginAttempts: 0,
          lastAttemptTime: null,
          isBlocked: false
        })
      }
    }),
    {
      name: 'bazari-auth',
      // Só persistir dados não sensíveis
      partialize: (state) => ({
        currentScreen: state.currentScreen,
        loginAttempts: state.loginAttempts,
        lastAttemptTime: state.lastAttemptTime,
        isBlocked: state.isBlocked
      })
    }
  )
)

// ===============================
// HOOKS ESPECIALIZADOS
// ===============================

// Hook principal de autenticação
export const useAuth = () => {
  const store = useAuthStore()
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    logout: store.logout,
    clearError: store.clearError,
    initialize: store.initialize
  }
}

// Hook para login
export const useLogin = () => {
  const store = useAuthStore()
  return {
    login: store.login,
    loginAttempts: store.loginAttempts,
    isBlocked: store.isBlocked,
    resetLoginAttempts: store.resetLoginAttempts,
    validatePassword: store.validatePassword,
    checkExistingAccount: store.checkExistingAccount,
    isLoading: store.isLoading,
    error: store.error,
    clearError: store.clearError
  }
}

// Hook para criar conta
export const useCreateAccount = () => {
  const store = useAuthStore()
  return {
    createAccount: store.createAccount,
    confirmSeedPhrase: store.confirmSeedPhrase,
    generateNewSeed: store.generateNewSeed,
    generatedSeed: store.generatedSeed,
    showSeedConfirmation: store.showSeedConfirmation,
    validatePassword: store.validatePassword,
    isLoading: store.isLoading,
    error: store.error,
    clearError: store.clearError
  }
}

// Hook para importar conta
export const useImportAccount = () => {
  const store = useAuthStore()
  return {
    importAccount: store.importAccount,
    validateSeedPhrase: store.validateSeedPhrase,
    validatePassword: store.validatePassword,
    isLoading: store.isLoading,
    error: store.error,
    clearError: store.clearError
  }
}

// Hook para navegação
export const useAuthNavigation = () => {
  const store = useAuthStore()
  return {
    currentScreen: store.currentScreen,
    setScreen: store.setScreen,
    initialize: store.initialize
  }
}

export default useAuthStore