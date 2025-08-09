import CryptoJS from 'crypto-js'

// Estrutura de categorias conforme categorias.txt
const MARKETPLACE_CATEGORIES = {
  products: {
    alimentosBebidas: {
      name: { pt: 'Alimentos & Bebidas', en: 'Food & Drinks', es: 'Comida & Bebidas' },
      icon: '🍽️',
      subcategories: {
        comidasFrescas: {
          name: { pt: 'Comidas Frescas', en: 'Fresh Food', es: 'Comida Fresca' },
          icon: '🥬',
          items: {
            frutasVerduras: { pt: 'Frutas & Verduras', en: 'Fruits & Vegetables', es: 'Frutas & Verduras' },
            carnesPeixes: { pt: 'Carnes & Peixes', en: 'Meat & Fish', es: 'Carnes & Pescados' },
            padariasConfeitarias: { pt: 'Padarias & Confeitarias', en: 'Bakery & Pastry', es: 'Panadería & Pastelería' },
            produtosOrganicos: { pt: 'Produtos Orgânicos', en: 'Organic Products', es: 'Productos Orgánicos' }
          }
        },
        comidasIndustrializadas: {
          name: { pt: 'Comidas Industrializadas', en: 'Processed Food', es: 'Comida Procesada' },
          icon: '🥫',
          items: {
            enlatados: { pt: 'Enlatados', en: 'Canned Food', es: 'Enlatados' },
            congelados: { pt: 'Congelados', en: 'Frozen', es: 'Congelados' },
            snacks: { pt: 'Snacks', en: 'Snacks', es: 'Snacks' },
            bebidasNaoAlcoolicas: { pt: 'Bebidas Não Alcoólicas', en: 'Non-Alcoholic Drinks', es: 'Bebidas Sin Alcohol' }
          }
        },
        bebidasAlcoolicas: {
          name: { pt: 'Bebidas Alcoólicas', en: 'Alcoholic Drinks', es: 'Bebidas Alcohólicas' },
          icon: '🍺',
          items: {
            cervejas: { pt: 'Cervejas', en: 'Beers', es: 'Cervezas' },
            vinhos: { pt: 'Vinhos', en: 'Wines', es: 'Vinos' },
            destilados: { pt: 'Destilados', en: 'Spirits', es: 'Destilados' }
          }
        }
      }
    },
    modaAcessorios: {
      name: { pt: 'Moda & Acessórios', en: 'Fashion & Accessories', es: 'Moda & Accesorios' },
      icon: '👕',
      subcategories: {
        roupas: {
          name: { pt: 'Roupas', en: 'Clothing', es: 'Ropa' },
          icon: '👔',
          items: {
            masculinas: { pt: 'Masculinas', en: 'Men\'s', es: 'Masculina' },
            femininas: { pt: 'Femininas', en: 'Women\'s', es: 'Femenina' },
            infantis: { pt: 'Infantis', en: 'Kids', es: 'Infantil' }
          }
        },
        calcados: {
          name: { pt: 'Calçados', en: 'Footwear', es: 'Calzado' },
          icon: '👟',
          items: {
            tenis: { pt: 'Tênis', en: 'Sneakers', es: 'Zapatillas' },
            sapatosSociais: { pt: 'Sapatos Sociais', en: 'Formal Shoes', es: 'Zapatos Formales' },
            sandaliasChinelos: { pt: 'Sandálias & Chinelos', en: 'Sandals & Flip-flops', es: 'Sandalias & Chanclas' }
          }
        },
        acessorios: {
          name: { pt: 'Acessórios', en: 'Accessories', es: 'Accesorios' },
          icon: '👜',
          items: {
            bolsas: { pt: 'Bolsas', en: 'Bags', es: 'Bolsos' },
            joias: { pt: 'Joias', en: 'Jewelry', es: 'Joyas' },
            relogios: { pt: 'Relógios', en: 'Watches', es: 'Relojes' }
          }
        }
      }
    },
    tecnologia: {
      name: { pt: 'Tecnologia', en: 'Technology', es: 'Tecnología' },
      icon: '💻',
      subcategories: {
        eletronicos: {
          name: { pt: 'Eletrônicos', en: 'Electronics', es: 'Electrónicos' },
          icon: '📱',
          items: {
            celulares: { pt: 'Celulares', en: 'Mobile Phones', es: 'Móviles' },
            computadores: { pt: 'Computadores', en: 'Computers', es: 'Computadoras' },
            tablets: { pt: 'Tablets', en: 'Tablets', es: 'Tablets' },
            tvs: { pt: 'TVs', en: 'TVs', es: 'TVs' }
          }
        },
        acessorios: {
          name: { pt: 'Acessórios Tech', en: 'Tech Accessories', es: 'Accesorios Tech' },
          icon: '🎧',
          items: {
            fonesOuvido: { pt: 'Fones de Ouvido', en: 'Headphones', es: 'Auriculares' },
            carregadores: { pt: 'Carregadores', en: 'Chargers', es: 'Cargadores' },
            capinhas: { pt: 'Capinhas', en: 'Cases', es: 'Fundas' }
          }
        }
      }
    }
  },
  services: {
    belezaBemEstar: {
      name: { pt: 'Beleza & Bem-Estar', en: 'Beauty & Wellness', es: 'Belleza & Bienestar' },
      icon: '💄',
      subcategories: {
        pessoais: {
          name: { pt: 'Serviços Pessoais', en: 'Personal Services', es: 'Servicios Personales' },
          icon: '✂️',
          items: {
            cabeleireiro: { pt: 'Cabeleireiro', en: 'Hair Stylist', es: 'Peluquero' },
            manicure: { pt: 'Manicure', en: 'Manicure', es: 'Manicura' },
            maquiagem: { pt: 'Maquiagem', en: 'Makeup', es: 'Maquillaje' },
            massagem: { pt: 'Massagem', en: 'Massage', es: 'Masaje' }
          }
        },
        clinicos: {
          name: { pt: 'Serviços Clínicos', en: 'Clinical Services', es: 'Servicios Clínicos' },
          icon: '🏥',
          items: {
            esteticista: { pt: 'Esteticista', en: 'Esthetician', es: 'Esteticista' },
            depilacao: { pt: 'Depilação', en: 'Hair Removal', es: 'Depilación' },
            spa: { pt: 'SPA', en: 'SPA', es: 'SPA' }
          }
        }
      }
    },
    reparosManutencao: {
      name: { pt: 'Reparos & Manutenção', en: 'Repairs & Maintenance', es: 'Reparaciones & Mantenimiento' },
      icon: '🔧',
      subcategories: {
        residencial: {
          name: { pt: 'Residencial', en: 'Residential', es: 'Residencial' },
          icon: '🏠',
          items: {
            eletricista: { pt: 'Eletricista', en: 'Electrician', es: 'Electricista' },
            encanador: { pt: 'Encanador', en: 'Plumber', es: 'Fontanero' },
            pintor: { pt: 'Pintor', en: 'Painter', es: 'Pintor' },
            pedreiro: { pt: 'Pedreiro', en: 'Mason', es: 'Albañil' }
          }
        },
        tecnologia: {
          name: { pt: 'Tecnologia', en: 'Technology', es: 'Tecnología' },
          icon: '💻',
          items: {
            suporteTI: { pt: 'Suporte TI', en: 'IT Support', es: 'Soporte TI' },
            consertoCelulares: { pt: 'Conserto Celulares', en: 'Phone Repair', es: 'Reparación Móviles' },
            reparoComputadores: { pt: 'Reparo Computadores', en: 'Computer Repair', es: 'Reparación PC' }
          }
        }
      }
    }
  }
}

class MarketplaceService {
  constructor() {
    this.STORAGE_KEYS = {
      BUSINESSES_DATA: 'bazari_marketplace_businesses',
      PRODUCTS_DATA: 'bazari_marketplace_products',
      CART_DATA: 'bazari_marketplace_cart',
      ORDERS_DATA: 'bazari_marketplace_orders',
      FAVORITES_DATA: 'bazari_marketplace_favorites'
    }
  }

  // ===============================
  // CATEGORY MANAGEMENT
  // ===============================
  getCategories() {
    return MARKETPLACE_CATEGORIES
  }

  getCategoryPath(categoryId) {
    const parts = categoryId.split('.')
    let current = MARKETPLACE_CATEGORIES
    const path = []

    for (const part of parts) {
      if (current[part]) {
        current = current[part]
        path.push({
          id: part,
          name: current.name,
          icon: current.icon
        })
        if (current.subcategories) current = current.subcategories
        else if (current.items) current = current.items
      }
    }

    return path
  }

  searchCategories(query, lang = 'pt') {
    const results = []
    const searchInObject = (obj, currentPath = '') => {
      for (const [key, value] of Object.entries(obj)) {
        if (value.name && value.name[lang].toLowerCase().includes(query.toLowerCase())) {
          results.push({
            id: currentPath ? `${currentPath}.${key}` : key,
            name: value.name[lang],
            icon: value.icon,
            path: currentPath
          })
        }
        
        if (value.subcategories) {
          searchInObject(value.subcategories, currentPath ? `${currentPath}.${key}` : key)
        }
        if (value.items) {
          searchInObject(value.items, currentPath ? `${currentPath}.${key}` : key)
        }
      }
    }

    searchInObject(MARKETPLACE_CATEGORIES)
    return results
  }

  // ===============================
  // BUSINESS MANAGEMENT
  // ===============================
  async createBusiness(businessData) {
    try {
      const businesses = this.getBusinesses()
      
      const business = {
        id: this.generateId(),
        ...businessData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: {
          views: 0,
          followers: 0,
          sales: 0,
          rating: 0,
          reviews: 0
        },
        token: this.generateBusinessToken(businessData.name),
        verified: false,
        active: true
      }

      businesses[business.id] = business
      localStorage.setItem(this.STORAGE_KEYS.BUSINESSES_DATA, JSON.stringify(businesses))

      return { success: true, business }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  getBusinesses(filters = {}) {
    try {
      const businessesData = localStorage.getItem(this.STORAGE_KEYS.BUSINESSES_DATA)
      const businesses = businessesData ? JSON.parse(businessesData) : {}
      
      let businessesList = Object.values(businesses)

      // Aplicar filtros
      if (filters.category) {
        businessesList = businessesList.filter(b => 
          b.categories?.includes(filters.category)
        )
      }

      if (filters.location) {
        businessesList = businessesList.filter(b => 
          b.location?.toLowerCase().includes(filters.location.toLowerCase())
        )
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        businessesList = businessesList.filter(b => 
          b.name.toLowerCase().includes(query) ||
          b.description.toLowerCase().includes(query)
        )
      }

      if (filters.verified !== undefined) {
        businessesList = businessesList.filter(b => b.verified === filters.verified)
      }

      // Ordenação
      if (filters.sortBy) {
        businessesList.sort((a, b) => {
          switch (filters.sortBy) {
            case 'rating':
              return (b.stats?.rating || 0) - (a.stats?.rating || 0)
            case 'sales':
              return (b.stats?.sales || 0) - (a.stats?.sales || 0)
            case 'newest':
              return new Date(b.createdAt) - new Date(a.createdAt)
            case 'oldest':
              return new Date(a.createdAt) - new Date(b.createdAt)
            default:
              return 0
          }
        })
      }

      return businessesList
    } catch (error) {
      console.error('Error getting businesses:', error)
      return []
    }
  }

  async getBusiness(businessId) {
    try {
      const businesses = this.getBusinesses()
      const business = businesses.find(b => b.id === businessId)
      
      if (business) {
        // Incrementar views
        await this.incrementBusinessViews(businessId)
      }
      
      return business || null
    } catch (error) {
      console.error('Error getting business:', error)
      return null
    }
  }

  async updateBusiness(businessId, updates) {
    try {
      const businessesData = localStorage.getItem(this.STORAGE_KEYS.BUSINESSES_DATA)
      const businesses = businessesData ? JSON.parse(businessesData) : {}
      
      if (!businesses[businessId]) {
        throw new Error('Negócio não encontrado')
      }

      businesses[businessId] = {
        ...businesses[businessId],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      localStorage.setItem(this.STORAGE_KEYS.BUSINESSES_DATA, JSON.stringify(businesses))
      
      return { success: true, business: businesses[businessId] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async incrementBusinessViews(businessId) {
    try {
      const businessesData = localStorage.getItem(this.STORAGE_KEYS.BUSINESSES_DATA)
      const businesses = businessesData ? JSON.parse(businessesData) : {}
      
      if (businesses[businessId]) {
        businesses[businessId].stats.views = (businesses[businessId].stats.views || 0) + 1
        businesses[businessId].updatedAt = new Date().toISOString()
        
        localStorage.setItem(this.STORAGE_KEYS.BUSINESSES_DATA, JSON.stringify(businesses))
      }
    } catch (error) {
      console.error('Error incrementing business views:', error)
    }
  }

  // ===============================
  // PRODUCT MANAGEMENT
  // ===============================
  async createProduct(productData) {
    try {
      const products = this.getProducts()
      
      const product = {
        id: this.generateId(),
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: {
          views: 0,
          sales: 0,
          likes: 0,
          rating: 0,
          reviews: 0
        },
        active: true
      }

      products[product.id] = product
      localStorage.setItem(this.STORAGE_KEYS.PRODUCTS_DATA, JSON.stringify(products))

      return { success: true, product }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  getProducts(filters = {}) {
    try {
      const productsData = localStorage.getItem(this.STORAGE_KEYS.PRODUCTS_DATA)
      const products = productsData ? JSON.parse(productsData) : {}
      
      let productsList = Object.values(products).filter(p => p.active)

      // Aplicar filtros
      if (filters.businessId) {
        productsList = productsList.filter(p => p.businessId === filters.businessId)
      }

      if (filters.category) {
        productsList = productsList.filter(p => 
          p.categories?.includes(filters.category)
        )
      }

      if (filters.priceRange) {
        const { min, max } = filters.priceRange
        productsList = productsList.filter(p => {
          const price = p.price || 0
          return price >= min && price <= max
        })
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        productsList = productsList.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      }

      // Ordenação
      if (filters.sortBy) {
        productsList.sort((a, b) => {
          switch (filters.sortBy) {
            case 'price_low':
              return (a.price || 0) - (b.price || 0)
            case 'price_high':
              return (b.price || 0) - (a.price || 0)
            case 'rating':
              return (b.stats?.rating || 0) - (a.stats?.rating || 0)
            case 'popular':
              return (b.stats?.sales || 0) - (a.stats?.sales || 0)
            case 'newest':
              return new Date(b.createdAt) - new Date(a.createdAt)
            default:
              return 0
          }
        })
      }

      return productsList
    } catch (error) {
      console.error('Error getting products:', error)
      return []
    }
  }

  // ===============================
  // CART MANAGEMENT
  // ===============================
  getCart() {
    try {
      const cartData = localStorage.getItem(this.STORAGE_KEYS.CART_DATA)
      return cartData ? JSON.parse(cartData) : { items: [], total: 0 }
    } catch (error) {
      console.error('Error getting cart:', error)
      return { items: [], total: 0 }
    }
  }

  addToCart(productId, quantity = 1, options = {}) {
    try {
      const cart = this.getCart()
      const products = this.getProducts()
      const product = products.find(p => p.id === productId)
      
      if (!product) {
        throw new Error('Produto não encontrado')
      }

      const existingItemIndex = cart.items.findIndex(item => 
        item.productId === productId && 
        JSON.stringify(item.options) === JSON.stringify(options)
      )

      if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += quantity
      } else {
        cart.items.push({
          id: this.generateId(),
          productId,
          quantity,
          options,
          price: product.price,
          name: product.name,
          image: product.images?.[0],
          businessId: product.businessId,
          addedAt: new Date().toISOString()
        })
      }

      // Recalcular total
      cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      localStorage.setItem(this.STORAGE_KEYS.CART_DATA, JSON.stringify(cart))
      
      return { success: true, cart }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  removeFromCart(itemId) {
    try {
      const cart = this.getCart()
      cart.items = cart.items.filter(item => item.id !== itemId)
      
      // Recalcular total
      cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      localStorage.setItem(this.STORAGE_KEYS.CART_DATA, JSON.stringify(cart))
      
      return { success: true, cart }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  updateCartItemQuantity(itemId, quantity) {
    try {
      const cart = this.getCart()
      const itemIndex = cart.items.findIndex(item => item.id === itemId)
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          cart.items.splice(itemIndex, 1)
        } else {
          cart.items[itemIndex].quantity = quantity
        }
        
        // Recalcular total
        cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        
        localStorage.setItem(this.STORAGE_KEYS.CART_DATA, JSON.stringify(cart))
      }
      
      return { success: true, cart }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  clearCart() {
    try {
      const emptyCart = { items: [], total: 0 }
      localStorage.setItem(this.STORAGE_KEYS.CART_DATA, JSON.stringify(emptyCart))
      return { success: true, cart: emptyCart }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ===============================
  // ORDER MANAGEMENT
  // ===============================
  async createOrder(orderData) {
    try {
      const orders = this.getOrders()
      const cart = this.getCart()
      
      if (!cart.items.length) {
        throw new Error('Carrinho vazio')
      }

      const order = {
        id: this.generateId(),
        ...orderData,
        items: cart.items,
        total: cart.total,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      orders[order.id] = order
      localStorage.setItem(this.STORAGE_KEYS.ORDERS_DATA, JSON.stringify(orders))
      
      // Limpar carrinho
      this.clearCart()
      
      // Incrementar vendas dos produtos
      for (const item of cart.items) {
        await this.incrementProductSales(item.productId, item.quantity)
      }

      return { success: true, order }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  getOrders(userId = null) {
    try {
      const ordersData = localStorage.getItem(this.STORAGE_KEYS.ORDERS_DATA)
      const orders = ordersData ? JSON.parse(ordersData) : {}
      
      let ordersList = Object.values(orders)
      
      if (userId) {
        ordersList = ordersList.filter(o => o.userId === userId)
      }
      
      return ordersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } catch (error) {
      console.error('Error getting orders:', error)
      return []
    }
  }

  // ===============================
  // FAVORITES MANAGEMENT
  // ===============================
  getFavorites() {
    try {
      const favoritesData = localStorage.getItem(this.STORAGE_KEYS.FAVORITES_DATA)
      return favoritesData ? JSON.parse(favoritesData) : []
    } catch (error) {
      console.error('Error getting favorites:', error)
      return []
    }
  }

  toggleFavorite(itemId, type = 'product') {
    try {
      const favorites = this.getFavorites()
      const existingIndex = favorites.findIndex(f => f.id === itemId && f.type === type)
      
      if (existingIndex >= 0) {
        favorites.splice(existingIndex, 1)
      } else {
        favorites.push({
          id: itemId,
          type,
          addedAt: new Date().toISOString()
        })
      }
      
      localStorage.setItem(this.STORAGE_KEYS.FAVORITES_DATA, JSON.stringify(favorites))
      
      return { success: true, favorites }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  isFavorite(itemId, type = 'product') {
    const favorites = this.getFavorites()
    return favorites.some(f => f.id === itemId && f.type === type)
  }

  // ===============================
  // UTILITY METHODS
  // ===============================
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  generateBusinessToken(businessName) {
    const symbol = businessName.substring(0, 3).toUpperCase() + 'B'
    return {
      symbol,
      name: `${businessName} Token`,
      price: 0.01 + Math.random() * 0.09, // 0.01 a 0.10 BZR
      supply: 1000000,
      marketCap: 0,
      holders: 1,
      change24h: (Math.random() - 0.5) * 20 // -10% a +10%
    }
  }

  async uploadToIPFS(file) {
    // Simular upload para IPFS
    return new Promise((resolve) => {
      setTimeout(() => {
        const hash = `Qm${Math.random().toString(36).substr(2, 40)}`
        resolve({
          success: true,
          hash,
          url: `https://ipfs.bazari.network/ipfs/${hash}`,
          size: file.size,
          type: file.type
        })
      }, 1500)
    })
  }

  async incrementProductSales(productId, quantity) {
    try {
      const productsData = localStorage.getItem(this.STORAGE_KEYS.PRODUCTS_DATA)
      const products = productsData ? JSON.parse(productsData) : {}
      
      if (products[productId]) {
        products[productId].stats.sales = (products[productId].stats.sales || 0) + quantity
        products[productId].updatedAt = new Date().toISOString()
        
        localStorage.setItem(this.STORAGE_KEYS.PRODUCTS_DATA, JSON.stringify(products))
      }
    } catch (error) {
      console.error('Error incrementing product sales:', error)
    }
  }

  // Método para popular dados de exemplo
  populateSampleData() {
    const sampleBusinesses = {
      'business_1': {
        id: 'business_1',
        name: 'Padaria do João',
        description: 'Pães frescos todos os dias, desde 1985',
        location: 'São Paulo, SP',
        categories: ['products.alimentosBebidas.comidasFrescas.padariasConfeitarias'],
        images: ['https://picsum.photos/400/300?random=1'],
        phone: '(11) 99999-9999',
        email: 'contato@padariodojoao.com',
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        stats: { views: 156, followers: 23, sales: 89, rating: 4.7, reviews: 15 },
        token: {
          symbol: 'PADJ',
          name: 'Padaria do João Token',
          price: 0.045,
          supply: 1000000,
          marketCap: 45000,
          holders: 12,
          change24h: 3.2
        },
        verified: true,
        active: true
      },
      'business_2': {
        id: 'business_2',
        name: 'Tech Solutions',
        description: 'Conserto e manutenção de celulares e computadores',
        location: 'Rio de Janeiro, RJ',
        categories: ['services.reparosManutencao.tecnologia.consertoCelulares'],
        images: ['https://picsum.photos/400/300?random=2'],
        phone: '(21) 88888-8888',
        email: 'contato@techsolutions.com',
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        stats: { views: 89, followers: 34, sales: 45, rating: 4.9, reviews: 21 },
        token: {
          symbol: 'TECH',
          name: 'Tech Solutions Token',
          price: 0.078,
          supply: 1000000,
          marketCap: 78000,
          holders: 18,
          change24h: -1.5
        },
        verified: false,
        active: true
      }
    }

    const sampleProducts = {
      'product_1': {
        id: 'product_1',
        businessId: 'business_1',
        name: 'Pão Francês',
        description: 'Pão francês fresquinho, assado na hora',
        price: 0.50,
        categories: ['products.alimentosBebidas.comidasFrescas.padariasConfeitarias'],
        images: ['https://picsum.photos/300/300?random=10'],
        tags: ['pão', 'fresco', 'padaria'],
        stock: 100,
        unit: 'unidade',
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        stats: { views: 234, sales: 78, likes: 12, rating: 4.8, reviews: 8 },
        active: true
      },
      'product_2': {
        id: 'product_2',
        businessId: 'business_2',
        name: 'Troca de Tela iPhone',
        description: 'Serviço de troca de tela para iPhone, todas as versões',
        price: 150.00,
        categories: ['services.reparosManutencao.tecnologia.consertoCelulares'],
        images: ['https://picsum.photos/300/300?random=11'],
        tags: ['iphone', 'tela', 'conserto'],
        duration: '2 horas',
        warranty: '90 dias',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        stats: { views: 167, sales: 23, likes: 8, rating: 4.9, reviews: 12 },
        active: true
      }
    }

    localStorage.setItem(this.STORAGE_KEYS.BUSINESSES_DATA, JSON.stringify(sampleBusinesses))
    localStorage.setItem(this.STORAGE_KEYS.PRODUCTS_DATA, JSON.stringify(sampleProducts))
  }
}

// Exportar instância única
const marketplaceService = new MarketplaceService()
export default marketplaceService