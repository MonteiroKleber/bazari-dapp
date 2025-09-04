import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Types
interface User {
  id: string
  name: string
  email: string
  address?: string
  avatar?: string
  role: 'citizen' | 'dao-owner' | 'validator'
}

interface Wallet {
  address: string
  bzrBalance: number
  livoBalance: number
  connected: boolean
}

interface AppState {
  // User
  user: User | null
  setUser: (user: User | null) => void
  
  // Wallet
  wallet: Wallet | null
  setWallet: (wallet: Wallet | null) => void
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  
  // Theme
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  
  // UI State
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  modalOpen: string | null
  setModalOpen: (modal: string | null) => void
  
  // Notifications
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  timestamp: Date
  duration?: number
}

// Store
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),
      
      // Wallet
      wallet: null,
      setWallet: (wallet) => set({ wallet }),
      
      connectWallet: async () => {
        // Placeholder for wallet connection logic
        // This will be implemented when we integrate with the blockchain
        try {
          // Simulate wallet connection
          await new Promise((resolve) => setTimeout(resolve, 1000))
          
          set({
            wallet: {
              address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
              bzrBalance: 1000,
              livoBalance: 50,
              connected: true,
            },
          })
          
          get().addNotification({
            type: 'success',
            title: 'Carteira conectada',
            message: 'Sua carteira foi conectada com sucesso!',
          })
        } catch (error) {
          get().addNotification({
            type: 'error',
            title: 'Erro ao conectar carteira',
            message: 'Não foi possível conectar sua carteira. Tente novamente.',
          })
          throw error
        }
      },
      
      disconnectWallet: () => {
        set({ wallet: null })
        get().addNotification({
          type: 'info',
          title: 'Carteira desconectada',
        })
      },
      
      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      
      // UI State
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      modalOpen: null,
      setModalOpen: (modal) => set({ modalOpen: modal }),
      
      // Notifications
      notifications: [],
      
      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: new Date(),
          duration: notification.duration ?? 5000,
        }
        
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }))
        
        // Auto-remove notification after duration
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id)
          }, newNotification.duration)
        }
      },
      
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'bazari-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
        // Don't persist wallet data for security
      }),
    }
  )
)

// Hooks for specific store slices
export const useUser = () => useStore((state) => state.user)
export const useWallet = () => useStore((state) => state.wallet)
export const useTheme = () => useStore((state) => state.theme)
export const useNotifications = () => useStore((state) => state.notifications)