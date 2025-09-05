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
  
  // Redirecionamento padrão para /dashboard ao invés de /wallet
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
      setError(t('auth.errors.passwordTooShort'))
      return
    }
    
    if (password !== confirmPassword) {
      setError(t('auth.errors.passwordMismatch'))
      return
    }
    
    try {
      setError('')
      const generatedSeed = await generateSeed()
      setSeed(generatedSeed)
      setStep('backup-seed')
    } catch (err: any) {
      console.error('Error generating seed:', err)
      setError(err.message || t('auth.errors.seedGenerationFailed'))
    }
  }
  
  const handleSeedBackup = () => {
    if (!seedConfirmed) {
      setError(t('auth.errors.seedNotConfirmed'))
      return
    }
    setError('')
    setStep('terms')
  }
  
  const handleAcceptTerms = async () => {
    // Validação dos termos
    if (!termsAccepted) {
      setError(t('auth.errors.termsNotAccepted'))
      return
    }
    
    // Validação de dados necessários
    if (!seed || !password) {
      setError('Dados incompletos. Por favor, reinicie o processo.')
      return
    }
    
    setIsProcessing(true)
    setError('')
    
    try {
      console.log('Creating vault...')
      
      // Criar vault com seed e senha
      const vaultCreated = await createVault(password, seed)
      
      if (!vaultCreated) {
        throw new Error('Falha ao criar carteira. Tente novamente.')
      }
      
      console.log('Vault created successfully')
      
      // Tentar fazer registro no backend
      try {
        console.log('Registering user...')
        const registered = await register({
          username: username || undefined,
          email: email || undefined,
          termsAccepted: true,
          termsVersion: '1.0.0'
        })
        
        if (!registered) {
          console.warn('Registration on backend failed, but wallet was created')
        } else {
          console.log('User registered successfully')
        }
      } catch (registerErr) {
        // Se falhar o registro no backend, ainda assim a carteira foi criada
        console.error('Registration error (non-fatal):', registerErr)
      }
      
      // Mesmo se o registro no backend falhar, a carteira foi criada com sucesso
      setStep('complete')
      
      // Redireciona para /dashboard após 2 segundos
      setTimeout(() => {
        // Tentar fazer login automático
        login().then(() => {
          navigate('/dashboard')
        }).catch(() => {
          // Se login falhar, ainda assim redireciona
          navigate('/dashboard')
        })
      }, 2000)
      
    } catch (err: any) {
      console.error('Error in handleAcceptTerms:', err)
      setError(err.message || t('auth.errors.registrationFailed'))
      setIsProcessing(false)
    }
  }
  
  const handleLogin = async () => {
    if (!password) {
      setError(t('auth.errors.passwordRequired'))
      return
    }
    
    setIsProcessing(true)
    setError('')
    
    try {
      console.log('Unlocking vault...')
      const unlocked = await unlockVault(password)
      
      if (!unlocked) {
        throw new Error('Senha incorreta')
      }
      
      console.log('Vault unlocked, logging in...')
      const loggedIn = await login()
      
      if (loggedIn) {
        navigate(from, { replace: true })
      } else {
        throw new Error('Falha no login')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || t('auth.errors.loginFailed'))
      setIsProcessing(false)
    }
  }
  
  const handleCopySeed = () => {
    copy(seed)
  }
  
  return (
    <div className="min-h-screen bg-bazari-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <AnimatePresence mode="wait">
          {/* Initial Screen */}
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
                    {mode === 'login' ? t('auth.login.title') : t('auth.register.title')}
                  </CardTitle>
                  <CardDescription className="text-center text-bazari-sand/60">
                    {mode === 'login' ? t('auth.login.description') : t('auth.register.description')}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {mode === 'register' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-bazari-sand mb-2">
                          {t('auth.fields.username')} ({t('common.optional')})
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full px-4 py-2 bg-bazari-black/50 border border-bazari-red/20 rounded-xl text-bazari-sand focus:outline-none focus:border-bazari-gold"
                          placeholder="@username"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-bazari-sand mb-2">
                          {t('auth.fields.email')} ({t('common.optional')})
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2 bg-bazari-black/50 border border-bazari-red/20 rounded-xl text-bazari-sand focus:outline-none focus:border-bazari-gold"
                          placeholder="email@example.com"
                        />
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-bazari-sand mb-2">
                      {t('auth.fields.password')}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 pr-10 bg-bazari-black/50 border border-bazari-red/20 rounded-xl text-bazari-sand focus:outline-none focus:border-bazari-gold"
                        placeholder="••••••••"
                        disabled={isProcessing}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-bazari-sand/60 hover:text-bazari-gold"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  {mode === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-bazari-sand mb-2">
                        {t('auth.fields.confirmPassword')}
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-bazari-black/50 border border-bazari-red/20 rounded-xl text-bazari-sand focus:outline-none focus:border-bazari-gold"
                        placeholder="••••••••"
                        disabled={isProcessing}
                      />
                    </div>
                  )}
                  
                  {error && (
                    <div className="flex items-start space-x-2 p-3 bg-red-900/20 border border-red-500/20 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-red-400">{error}</span>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-3">
                  <Button
                    onClick={mode === 'login' ? handleLogin : handleCreateVault}
                    disabled={isProcessing || isUnlocking || isCreatingVault}
                    className="w-full"
                  >
                    {(isProcessing || isUnlocking || isCreatingVault) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {mode === 'login' ? t('auth.login.button') : t('auth.register.button')}
                  </Button>
                  
                  {mode === 'login' && (
                    <button
                      onClick={() => {
                        setMode('register')
                        setError('')
                        setPassword('')
                        setConfirmPassword('')
                      }}
                      className="text-sm text-bazari-gold hover:text-bazari-gold/80"
                      disabled={isProcessing}
                    >
                      {t('auth.login.noAccount')}
                    </button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          )}
          
          {/* Seed Backup Screen */}
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
                    {t('auth.seed.title')}
                  </CardTitle>
                  <CardDescription className="text-center text-bazari-sand/60">
                    {t('auth.seed.description')}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="p-4 bg-bazari-black/50 border border-bazari-gold/20 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-bazari-gold">
                        {t('auth.seed.phrase')}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowSeed(!showSeed)}
                          className="text-bazari-sand/60 hover:text-bazari-gold"
                        >
                          {showSeed ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button
                          onClick={handleCopySeed}
                          className="text-bazari-sand/60 hover:text-bazari-gold"
                        >
                          <Copy size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "font-mono text-sm break-all",
                      showSeed ? "text-bazari-sand" : "text-transparent bg-bazari-sand/10 select-none"
                    )}>
                      {showSeed ? seed : '••• ••• ••• ••• ••• ••• ••• ••• ••• ••• ••• •••'}
                    </div>
                    
                    {copiedText && (
                      <div className="mt-2 text-xs text-green-500">
                        {t('common.copied')}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 bg-yellow-900/20 border border-yellow-500/20 rounded-xl">
                    <p className="text-sm text-yellow-400">
                      ⚠️ {t('auth.seed.warning')}
                    </p>
                  </div>
                  
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={seedConfirmed}
                      onChange={(e) => setSeedConfirmed(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-bazari-red/50 bg-bazari-black/50 text-bazari-gold focus:ring-bazari-gold"
                    />
                    <span className="text-sm text-bazari-sand">
                      {t('auth.seed.confirm')}
                    </span>
                  </label>
                  
                  {error && (
                    <div className="flex items-start space-x-2 p-3 bg-red-900/20 border border-red-500/20 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-red-400">{error}</span>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep('initial')
                      setError('')
                    }}
                    className="flex-1"
                  >
                    {t('common.back')}
                  </Button>
                  <Button
                    onClick={handleSeedBackup}
                    disabled={!seedConfirmed}
                    className="flex-1"
                  >
                    {t('common.next')}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
          
          {/* Terms Screen */}
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
                    {t('auth.terms.title')}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="h-64 overflow-y-auto p-4 bg-bazari-black/50 border border-bazari-red/20 rounded-xl">
                    <div className="space-y-4 text-sm text-bazari-sand/80">
                      <h3 className="font-semibold text-bazari-sand">1. Aceitação dos Termos</h3>
                      <p>
                        Ao usar o Ecossistema Bazari, você concorda com estes termos de uso e nossa política de privacidade.
                      </p>
                      
                      <h3 className="font-semibold text-bazari-sand">2. Carteira Digital</h3>
                      <p>
                        Você é responsável por manter segura sua seed phrase e senha. A Bazari não pode recuperar suas credenciais perdidas.
                      </p>
                      
                      <h3 className="font-semibold text-bazari-sand">3. Transações</h3>
                      <p>
                        Todas as transações na blockchain são irreversíveis. Verifique sempre os endereços antes de enviar tokens.
                      </p>
                      
                      <h3 className="font-semibold text-bazari-sand">4. Taxas e Split</h3>
                      <p>
                        Todas as transações no marketplace seguem o split automático: 88% vendedor, 8% tesouro da SubDAO, 2% validadores, 2% cashback LIVO.
                      </p>
                      
                      <h3 className="font-semibold text-bazari-sand">5. Governança</h3>
                      <p>
                        Participar da governança das DAOs requer tokens de governança. Suas decisões de voto são públicas e imutáveis.
                      </p>
                      
                      <h3 className="font-semibold text-bazari-sand">6. Privacidade</h3>
                      <p>
                        Respeitamos sua privacidade. Dados pessoais são armazenados off-chain e criptografados. Transações on-chain são públicas.
                      </p>
                      
                      <h3 className="font-semibold text-bazari-sand">7. Riscos</h3>
                      <p>
                        Criptomoedas são voláteis e arriscadas. Invista apenas o que pode perder. A Bazari não oferece conselhos financeiros.
                      </p>
                    </div>
                  </div>
                  
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-bazari-red/50 bg-bazari-black/50 text-bazari-gold focus:ring-bazari-gold"
                    />
                    <span className="text-sm text-bazari-sand">
                      {t('auth.terms.accept')}
                    </span>
                  </label>
                  
                  {error && (
                    <div className="flex items-start space-x-2 p-3 bg-red-900/20 border border-red-500/20 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-red-400">{error}</span>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep('backup-seed')
                      setError('')
                    }}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    {t('common.back')}
                  </Button>
                  <Button
                    onClick={handleAcceptTerms}
                    disabled={!termsAccepted || isProcessing || isCreatingVault}
                    className="w-full bg-bazari-red hover:bg-bazari-red/80"
                  >
                    {isProcessing || isCreatingVault ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando carteira...
                      </>
                    ) : (
                      t('auth.register.complete')
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
          
          {/* Complete Screen */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-bazari-gold/20 bg-bazari-black/80">
                <CardContent className="pt-12 pb-8">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-bazari-sand">
                      {t('auth.success.title')}
                    </h2>
                    <p className="text-bazari-sand/60">
                      {t('auth.success.description')}
                    </p>
                    <div className="mt-4">
                      <Loader2 className="w-6 h-6 animate-spin text-bazari-gold mx-auto" />
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