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
  
  const from = (location.state as any)?.from?.pathname || '/wallet'
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])
  
  useEffect(() => {
    checkVaultStatus()
  }, [])
  
  const checkVaultStatus = async () => {
    const vaultExists = await hasVault()
    if (vaultExists) {
      setMode('login')
      setStep('initial')
    } else {
      setMode('register')
      setStep('initial')
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
      setError(err.message || t('auth.errors.seedGenerationFailed'))
    }
  }
  
  const handleSeedBackup = () => {
    if (!seedConfirmed) {
      setError(t('auth.errors.seedNotConfirmed'))
      return
    }
    setStep('terms')
  }
  
  const handleAcceptTerms = async () => {
    if (!termsAccepted) {
      setError(t('auth.errors.termsNotAccepted'))
      return
    }
    
    try {
      setError('')
      // Create vault with seed and password
      const vaultCreated = await createVault(password, seed)
      
      if (vaultCreated) {
        // Register user on backend
        const registered = await register({
          username,
          email,
          termsAccepted: true,
          termsVersion: '1.0.0'
        })
        
        if (registered) {
          setStep('complete')
          setTimeout(() => {
            navigate('/wallet')
          }, 2000)
        }
      }
    } catch (err: any) {
      setError(err.message || t('auth.errors.registrationFailed'))
    }
  }
  
  const handleLogin = async () => {
    if (!password) {
      setError(t('auth.errors.passwordRequired'))
      return
    }
    
    try {
      setError('')
      const unlocked = await unlockVault(password)
      
      if (unlocked) {
        const loggedIn = await login()
        if (loggedIn) {
          navigate(from, { replace: true })
        }
      }
    } catch (err: any) {
      setError(err.message || t('auth.errors.loginFailed'))
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
                    disabled={isUnlocking || isCreatingVault}
                    className="w-full"
                  >
                    {(isUnlocking || isCreatingVault) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {mode === 'login' ? t('auth.login.button') : t('auth.register.button')}
                  </Button>
                  
                  {mode === 'login' && (
                    <button
                      onClick={() => {
                        setMode('register')
                        setError('')
                      }}
                      className="text-sm text-bazari-gold hover:text-bazari-gold/80"
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
                    onClick={() => setStep('initial')}
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
                    onClick={() => setStep('backup-seed')}
                    className="flex-1"
                  >
                    {t('common.back')}
                  </Button>
                  <Button
                    onClick={handleAcceptTerms}
                    disabled={!termsAccepted || isCreatingVault}
                    className="flex-1"
                  >
                    {isCreatingVault && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {t('auth.register.complete')}
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