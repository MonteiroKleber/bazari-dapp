import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Eye, EyeOff, AlertCircle, Upload, 
  FileText, Clipboard, Check, Shield, Key
} from 'lucide-react'
import { Button, Input, Card, Alert, Badge } from '@components/BaseComponents'
import { useTranslation } from '@i18n/useTranslation'
import { useAuthNavigation, useImportAccount } from '@modules/acesso/useAuthStore'

// ===============================
// TELA IMPORTAR CONTA
// ===============================
const TelaImportarConta = () => {
  const { t } = useTranslation()
  const { setScreen } = useAuthNavigation()
  const {
    importAccount,
    validateSeedPhrase,
    validatePassword,
    isLoading,
    error,
    clearError
  } = useImportAccount()

  const [step, setStep] = React.useState(1) // 1: seed phrase, 2: senha
  const [seedInput, setSeedInput] = React.useState('')
  const [seedWords, setSeedWords] = React.useState(Array(12).fill(''))
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [seedValidation, setSeedValidation] = React.useState(null)
  const [passwordValidation, setPasswordValidation] = React.useState(null)
  const [inputMode, setInputMode] = React.useState('text') // 'text' ou 'individual'

  // Validação da seed phrase em tempo real
  React.useEffect(() => {
    let wordsToValidate = []
    
    if (inputMode === 'text') {
      wordsToValidate = seedInput.trim().split(/\s+/).filter(w => w.length > 0)
    } else {
      wordsToValidate = seedWords.filter(w => w.length > 0)
    }

    if (wordsToValidate.length > 0) {
      const validation = validateSeedPhrase(wordsToValidate)
      setSeedValidation(validation)
    } else {
      setSeedValidation(null)
    }
  }, [seedInput, seedWords, inputMode, validateSeedPhrase])

  // Validação da senha em tempo real
  React.useEffect(() => {
    if (password) {
      const validation = validatePassword(password)
      setPasswordValidation(validation)
    } else {
      setPasswordValidation(null)
    }
  }, [password, validatePassword])

  // Limpar erro quando dados mudarem
  React.useEffect(() => {
    if (error) clearError()
  }, [seedInput, seedWords, password, confirmPassword, clearError, error])

  const handleSeedInputChange = (value) => {
    setSeedInput(value)
    // Auto-fill individual words if pasting
    const words = value.trim().split(/\s+/).slice(0, 12)
    if (words.length <= 12) {
      const newSeedWords = [...Array(12)].map((_, i) => words[i] || '')
      setSeedWords(newSeedWords)
    }
  }

  const handleSeedWordChange = (index, value) => {
    const newWords = [...seedWords]
    newWords[index] = value.toLowerCase().trim()
    setSeedWords(newWords)
    
    // Update text input
    setSeedInput(newWords.filter(w => w.length > 0).join(' '))
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      handleSeedInputChange(text)
    } catch (err) {
      console.error('Erro ao colar da área de transferência:', err)
    }
  }

  const handleContinueToPassword = () => {
    if (seedValidation?.valid) {
      setStep(2)
    }
  }

  const handleImport = async (e) => {
    e.preventDefault()
    
    if (!seedValidation?.valid || !password || password !== confirmPassword) {
      return
    }

    try {
      const seedPhrase = inputMode === 'text' 
        ? seedInput.trim().split(/\s+/)
        : seedWords.filter(w => w.length > 0)
      
      const result = await importAccount(seedPhrase, password)
      
      if (!result.success) {
        // Erro será mostrado pelo store
      }
    } catch (err) {
      console.error('Erro ao importar conta:', err)
    }
  }

  const allWordsEntered = seedWords.every(word => word.length > 0)
  const passwordsMatch = password === confirmPassword

  return (
    <div className="min-h-screen bg-gradient-to-br from-bazari-light via-white to-bazari-light/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => step === 1 ? setScreen('initial') : setStep(1)}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-bazari-primary">
                {t('acesso.import_account')}
              </h1>
              <p className="text-bazari-dark/70">
                {step === 1 ? 'Digite sua seed phrase' : 'Defina uma senha local'}
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center space-x-2">
            {[1, 2].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${stepNumber <= step 
                    ? 'bg-bazari-primary text-white' 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {stepNumber < step ? <Check size={16} /> : stepNumber}
                </div>
                {stepNumber < 2 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    stepNumber < step ? 'bg-bazari-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Seed Phrase */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <Card className="p-4 border-bazari-secondary/20 bg-bazari-secondary/5">
                  <div className="flex items-start space-x-3">
                    <Upload className="w-5 h-5 text-bazari-secondary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-bazari-dark mb-1">
                        Recuperar Conta Existente
                      </p>
                      <p className="text-xs text-bazari-dark/70">
                        Insira as 12 palavras da sua seed phrase para importar sua conta existente.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="space-y-6">
                    {/* Input Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setInputMode('text')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                          inputMode === 'text' 
                            ? 'bg-white text-bazari-primary shadow-sm' 
                            : 'text-gray-600'
                        }`}
                      >
                        <FileText size={16} className="inline mr-1" />
                        Texto
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputMode('individual')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                          inputMode === 'individual' 
                            ? 'bg-white text-bazari-primary shadow-sm' 
                            : 'text-gray-600'
                        }`}
                      >
                        Individual
                      </button>
                    </div>

                    {/* Text Input Mode */}
                    {inputMode === 'text' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-bazari-dark">
                            Seed Phrase (12 palavras)
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handlePasteFromClipboard}
                            className="text-xs"
                          >
                            <Clipboard size={14} className="mr-1" />
                            Colar
                          </Button>
                        </div>
                        
                        <textarea
                          placeholder={t('acesso.seed_phrase_placeholder')}
                          value={seedInput}
                          onChange={(e) => handleSeedInputChange(e.target.value)}
                          disabled={isLoading}
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-bazari-primary focus:ring-4 focus:ring-bazari-primary/20 focus:outline-none resize-none"
                        />
                      </div>
                    )}

                    {/* Individual Words Mode */}
                    {inputMode === 'individual' && (
                      <div className="space-y-4">
                        <label className="text-sm font-medium text-bazari-dark">
                          Digite cada palavra:
                        </label>
                        
                        <div className="grid grid-cols-3 gap-3">
                          {seedWords.map((word, index) => (
                            <div key={index} className="space-y-1">
                              <label className="text-xs text-bazari-dark/60">
                                {index + 1}
                              </label>
                              <Input
                                type="text"
                                value={word}
                                onChange={(e) => handleSeedWordChange(index, e.target.value)}
                                placeholder=""
                                className="text-center"
                                disabled={isLoading}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Seed Validation */}
                    {seedValidation && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-bazari-dark">Status:</span>
                          <Badge 
                            variant={seedValidation.valid ? 'success' : 'error'}
                            size="sm"
                          >
                            {seedValidation.valid ? 'Válida' : 'Inválida'}
                          </Badge>
                        </div>
                        
                        {!seedValidation.valid && seedValidation.error && (
                          <Alert variant="error" className="text-sm">
                            <AlertCircle size={16} className="inline mr-1" />
                            {seedValidation.error}
                          </Alert>
                        )}

                        {seedValidation.valid && (
                          <Alert variant="success" className="text-sm">
                            <Check size={16} className="inline mr-1" />
                            Seed phrase válida! Você pode continuar.
                          </Alert>
                        )}
                      </motion.div>
                    )}

                    <Button
                      size="lg"
                      className="w-full"
                      disabled={!seedValidation?.valid}
                      onClick={handleContinueToPassword}
                    >
                      Continuar
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* STEP 2: Password Setup */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <Card className="p-4 border-bazari-primary/20 bg-bazari-primary/5">
                  <div className="flex items-start space-x-3">
                    <Key className="w-5 h-5 text-bazari-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-bazari-dark mb-1">
                        Senha para este Dispositivo
                      </p>
                      <p className="text-xs text-bazari-dark/70">
                        Defina uma senha para acessar sua conta neste dispositivo.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <form onSubmit={handleImport} className="space-y-6">
                    {/* Password */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-bazari-dark">
                        Nova Senha
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Digite sua senha"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                          className="pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-bazari-primary"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>

                      {/* Password Validation */}
                      {passwordValidation && password.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span>Força:</span>
                            <Badge 
                              variant={
                                passwordValidation.strength === 'forte' ? 'success' :
                                passwordValidation.strength === 'média' ? 'warning' : 'error'
                              }
                              size="sm"
                            >
                              {passwordValidation.strength}
                            </Badge>
                          </div>
                          
                          {passwordValidation.errors.length > 0 && (
                            <div className="space-y-1">
                              {passwordValidation.errors.map((error, index) => (
                                <p key={index} className="text-xs text-error flex items-center">
                                  <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                                  {error}
                                </p>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-bazari-dark">
                        Confirmar Senha
                      </label>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Digite novamente"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        error={confirmPassword && !passwordsMatch ? 'Senhas não conferem' : null}
                      />
                    </div>

                    {error && (
                      <Alert variant="error">{error}</Alert>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      loading={isLoading}
                      disabled={
                        !password || 
                        !confirmPassword || 
                        !passwordsMatch || 
                        !passwordValidation?.valid
                      }
                    >
                      {isLoading ? 'Importando conta...' : 'Importar Conta'}
                    </Button>
                  </form>
                </Card>

                {/* Security Info */}
                <Card className="p-4 border-info/20 bg-info/5">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-bazari-dark mb-1">
                        Dados Seguros
                      </p>
                      <p className="text-xs text-bazari-dark/70">
                        Sua seed phrase será criptografada e armazenada localmente. 
                        Nunca é enviada para nossos servidores.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default TelaImportarConta