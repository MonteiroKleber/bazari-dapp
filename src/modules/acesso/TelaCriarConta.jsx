import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Eye, EyeOff, AlertCircle, Check, 
  Shield, Key, Copy, Download, RefreshCw 
} from 'lucide-react'
import { Button, Input, Card, Alert, Badge } from '@components/BaseComponents'
import { useTranslation } from '@i18n/useTranslation'
import { useAuthNavigation, useCreateAccount } from '@modules/acesso/useAuthStore'

// ===============================
// TELA CRIAR CONTA
// ===============================
const TelaCriarConta = () => {
  const { t } = useTranslation()
  const { setScreen } = useAuthNavigation()
  const {
    createAccount,
    confirmSeedPhrase,
    generateNewSeed,
    generatedSeed,
    showSeedConfirmation,
    validatePassword,
    isLoading,
    error,
    clearError
  } = useCreateAccount()

  const [step, setStep] = React.useState(1) // 1: senha, 2: seed, 3: confirmação
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [passwordValidation, setPasswordValidation] = React.useState(null)
  const [seedSaved, setSeedSaved] = React.useState(false)
  const [confirmedSeedWords, setConfirmedSeedWords] = React.useState(Array(12).fill(''))

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
  }, [password, confirmPassword, clearError, error])

  const handleCreatePassword = async (e) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) return
    
    if (password !== confirmPassword) {
      return // Erro já mostrado na UI
    }

    if (!passwordValidation?.valid) return

    try {
      const result = await createAccount(password)
      if (result.success) {
        setStep(2) // Avançar para mostrar seed phrase
      }
    } catch (err) {
      console.error('Erro ao criar conta:', err)
    }
  }

  const handleCopySeed = () => {
    if (generatedSeed) {
      navigator.clipboard.writeText(generatedSeed.join(' '))
      setSeedSaved(true)
    }
  }

  const handleRegenerateSeeed = () => {
    generateNewSeed()
    setSeedSaved(false)
  }

  const handleConfirmSeed = async (e) => {
    e.preventDefault()
    
    const result = await confirmSeedPhrase(confirmedSeedWords)
    if (!result.success) {
      // Erro será mostrado pelo store
    }
  }

  const handleSeedWordChange = (index, value) => {
    const newWords = [...confirmedSeedWords]
    newWords[index] = value.toLowerCase().trim()
    setConfirmedSeedWords(newWords)
  }

  const passwordsMatch = password === confirmPassword
  const allWordsEntered = confirmedSeedWords.every(word => word.length > 0)

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
              onClick={() => step === 1 ? setScreen('initial') : setStep(step - 1)}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-bazari-primary">
                {t('acesso.create_account')}
              </h1>
              <p className="text-bazari-dark/70">
                {step === 1 && 'Defina uma senha segura'}
                {step === 2 && 'Salve sua seed phrase'}
                {step === 3 && 'Confirme sua seed phrase'}
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((stepNumber) => (
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
                {stepNumber < 3 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    stepNumber < step ? 'bg-bazari-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Definir Senha */}
            {step === 1 && (
              <motion.div
                key="step1"
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
                        Senha Local
                      </p>
                      <p className="text-xs text-bazari-dark/70">
                        Será usada para acessar o app neste dispositivo. 
                        Escolha uma senha forte e memorável.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <form onSubmit={handleCreatePassword} className="space-y-6">
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
                      {passwordValidation && (
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
                      disabled={!password || !confirmPassword || !passwordsMatch || !passwordValidation?.valid}
                    >
                      Continuar
                    </Button>
                  </form>
                </Card>
              </motion.div>
            )}

            {/* STEP 2: Mostrar Seed Phrase */}
            {step === 2 && generatedSeed && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <Alert variant="warning" className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">⚠️ Muito Importante!</p>
                    <p className="text-sm">
                      Anote estas 12 palavras em ordem e guarde em local seguro. 
                      Elas são a <strong>única forma</strong> de recuperar sua conta.
                    </p>
                  </div>
                </Alert>

                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-bazari-dark">Sua Seed Phrase</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRegenerateSeeed}
                        disabled={isLoading}
                      >
                        <RefreshCw size={16} className="mr-1" />
                        Nova
                      </Button>
                    </div>

                    {/* Seed Words Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {generatedSeed.map((word, index) => (
                        <div
                          key={index}
                          className="bg-bazari-light p-3 rounded-lg text-center"
                        >
                          <div className="text-xs text-bazari-dark/60 mb-1">
                            {index + 1}
                          </div>
                          <div className="font-mono font-semibold text-bazari-dark">
                            {word}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleCopySeed}
                      >
                        <Copy size={16} className="mr-2" />
                        Copiar para área de transferência
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const text = generatedSeed.join(' ')
                          const blob = new Blob([text], { type: 'text/plain' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = 'bazari-seed-phrase.txt'
                          a.click()
                          setSeedSaved(true)
                        }}
                      >
                        <Download size={16} className="mr-2" />
                        Baixar como arquivo
                      </Button>
                    </div>

                    {/* Confirmation */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        id="seedSaved"
                        checked={seedSaved}
                        onChange={(e) => setSeedSaved(e.target.checked)}
                        className="w-4 h-4 text-bazari-primary"
                      />
                      <label htmlFor="seedSaved" className="text-sm text-bazari-dark">
                        Salvei minha seed phrase em local seguro
                      </label>
                    </div>

                    <Button
                      size="lg"
                      className="w-full"
                      disabled={!seedSaved}
                      onClick={() => setStep(3)}
                    >
                      Continuar
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* STEP 3: Confirmar Seed Phrase */}
            {step === 3 && generatedSeed && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <Card className="p-4 border-success/20 bg-success/5">
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-bazari-dark mb-1">
                        Quase pronto!
                      </p>
                      <p className="text-xs text-bazari-dark/70">
                        Digite sua seed phrase para confirmar que a salvou corretamente.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <form onSubmit={handleConfirmSeed} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-bazari-dark mb-3">
                        Digite as 12 palavras da sua seed phrase:
                      </label>
                      
                      <div className="grid grid-cols-3 gap-3">
                        {confirmedSeedWords.map((word, index) => (
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

                    {error && (
                      <Alert variant="error">{error}</Alert>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      loading={isLoading}
                      disabled={!allWordsEntered}
                    >
                      {isLoading ? 'Criando conta...' : 'Criar Conta'}
                    </Button>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default TelaCriarConta