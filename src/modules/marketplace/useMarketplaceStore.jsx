import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import marketplaceService from '@services/MarketplaceService'

// ===============================
// MARKETPLACE STORE
// ===============================
const useMarketplaceStore = create(
  persist(
    (set, get) => ({
      // Estado dos dados
      businesses: [],
      products: [],
      featuredBusinesses: [],
      categories: {},
      cart: { items: [], total: 0 },
      favorites: [],
      orders: [],
      
      // Estado da UI
      activeView: 'home', // home, categories, search, business, product, cart
      selectedCategory: null,
      selectedBusiness: null,
      selectedProduct: null,
      searchQuery: '',
      filters: {},
      sortBy: 'newest',
      
      // Estados dos modais
      showCreateBusiness: false,
      showCreateProduct: false,
      showBusinessDetails: false,
      showProductDetails: false,
      showCart: false,
      showFilters: false,
      
      // Estados de loading
      isLoading: false,
      isLoadingBusinesses: false,
      isLoadingProducts: false,
      isLoadingCart: false,
      error: null,

      // ===============================
      // BUSINESS ACTIONS
      // ===============================
      
      // Carregar todos os negócios
      loadBusinesses: async (filters = {}) => {
        set({ isLoadingBusinesses: true, error: null })
        
        try {
          const businesses = await marketplaceService.getBusinesses(filters)
          const featuredBusinesses = businesses.filter(b => b.verified || b.stats?.rating >= 4.5).slice(0, 6)
          
          set({
            businesses,
            featuredBusinesses,
            isLoadingBusinesses: false
          })
          
          return { success: true, businesses }
        } catch (error) {
          set({
            isLoadingBusinesses: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // Carregar negócio específico
      loadBusiness: async (businessId) => {
        set({ isLoading: true, error: null })
        
        try {
          const business = await marketplaceService.getBusiness(businessId)
          if (business) {
            set({
              selectedBusiness: business,
              activeView: 'business',
              isLoading: false
            })
            return { success: true, business }
          } else {
            throw new Error('Negócio não encontrado')
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // Criar novo negócio
      createBusiness: async (businessData) => {
        set({ isLoading: true, error: null })
        
        try {
          const result = await marketplaceService.createBusiness(businessData)
          
          if (result.success) {
            // Recarregar lista de negócios
            const state = get()
            state.loadBusinesses()
            
            set({
              isLoading: false,
              showCreateBusiness: false
            })
            
            return result
          } else {
            throw new Error(result.error)
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
      // PRODUCT ACTIONS
      // ===============================
      
      // Carregar produtos
      loadProducts: async (filters = {}) => {
        set({ isLoadingProducts: true, error: null })
        
        try {
          const products = await marketplaceService.getProducts(filters)
          
          set({
            products,
            isLoadingProducts: false
          })
          
          return { success: true, products }
        } catch (error) {
          set({
            isLoadingProducts: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // Carregar produto específico
      loadProduct: async (productId) => {
        set({ isLoading: true, error: null })
        
        try {
          const products = await marketplaceService.getProducts()
          const product = products.find(p => p.id === productId)
          
          if (product) {
            set({
              selectedProduct: product,
              activeView: 'product',
              isLoading: false
            })
            return { success: true, product }
          } else {
            throw new Error('Produto não encontrado')
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // Criar novo produto
      createProduct: async (productData) => {
        set({ isLoading: true, error: null })
        
        try {
          const result = await marketplaceService.createProduct(productData)
          
          if (result.success) {
            // Recarregar lista de produtos
            const state = get()
            state.loadProducts()
            
            set({
              isLoading: false,
              showCreateProduct: false
            })
            
            return result
          } else {
            throw new Error(result.error)
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
      // CATEGORY ACTIONS
      // ===============================
      
      // Carregar categorias
      loadCategories: () => {
        try {
          const categories = marketplaceService.getCategories()
          set({ categories })
          return { success: true, categories }
        } catch (error) {
          set({ error: error.message })
          return { success: false, error: error.message }
        }
      },

      // Buscar categorias
      searchCategories: (query, lang = 'pt') => {
        try {
          const results = marketplaceService.searchCategories(query, lang)
          return { success: true, results }
        } catch (error) {
          return { success: false, error: error.message }
        }
      },

      // Obter caminho da categoria
      getCategoryPath: (categoryId) => {
        try {
          const path = marketplaceService.getCategoryPath(categoryId)
          return { success: true, path }
        } catch (error) {
          return { success: false, error: error.message }
        }
      },

      // ===============================
      // CART ACTIONS
      // ===============================
      
      // Carregar carrinho
      loadCart: () => {
        set({ isLoadingCart: true })
        
        try {
          const cart = marketplaceService.getCart()
          set({
            cart,
            isLoadingCart: false
          })
          return { success: true, cart }
        } catch (error) {
          set({
            isLoadingCart: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // Adicionar ao carrinho
      addToCart: async (productId, quantity = 1, options = {}) => {
        set({ isLoadingCart: true, error: null })
        
        try {
          const result = marketplaceService.addToCart(productId, quantity, options)
          
          if (result.success) {
            set({
              cart: result.cart,
              isLoadingCart: false
            })
            return result
          } else {
            throw new Error(result.error)
          }
        } catch (error) {
          set({
            isLoadingCart: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // Remover do carrinho
      removeFromCart: async (itemId) => {
        set({ isLoadingCart: true, error: null })
        
        try {
          const result = marketplaceService.removeFromCart(itemId)
          
          if (result.success) {
            set({
              cart: result.cart,
              isLoadingCart: false
            })
            return result
          } else {
            throw new Error(result.error)
          }
        } catch (error) {
          set({
            isLoadingCart: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // Atualizar quantidade do item
      updateCartItemQuantity: async (itemId, quantity) => {
        set({ isLoadingCart: true, error: null })
        
        try {
          const result = marketplaceService.updateCartItemQuantity(itemId, quantity)
          
          if (result.success) {
            set({
              cart: result.cart,
              isLoadingCart: false
            })
            return result
          } else {
            throw new Error(result.error)
          }
        } catch (error) {
          set({
            isLoadingCart: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // Limpar carrinho
      clearCart: async () => {
        set({ isLoadingCart: true, error: null })
        
        try {
          const result = marketplaceService.clearCart()
          
          if (result.success) {
            set({
              cart: result.cart,
              isLoadingCart: false
            })
            return result
          } else {
            throw new Error(result.error)
          }
        } catch (error) {
          set({
            isLoadingCart: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // ===============================
      // ORDER ACTIONS
      // ===============================
      
      // Criar pedido
      createOrder: async (orderData) => {
        set({ isLoading: true, error: null })
        
        try {
          const result = await marketplaceService.createOrder(orderData)
          
          if (result.success) {
            // Recarregar carrinho (que será limpo)
            const state = get()
            state.loadCart()
            
            set({
              isLoading: false,
              activeView: 'orders'
            })
            
            return result
          } else {
            throw new Error(result.error)
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // Carregar pedidos
      loadOrders: (userId = null) => {
        set({ isLoading: true, error: null })
        
        try {
          const orders = marketplaceService.getOrders(userId)
          set({
            orders,
            isLoading: false
          })
          return { success: true, orders }
        } catch (error) {
          set({
            isLoading: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // ===============================
      // FAVORITES ACTIONS
      // ===============================
      
      // Carregar favoritos
      loadFavorites: () => {
        try {
          const favorites = marketplaceService.getFavorites()
          set({ favorites })
          return { success: true, favorites }
        } catch (error) {
          set({ error: error.message })
          return { success: false, error: error.message }
        }
      },

      // Toggle favorito
      toggleFavorite: async (itemId, type = 'product') => {
        try {
          const result = marketplaceService.toggleFavorite(itemId, type)
          
          if (result.success) {
            set({ favorites: result.favorites })
            return result
          } else {
            throw new Error(result.error)
          }
        } catch (error) {
          set({ error: error.message })
          return { success: false, error: error.message }
        }
      },

      // Verificar se é favorito
      isFavorite: (itemId, type = 'product') => {
        return marketplaceService.isFavorite(itemId, type)
      },

      // ===============================
      // SEARCH ACTIONS
      // ===============================
      
      // Buscar produtos/negócios
      search: async (query, filters = {}) => {
        set({ isLoading: true, error: null, searchQuery: query })
        
        try {
          const [businesses, products] = await Promise.all([
            marketplaceService.getBusinesses({ ...filters, searchQuery: query }),
            marketplaceService.getProducts({ ...filters, searchQuery: query })
          ])
          
          set({
            businesses,
            products,
            activeView: 'search',
            isLoading: false
          })
          
          return { success: true, businesses, products }
        } catch (error) {
          set({
            isLoading: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // Aplicar filtros
      applyFilters: async (newFilters) => {
        const state = get()
        const updatedFilters = { ...state.filters, ...newFilters }
        
        set({ filters: updatedFilters })
        
        if (state.searchQuery) {
          return state.search(state.searchQuery, updatedFilters)
        } else {
          return Promise.all([
            state.loadBusinesses(updatedFilters),
            state.loadProducts(updatedFilters)
          ])
        }
      },

      // Limpar filtros
      clearFilters: async () => {
        const state = get()
        set({ filters: {}, sortBy: 'newest' })
        
        if (state.searchQuery) {
          return state.search(state.searchQuery, {})
        } else {
          return Promise.all([
            state.loadBusinesses(),
            state.loadProducts()
          ])
        }
      },

      // ===============================
      // NAVIGATION ACTIONS
      // ===============================
      
      // Navegar para view
      navigateTo: (view, data = {}) => {
        set({
          activeView: view,
          ...data
        })
      },

      // Selecionar categoria
      selectCategory: async (categoryId) => {
        set({
          selectedCategory: categoryId,
          activeView: 'categories',
          isLoading: true
        })
        
        try {
          const [businesses, products] = await Promise.all([
            marketplaceService.getBusinesses({ category: categoryId }),
            marketplaceService.getProducts({ category: categoryId })
          ])
          
          set({
            businesses,
            products,
            isLoading: false
          })
          
          return { success: true, businesses, products }
        } catch (error) {
          set({
            isLoading: false,
            error: error.message
          })
          return { success: false, error: error.message }
        }
      },

      // ===============================
      // UI ACTIONS
      // ===============================
      
      // Mostrar/ocultar modais
      setShowCreateBusiness: (show) => set({ showCreateBusiness: show }),
      setShowCreateProduct: (show) => set({ showCreateProduct: show }),
      setShowBusinessDetails: (show) => set({ showBusinessDetails: show }),
      setShowProductDetails: (show) => set({ showProductDetails: show }),
      setShowCart: (show) => set({ showCart: show }),
      setShowFilters: (show) => set({ showFilters: show }),
      
      // Definir ordenação
      setSortBy: async (sortBy) => {
        const state = get()
        set({ sortBy })
        
        // Reaplicar filtros com nova ordenação
        const filters = { ...state.filters, sortBy }
        
        if (state.searchQuery) {
          return state.search(state.searchQuery, filters)
        } else if (state.selectedCategory) {
          return state.selectCategory(state.selectedCategory)
        } else {
          return Promise.all([
            state.loadBusinesses(filters),
            state.loadProducts(filters)
          ])
        }
      },

      // Limpar erro
      clearError: () => set({ error: null }),

      // ===============================
      // UTILITY ACTIONS
      // ===============================
      
      // Inicializar dados de exemplo
      initializeSampleData: () => {
        marketplaceService.populateSampleData()
        const state = get()
        state.loadBusinesses()
        state.loadProducts()
        state.loadCategories()
        state.loadCart()
        state.loadFavorites()
      },

      // Obter estatísticas do marketplace
      getMarketplaceStats: () => {
        const state = get()
        
        return {
          totalBusinesses: state.businesses.length,
          totalProducts: state.products.length,
          verifiedBusinesses: state.businesses.filter(b => b.verified).length,
          cartItemsCount: state.cart.items.length,
          cartTotal: state.cart.total,
          favoritesCount: state.favorites.length,
          ordersCount: state.orders.length
        }
      }
    }),
    {
      name: 'bazari-marketplace-store',
      // Persistir apenas configurações da UI
      partialize: (state) => ({
        activeView: state.activeView,
        selectedCategory: state.selectedCategory,
        filters: state.filters,
        sortBy: state.sortBy,
        showCreateBusiness: state.showCreateBusiness,
        showCreateProduct: state.showCreateProduct,
        showCart: state.showCart
      })
    }
  )
)

// ===============================
// HOOKS ESPECIALIZADOS
// ===============================

// Hook principal do marketplace
export const useMarketplace = () => {
  const store = useMarketplaceStore()
  return {
    businesses: store.businesses,
    products: store.products,
    featuredBusinesses: store.featuredBusinesses,
    categories: store.categories,
    isLoading: store.isLoading,
    isLoadingBusinesses: store.isLoadingBusinesses,
    isLoadingProducts: store.isLoadingProducts,
    error: store.error,
    activeView: store.activeView,
    searchQuery: store.searchQuery,
    filters: store.filters,
    sortBy: store.sortBy,
    
    loadBusinesses: store.loadBusinesses,
    loadProducts: store.loadProducts,
    loadCategories: store.loadCategories,
    search: store.search,
    applyFilters: store.applyFilters,
    clearFilters: store.clearFilters,
    selectCategory: store.selectCategory,
    navigateTo: store.navigateTo,
    setSortBy: store.setSortBy,
    clearError: store.clearError,
    getMarketplaceStats: store.getMarketplaceStats,
    initializeSampleData: store.initializeSampleData
  }
}

// Hook para negócios
export const useBusinesses = () => {
  const store = useMarketplaceStore()
  return {
    businesses: store.businesses,
    featuredBusinesses: store.featuredBusinesses,
    selectedBusiness: store.selectedBusiness,
    isLoadingBusinesses: store.isLoadingBusinesses,
    showCreateBusiness: store.showCreateBusiness,
    showBusinessDetails: store.showBusinessDetails,
    
    loadBusinesses: store.loadBusinesses,
    loadBusiness: store.loadBusiness,
    createBusiness: store.createBusiness,
    setShowCreateBusiness: store.setShowCreateBusiness,
    setShowBusinessDetails: store.setShowBusinessDetails
  }
}

// Hook para produtos
export const useProducts = () => {
  const store = useMarketplaceStore()
  return {
    products: store.products,
    selectedProduct: store.selectedProduct,
    isLoadingProducts: store.isLoadingProducts,
    showCreateProduct: store.showCreateProduct,
    showProductDetails: store.showProductDetails,
    
    loadProducts: store.loadProducts,
    loadProduct: store.loadProduct,
    createProduct: store.createProduct,
    setShowCreateProduct: store.setShowCreateProduct,
    setShowProductDetails: store.setShowProductDetails
  }
}

// Hook para carrinho
export const useCart = () => {
  const store = useMarketplaceStore()
  return {
    cart: store.cart,
    isLoadingCart: store.isLoadingCart,
    showCart: store.showCart,
    
    loadCart: store.loadCart,
    addToCart: store.addToCart,
    removeFromCart: store.removeFromCart,
    updateCartItemQuantity: store.updateCartItemQuantity,
    clearCart: store.clearCart,
    setShowCart: store.setShowCart
  }
}

// Hook para favoritos
export const useFavorites = () => {
  const store = useMarketplaceStore()
  return {
    favorites: store.favorites,
    
    loadFavorites: store.loadFavorites,
    toggleFavorite: store.toggleFavorite,
    isFavorite: store.isFavorite
  }
}

// Hook para pedidos
export const useOrders = () => {
  const store = useMarketplaceStore()
  return {
    orders: store.orders,
    isLoading: store.isLoading,
    
    loadOrders: store.loadOrders,
    createOrder: store.createOrder
  }
}

// Hook para categorias
export const useCategories = () => {
  const store = useMarketplaceStore()
  return {
    categories: store.categories,
    selectedCategory: store.selectedCategory,
    
    loadCategories: store.loadCategories,
    searchCategories: store.searchCategories,
    getCategoryPath: store.getCategoryPath,
    selectCategory: store.selectCategory
  }
}

export default useMarketplaceStore