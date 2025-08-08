import CryptoJS from 'crypto-js'

// Lista de palavras para geração de seed phrase (simplificada para demonstração)
const SEED_WORDS = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
  'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
  'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
  'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
  'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
  'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
  'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone',
  'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among',
  'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry',
  'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
  'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april',
  'arcade', 'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed',
  'armor', 'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art',
  'article', 'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist',
  'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract',
  'auction', 'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average',
  'avocado', 'avoid', 'awake', 'aware', 'away', 'awesome', 'awful', 'awkward',
  'axis', 'baby', 'bachelor', 'bacon', 'badge', 'bag', 'balance', 'balcony',
  'ball', 'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain', 'barrel',
  'base', 'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because',
  'become', 'beef', 'before', 'begin', 'behave', 'behind', 'believe', 'below',
  'belt', 'bench', 'benefit', 'best', 'betray', 'better', 'between', 'beyond',
  'bicycle', 'bid', 'bike', 'bind', 'biology', 'bird', 'birth', 'bitter',
  'black', 'blade', 'blame', 'blanket', 'blast', 'bleak', 'bless', 'blind',
  'blood', 'blossom', 'blow', 'blue', 'blur', 'blush', 'board', 'boat',
  'body', 'boil', 'bomb', 'bone', 'bonus', 'book', 'boost', 'border',
  'boring', 'borrow', 'boss', 'bottom', 'bounce', 'box', 'boy', 'bracket',
  'brain', 'brand', 'brass', 'brave', 'bread', 'breeze', 'brick', 'bridge',
  'brief', 'bright', 'bring', 'brisk', 'broccoli', 'broken', 'bronze', 'broom',
  'brother', 'brown', 'brush', 'bubble', 'buddy', 'budget', 'buffalo', 'build',
  'bulb', 'bulk', 'bullet', 'bundle', 'bunker', 'burden', 'burger', 'burst',
  'bus', 'business', 'busy', 'butter', 'buyer', 'buzz', 'cabbage', 'cabin'
]

class AuthService {
  constructor() {
    this.STORAGE_KEYS = {
      ACCOUNT_DATA: 'bazari_account_data',
      ENCRYPTED_SEED: 'bazari_encrypted_seed',
      USER_SESSION: 'bazari_user_session',
      LAST_LOGIN: 'bazari_last_login'
    }
  }

  // ===============================
  // SEED PHRASE GENERATION
  // ===============================
  generateSeedPhrase() {
    const words = []
    
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * SEED_WORDS.length)
      words.push(SEED_WORDS[randomIndex])
    }
    
    return words
  }

  // Validar seed phrase (formato básico)
  validateSeedPhrase(seedPhrase) {
    const words = this.normalizeSeedPhrase(seedPhrase)
    
    if (words.length !== 12) {
      return { valid: false, error: 'A seed phrase deve ter exatamente 12 palavras' }
    }

    const invalidWords = words.filter(word => !SEED_WORDS.includes(word.toLowerCase()))
    if (invalidWords.length > 0) {
      return { 
        valid: false, 
        error: `Palavras inválidas encontradas: ${invalidWords.join(', ')}` 
      }
    }

    return { valid: true, words }
  }

  // Normalizar seed phrase (remove espaços extras, converte para lowercase)
  normalizeSeedPhrase(seedPhrase) {
    if (typeof seedPhrase === 'string') {
      return seedPhrase.trim().toLowerCase().split(/\s+/).filter(word => word.length > 0)
    }
    if (Array.isArray(seedPhrase)) {
      return seedPhrase.map(word => word.trim().toLowerCase()).filter(word => word.length > 0)
    }
    return []
  }

  // ===============================
  // ENCRYPTION / DECRYPTION
  // ===============================
  encryptData(data, password) {
    try {
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), password).toString()
      return encrypted
    } catch (error) {
      throw new Error('Falha na criptografia dos dados')
    }
  }

  decryptData(encryptedData, password) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, password)
      const decrypted = bytes.toString(CryptoJS.enc.Utf8)
      return JSON.parse(decrypted)
    } catch (error) {
      throw new Error('Senha incorreta ou dados corrompidos')
    }
  }

  // ===============================
  // PASSWORD VALIDATION
  // ===============================
  validatePassword(password) {
    const errors = []

    if (!password) {
      errors.push('Senha é obrigatória')
      return { valid: false, errors }
    }

    if (password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres')
    }

    if (password.length > 128) {
      errors.push('Senha muito longa (máximo 128 caracteres)')
    }

    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /\d/.test(password)

    if (!hasLetter) {
      errors.push('Senha deve conter pelo menos uma letra')
    }

    if (!hasNumber) {
      errors.push('Senha deve conter pelo menos um número')
    }

    return {
      valid: errors.length === 0,
      errors,
      strength: this.calculatePasswordStrength(password)
    }
  }

  calculatePasswordStrength(password) {
    let score = 0

    // Length bonus
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1

    // Character variety bonus
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1

    if (score <= 2) return 'fraca'
    if (score <= 4) return 'média'
    return 'forte'
  }

  // ===============================
  // ACCOUNT MANAGEMENT
  // ===============================
  async createAccount(password) {
    try {
      // Validar senha
      const passwordValidation = this.validatePassword(password)
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.errors.join(', '))
      }

      // Gerar seed phrase
      const seedWords = this.generateSeedPhrase()
      
      // Gerar dados da conta
      const accountData = {
        id: this.generateAccountId(),
        address: this.generateAddress(seedWords),
        createdAt: new Date().toISOString(),
        lastLogin: null,
        version: '1.0'
      }

      // Criptografar e salvar seed phrase
      const encryptedSeed = this.encryptData(seedWords, password)
      localStorage.setItem(this.STORAGE_KEYS.ENCRYPTED_SEED, encryptedSeed)

      // Salvar dados da conta
      localStorage.setItem(this.STORAGE_KEYS.ACCOUNT_DATA, JSON.stringify(accountData))

      return {
        success: true,
        account: accountData,
        seedPhrase: seedWords
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async importAccount(seedPhrase, password) {
    try {
      // Validar seed phrase
      const seedValidation = this.validateSeedPhrase(seedPhrase)
      if (!seedValidation.valid) {
        throw new Error(seedValidation.error)
      }

      // Validar senha
      const passwordValidation = this.validatePassword(password)
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.errors.join(', '))
      }

      const seedWords = seedValidation.words

      // Gerar dados da conta baseados na seed phrase
      const accountData = {
        id: this.generateAccountId(seedWords),
        address: this.generateAddress(seedWords),
        createdAt: new Date().toISOString(),
        lastLogin: null,
        imported: true,
        version: '1.0'
      }

      // Criptografar e salvar seed phrase
      const encryptedSeed = this.encryptData(seedWords, password)
      localStorage.setItem(this.STORAGE_KEYS.ENCRYPTED_SEED, encryptedSeed)

      // Salvar dados da conta
      localStorage.setItem(this.STORAGE_KEYS.ACCOUNT_DATA, JSON.stringify(accountData))

      return {
        success: true,
        account: accountData
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async login(password) {
    try {
      // Verificar se existe conta
      const accountData = this.getStoredAccountData()
      if (!accountData) {
        throw new Error('Nenhuma conta encontrada neste dispositivo')
      }

      // Tentar descriptografar seed phrase para validar senha
      const encryptedSeed = localStorage.getItem(this.STORAGE_KEYS.ENCRYPTED_SEED)
      if (!encryptedSeed) {
        throw new Error('Dados da conta corrompidos')
      }

      // Validar senha tentando descriptografar
      const seedWords = this.decryptData(encryptedSeed, password)

      // Atualizar último login
      accountData.lastLogin = new Date().toISOString()
      localStorage.setItem(this.STORAGE_KEYS.ACCOUNT_DATA, JSON.stringify(accountData))

      // Criar sessão
      const sessionData = {
        accountId: accountData.id,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      }
      
      localStorage.setItem(this.STORAGE_KEYS.USER_SESSION, JSON.stringify(sessionData))

      return {
        success: true,
        account: accountData
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  logout() {
    localStorage.removeItem(this.STORAGE_KEYS.USER_SESSION)
    return { success: true }
  }

  // ===============================
  // SESSION MANAGEMENT
  // ===============================
  isLoggedIn() {
    const sessionData = this.getSessionData()
    if (!sessionData) return false

    // Verificar se sessão não expirou
    const now = new Date()
    const expiresAt = new Date(sessionData.expiresAt)

    return now < expiresAt
  }

  getSessionData() {
    try {
      const sessionStr = localStorage.getItem(this.STORAGE_KEYS.USER_SESSION)
      return sessionStr ? JSON.parse(sessionStr) : null
    } catch (error) {
      return null
    }
  }

  getCurrentAccount() {
    if (!this.isLoggedIn()) return null
    return this.getStoredAccountData()
  }

  // ===============================
  // STORAGE HELPERS
  // ===============================
  getStoredAccountData() {
    try {
      const accountStr = localStorage.getItem(this.STORAGE_KEYS.ACCOUNT_DATA)
      return accountStr ? JSON.parse(accountStr) : null
    } catch (error) {
      return null
    }
  }

  hasExistingAccount() {
    return !!this.getStoredAccountData()
  }

  clearAllData() {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }

  // ===============================
  // UTILITY FUNCTIONS
  // ===============================
  generateAccountId(seedWords = null) {
    const source = seedWords ? seedWords.join('') : Math.random().toString()
    return CryptoJS.SHA256(source + Date.now()).toString().substring(0, 16)
  }

  generateAddress(seedWords) {
    const hash = CryptoJS.SHA256(seedWords.join('')).toString()
    return `bzr1${hash.substring(0, 38)}`
  }

  // Função para testar força da conexão (simulada)
  async testConnection() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, ping: Math.floor(Math.random() * 100) + 20 })
      }, 1000)
    })
  }
}

// Instância singleton
const authService = new AuthService()

export default authService

// Export individual functions for convenience
export const {
  generateSeedPhrase,
  validateSeedPhrase,
  validatePassword,
  createAccount,
  importAccount,
  login,
  logout,
  isLoggedIn,
  getCurrentAccount,
  hasExistingAccount,
  clearAllData
} = authService