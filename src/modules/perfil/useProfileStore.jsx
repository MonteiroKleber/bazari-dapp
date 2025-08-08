import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import profileService from '@services/ProfileService'

// ===============================
// PROFILE STORE
// ===============================
const useProfileStore = create(
  persist(
    (set, get) => ({
      // Estado do perfil
      currentProfile: null,
      reputation: null,
      businesses: [],
      activityFeed: [],
      isLoading: false,
      error: null,

      // Estado da UI
      showEditProfile: false,
      showCreateBusiness: false,
      activeTab: 'overview', // overview, businesses, activity, token

      // ===============================
      // PROFILE ACTIONS
      // ===============================
      
      // Carregar perfil completo
      loadProfile: async (accountId) => {
        set({ isLoading: true, error: null })
        
        try {
          const [profile, reputation, businesses, activityFeed] = await Promise.all([
            profileService.getProfile(accountId),
            profileService.getReputation(accountId),
            profileService.getBusinesses(accountId),
            profileService.getActivityFeed(accountId)
          ])

          // Se não existe perfil, criar um vazio
          let finalProfile = profile
          if (!profile) {
            const result = await profileService.updateProfile(accountId, {})
            finalProfile = result.profile
          }

          set({
            currentProfile: finalProfile,
            reputation,
            businesses,
            activityFeed,
            isLoading: false,
            error: null
          })

          return { success: true }
        } catch (error) {
          set({
            isLoading: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // Atualizar perfil
      updateProfile: async (accountId, updates) => {
        set({ isLoading: true, error: null })

        try {
          const result = await profileService.updateProfile(accountId, updates)
          
          if (result.success) {
            set({
              currentProfile: result.profile,
              isLoading: false,
              error: null
            })

            // Recarregar reputação (pode ter mudado)
            const newReputation = await profileService.getReputation(accountId)
            set({ reputation: newReputation })

            return { success: true, profile: result.profile }
          } else {
            set({
              isLoading: false,
              error: result.error
            })
            return result
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // Upload de avatar
      uploadAvatar: async (accountId, imageFile) => {
        set({ isLoading: true, error: null })

        try {
          const result = await profileService.uploadAvatar(accountId, imageFile)
          
          if (result.success) {
            const updateResult = await get().updateProfile(accountId, {
              avatar: result.url
            })
            return updateResult
          } else {
            set({ isLoading: false, error: 'Erro ao fazer upload da imagem' })
            return { success: false, error: 'Erro ao fazer upload da imagem' }
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
      // BUSINESS ACTIONS
      // ===============================
      
      // Criar negócio
      createBusiness: async (accountId, businessData) => {
        set({ isLoading: true, error: null })

        try {
          const result = await profileService.createBusiness(accountId, businessData)
          
          if (result.success) {
            // Recarregar businesses
            const businesses = await profileService.getBusinesses(accountId)
            
            // Recarregar perfil (stats podem ter mudado)
            const profile = await profileService.getProfile(accountId)
            
            // Recarregar reputação
            const reputation = await profileService.getReputation(accountId)

            set({
              businesses,
              currentProfile: profile,
              reputation,
              isLoading: false,
              error: null,
              showCreateBusiness: false
            })

            return { success: true, business: result.business }
          } else {
            set({
              isLoading: false,
              error: result.error
            })
            return result
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // Recarregar negócios
      reloadBusinesses: async (accountId) => {
        try {
          const businesses = await profileService.getBusinesses(accountId)
          set({ businesses })
          return businesses
        } catch (error) {
          console.error('Erro ao recarregar negócios:', error)
          return []
        }
      },

      // ===============================
      // ACTIVITY ACTIONS
      // ===============================
      
      // Adicionar atividade
      addActivity: async (accountId, activity) => {
        try {
          const result = await profileService.addActivity(accountId, activity)
          
          if (result.success) {
            // Recarregar feed
            const activityFeed = await profileService.getActivityFeed(accountId)
            
            // Recarregar perfil (stats podem ter mudado)
            const profile = await profileService.getProfile(accountId)
            
            // Recarregar reputação
            const reputation = await profileService.getReputation(accountId)

            set({
              activityFeed,
              currentProfile: profile,
              reputation
            })

            return { success: true, activity: result.activity }
          }

          return result
        } catch (error) {
          return { success: false, error: error.message }
        }
      },

      // Recarregar feed de atividades
      reloadActivityFeed: async (accountId) => {
        try {
          const activityFeed = await profileService.getActivityFeed(accountId)
          set({ activityFeed })
          return activityFeed
        } catch (error) {
          console.error('Erro ao recarregar feed:', error)
          return []
        }
      },

      // ===============================
      // TOKEN ACTIONS
      // ===============================
      
      // Obter dados do token do perfil
      getProfileToken: async (accountId) => {
        try {
          const token = await profileService.getProfileToken(accountId)
          return token
        } catch (error) {
          console.error('Erro ao buscar token do perfil:', error)
          return null
        }
      },

      // Simular compra/venda de token (placeholder)
      simulateTokenTrade: async (accountId, action, amount) => {
        // Esta função será expandida quando integrarmos com DEX
        const state = get()
        const profile = state.currentProfile
        
        if (!profile?.token) return { success: false, error: 'Token não encontrado' }

        // Simulate price change
        const priceChange = action === 'buy' ? 0.001 : -0.001
        const newPrice = Math.max(0.001, profile.token.price + priceChange)
        
        const result = await profileService.updateTokenPrice(accountId, newPrice)
        
        if (result.success) {
          set({ currentProfile: result.profile })
        }

        return result
      },

      // ===============================
      // UI ACTIONS
      // ===============================
      
      // Controlar modais e abas
      setShowEditProfile: (show) => set({ showEditProfile: show }),
      setShowCreateBusiness: (show) => set({ showCreateBusiness: show }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      clearError: () => set({ error: null }),

      // Reset store
      resetStore: () => set({
        currentProfile: null,
        reputation: null,
        businesses: [],
        activityFeed: [],
        isLoading: false,
        error: null,
        showEditProfile: false,
        showCreateBusiness: false,
        activeTab: 'overview'
      }),

      // ===============================
      // COMPUTED VALUES
      // ===============================
      
      // Calcular estatísticas do perfil
      getProfileStats: () => {
        const state = get()
        const profile = state.currentProfile
        const reputation = state.reputation
        
        if (!profile) return null

        return {
          completeness: reputation?.completeness || 0,
          reputationLevel: reputation?.level || 'Iniciante',
          tokenPrice: profile.token?.price || 0,
          marketCap: profile.token?.marketCap || 0,
          totalBusinesses: profile.stats?.businessCount || 0,
          totalPosts: profile.stats?.posts || 0,
          followers: profile.stats?.followers || 0,
          following: profile.stats?.following || 0
        }
      },

      // Verificar se perfil está completo
      isProfileComplete: () => {
        const state = get()
        const reputation = state.reputation
        return (reputation?.completeness || 0) >= 80
      },

      // Obter próximos passos para completar perfil
      getProfileNextSteps: () => {
        const state = get()
        const profile = state.currentProfile
        
        if (!profile) return []

        const steps = []
        
        if (!profile.name) steps.push({ field: 'name', label: 'Adicionar nome' })
        if (!profile.bio) steps.push({ field: 'bio', label: 'Escrever biografia' })
        if (!profile.avatar) steps.push({ field: 'avatar', label: 'Adicionar foto de perfil' })
        if (!profile.location) steps.push({ field: 'location', label: 'Definir localização' })
        if (!profile.skills?.length) steps.push({ field: 'skills', label: 'Adicionar habilidades' })
        if (!profile.interests?.length) steps.push({ field: 'interests', label: 'Definir interesses' })
        if (!profile.social?.website && !profile.social?.twitter) {
          steps.push({ field: 'social', label: 'Adicionar redes sociais' })
        }

        return steps
      }
    }),
    {
      name: 'bazari-profile-store',
      // Não persistir dados pessoais sensíveis
      partialize: (state) => ({
        activeTab: state.activeTab,
        showEditProfile: state.showEditProfile,
        showCreateBusiness: state.showCreateBusiness
      })
    }
  )
)

// ===============================
// HOOKS ESPECIALIZADOS
// ===============================

// Hook principal do perfil
export const useProfile = () => {
  const store = useProfileStore()
  return {
    profile: store.currentProfile,
    reputation: store.reputation,
    isLoading: store.isLoading,
    error: store.error,
    loadProfile: store.loadProfile,
    updateProfile: store.updateProfile,
    uploadAvatar: store.uploadAvatar,
    clearError: store.clearError,
    getProfileStats: store.getProfileStats,
    isProfileComplete: store.isProfileComplete,
    getProfileNextSteps: store.getProfileNextSteps
  }
}

// Hook para negócios
export const useBusinesses = () => {
  const store = useProfileStore()
  return {
    businesses: store.businesses,
    createBusiness: store.createBusiness,
    reloadBusinesses: store.reloadBusinesses,
    showCreateBusiness: store.showCreateBusiness,
    setShowCreateBusiness: store.setShowCreateBusiness,
    isLoading: store.isLoading,
    error: store.error
  }
}

// Hook para atividades
export const useActivity = () => {
  const store = useProfileStore()
  return {
    activityFeed: store.activityFeed,
    addActivity: store.addActivity,
    reloadActivityFeed: store.reloadActivityFeed,
    isLoading: store.isLoading,
    error: store.error
  }
}

// Hook para token
export const useProfileToken = () => {
  const store = useProfileStore()
  return {
    getProfileToken: store.getProfileToken,
    simulateTokenTrade: store.simulateTokenTrade,
    isLoading: store.isLoading,
    error: store.error
  }
}

// Hook para UI
export const useProfileUI = () => {
  const store = useProfileStore()
  return {
    activeTab: store.activeTab,
    setActiveTab: store.setActiveTab,
    showEditProfile: store.showEditProfile,
    setShowEditProfile: store.setShowEditProfile,
    showCreateBusiness: store.showCreateBusiness,
    setShowCreateBusiness: store.setShowCreateBusiness
  }
}

export default useProfileStore