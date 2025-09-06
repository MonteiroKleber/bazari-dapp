// apps/web/src/pages/Auth.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useWalletStore } from '@/store/wallet'
import { authService } from '@/services/auth'
import { mnemonicGenerate } from '@polkadot/util-crypto'
import { 
  Shield, 
  Wallet, 
  Key, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Copy, 
  Check,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Info,
  Globe
} from 'lucide-react'

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t, i18n } = useTranslation()
  const { 
    isInitialized, 
    isLocked, 
    createWallet, 
    importWallet, 
    unlock,
    activeAccount,
    clearWallet
  } = useWalletStore()
  
  // Estados do fluxo
  const [mode, setMode] = useState<'choice' | 'create' | 'confirm' | 'verify' | 'import' | 'unlock'>('choice')
  const [step, setStep] = useState(1)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [seedPhrase, setSeedPhrase] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showSeed, setShowSeed] = useState(false)
  const [copiedSeed, setCopiedSeed] = useState(false)
  const [generatedSeed, setGeneratedSeed] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Estados para validação de seed
  const [seedWords, setSeedWords] = useState<string[]>([])
  const [verificationIndices, setVerificationIndices] = useState<number[]>([])
  const [verificationInputs, setVerificationInputs] = useState<{[key: number]: string}>({})
  const [seedConfirmed, setSeedConfirmed] = useState(false)
  
  // Estado temporário para guardar a senha entre os passos
  const [tempPassword, setTempPassword] = useState('')

  // Função para mudar idioma
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('bazari_language', lang)
  }

  useEffect(() => {
    // Verificar parâmetros da URL
    const modeParam = searchParams.get('mode')
    if (modeParam === 'register') {
      setMode('create')
    } else if (modeParam === 'login') {
      if (isInitialized && isLocked) {
        setMode('unlock')
      } else if (!isInitialized) {
        setMode('import')
      } else {
        navigate('/dashboard')
      }
    } else if (isInitialized && !isLocked) {
      navigate('/dashboard')
    } else if (isInitialized && isLocked) {
      setMode('unlock')
    } else {
      setMode('choice')
    }
  }, [searchParams, isInitialized, isLocked, navigate])

  // Gerar índices aleatórios para verificação (3 palavras)
  const generateVerificationIndices = () => {
    const indices: number[] = []
    while (indices.length < 3) {
      const randomIndex = Math.floor(Math.random() * 12)
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex)
      }
    }
    return indices.sort((a, b) => a - b)
  }

  // Copiar seed para clipboard
  const handleCopySeed = async () => {
    if (generatedSeed) {
      await navigator.clipboard.writeText(generatedSeed)
      setCopiedSeed(true)
      setTimeout(() => setCopiedSeed(false), 3000)
    }
  }

  // PASSO 1: Validar senha e gerar seed (mas NÃO criar wallet ainda)
  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    
    if (password !== confirmPassword) {
      setError(t('auth.errors.passwordsDontMatch'))
      return
    }
    
    if (password.length < 8) {
      setError(t('auth.errors.passwordTooShort'))
      return
    }
    
    // Guardar senha temporariamente
    setTempPassword(password)
    
    // Gerar seed phrase
    const mnemonic = mnemonicGenerate(12)
    setGeneratedSeed(mnemonic)
    setSeedWords(mnemonic.split(' '))
    
    // Ir para o passo de confirmação
    setMode('confirm')
    setStep(2)
  }

  // PASSO 2: Usuário confirma que salvou a seed
  const handleConfirmSeed = () => {
    if (!seedConfirmed) {
      setError(t('auth.errors.confirmSeedFirst'))
      return
    }
    
    // Gerar índices para verificação
    const indices = generateVerificationIndices()
    setVerificationIndices(indices)
    
    // Ir para verificação
    setMode('verify')
    setStep(3)
  }

  // PASSO 3: Verificar seed e ENTÃO criar a wallet
  const handleVerifySeed = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    
    // Verificar se todas as palavras estão corretas
    const allCorrect = verificationIndices.every(index => {
      const userInput = verificationInputs[index]?.toLowerCase().trim()
      const correctWord = seedWords[index].toLowerCase()
      return userInput === correctWord
    })
    
    if (!allCorrect) {
      setError(t('auth.errors.wordsDoNotMatch'))
      return
    }
    
    setLoading(true)
    
    try {
      // AGORA SIM criar a wallet no store usando a senha guardada
      const result = await createWallet(tempPassword)
      
      // Registrar no backend se necessário
      await authService.register(tempPassword)
      
      // Sucesso - ir para dashboard
      setInfo(t('auth.success.walletCreated'))
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error.message || t('auth.errors.registrationFailed'))
    } finally {
      setLoading(false)
    }
  }

  // Importar carteira existente
  const handleImportWallet = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    
    if (!seedPhrase.trim()) {
      setError(t('auth.errors.enterSeedPhrase'))
      return
    }
    
    const words = seedPhrase.trim().split(/\s+/)
    if (words.length !== 12 && words.length !== 24) {
      setError(t('auth.errors.invalidSeedLength'))
      return
    }
    
    if (password.length < 8) {
      setError(t('auth.errors.passwordTooShort'))
      return
    }
    
    setLoading(true)
    
    try {
      await importWallet(seedPhrase.trim(), password)
      setInfo(t('auth.success.walletImported'))
      
      // Tentar registrar/login no backend
      try {
        await authService.importWallet(seedPhrase.trim(), password)
      } catch (backendError) {
        console.log('Backend sync optional:', backendError)
      }
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (error: any) {
      console.error('Import error:', error)
      setError(error.message || t('auth.errors.invalidSeedPhrase'))
    } finally {
      setLoading(false)
    }
  }

  // Desbloquear carteira existente
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    
    try {
      await unlock(password)
      setInfo(t('auth.success.walletUnlocked'))
      
      // Tentar fazer login no backend também
      try {
        await authService.login(password)
      } catch (backendError) {
        console.log('Backend sync optional:', backendError)
      }
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 500)
    } catch (error: any) {
      console.error('Unlock error:', error)
      
      // MELHOR TRATAMENTO DE ERROS
      if (error.message.includes('not found') || error.message.includes('corrupted')) {
        setError(t('auth.errors.walletDataNotFound'))
        setInfo(t('auth.errors.pleaseImportAgain'))
        
        // Oferecer opção de reset
        setTimeout(() => {
          if (confirm(t('auth.confirmReset'))) {
            clearWallet()
            setMode('import')
            setPassword('')
          }
        }, 2000)
      } else if (error.message.includes('Incorrect password')) {
        setError(t('auth.errors.incorrectPassword'))
      } else {
        setError(error.message || t('auth.errors.unlockFailed'))
      }
    } finally {
      setLoading(false)
    }
  }

  // Renderizar tela de escolha inicial
  const renderChoice = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-bazari-sand">{t('auth.welcome')}</h2>
        <p className="text-bazari-sand/60 mt-2">{t('auth.chooseHowToContinue')}</p>
      </div>
      
      <button
        onClick={() => setMode('create')}
        className="w-full flex items-center justify-between p-4 bg-bazari-black/50 border border-bazari-red/20 rounded-2xl hover:border-bazari-gold hover:bg-bazari-red/5 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-bazari-red/20 to-bazari-gold/20 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-bazari-gold" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-bazari-sand">{t('auth.createNewWallet')}</p>
            <p className="text-sm text-bazari-sand/50">{t('auth.generateNewSeed')}</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-bazari-sand/40" />
      </button>
      
      <button
        onClick={() => setMode('import')}
        className="w-full flex items-center justify-between p-4 bg-bazari-black/50 border border-bazari-red/20 rounded-2xl hover:border-bazari-gold hover:bg-bazari-gold/5 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-bazari-gold/20 to-bazari-red/20 rounded-lg flex items-center justify-center">
            <Key className="w-5 h-5 text-bazari-red" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-bazari-sand">{t('auth.importWallet')}</p>
            <p className="text-sm text-bazari-sand/50">{t('auth.useExistingSeed')}</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-bazari-sand/40" />
      </button>
      
      {isInitialized && (
        <button
          onClick={() => setMode('unlock')}
          className="w-full flex items-center justify-between p-4 bg-bazari-black/50 border border-bazari-red/20 rounded-2xl hover:border-bazari-gold hover:bg-green-900/10 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600/20 to-bazari-gold/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-bazari-sand">{t('auth.unlockWallet')}</p>
              <p className="text-sm text-bazari-sand/50">{t('auth.accessExistingWallet')}</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-bazari-sand/40" />
        </button>
      )}
      
      <div className="mt-8 p-4 bg-bazari-black/30 border border-bazari-red/10 rounded-lg">
        <div className="flex items-start gap-2">
          <Shield className="w-5 h-5 text-bazari-sand/40 mt-0.5" />
          <div className="text-xs text-bazari-sand/60">
            <p className="font-semibold mb-1">{t('auth.100web3')}</p>
            <p>{t('auth.privateKeysNeverLeave')}</p>
            <p>{t('auth.encryptedLocalStorage')}</p>
          </div>
        </div>
      </div>
    </div>
  )

  // Renderizar criação de senha
  const renderCreatePassword = () => (
    <form onSubmit={handleCreateWallet} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-bazari-sand">{t('auth.createProtectionPassword')}</h2>
        <p className="text-bazari-sand/60 mt-2">{t('auth.thisPasswordWillProtect')}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-bazari-sand/80 mb-2">
          {t('auth.password')}
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-bazari-black/50 border border-bazari-red/20 text-bazari-sand rounded-lg focus:border-bazari-gold focus:outline-none focus:ring-1 focus:ring-bazari-gold/50 placeholder:text-bazari-sand/40"
            placeholder={t('auth.minCharacters', { count: 8 })}
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-bazari-sand/40 hover:text-bazari-sand/60"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-bazari-sand/80 mb-2">
          {t('auth.confirmPassword')}
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 bg-bazari-black/50 border border-bazari-red/20 text-bazari-sand rounded-lg focus:border-bazari-gold focus:outline-none focus:ring-1 focus:ring-bazari-gold/50 placeholder:text-bazari-sand/40"
          placeholder={t('auth.enterPasswordAgain')}
          required
          minLength={8}
        />
      </div>
      
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading || password.length < 8 || password !== confirmPassword}
        className="w-full py-3 bg-bazari-red text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {t('auth.continue')}
      </button>
      
      <button
        type="button"
        onClick={() => setMode('choice')}
        className="w-full py-2 text-bazari-sand/60 hover:text-bazari-sand"
      >
        <ArrowLeft className="w-4 h-4 inline mr-2" />
        {t('auth.back')}
      </button>
    </form>
  )

  // Renderizar seed phrase
  const renderSeedPhrase = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-bazari-sand">{t('auth.yourSeedPhrase')}</h2>
        <p className="text-bazari-sand/60 mt-2">
          {t('auth.writeDownWords')}
        </p>
      </div>
      
      <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-300">
            <p className="font-semibold mb-1">{t('auth.important')}</p>
            <p>{t('auth.neverShareSeed')}</p>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className={`grid grid-cols-3 gap-3 p-4 bg-bazari-black/30 border border-bazari-red/10 rounded-lg ${!showSeed ? 'blur-md' : ''}`}>
          {seedWords.map((word, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-bazari-black/50 rounded border border-bazari-red/20">
              <span className="text-xs text-bazari-sand/50 font-mono">{index + 1}.</span>
              <span className="font-mono text-sm text-bazari-sand">{word}</span>
            </div>
          ))}
        </div>
        
        {!showSeed && (
          <button
            onClick={() => setShowSeed(true)}
            className="absolute inset-0 flex items-center justify-center bg-bazari-black/60 rounded-lg"
          >
            <div className="bg-bazari-black px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 border border-bazari-red/30">
              <Eye className="w-5 h-5 text-bazari-sand" />
              <span className="text-bazari-sand">{t('auth.showWords')}</span>
            </div>
          </button>
        )}
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={handleCopySeed}
          className="flex-1 py-2 bg-bazari-black/50 border border-bazari-red/20 text-bazari-sand rounded-lg hover:bg-bazari-red/10 hover:border-bazari-gold flex items-center justify-center gap-2"
        >
          {copiedSeed ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-green-400">{t('common.copied')}</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>{t('common.copy')}</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => setShowSeed(!showSeed)}
          className="flex-1 py-2 bg-bazari-black/50 border border-bazari-red/20 text-bazari-sand rounded-lg hover:bg-bazari-red/10 hover:border-bazari-gold flex items-center justify-center gap-2"
        >
          {showSeed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showSeed ? t('auth.hideWords') : t('auth.showWords')}</span>
        </button>
      </div>
      
      <div className="space-y-3">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={seedConfirmed}
            onChange={(e) => setSeedConfirmed(e.target.checked)}
            className="mt-1 accent-bazari-red"
          />
          <span className="text-sm text-bazari-sand/80">
            {t('auth.confirmSavedSeed')}
          </span>
        </label>
      </div>
      
      <button
        onClick={handleConfirmSeed}
        disabled={!seedConfirmed}
        className="w-full py-3 bg-bazari-red text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {t('auth.continueToVerification')}
      </button>
    </div>
  )

  // Renderizar verificação de seed
  const renderVerifySeed = () => (
    <form onSubmit={handleVerifySeed} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-bazari-sand">{t('auth.verifySeedPhrase')}</h2>
        <p className="text-bazari-sand/60 mt-2">
          {t('auth.enterRequestedWords')}
        </p>
      </div>
      
      <div className="space-y-4">
        {verificationIndices.map((index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-bazari-sand/80 mb-2">
              {t('auth.word')} #{index + 1}
            </label>
            <input
              type="text"
              value={verificationInputs[index] || ''}
              onChange={(e) => setVerificationInputs({
                ...verificationInputs,
                [index]: e.target.value
              })}
              className="w-full px-4 py-3 bg-bazari-black/50 border border-bazari-red/20 text-bazari-sand rounded-lg focus:border-bazari-gold focus:outline-none focus:ring-1 focus:ring-bazari-gold/50 font-mono placeholder:text-bazari-sand/40"
              placeholder={t('auth.enterWord', { number: index + 1 })}
              required
            />
          </div>
        ))}
      </div>
      
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
      
      {info && (
        <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg flex items-start gap-2">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-300">{info}</p>
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-bazari-red text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{t('auth.creatingWallet')}</span>
          </>
        ) : (
          <span>{t('auth.finalizeCreation')}</span>
        )}
      </button>
    </form>
  )

  // Renderizar importação
  const renderImport = () => (
    <form onSubmit={handleImportWallet} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-bazari-sand">{t('auth.importWallet')}</h2>
        <p className="text-bazari-sand/60 mt-2">{t('auth.restoreWalletUsingSeed')}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-bazari-sand/80 mb-2">
          {t('auth.seedPhrase12or24')}
        </label>
        <textarea
          value={seedPhrase}
          onChange={(e) => setSeedPhrase(e.target.value)}
          className="w-full px-4 py-3 bg-bazari-black/50 border border-bazari-red/20 text-bazari-sand rounded-lg focus:border-bazari-gold focus:outline-none focus:ring-1 focus:ring-bazari-gold/50 font-mono text-sm placeholder:text-bazari-sand/40"
          rows={4}
          placeholder="palavra1 palavra2 palavra3..."
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-bazari-sand/80 mb-2">
          {t('auth.newPassword')}
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-bazari-black/50 border border-bazari-red/20 text-bazari-sand rounded-lg focus:border-bazari-gold focus:outline-none focus:ring-1 focus:ring-bazari-gold/50 placeholder:text-bazari-sand/40"
            placeholder={t('auth.passwordToProtectLocally')}
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-bazari-sand/40 hover:text-bazari-sand/60"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
      
      {info && (
        <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg flex items-start gap-2">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-300">{info}</p>
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading || !seedPhrase.trim() || password.length < 8}
        className="w-full py-3 bg-bazari-red text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{t('auth.importing')}</span>
          </>
        ) : (
          <span>{t('auth.import')}</span>
        )}
      </button>
      
      <button
        type="button"
        onClick={() => setMode('choice')}
        className="w-full py-2 text-bazari-sand/60 hover:text-bazari-sand"
      >
        <ArrowLeft className="w-4 h-4 inline mr-2" />
        {t('auth.back')}
      </button>
    </form>
  )

  // Renderizar unlock
  const renderUnlock = () => (
    <form onSubmit={handleUnlock} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-bazari-sand">{t('auth.welcomeBack')}</h2>
        <p className="text-bazari-sand/60 mt-2">{t('auth.enterYourPassword')}</p>
        {activeAccount && (
          <p className="text-xs text-bazari-sand/40 mt-1 font-mono">
            {activeAccount.address.slice(0, 8)}...{activeAccount.address.slice(-6)}
          </p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-bazari-sand/80 mb-2">
          {t('auth.password')}
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-bazari-black/50 border border-bazari-red/20 text-bazari-sand rounded-lg focus:border-bazari-gold focus:outline-none focus:ring-1 focus:ring-bazari-gold/50 placeholder:text-bazari-sand/40"
            placeholder={t('auth.enterYourPassword')}
            required
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-bazari-sand/40 hover:text-bazari-sand/60"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
      
      {info && (
        <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-300">{info}</p>
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full py-3 bg-bazari-red text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{t('auth.unlocking')}</span>
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            <span>{t('auth.unlock')}</span>
          </>
        )}
      </button>
      
      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={() => {
            setMode('import')
            setPassword('')
            setError('')
            setInfo('')
          }}
          className="text-sm text-bazari-sand/60 hover:text-bazari-gold"
        >
          {t('auth.forgotPassword')}
        </button>
        
        <button
          type="button"
          onClick={() => {
            if (confirm(t('auth.confirmResetWallet'))) {
              clearWallet()
              setMode('choice')
              setPassword('')
              setError('')
              setInfo('')
            }
          }}
          className="text-sm text-red-400 hover:text-red-300 block mx-auto"
        >
          {t('auth.resetWallet')}
        </button>
      </div>
    </form>
  )

  return (
    <div className="min-h-screen bg-bazari-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-bazari-black/90 border border-bazari-red/20 rounded-2xl p-8">
          {/* Language Selector - Canto Superior Direito */}
          <div className="flex justify-between items-start mb-6">
            {/* Logo */}
            <div className="flex justify-center flex-1">
              <div className="w-16 h-16 bg-gradient-to-r from-bazari-red to-bazari-gold rounded-2xl flex items-center justify-center">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  const nextLang = {
                    'pt-BR': 'en-US',
                    'en-US': 'es-ES',
                    'es-ES': 'pt-BR'
                  }[i18n.language] || 'pt-BR'
                  changeLanguage(nextLang)
                }}
                className="flex items-center gap-1 px-2 py-1 bg-bazari-black/50 border border-bazari-red/20 rounded-lg hover:border-bazari-gold transition-all"
              >
                <Globe className="w-4 h-4 text-bazari-sand/60" />
                <span className="text-xs text-bazari-sand/60">
                  {i18n.language === 'pt-BR' && '🇧🇷'}
                  {i18n.language === 'en-US' && '🇺🇸'}
                  {i18n.language === 'es-ES' && '🇪🇸'}
                </span>
              </button>
            </div>
          </div>
          
          {/* Indicador de passos */}
          {(mode === 'create' || mode === 'confirm' || mode === 'verify') && (
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-16 rounded-full transition-colors ${
                    step >= s ? 'bg-bazari-red' : 'bg-bazari-red/20'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Conteúdo dinâmico */}
          {mode === 'choice' && renderChoice()}
          {mode === 'create' && renderCreatePassword()}
          {mode === 'confirm' && renderSeedPhrase()}
          {mode === 'verify' && renderVerifySeed()}
          {mode === 'import' && renderImport()}
          {mode === 'unlock' && renderUnlock()}
          
          {/* Badge de segurança */}
          <div className="mt-8 text-center text-xs text-bazari-sand/40">
            <p>🔒 {t('auth.securityBadge')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}