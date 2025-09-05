// Arquivo: apps/web/src/pages/Auth.tsx
// Página de autenticação (login e registro)

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Wallet, Shield, Check, AlertCircle, Eye, EyeOff, Copy, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card'
import { useAuthStore } from '@store/auth'
import { useWalletStore } from '@store/wallet'
import { useCopyToClipboard } from '@hooks/useCopyToClipboard'
import { cn } from '@lib/utils'

export default function Auth() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [copiedText, copy] = useCopyToClipboard()
  
  const { login, register, isAuthenticated } = useAuthStore()
  const { 
    hasVault, 
    createVault, 
    unlockVault, 
    generateSeed,
    isCreatingVault,
    isUnlocking,
    error: walletError
  } = useWalletStore()
  
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [step, setStep] = useState<'initial' | 'create-vault' | 'backup-seed' | 'terms' | 'complete'>('initial')
  const [seed, setSeed] = useState<string>('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showSeed, setShowSeed] = useState(false)
  const [seedConfirmed, setSeedConfirmed] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const from = (location.state as any)?.from?.pathname || '/dashboard'
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])
  
  useEffect(() => {
    checkVaultStatus()
  }, [])
  
  const checkVaultStatus = async () => {
    try {
      const vaultExists = await hasVault()
      if (vaultExists) {
        setMode('login')
        setStep('initial')
      } else {
        setMode('register')
        setStep('initial')
      }
    } catch (err) {
      console.error('Error checking vault status:', err)
    }
  }
  
  const handleCreateVault = async () => {
    if (!password || password.length < 8) {
      setError(t('auth.errors.passwordTooShort') || 'Senha deve ter no mínimo 8 caracteres')
      return
    }
    
    if (password !== confirmPassword) {
      setError(t('auth.errors.passwordMismatch') || 'Senhas não conferem')
      return
    }
    
    try {
      setError('')
      const generatedSeed = await generateSeed()
      setSeed(generatedSeed)
      setStep('backup-seed')
    } catch (err: any) {
      setError(err.message || t('auth.errors.seedGenerationFailed') || 'Erro ao gerar seed')
    }
  }
  
  const handleSeedBackup = () => {
    if (!seedConfirmed) {
      setError(t('auth.errors.seedNotConfirmed') || 'Você deve confirmar que salvou a seed')
      return
    }
    setStep('terms')
  }
  
  const handleAcceptTerms = async () => {
    if (!termsAccepted) {
      setError(t('auth.errors.termsNotAccepted') || 'Você deve aceitar os termos')
      return
    }
    
    try {
      setError('')
      setIsProcessing(true)
      
      console.log('Creating vault...')
      console.log('Password:', password ? 'Set' : 'Not set')
      console.log('Seed:', seed ? 'Generated' : 'Not generated')
      
      // Validar dados necessários
      if (!password || !seed) {
        throw new Error('Dados incompletos. Password e seed são obrigatórios.')
      }
      
      // 1. Criar vault com seed e password
      console.log('Step 1: Creating vault...')
      const vaultCreated = await createVault(password, seed)
      
      if (!vaultCreated) {
        throw new Error('Falha ao criar carteira. Tente novamente.')
      }
      
      console.log('Vault created successfully!')
      
      // 2. Registrar usuário no backend com assinatura
      console.log('Step 2: Registering user on backend...')
      try {
        const registered = await register({
          username: username || undefined,
          email: email || undefined,
          termsAccepted: true,
          termsVersion: '1.0.0'
        })
        
        if (registered) {
          console.log('User registered successfully!')
          setStep('complete')
          
          // Redirecionar após 2 segundos
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        } else {
          console.log('Registration failed but vault created, proceeding...')
          // Mesmo se o registro falhar, a carteira foi criada
          setStep('complete')
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        }
      } catch (backendError: any) {
        console.error('Backend registration error:', backendError)
        // Se o backend falhar, ainda assim prosseguir (carteira foi criada)
        setStep('complete')
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      }
    } catch (err: any) {
      console.error('Error in handleAcceptTerms:', err)
      setError(err.message || t('auth.errors.registrationFailed') || 'Falha no registro')
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleLogin = async () => {
    if (!password) {
      setError(t('auth.errors.passwordRequired') || 'Senha é obrigatória')
      return
    }
    
    try {
      setError('')
      console.log('Unlocking vault...')
      const unlocked = await unlockVault(password)
      
      if (unlocked) {
        console.log('Vault unlocked, logging in...')
        const loggedIn = await login()
        if (loggedIn) {
          navigate(from, { replace: true })
        } else {
          setError('Falha no login. Verifique sua conexão.')
        }
      } else {
        setError('Senha incorreta')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || t('auth.errors.loginFailed') || 'Falha no login')
    }
  }
  
  const handleCopySeed = () => {
    copy(seed)
  }
  
  return (
    <div className="min-h-screen bg-bazari-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <AnimatePresence mode="wait">
          {/* Tela Inicial */}
          {step === 'initial' && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-bazari-red/20 bg-bazari-black/80">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-bazari-red to-bazari-gold rounded-2xl flex items-center justify-center">
                      <Wallet className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-center text-bazari-sand">
                    {mode === 'login' ? t('auth.login.title') || 'Bem-vindo de volta' : t('auth.register.title') || 'Criar Nova Carteira'}
                  </CardTitle>
                  <CardDescription className="text-center text-bazari-sand/60">
                    {mode === 'login' ? 
                      t('auth.login.description') || 'Desbloqueie sua carteira para continuar' : 
                      t('auth.register.description') || 'Configure sua carteira Bazari em poucos passos'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {mode === 'register' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-bazari-sand">
                          {t('auth.fields.username') || 'Nome de usuário'} (opcional)
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full px-3 py-2 bg-bazari-black/50 border border-bazari-red/20 rounded-lg text-bazari-sand focus:border-bazari-red focus:outline-none"
                          placeholder="Seu nome de usuário"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-bazari-sand">
                          {t('auth.fields.email') || 'E-mail'} (opcional)
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-bazari-black/50 border border-bazari-red/20 rounded-lg text-bazari-sand focus:border-bazari-red focus:outline-none"
                          placeholder="seu@email.com"
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-bazari-sand">
                      {t('auth.fields.password') || 'Senha'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 bg-bazari-black/50 border border-bazari-red/20 rounded-lg text-bazari-sand focus:border-bazari-red focus:outline-none"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-bazari-sand/60 hover:text-bazari-sand"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {mode === 'register' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-bazari-sand">
                        {t('auth.fields.confirmPassword') || 'Confirmar senha'}
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-bazari-black/50 border border-bazari-red/20 rounded-lg text-bazari-sand focus:border-bazari-red focus:outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  )}
                  
                  {error && (
                    <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <p className="text-sm text-red-500">{error}</p>
                    </div>
                  )}
                  
                  {walletError && (
                    <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <p className="text-sm text-red-500">{walletError}</p>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-3">
                  {mode === 'login' ? (
                    <>
                      <Button 
                        size="lg" 
                        className="w-full bg-bazari-red hover:bg-bazari-red/90"
                        onClick={handleLogin}
                        disabled={isUnlocking}
                      >
                        {isUnlocking ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Desbloqueando...
                          </>
                        ) : (
                          t('auth.login.button') || 'Desbloquear'
                        )}
                      </Button>
                      <button
                        onClick={() => {
                          setMode('register')
                          setError('')
                          setPassword('')
                          setConfirmPassword('')
                        }}
                        className="text-sm text-bazari-gold hover:underline"
                      >
                        {t('auth.login.noAccount') || 'Não tem uma conta? Crie agora'}
                      </button>
                    </>
                  ) : (
                    <>
                      <Button 
                        size="lg" 
                        className="w-full bg-bazari-red hover:bg-bazari-red/90"
                        onClick={handleCreateVault}
                        disabled={isCreatingVault}
                      >
                        {isCreatingVault ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Criando...
                          </>
                        ) : (
                          t('auth.register.button') || 'Continuar'
                        )}
                      </Button>
                      <button
                        onClick={() => {
                          setMode('login')
                          setError('')
                          setPassword('')
                          setConfirmPassword('')
                        }}
                        className="text-sm text-bazari-gold hover:underline"
                      >
                        Já tenho uma conta
                      </button>
                    </>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          )}
          
          {/* Tela de Backup da Seed */}
          {step === 'backup-seed' && (
            <motion.div
              key="backup-seed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-bazari-red/20 bg-bazari-black/80">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-bazari-red to-bazari-gold rounded-2xl flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-center text-bazari-sand">
                    {t('auth.seed.title') || 'Sua Frase de Recuperação'}
                  </CardTitle>
                  <CardDescription className="text-center text-bazari-sand/60">
                    {t('auth.seed.description') || 'Anote estas 24 palavras em um local seguro. Você precisará delas para recuperar sua carteira.'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="p-4 bg-bazari-black/50 border border-bazari-red/20 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-bazari-sand">
                        {t('auth.seed.phrase') || 'Frase de Recuperação'}
                      </label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowSeed(!showSeed)}
                          className="text-bazari-gold hover:text-bazari-gold/80"
                        >
                          {showSeed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={handleCopySeed}
                          className="text-bazari-gold hover:text-bazari-gold/80"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className={cn(
                      "font-mono text-sm text-bazari-sand select-all",
                      !showSeed && "filter blur-md"
                    )}>
                      {seed.split(' ').map((word, index) => (
                        <span key={index} className="inline-block m-1 p-1 bg-bazari-black/30 rounded">
                          {index + 1}. {word}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <p className="text-sm text-amber-500">
                      {t('auth.seed.warning') || 'Nunca compartilhe sua frase de recuperação. Qualquer pessoa com acesso a ela pode roubar seus fundos.'}
                    </p>
                  </div>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={seedConfirmed}
                      onChange={(e) => setSeedConfirmed(e.target.checked)}
                      className="rounded border-bazari-red/20 bg-bazari-black/50 text-bazari-red focus:ring-bazari-red"
                    />
                    <span className="text-sm text-bazari-sand">
                      {t('auth.seed.confirm') || 'Eu salvei minha frase de recuperação com segurança'}
                    </span>
                  </label>
                  
                  {copiedText && (
                    <div className="text-center text-sm text-green-500">
                      Frase copiada para a área de transferência!
                    </div>
                  )}
                </CardContent>
                
                <CardFooter>
                  <Button 
                    size="lg" 
                    className="w-full bg-bazari-red hover:bg-bazari-red/90"
                    onClick={handleSeedBackup}
                    disabled={!seedConfirmed}
                  >
                    Continuar
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
          
          {/* Tela de Termos */}
          {step === 'terms' && (
            <motion.div
              key="terms"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-bazari-red/20 bg-bazari-black/80">
                <CardHeader>
                  <CardTitle className="text-2xl text-center text-bazari-sand">
                    {t('auth.terms.title') || 'Termos de Uso'}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="h-64 overflow-y-auto p-4 bg-bazari-black/50 border border-bazari-red/20 rounded-lg">
                    <div className="prose prose-sm prose-invert">
                      <h3 className="font-semibold text-bazari-sand">1. Aceitação dos Termos</h3>
                      <p className="text-bazari-sand/80">
                        Ao usar a plataforma Bazari, você concorda com estes termos de uso e nossa política de privacidade.
                      </p>
                      
                      <h3 className="font-semibold text-bazari-sand">2. Natureza Descentralizada</h3>
                      <p className="text-bazari-sand/80">
                        A Bazari é uma plataforma descentralizada. Você é responsável pela segurança de sua carteira e seed phrase.
                      </p>
                      
                      <h3 className="font-semibold text-bazari-sand">3. Responsabilidade</h3>
                      <p className="text-bazari-sand/80">
                        Você é o único responsável por suas transações. Transações blockchain são irreversíveis.
                      </p>
                      
                      <h3 className="font-semibold text-bazari-sand">4. Taxas</h3>
                      <p className="text-bazari-sand/80">
                        As transações na rede Bazari podem incorrer em taxas de rede e taxas de marketplace conforme especificado.
                      </p>
                      
                      <h3 className="font-semibold text-bazari-sand">5. Governança</h3>
                      <p className="text-bazari-sand/80">
                        Como membro da Bazari DAO, você tem direito a participar da governança. 
                        Suas decisões de voto são públicas e imutáveis.
                      </p>
                      
                      <h3 className="font-semibold text-bazari-sand">6. Privacidade</h3>
                      <p className="text-bazari-sand/80">
                        Respeitamos sua privacidade. Dados pessoais são armazenados off-chain e criptografados. 
                        Transações on-chain são públicas.
                      </p>
                      
                      <h3 className="font-semibold text-bazari-sand">7. Riscos</h3>
                      <p className="text-bazari-sand/80">
                        Criptomoedas são voláteis e arriscadas. Invista apenas o que pode perder. 
                        A Bazari não oferece conselhos financeiros.
                      </p>
                      
                      <h3 className="font-semibold text-bazari-sand">8. Mudanças nos Termos</h3>
                      <p className="text-bazari-sand/80">
                        Estes termos podem ser atualizados através de votação da DAO. 
                        Mudanças serão comunicadas com antecedência.
                      </p>
                    </div>
                  </div>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="rounded border-bazari-red/20 bg-bazari-black/50 text-bazari-red focus:ring-bazari-red"
                    />
                    <span className="text-sm text-bazari-sand">
                      {t('auth.terms.accept') || 'Li e aceito os termos de uso e política de privacidade'}
                    </span>
                  </label>
                  
                  {error && (
                    <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <p className="text-sm text-red-500">{error}</p>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter>
                  <Button 
                    size="lg" 
                    className="w-full bg-bazari-red hover:bg-bazari-red/90"
                    onClick={handleAcceptTerms}
                    disabled={!termsAccepted || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando carteira...
                      </>
                    ) : (
                      t('auth.register.complete') || 'Criar Carteira'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
          
          {/* Tela de Conclusão */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
            >
              <Card className="border-bazari-red/20 bg-bazari-black/80">
                <CardContent className="pt-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-bazari-red to-bazari-gold rounded-full flex items-center justify-center">
                      <Check className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-bazari-sand">
                      {t('auth.success.title') || 'Carteira Criada!'}
                    </h2>
                    <p className="text-center text-bazari-sand/60">
                      {t('auth.success.description') || 'Sua carteira foi criada com sucesso. Redirecionando...'}
                    </p>
                    <div className="flex items-center space-x-1 text-sm text-bazari-gold">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Redirecionando...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}