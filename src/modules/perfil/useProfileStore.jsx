// ===============================
// PROFILE STORE - CORRIGIDO
// ===============================

import { create } from 'zustand'

// ===============================
// MAIN PROFILE STORE
// ===============================

const useProfileStore = create((set, get) => ({
  // Estado inicial
  profile: {
    name: 'João Silva',
    bio: 'Desenvolvedor Full Stack apaixonado por Web3 e descentralização.',
    location: 'São Paulo, Brasil',
    avatar: null,
    address: '0x742d35c6cf39354bc8e30b6f4e49dc3b35f9c5f4',
    completeness: 75,
    tokenValue: '250,00',
    skills: ['React', 'Node.js', 'Blockchain', 'Smart Contracts'],
    social: {
      website: 'https://joaosilva.dev',
      twitter: 'joao_dev',
      instagram: 'joao.silva.dev'
    }
  },
  
  reputation: {
    score: 847,
    level: 'Especialista',
    badges: ['Contribuidor', 'Mentor', 'Pioneiro'],
    history: []
  },
  
  // Estados da UI
  isLoading: false,
  error: null,
  activeTab: 'overview',
  
  // ===============================
  // ACTIONS
  // ===============================
  
  // Atualizar perfil
  updateProfile: (updates) => {
    set((state) => ({
      profile: { ...state.profile, ...updates }
    }))
  },
  
  // Atualizar reputação
  updateReputation: (updates) => {
    set((state) => ({
      reputation: { ...state.reputation, ...updates }
    }))
  },
  
  // Mudar aba ativa
  setActiveTab: (tab) => {
    set({ activeTab: tab })
  },
  
  // Carregar dados do perfil
  loadProfile: () => {
    set({ isLoading: true, error: null })
    
    // Simular carregamento
    setTimeout(() => {
      set({ isLoading: false })
    }, 1000)
  },
  
  // Limpar erro
  clearError: () => {
    set({ error: null })
  }
}))

// ===============================
// SPECIALIZED HOOKS
// ===============================

// Hook para dados do perfil
export const useProfile = () => {
  const profile = useProfileStore(state => state.profile)
  const reputation = useProfileStore(state => state.reputation)
  const isLoading = useProfileStore(state => state.isLoading)
  const error = useProfileStore(state => state.error)
  const updateProfile = useProfileStore(state => state.updateProfile)
  const updateReputation = useProfileStore(state => state.updateReputation)
  const loadProfile = useProfileStore(state => state.loadProfile)
  
  return {
    profile,
    reputation,
    isLoading,
    error,
    updateProfile,
    updateReputation,
    loadProfile
  }
}

// Hook para UI state
export const useProfileUI = () => {
  const activeTab = useProfileStore(state => state.activeTab)
  const setActiveTab = useProfileStore(state => state.setActiveTab)
  const clearError = useProfileStore(state => state.clearError)
  
  return {
    activeTab,
    setActiveTab,
    clearError
  }
}

// Hook para negócios (placeholder)
export const useBusinesses = () => {
  return {
    businesses: [],
    isLoading: false,
    error: null
  }
}

// Hook para atividades (placeholder)
export const useActivity = () => {
  return {
    activities: [],
    isLoading: false,
    error: null
  }
}

// Hook para token do perfil (placeholder)
export const useProfileToken = () => {
  const profile = useProfileStore(state => state.profile)
  
  return {
    token: {
      symbol: 'JOAO',
      name: 'João Silva Token',
      value: profile.tokenValue,
      change24h: 8.5
    },
    isLoading: false,
    error: null
  }
}

// Export store principal
export default useProfileStore