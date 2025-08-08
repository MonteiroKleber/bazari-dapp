import CryptoJS from 'crypto-js'

// Categorias de negócios disponíveis
const BUSINESS_CATEGORIES = {
  alimentacao: {
    name: { pt: 'Alimentação', en: 'Food', es: 'Alimentación' },
    subcategories: {
      restaurante: { pt: 'Restaurante', en: 'Restaurant', es: 'Restaurante' },
      lanchonete: { pt: 'Lanchonete', en: 'Snack Bar', es: 'Cafetería' },
      delivery: { pt: 'Delivery', en: 'Delivery', es: 'Entrega' },
      doces: { pt: 'Doces & Sobremesas', en: 'Sweets & Desserts', es: 'Dulces' }
    }
  },
  servicos: {
    name: { pt: 'Serviços', en: 'Services', es: 'Servicios' },
    subcategories: {
      beleza: { pt: 'Beleza & Estética', en: 'Beauty', es: 'Belleza' },
      limpeza: { pt: 'Limpeza', en: 'Cleaning', es: 'Limpieza' },
      reparo: { pt: 'Reparos', en: 'Repairs', es: 'Reparaciones' },
      educacao: { pt: 'Educação', en: 'Education', es: 'Educación' }
    }
  },
  comercio: {
    name: { pt: 'Comércio', en: 'Commerce', es: 'Comercio' },
    subcategories: {
      roupas: { pt: 'Roupas & Acessórios', en: 'Clothing', es: 'Ropa' },
      casa: { pt: 'Casa & Decoração', en: 'Home', es: 'Hogar' },
      eletronicos: { pt: 'Eletrônicos', en: 'Electronics', es: 'Electrónicos' },
      variedades: { pt: 'Variedades', en: 'Variety', es: 'Variedades' }
    }
  },
  digital: {
    name: { pt: 'Digital', en: 'Digital', es: 'Digital' },
    subcategories: {
      design: { pt: 'Design Gráfico', en: 'Graphic Design', es: 'Diseño' },
      desenvolvimento: { pt: 'Desenvolvimento', en: 'Development', es: 'Desarrollo' },
      marketing: { pt: 'Marketing Digital', en: 'Digital Marketing', es: 'Marketing' },
      consultoria: { pt: 'Consultoria', en: 'Consulting', es: 'Consultoría' }
    }
  }
}

class ProfileService {
  constructor() {
    this.STORAGE_KEYS = {
      PROFILE_DATA: 'bazari_profile_data',
      BUSINESS_DATA: 'bazari_business_data',
      REPUTATION_DATA: 'bazari_reputation_data',
      ACTIVITY_FEED: 'bazari_activity_feed',
      PROFILE_TOKEN: 'bazari_profile_token'
    }
  }

  // ===============================
  // PROFILE MANAGEMENT
  // ===============================
  async getProfile(accountId) {
    try {
      const profileData = localStorage.getItem(this.STORAGE_KEYS.PROFILE_DATA)
      if (!profileData) return null
      
      const profiles = JSON.parse(profileData)
      return profiles[accountId] || null
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      return null
    }
  }

  async updateProfile(accountId, profileUpdates) {
    try {
      const profileData = localStorage.getItem(this.STORAGE_KEYS.PROFILE_DATA) || '{}'
      const profiles = JSON.parse(profileData)
      
      if (!profiles[accountId]) {
        profiles[accountId] = this.createEmptyProfile(accountId)
      }

      // Update profile
      profiles[accountId] = {
        ...profiles[accountId],
        ...profileUpdates,
        updatedAt: new Date().toISOString()
      }

      localStorage.setItem(this.STORAGE_KEYS.PROFILE_DATA, JSON.stringify(profiles))

      // Update reputation based on profile completeness
      await this.updateReputationScore(accountId, this.calculateProfileCompleteness(profiles[accountId]))

      return { success: true, profile: profiles[accountId] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  createEmptyProfile(accountId) {
    return {
      id: accountId,
      name: '',
      bio: '',
      avatar: null,
      location: '',
      skills: [],
      interests: [],
      social: {
        website: '',
        twitter: '',
        instagram: '',
        linkedin: ''
      },
      stats: {
        followers: 0,
        following: 0,
        posts: 0,
        businessCount: 0
      },
      token: {
        symbol: `${accountId.substring(0, 6).toUpperCase()}`,
        supply: 1000000,
        holders: 1,
        marketCap: 0,
        price: 0.001 // Initial price in BZR
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  calculateProfileCompleteness(profile) {
    const fields = [
      profile.name,
      profile.bio,
      profile.avatar,
      profile.location,
      profile.skills?.length > 0,
      profile.interests?.length > 0,
      profile.social.website || profile.social.twitter || profile.social.instagram
    ]
    
    const completed = fields.filter(field => field && field !== '').length
    return Math.round((completed / fields.length) * 100)
  }

  // ===============================
  // TOKENIZATION
  // ===============================
  async getProfileToken(accountId) {
    try {
      const profile = await this.getProfile(accountId)
      return profile?.token || null
    } catch (error) {
      return null
    }
  }

  async updateTokenPrice(accountId, newPrice) {
    try {
      const profile = await this.getProfile(accountId)
      if (!profile) throw new Error('Perfil não encontrado')

      const updatedToken = {
        ...profile.token,
        price: newPrice,
        marketCap: newPrice * profile.token.supply,
        lastUpdate: new Date().toISOString()
      }

      return await this.updateProfile(accountId, { token: updatedToken })
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  calculateTokenValue(profile, reputation) {
    // Algorithm: base value + reputation bonus + activity bonus
    const baseValue = 0.001 // BZR
    const reputationMultiplier = (reputation.score / 100) * 0.5
    const activityMultiplier = Math.min(profile.stats.posts * 0.001, 0.1)
    const businessMultiplier = profile.stats.businessCount * 0.05
    
    return baseValue + (baseValue * reputationMultiplier) + activityMultiplier + businessMultiplier
  }

  // ===============================
  // REPUTATION SYSTEM
  // ===============================
  async getReputation(accountId) {
    try {
      const reputationData = localStorage.getItem(this.STORAGE_KEYS.REPUTATION_DATA)
      if (!reputationData) return this.createEmptyReputation(accountId)
      
      const reputations = JSON.parse(reputationData)
      return reputations[accountId] || this.createEmptyReputation(accountId)
    } catch (error) {
      return this.createEmptyReputation(accountId)
    }
  }

  async updateReputationScore(accountId, completeness) {
    try {
      const reputationData = localStorage.getItem(this.STORAGE_KEYS.REPUTATION_DATA) || '{}'
      const reputations = JSON.parse(reputationData)
      
      if (!reputations[accountId]) {
        reputations[accountId] = this.createEmptyReputation(accountId)
      }

      // Calculate new score
      const currentRep = reputations[accountId]
      const profileScore = completeness * 0.3 // 30% weight for profile completeness
      const activityScore = Math.min(currentRep.activities * 2, 30) // 30% max for activities
      const businessScore = Math.min(currentRep.businessCreated * 10, 25) // 25% max for business
      const votingScore = Math.min(currentRep.daoVotes * 1, 15) // 15% max for DAO participation

      const newScore = Math.min(profileScore + activityScore + businessScore + votingScore, 100)
      
      reputations[accountId] = {
        ...currentRep,
        score: newScore,
        completeness,
        level: this.calculateReputationLevel(newScore),
        updatedAt: new Date().toISOString()
      }

      localStorage.setItem(this.STORAGE_KEYS.REPUTATION_DATA, JSON.stringify(reputations))

      // Update token price based on reputation
      const profile = await this.getProfile(accountId)
      if (profile) {
        const newTokenPrice = this.calculateTokenValue(profile, reputations[accountId])
        await this.updateTokenPrice(accountId, newTokenPrice)
      }

      return reputations[accountId]
    } catch (error) {
      console.error('Erro ao atualizar reputação:', error)
      return null
    }
  }

  createEmptyReputation(accountId) {
    return {
      accountId,
      score: 10, // Starting score
      level: 'Iniciante',
      completeness: 0,
      activities: 0,
      businessCreated: 0,
      daoVotes: 0,
      reviews: [],
      badges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  calculateReputationLevel(score) {
    if (score >= 90) return 'Lendário'
    if (score >= 80) return 'Especialista'
    if (score >= 65) return 'Profissional'
    if (score >= 45) return 'Experiente'
    if (score >= 25) return 'Intermediário'
    return 'Iniciante'
  }

  async addReputationActivity(accountId, activityType, points = 1) {
    const reputation = await this.getReputation(accountId)
    
    switch (activityType) {
      case 'post':
        reputation.activities += points
        break
      case 'business':
        reputation.businessCreated += points
        break
      case 'dao_vote':
        reputation.daoVotes += points
        break
    }

    const reputationData = localStorage.getItem(this.STORAGE_KEYS.REPUTATION_DATA) || '{}'
    const reputations = JSON.parse(reputationData)
    reputations[accountId] = reputation
    localStorage.setItem(this.STORAGE_KEYS.REPUTATION_DATA, JSON.stringify(reputations))

    return await this.updateReputationScore(accountId, reputation.completeness)
  }

  // ===============================
  // BUSINESS MANAGEMENT
  // ===============================
  async createBusiness(accountId, businessData) {
    try {
      const businessDataStorage = localStorage.getItem(this.STORAGE_KEYS.BUSINESS_DATA) || '{}'
      const businesses = JSON.parse(businessDataStorage)
      
      if (!businesses[accountId]) {
        businesses[accountId] = []
      }

      const newBusiness = {
        id: this.generateBusinessId(),
        ...businessData,
        ownerId: accountId,
        token: {
          symbol: `${businessData.name.substring(0, 3).toUpperCase()}`,
          supply: 100000,
          holders: 1,
          marketCap: 0,
          price: 0.01 // Initial price in BZR
        },
        stats: {
          views: 0,
          followers: 0,
          sales: 0,
          rating: 0,
          reviews: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      businesses[accountId].push(newBusiness)
      localStorage.setItem(this.STORAGE_KEYS.BUSINESS_DATA, JSON.stringify(businesses))

      // Update profile business count
      const profile = await this.getProfile(accountId)
      if (profile) {
        await this.updateProfile(accountId, {
          stats: {
            ...profile.stats,
            businessCount: businesses[accountId].length
          }
        })
      }

      // Add reputation points
      await this.addReputationActivity(accountId, 'business', 1)

      return { success: true, business: newBusiness }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getBusinesses(accountId) {
    try {
      const businessData = localStorage.getItem(this.STORAGE_KEYS.BUSINESS_DATA)
      if (!businessData) return []
      
      const businesses = JSON.parse(businessData)
      return businesses[accountId] || []
    } catch (error) {
      return []
    }
  }

  generateBusinessId() {
    return `biz_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  }

  // ===============================
  // ACTIVITY FEED
  // ===============================
  async getActivityFeed(accountId, limit = 20) {
    try {
      const feedData = localStorage.getItem(this.STORAGE_KEYS.ACTIVITY_FEED)
      if (!feedData) return []
      
      const feeds = JSON.parse(feedData)
      const userFeed = feeds[accountId] || []
      
      return userFeed
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit)
    } catch (error) {
      return []
    }
  }

  async addActivity(accountId, activity) {
    try {
      const feedData = localStorage.getItem(this.STORAGE_KEYS.ACTIVITY_FEED) || '{}'
      const feeds = JSON.parse(feedData)
      
      if (!feeds[accountId]) {
        feeds[accountId] = []
      }

      const newActivity = {
        id: this.generateActivityId(),
        ...activity,
        authorId: accountId,
        createdAt: new Date().toISOString()
      }

      feeds[accountId].unshift(newActivity)
      
      // Keep only last 100 activities
      if (feeds[accountId].length > 100) {
        feeds[accountId] = feeds[accountId].slice(0, 100)
      }

      localStorage.setItem(this.STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify(feeds))

      // Update profile post count
      const profile = await this.getProfile(accountId)
      if (profile) {
        await this.updateProfile(accountId, {
          stats: {
            ...profile.stats,
            posts: profile.stats.posts + 1
          }
        })
      }

      // Add reputation points
      await this.addReputationActivity(accountId, 'post', 1)

      return { success: true, activity: newActivity }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  generateActivityId() {
    return `act_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  }

  // ===============================
  // UTILITY FUNCTIONS
  // ===============================
  getBusinessCategories() {
    return BUSINESS_CATEGORIES
  }

  async uploadAvatar(accountId, imageFile) {
    // Simulated upload - in real implementation would use IPFS
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target.result
        resolve({ success: true, url: dataUrl })
      }
      reader.readAsDataURL(imageFile)
    })
  }

  generateProfileStats(accountId) {
    // Generate some mock engagement stats
    const baseStats = {
      followers: Math.floor(Math.random() * 1000) + 50,
      following: Math.floor(Math.random() * 500) + 20,
      posts: Math.floor(Math.random() * 200) + 10,
      businessCount: Math.floor(Math.random() * 5)
    }
    
    return baseStats
  }
}

// Singleton instance
const profileService = new ProfileService()

export default profileService

// Export individual functions for convenience
export const {
  getProfile,
  updateProfile,
  getProfileToken,
  getReputation,
  createBusiness,
  getBusinesses,
  getActivityFeed,
  addActivity,
  getBusinessCategories
} = profileService