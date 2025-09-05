// apps/web/src/pages/Auth.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useWalletStore } from '@/store/wallet'
import { authService } from '@/services/auth'
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

  // Criar carteira - Passo 1: definir senha
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
      // Criar wallet localmente
      const result = await createWallet(password)
      setGeneratedSeed(result.mnemonic)
      setSeedWords(result.mnemonic.split(' '))
      
      // Ir para tela de confirmação
      setMode('confirm')
      setStep(2)
    } catch (error: any) {
      console.error('Create wallet error:', error)
      setError(error.message || 'Erro ao criar carteira')
    } finally {
      setLoading(false)
    }
  }

  // Confirmar que anotou a seed
  const handleConfirmSeed = () => {
    // Gerar palavras aleatórias para verificação
    const indices = generateVerificationIndices()
    setVerificationIndices(indices)
    setVerificationInputs({})
    
    // Ir para tela de verificação
    setMode('verify')
    setStep(3)
  }

  // Verificar palavras da seed
  const handleVerifySeed = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Verificar se todas as palavras estão corretas
    let allCorrect = true
    for (const index of verificationIndices) {
      const input = verificationInputs[index]?.toLowerCase().trim()
      const correct = seedWords[index].toLowerCase()
      
      if (input !== correct) {
        allCorrect = false
        break
      }
    }
    
    if (!allCorrect) {
      setError('As palavras não correspondem. Por favor, verifique sua seed phrase.')
      return
    }
    
    setLoading(true)
    
    try {
      // Registrar no backend
      await authService.register(password)
      
      // Sucesso - ir para dashboard
      setSeedConfirmed(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
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
        <h2 className="text-2xl font-bold text-white mb-2">
          Bem-vindo ao Bazari
        </h2>
        <p className="text-gray-400">
          Escolha como deseja continuar
        </p>
      </div>

      <button
        onClick={() => setMode('create')}
        className="w-full p-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-2xl transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h3 className="text-xl font-bold text-white mb-1">
              Criar Nova Carteira
            </h3>
            <p className="text-red-200 text-sm">
              Gerar uma nova seed phrase e endereço
            </p>
          </div>
          <ArrowRight className="text-white group-hover:translate-x-1 transition-transform" size={24} />
        </div>
      </button>

      <button
        onClick={() => setMode('import')}
        className="w-full p-6 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-2xl transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h3 className="text-xl font-bold text-white mb-1">
              Importar Carteira Existente
            </h3>
            <p className="text-gray-400 text-sm">
              Restaurar usando sua seed phrase
            </p>
          </div>
          <Key className="text-gray-400 group-hover:text-white transition-colors" size={24} />
        </div>
      </button>

      {isInitialized && isLocked && (
        <button
          onClick={() => setMode('unlock')}
          className="w-full p-6 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-2xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-xl font-bold text-white mb-1">
                Desbloquear Carteira
              </h3>
              <p className="text-gray-400 text-sm">
                Sua carteira está bloqueada
              </p>
            </div>
            <Key className="text-gray-400 group-hover:text-white transition-colors" size={24} />
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
        <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
          1
        </div>
        <div className="w-16 h-1 bg-gray-700" />
        <div className="w-8 h-8 bg-gray-700 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold">
          2
        </div>
        <div className="w-16 h-1 bg-gray-700" />
        <div className="w-8 h-8 bg-gray-700 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold">
          3
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Criar Senha de Proteção
        </h2>
        <p className="text-gray-400 text-sm">
          Esta senha protegerá sua carteira localmente
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Senha
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Mínimo 8 caracteres"
            required
            disabled={loading}
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Confirmar Senha
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
          onClick={() => setMode('choice')}
          className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
        >
          Voltar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Criando...' : 'Continuar'}
        </button>
      </div>
    </form>
  )

  // Renderizar confirmação de seed - Passo 2
  const renderConfirm = () => (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
          ✓
        </div>
        <div className="w-16 h-1 bg-red-600" />
        <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
          2
        </div>
        <div className="w-16 h-1 bg-gray-700" />
        <div className="w-8 h-8 bg-gray-700 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold">
          3
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Sua Seed Phrase
        </h2>
        <p className="text-gray-400 text-sm">
          Anote estas palavras em ordem. É a única forma de recuperar sua carteira!
        </p>
      </div>

      {/* Aviso importante */}
      <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="text-red-500 mt-1 flex-shrink-0" size={20} />
          <div className="text-sm">
            <p className="text-red-200 font-bold mb-1">ATENÇÃO CRÍTICA!</p>
            <ul className="text-red-300 space-y-1">
              <li>• Nunca compartilhe estas palavras com ninguém</li>
              <li>• Anote em papel e guarde em local seguro</li>
              <li>• Perder a seed = perder acesso permanente</li>
              <li>• Não tire screenshot ou salve digitalmente</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Seed phrase */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-300">12 palavras de recuperação:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowSeed(!showSeed)}
              className="text-gray-400 hover:text-gray-300"
            >
              {showSeed ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <button
              type="button"
              onClick={handleCopySeed}
              className="text-gray-400 hover:text-gray-300"
            >
              {copiedSeed ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {seedWords.map((word, index) => (
            <div
              key={index}
              className="bg-gray-900 px-3 py-2 rounded-lg text-center"
              style={{ filter: showSeed ? 'none' : 'blur(5px)' }}
            >
              <span className="text-gray-500 text-xs mr-2">{index + 1}.</span>
              <span className="text-white font-mono text-sm">{word}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmação */}
      <div className="bg-gray-800 rounded-lg p-4">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={seedConfirmed}
            onChange={(e) => setSeedConfirmed(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-gray-300">
            Confirmo que anotei minha seed phrase em um local seguro e entendo que é minha única forma de recuperar a carteira
          </span>
        </label>
      </div>

      <button
        onClick={handleConfirmSeed}
        disabled={!seedConfirmed}
        className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
          ✓
        </div>
        <div className="w-16 h-1 bg-gray-600" />
        <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
          ✓
        </div>
        <div className="w-16 h-1 bg-red-600" />
        <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
          3
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Verificar Seed Phrase
        </h2>
        <p className="text-gray-400 text-sm">
          Digite as palavras solicitadas para confirmar que você salvou corretamente
        </p>
      </div>

      <div className="space-y-4">
        {verificationIndices.map((index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Palavra #{index + 1}
            </label>
            <input
              type="text"
              value={verificationInputs[index] || ''}
              onChange={(e) => setVerificationInputs({
                ...verificationInputs,
                [index]: e.target.value
              })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
              placeholder={`Digite a palavra ${index + 1}`}
              required
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

      {seedConfirmed && (
        <div className="flex items-center justify-center space-x-2 text-green-400">
          <Check size={20} />
          <span>Carteira criada com sucesso! Redirecionando...</span>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => {
            setMode('confirm')
            setError('')
          }}
          className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
        >
          Voltar
        </button>
        <button
          type="submit"
          disabled={loading || seedConfirmed}
          className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verificando...' : 'Finalizar Criação'}
        </button>
      </div>
    </form>
  )

  // Renderizar importação de carteira
  const renderImport = () => (
    <form onSubmit={handleImportWallet} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Importar Carteira
        </h2>
        <p className="text-gray-400 text-sm">
          Restaure sua carteira usando a seed phrase
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Seed Phrase (12 ou 24 palavras)
        </label>
        <textarea
          value={seedPhrase}
          onChange={(e) => setSeedPhrase(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent h-24 font-mono text-sm"
          placeholder="palavra1 palavra2 palavra3..."
          required
          disabled={loading}
          spellCheck={false}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Nova Senha
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Senha para proteger localmente"
            required
            disabled={loading}
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
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
          onClick={() => setMode('choice')}
          className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
        >
          Voltar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Importando...' : 'Importar Carteira'}
        </button>
      </div>
    </form>
  )

  // Renderizar desbloqueio
  const renderUnlock = () => (
    <form onSubmit={handleUnlock} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Desbloquear Carteira
        </h2>
        <p className="text-gray-400 text-sm">
          Digite sua senha para acessar
        </p>
        {currentAddress && (
          <p className="text-xs text-gray-500 mt-2 font-mono">
            {currentAddress.slice(0, 8)}...{currentAddress.slice(-8)}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Senha
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Digite sua senha"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
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
        className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Desbloqueando...' : 'Desbloquear'}
      </button>

      <div className="text-center text-sm text-gray-400">
        Esqueceu a senha?{' '}
        <button
          type="button"
          onClick={() => setMode('import')}
          className="text-red-400 hover:text-red-300"
        >
          Restaurar com seed phrase
        </button>
      </div>
    </form>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-2xl mb-4">
            <Wallet className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bazari</h1>
          <p className="text-gray-400">100% Web3 • Sem intermediários</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 p-8">
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
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>Suas chaves privadas nunca saem do seu dispositivo</p>
          <p className="mt-1">Armazenamento local criptografado</p>
        </div>
      </div>
    </div>
  )
}