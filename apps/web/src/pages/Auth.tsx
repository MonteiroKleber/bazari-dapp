// apps/web/src/pages/Auth.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  AlertTriangle
} from 'lucide-react'

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { 
    isInitialized, 
    isLocked, 
    createWallet, 
    importWallet, 
    unlock,
    currentAddress 
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
  const [loading, setLoading] = useState(false)
  
  // Estados para validação de seed
  const [seedWords, setSeedWords] = useState<string[]>([])
  const [verificationIndices, setVerificationIndices] = useState<number[]>([])
  const [verificationInputs, setVerificationInputs] = useState<{[key: number]: string}>({})
  const [seedConfirmed, setSeedConfirmed] = useState(false)
  
  // Estado temporário para guardar a senha entre os passos
  const [tempPassword, setTempPassword] = useState('')

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
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }
    
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      return
    }
    
    setLoading(true)
    
    try {
      // Gerar seed localmente (sem criar wallet no store ainda)
      const mnemonic = mnemonicGenerate(12)
      setGeneratedSeed(mnemonic)
      setSeedWords(mnemonic.split(' '))
      setTempPassword(password) // Guardar senha para usar depois
      setMode('confirm')
    } catch (error: any) {
      console.error('Seed generation error:', error)
      setError(error.message || 'Erro ao gerar seed phrase')
    } finally {
      setLoading(false)
    }
  }

  // PASSO 2: Confirmar que salvou a seed
  const handleConfirmSeed = () => {
    if (!seedConfirmed) {
      setError('Você precisa confirmar que salvou a seed phrase')
      return
    }
    
    // Gerar índices aleatórios para verificação
    const indices = generateVerificationIndices()
    setVerificationIndices(indices)
    setVerificationInputs({})
    setMode('verify')
  }

  // PASSO 3: Verificar seed e CRIAR WALLET
  const handleVerifySeed = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Verificar se todas as palavras foram preenchidas
    const allFilled = verificationIndices.every(index => 
      verificationInputs[index]?.trim()
    )
    
    if (!allFilled) {
      setError('Por favor, preencha todas as palavras')
      return
    }
    
    // Verificar se as palavras estão corretas
    const isCorrect = verificationIndices.every(index => 
      verificationInputs[index]?.trim().toLowerCase() === seedWords[index].toLowerCase()
    )
    
    if (!isCorrect) {
      setError('As palavras não correspondem. Por favor, verifique sua seed phrase.')
      return
    }
    
    setLoading(true)
    
    try {
      // AGORA SIM criar a wallet no store usando a senha guardada
      const result = await createWallet(tempPassword)
      
      // Registrar no backend se necessário
      await authService.register(tempPassword)
      
      // Sucesso - ir para dashboard
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error.message || 'Erro ao finalizar registro')
    } finally {
      setLoading(false)
    }
  }

  // Importar carteira existente
  const handleImportWallet = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!seedPhrase.trim()) {
      setError('Por favor, insira a seed phrase')
      return
    }
    
    const words = seedPhrase.trim().split(/\s+/)
    if (words.length !== 12 && words.length !== 24) {
      setError('A seed phrase deve conter 12 ou 24 palavras')
      return
    }
    
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      return
    }
    
    setLoading(true)
    
    try {
      await importWallet(seedPhrase.trim(), password)
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Import error:', error)
      setError(error.message || 'Seed phrase inválida')
    } finally {
      setLoading(false)
    }
  }

  // Desbloquear carteira existente
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await unlock(password)
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Unlock error:', error)
      setError('Senha incorreta')
    } finally {
      setLoading(false)
    }
  }

  // Renderizar tela de escolha inicial
  const renderChoice = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-bazari-sand mb-2">
          Bem-vindo ao Bazari
        </h2>
        <p className="text-bazari-sand/60">
          Escolha como deseja continuar
        </p>
      </div>

      {/* Criar Nova Carteira */}
      <button
        onClick={() => setMode('create')}
        className="w-full group bg-bazari-black/50 hover:bg-bazari-black/70 border border-bazari-red/30 hover:border-bazari-red/50 rounded-xl p-6 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h3 className="text-xl font-bold text-bazari-sand mb-1">
              Criar Nova Carteira
            </h3>
            <p className="text-bazari-sand/60 text-sm">
              Gerar uma nova seed phrase e criar sua carteira
            </p>
          </div>
          <Wallet className="text-bazari-gold group-hover:text-bazari-gold/80 transition-colors" size={24} />
        </div>
      </button>

      {/* Importar Carteira */}
      <button
        onClick={() => setMode('import')}
        className="w-full group bg-bazari-black/50 hover:bg-bazari-black/70 border border-bazari-gold/30 hover:border-bazari-gold/50 rounded-xl p-6 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h3 className="text-xl font-bold text-bazari-sand mb-1">
              Importar Carteira
            </h3>
            <p className="text-bazari-sand/60 text-sm">
              Restaurar usando sua seed phrase existente
            </p>
          </div>
          <ArrowRight className="text-bazari-gold group-hover:text-bazari-gold/80 transition-colors" size={24} />
        </div>
      </button>

      {/* Desbloquear (só aparece se já tem carteira) */}
      {isInitialized && isLocked && (
        <button
          onClick={() => setMode('unlock')}
          className="w-full group bg-bazari-black/50 hover:bg-bazari-black/70 border border-bazari-red/30 hover:border-bazari-red/50 rounded-xl p-6 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-xl font-bold text-bazari-sand mb-1">
                Desbloquear Carteira
              </h3>
              <p className="text-bazari-sand/60 text-sm">
                Sua carteira está bloqueada
              </p>
            </div>
            <Key className="text-bazari-gold group-hover:text-bazari-gold/80 transition-colors" size={24} />
          </div>
        </button>
      )}
    </div>
  )

  // Renderizar criação de carteira - Passo 1: Senha
  const renderCreate = () => (
    <form onSubmit={handleCreateWallet} className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        <div className="w-8 h-8 bg-bazari-red text-white rounded-full flex items-center justify-center text-sm font-bold">
          1
        </div>
        <div className="w-16 h-1 bg-bazari-red/20" />
        <div className="w-8 h-8 bg-bazari-black/50 border border-bazari-red/20 text-bazari-sand/60 rounded-full flex items-center justify-center text-sm font-bold">
          2
        </div>
        <div className="w-16 h-1 bg-bazari-red/20" />
        <div className="w-8 h-8 bg-bazari-black/50 border border-bazari-red/20 text-bazari-sand/60 rounded-full flex items-center justify-center text-sm font-bold">
          3
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-bazari-sand mb-2">
          Criar Senha de Proteção
        </h2>
        <p className="text-bazari-sand/60 text-sm">
          Esta senha protegerá sua carteira localmente
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-bazari-sand/80 mb-2">
          Senha
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-bazari-black/50 border border-bazari-red/30 rounded-lg text-bazari-sand focus:ring-2 focus:ring-bazari-red focus:border-transparent placeholder-bazari-sand/40"
            placeholder="Mínimo 8 caracteres"
            required
            disabled={loading}
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-bazari-sand/60 hover:text-bazari-sand"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-bazari-sand/80 mb-2">
          Confirmar Senha
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 bg-bazari-black/50 border border-bazari-red/30 rounded-lg text-bazari-sand focus:ring-2 focus:ring-bazari-red focus:border-transparent placeholder-bazari-sand/40"
          placeholder="Digite a senha novamente"
          required
          disabled={loading}
          minLength={8}
        />
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-400 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => {
            setMode('choice')
            setPassword('')
            setConfirmPassword('')
            setError('')
          }}
          className="flex-1 py-3 px-4 bg-bazari-black/50 hover:bg-bazari-black/70 border border-bazari-gold/30 text-bazari-sand font-medium rounded-lg transition-colors"
        >
          Voltar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 px-4 bg-bazari-red hover:bg-bazari-red/80 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Gerando...' : 'Continuar'}
        </button>
      </div>
    </form>
  )

  // Renderizar confirmação de seed - Passo 2
  const renderConfirm = () => (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        <div className="w-8 h-8 bg-bazari-gold text-bazari-black rounded-full flex items-center justify-center text-sm font-bold">
          ✓
        </div>
        <div className="w-16 h-1 bg-bazari-gold" />
        <div className="w-8 h-8 bg-bazari-red text-white rounded-full flex items-center justify-center text-sm font-bold">
          2
        </div>
        <div className="w-16 h-1 bg-bazari-red/20" />
        <div className="w-8 h-8 bg-bazari-black/50 border border-bazari-red/20 text-bazari-sand/60 rounded-full flex items-center justify-center text-sm font-bold">
          3
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-bazari-sand mb-2">
          Sua Seed Phrase
        </h2>
        <p className="text-bazari-sand/60 text-sm">
          Anote estas palavras em ordem. É a única forma de recuperar sua carteira!
        </p>
      </div>

      {/* Aviso */}
      <div className="bg-bazari-red/10 border border-bazari-red/30 rounded-xl p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="text-bazari-red mt-0.5" size={20} />
          <div className="text-sm text-bazari-sand/80">
            <p className="font-semibold mb-1">Importante!</p>
            <p>Nunca compartilhe sua seed phrase. Qualquer pessoa com acesso a ela pode roubar seus fundos.</p>
          </div>
        </div>
      </div>

      {/* Seed Display */}
      <div className="bg-bazari-black/50 border border-bazari-gold/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setShowSeed(!showSeed)}
            className="text-sm text-bazari-gold hover:text-bazari-gold/80 flex items-center space-x-2"
          >
            {showSeed ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{showSeed ? 'Ocultar' : 'Mostrar'} palavras</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopySeed}
              className="text-sm text-bazari-gold hover:text-bazari-gold/80 flex items-center space-x-2"
            >
              {copiedSeed ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {seedWords.map((word, index) => (
            <div
              key={index}
              className="bg-bazari-black/80 border border-bazari-red/20 px-3 py-2 rounded-lg text-center"
              style={{ filter: showSeed ? 'none' : 'blur(5px)' }}
            >
              <span className="text-bazari-sand/50 text-xs mr-2">{index + 1}.</span>
              <span className="text-bazari-sand font-mono text-sm">{word}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmação */}
      <div className="bg-bazari-black/50 border border-bazari-gold/30 rounded-lg p-4">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={seedConfirmed}
            onChange={(e) => setSeedConfirmed(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-bazari-sand/80">
            Confirmo que anotei minha seed phrase em um local seguro e entendo que é minha única forma de recuperar a carteira
          </span>
        </label>
      </div>

      <button
        onClick={handleConfirmSeed}
        disabled={!seedConfirmed}
        className="w-full py-3 px-4 bg-bazari-red hover:bg-bazari-red/80 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Verificar Seed Phrase
      </button>
    </div>
  )

  // Renderizar verificação de seed - Passo 3
  const renderVerify = () => (
    <form onSubmit={handleVerifySeed} className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        <div className="w-8 h-8 bg-bazari-gold text-bazari-black rounded-full flex items-center justify-center text-sm font-bold">
          ✓
        </div>
        <div className="w-16 h-1 bg-bazari-gold" />
        <div className="w-8 h-8 bg-bazari-gold text-bazari-black rounded-full flex items-center justify-center text-sm font-bold">
          ✓
        </div>
        <div className="w-16 h-1 bg-bazari-gold" />
        <div className="w-8 h-8 bg-bazari-red text-white rounded-full flex items-center justify-center text-sm font-bold">
          3
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-bazari-sand mb-2">
          Verificar Seed Phrase
        </h2>
        <p className="text-bazari-sand/60 text-sm">
          Digite as palavras solicitadas para confirmar que você salvou corretamente
        </p>
      </div>

      <div className="space-y-4">
        {verificationIndices.map((index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-bazari-sand/80 mb-2">
              Palavra #{index + 1}
            </label>
            <input
              type="text"
              value={verificationInputs[index] || ''}
              onChange={(e) => setVerificationInputs({
                ...verificationInputs,
                [index]: e.target.value
              })}
              className="w-full px-4 py-3 bg-bazari-black/50 border border-bazari-red/30 rounded-lg text-bazari-sand focus:ring-2 focus:ring-bazari-red focus:border-transparent font-mono lowercase"
              placeholder={`Digite a palavra #${index + 1}`}
              required
              disabled={loading}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-400 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => {
            setMode('confirm')
            setVerificationInputs({})
            setError('')
          }}
          className="flex-1 py-3 px-4 bg-bazari-black/50 hover:bg-bazari-black/70 border border-bazari-gold/30 text-bazari-sand font-medium rounded-lg transition-colors"
        >
          Voltar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 px-4 bg-bazari-red hover:bg-bazari-red/80 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Criando Carteira...' : 'Finalizar Criação'}
        </button>
      </div>
    </form>
  )

  // Renderizar importação de carteira
  const renderImport = () => (
    <form onSubmit={handleImportWallet} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-bazari-sand mb-2">
          Importar Carteira
        </h2>
        <p className="text-bazari-sand/60 text-sm">
          Restaure sua carteira usando a seed phrase
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-bazari-sand/80 mb-2">
          Seed Phrase (12 ou 24 palavras)
        </label>
        <textarea
          value={seedPhrase}
          onChange={(e) => setSeedPhrase(e.target.value)}
          className="w-full px-4 py-3 bg-bazari-black/50 border border-bazari-red/30 rounded-lg text-bazari-sand focus:ring-2 focus:ring-bazari-red focus:border-transparent h-24 font-mono text-sm placeholder-bazari-sand/40"
          placeholder="palavra1 palavra2 palavra3..."
          required
          disabled={loading}
          spellCheck={false}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-bazari-sand/80 mb-2">
          Nova Senha
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-bazari-black/50 border border-bazari-red/30 rounded-lg text-bazari-sand focus:ring-2 focus:ring-bazari-red focus:border-transparent placeholder-bazari-sand/40"
            placeholder="Senha para proteger localmente"
            required
            disabled={loading}
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-bazari-sand/60 hover:text-bazari-sand"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-400 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => {
            setMode('choice')
            setSeedPhrase('')
            setPassword('')
            setError('')
          }}
          className="flex-1 py-3 px-4 bg-bazari-black/50 hover:bg-bazari-black/70 border border-bazari-gold/30 text-bazari-sand font-medium rounded-lg transition-colors"
        >
          Voltar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 px-4 bg-bazari-red hover:bg-bazari-red/80 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Importando...' : 'Importar'}
        </button>
      </div>
    </form>
  )

  // Renderizar desbloqueio
  const renderUnlock = () => (
    <form onSubmit={handleUnlock} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-bazari-sand mb-2">
          Desbloquear Carteira
        </h2>
        <p className="text-bazari-sand/60 text-sm">
          Digite sua senha para acessar sua carteira
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-bazari-sand/80 mb-2">
          Senha
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-bazari-black/50 border border-bazari-red/30 rounded-lg text-bazari-sand focus:ring-2 focus:ring-bazari-red focus:border-transparent placeholder-bazari-sand/40"
            placeholder="Digite sua senha"
            required
            disabled={loading}
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-bazari-sand/60 hover:text-bazari-sand"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-400 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-bazari-red hover:bg-bazari-red/80 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Desbloqueando...' : 'Desbloquear'}
      </button>

      <div className="text-center text-sm text-bazari-sand/60">
        Esqueceu a senha?{' '}
        <button
          type="button"
          onClick={() => {
            setMode('import')
            setPassword('')
            setError('')
          }}
          className="text-bazari-gold hover:text-bazari-gold/80"
        >
          Restaurar com seed phrase
        </button>
      </div>
    </form>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-bazari-black via-bazari-black to-bazari-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-bazari-red to-bazari-gold rounded-2xl mb-4">
            <Wallet className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-bazari-sand mb-2">Bazari</h1>
          <p className="text-bazari-sand/60">100% Web3 • Sem intermediários</p>
        </div>

        {/* Card */}
        <div className="bg-bazari-black/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-bazari-red/20 p-8">
          {/* Security Badge */}
          <div className="flex items-center justify-center space-x-2 mb-6 text-green-400">
            <Shield size={16} />
            <span className="text-xs">Criptografia AES-256-GCM • sr25519</span>
          </div>

          {/* Renderizar modo atual */}
          {mode === 'choice' && renderChoice()}
          {mode === 'create' && renderCreate()}
          {mode === 'confirm' && renderConfirm()}
          {mode === 'verify' && renderVerify()}
          {mode === 'import' && renderImport()}
          {mode === 'unlock' && renderUnlock()}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-bazari-sand/50">
          <p>Suas chaves privadas nunca saem do seu dispositivo</p>
          <p className="mt-1">Armazenamento local criptografado</p>
        </div>
      </div>
    </div>
  )
}