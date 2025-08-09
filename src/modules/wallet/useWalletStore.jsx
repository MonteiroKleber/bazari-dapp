// ===============================
// WALLET STORE - CORRIGIDO
// ===============================

import { create } from 'zustand'

// Mock WalletService (inline para evitar dependências)
const mockWalletService = {
  getWalletData: () => ({
    address: '0x742d35c6cf39354bc8e30b6f4e49dc3b35f9c5f4',
    balance: { bzr: 1250.50, usd: 375.15 },
    tokens: [
      {
        id: 'bzr',
        symbol: 'BZR',
        name: 'Bazari Token',
        balance: 1250.50,
        price: 0.30,
        value: 375.15,
        change24h: 3.2,
        type: 'governance',
        icon: '🏪'
      },
      {
        id: 'profile_token',
        symbol: 'JOAO',
        name: 'João Silva Token',
        balance: 100,
        price: 2.50,
        value: 250,
        change24h: 8.5,
        type: 'profile',
        icon: '👤'
      }
    ],
    portfolioValue: 1625.65,
    portfolioChange: 5.2
  }),
  
  getTransactions: () => ([
    {
      id: '1',
      type: 'receive',
      description: 'Pagamento recebido',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      amount: 50,
      token: 'BZR',
      status: 'completed'
    }
  ]),
  
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  },
  
  formatTokenAmount: (amount, decimals = 2) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount)
  },
  
  shortenAddress: (address, chars = 4) => {
    if (!address) return ''
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
  },
  
  getTransactionIcon: (type) => {
    const icons = {
      send: '📤',
      receive: '📥',
      trade: '🔄',
      mint: '🏭'
    }
    return icons[type] || '💱'
  },
  
  getStatusColor: (status) => {
    const colors = {
      completed: 'success',
      pending: 'warning',
      failed: 'error'
    }
    return colors[status] || 'neutral'
  }
}

// ===============================
// MAIN WALLET STORE
// ===============================

const useWalletStore = create((set, get) => ({
  // Estado inicial
  walletData: mockWalletService.getWalletData(),
  transactions: mockWalletService.getTransactions(),
  analytics: {
    totalValue: 1625.65,
    change24h: 85.20,
    changePercentage: 5.2,
    distribution: {},
    chartData: [],
    tokensCount: 2,
    transactionsCount: 1
  },
  
  // Estados da UI
  isLoading: false,
  error: null,
  activeTab: 'overview',
  selectedToken: null,
  sendModal: {
    isOpen: false,
    token: null,
    amount: '',
    recipient: '',
    description: ''
  },
  receiveModal: {
    isOpen: false,
    token: null
  },

  // ===============================
  // ACTIONS
  // ===============================

  // Carregar dados da carteira
  loadWalletData: () => {
    set({ isLoading: true, error: null })
    try {
      const walletData = mockWalletService.getWalletData()
      const transactions = mockWalletService.getTransactions()
      
      set({
        walletData,
        transactions,
        isLoading: false
      })
    } catch (error) {
      console.error('Erro ao carregar dados da carteira:', error)
      set({ 
        error: 'Erro ao carregar dados da carteira', 
        isLoading: false 
      })
    }
  },

  // Atualizar dados da carteira
  updateWalletData: (newData) => {
    const updated = { ...get().walletData, ...newData }
    set({ walletData: updated })
  },

  // Selecionar token
  selectToken: (token) => {
    set({ selectedToken: token })
  },

  // Mudar aba ativa
  setActiveTab: (tab) => {
    set({ activeTab: tab })
  },

  // ===============================
  // SEND TOKEN ACTIONS
  // ===============================

  openSendModal: (token = null) => {
    set({
      sendModal: {
        isOpen: true,
        token,
        amount: '',
        recipient: '',
        description: ''
      }
    })
  },

  closeSendModal: () => {
    set({
      sendModal: {
        isOpen: false,
        token: null,
        amount: '',
        recipient: '',
        description: ''
      }
    })
  },

  updateSendForm: (field, value) => {
    const sendModal = { ...get().sendModal }
    sendModal[field] = value
    set({ sendModal })
  },

  sendToken: async () => {
    const { sendModal } = get()
    
    if (!sendModal.token || !sendModal.amount || !sendModal.recipient) {
      set({ error: 'Preencha todos os campos obrigatórios' })
      return false
    }

    set({ isLoading: true, error: null })

    try {
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Fechar modal
      get().closeSendModal()
      
      set({ isLoading: false })
      return true
    } catch (error) {
      console.error('Erro ao enviar token:', error)
      set({ 
        error: error.message || 'Erro ao enviar token',
        isLoading: false 
      })
      return false
    }
  },

  // ===============================
  // RECEIVE TOKEN ACTIONS
  // ===============================

  openReceiveModal: (token = null) => {
    set({
      receiveModal: {
        isOpen: true,
        token
      }
    })
  },

  closeReceiveModal: () => {
    set({
      receiveModal: {
        isOpen: false,
        token: null
      }
    })
  },

  // ===============================
  // UTILITY ACTIONS
  // ===============================

  clearError: () => {
    set({ error: null })
  },

  refreshData: () => {
    get().loadWalletData()
  }
}))

// ===============================
// SPECIALIZED HOOKS
// ===============================

// Hook para dados da carteira
export const useWallet = () => {
  const walletData = useWalletStore(state => state.walletData)
  const updateWalletData = useWalletStore(state => state.updateWalletData)
  const refreshData = useWalletStore(state => state.refreshData)
  
  return {
    walletData,
    updateWalletData,
    refreshData,
    address: walletData.address,
    balance: walletData.balance,
    tokens: walletData.tokens,
    portfolioValue: walletData.portfolioValue,
    portfolioChange: walletData.portfolioChange
  }
}

// Hook para transações
export const useTransactions = () => {
  const transactions = useWalletStore(state => state.transactions)
  const isLoading = useWalletStore(state => state.isLoading)
  
  return {
    transactions,
    isLoading,
    pendingTransactions: transactions.filter(tx => tx.status === 'pending'),
    completedTransactions: transactions.filter(tx => tx.status === 'completed'),
    recentTransactions: transactions.slice(0, 5)
  }
}

// Hook para analytics
export const useWalletAnalytics = () => {
  const analytics = useWalletStore(state => state.analytics)
  const refreshData = useWalletStore(state => state.refreshData)
  
  return {
    analytics,
    refreshData,
    totalValue: analytics.totalValue,
    change24h: analytics.change24h,
    changePercentage: analytics.changePercentage,
    distribution: analytics.distribution,
    chartData: analytics.chartData
  }
}

// Hook para envio de tokens
export const useSendToken = () => {
  const sendModal = useWalletStore(state => state.sendModal)
  const openSendModal = useWalletStore(state => state.openSendModal)
  const closeSendModal = useWalletStore(state => state.closeSendModal)
  const updateSendForm = useWalletStore(state => state.updateSendForm)
  const sendToken = useWalletStore(state => state.sendToken)
  const isLoading = useWalletStore(state => state.isLoading)
  const error = useWalletStore(state => state.error)
  
  return {
    sendModal,
    openSendModal,
    closeSendModal,
    updateSendForm,
    sendToken,
    isLoading,
    error,
    isValid: sendModal.token && sendModal.amount && sendModal.recipient
  }
}

// Hook para recebimento de tokens
export const useReceiveToken = () => {
  const receiveModal = useWalletStore(state => state.receiveModal)
  const openReceiveModal = useWalletStore(state => state.openReceiveModal)
  const closeReceiveModal = useWalletStore(state => state.closeReceiveModal)
  
  return {
    receiveModal,
    openReceiveModal,
    closeReceiveModal
  }
}

// Hook para tokens
export const useTokens = () => {
  const { tokens } = useWallet()
  const selectedToken = useWalletStore(state => state.selectedToken)
  const selectToken = useWalletStore(state => state.selectToken)
  
  return {
    tokens,
    selectedToken,
    selectToken,
    governanceTokens: tokens.filter(t => t.type === 'governance'),
    profileTokens: tokens.filter(t => t.type === 'profile'),
    businessTokens: tokens.filter(t => t.type === 'business'),
    skillTokens: tokens.filter(t => t.type === 'skill'),
    communityTokens: tokens.filter(t => t.type === 'community')
  }
}

// Hook para UI state
export const useWalletUI = () => {
  const activeTab = useWalletStore(state => state.activeTab)
  const setActiveTab = useWalletStore(state => state.setActiveTab)
  const isLoading = useWalletStore(state => state.isLoading)
  const error = useWalletStore(state => state.error)
  const clearError = useWalletStore(state => state.clearError)
  
  return {
    activeTab,
    setActiveTab,
    isLoading,
    error,
    clearError
  }
}

// Export store principal
export default useWalletStore