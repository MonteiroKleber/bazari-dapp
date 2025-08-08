import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import authService from '@services/AuthService'

// ===============================
// AUTH STORE
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
      currentScreen: 'initial', // initial, login, create, import
      showSeedConfirmation: false,
      generatedSeed: null,

      // Tentativas de login
      loginAttempts: 0,
      lastAttemptTime: null,
      isBlocked: false,

      // ===============================
      // ACTIONS
      // ===============================

      // Inicializar auth (verificar se já está logado)
      initialize: () => {
        set({ isLoading: true })
        
        try {
          const isLoggedIn = authService.isLoggedIn()
          const currentAccount = authService.getCurrentAccount()

          if (isLoggedIn && currentAccount) {
            set({
              user: currentAccount,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
            return true
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false
            })
            return false
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error.message
          })
          return false
        }
      },

      // Verificar se já existe conta no dispositivo
      checkExistingAccount: () => {
        return authService.hasExistingAccount()
      },

      // Navegar entre telas
      setScreen: (screen) => {
        set({ 
          currentScreen: screen,
          error: null // Limpar erros ao mudar de tela
        })
      },

      // ===============================
      // LOGIN
      // ===============================
      login: async (password) => {
        const state = get()
        
        // Verificar se está bloqueado
        if (state.isBlocked) {
          const timeLeft = Math.ceil((state.lastAttemptTime + 300000 - Date.now()) / 1000)
          throw new Error(`Muitas tentativas. Tente novamente em ${timeLeft} segundos`)
        }

        set({ isLoading: true, error: null })

        try {
          const result = await authService.login(password)

          if (result.success) {
            set({
              user: result.account,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              loginAttempts: 0,
              lastAttemptTime: null,
              isBlocked: false
            })
            return { success: true }
          } else {
            // Incrementar tentativas falhas
            const newAttempts = state.loginAttempts + 1
            const isBlocked = newAttempts >= 5
            
            set({
              isLoading: false,
              error: result.error,
              loginAttempts: newAttempts,
              lastAttemptTime: isBlocked ? Date.now() : state.lastAttemptTime,
              isBlocked
            })

            return { success: false, error: result.error }
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error.message
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
          const result = await authService.createAccount(password)

          if (result.success) {
            set({
              generatedSeed: result.seedPhrase,
              showSeedConfirmation: true,
              isLoading: false,
              error: null
            })
            return { success: true, seedPhrase: result.seedPhrase }
          } else {
            set({
              isLoading: false,
              error: result.error
            })
            return { success: false, error: result.error }
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // Confirmar seed phrase e finalizar criação da conta
      confirmSeedPhrase: async (confirmedSeed) => {
        const state = get()
        const originalSeed = state.generatedSeed

        if (!originalSeed) {
          return { success: false, error: 'Seed phrase original não encontrada' }
        }

        // Comparar seed phrases
        const original = originalSeed.join(' ').toLowerCase()
        const confirmed = confirmedSeed.join(' ').toLowerCase()

        if (original !== confirmed) {
          return { success: false, error: 'Seed phrase não confere. Tente novamente.' }
        }

        // Se chegou aqui, a conta foi criada com sucesso
        const currentAccount = authService.getCurrentAccount()
        
        set({
          user: currentAccount,
          isAuthenticated: true,
          showSeedConfirmation: false,
          generatedSeed: null,
          error: null
        })

        return { success: true }
      },

      // ===============================
      // IMPORTAR CONTA
      // ===============================
      importAccount: async (seedPhrase, password) => {
        set({ isLoading: true, error: null })

        try {
          const result = await authService.importAccount(seedPhrase, password)

          if (result.success) {
            set({
              user: result.account,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
            return { success: true }
          } else {
            set({
              isLoading: false,
              error: result.error
            })
            return { success: false, error: result.error }
          }
        } catch (error) {
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
        authService.logout()
        set({
          user: null,
          isAuthenticated: false,
          currentScreen: 'initial',
          showSeedConfirmation: false,
          generatedSeed: null,
          error: null,
          loginAttempts: 0,
          lastAttemptTime: null,
          isBlocked: false
        })
      },

      // ===============================
      // UTILITY ACTIONS
      // ===============================
      clearError: () => set({ error: null }),
      
      resetLoginAttempts: () => set({ 
        loginAttempts: 0, 
        lastAttemptTime: null, 
        isBlocked: false 
      }),

      // Validar senha
      validatePassword: (password) => {
        return authService.validatePassword(password)
      },

      // Validar seed phrase
      validateSeedPhrase: (seedPhrase) => {
        return authService.validateSeedPhrase(seedPhrase)
      },

      // Gerar nova seed phrase
      generateNewSeed: () => {
        const newSeed = authService.generateSeedPhrase()
        set({ generatedSeed: newSeed })
        return newSeed
      },

      // Limpar todos os dados (para reset completo)
      clearAllData: () => {
        authService.clearAllData()
        set({
          user: null,
          isAuthenticated: false,
          currentScreen: 'initial',
          showSeedConfirmation: false,
          generatedSeed: null,
          error: null,
          loginAttempts: 0,
          lastAttemptTime: null,
          isBlocked: false,
          isLoading: false
        })
      }
    }),
    {
      name: 'bazari-auth-store',
      // Não persistir dados sensíveis
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

// Hook para verificar se está autenticado
export const useAuth = () => {
  const store = useAuthStore()
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    logout: store.logout,
    clearError: store.clearError
  }
}

// Hook para o fluxo de login
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

// Hook para navegação entre telas
export const useAuthNavigation = () => {
  const store = useAuthStore()
  return {
    currentScreen: store.currentScreen,
    setScreen: store.setScreen,
    initialize: store.initialize
  }
}

export default useAuthStore