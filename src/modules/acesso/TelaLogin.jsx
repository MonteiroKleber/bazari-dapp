import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, AlertCircle, Clock, Shield } from 'lucide-react'
import { Button, Input, Card, Alert } from '@components/BaseComponents'
import { useTranslation } from '@i18n/useTranslation'
import { useAuthNavigation, useLogin } from '@modules/acesso/useAuthStore'

// ===============================
// TELA DE LOGIN
// ===============================
const TelaLogin = () => {
  const { t } = useTranslation()
  const { setScreen } = useAuthNavigation()
  const { 
    login, 
    loginAttempts, 
    isBlocked, 
    resetLoginAttempts,
    validatePassword,
    isLoading, 
    error, 
    clearError 
  } = useLogin()

  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [passwordValidation, setPasswordValidation] = React.useState(null)
  const [blockTimeLeft, setBlockTimeLeft] = React.useState(0)

  // Timer para desbloqueio
  React.useEffect(() => {
    if (isBlocked) {
      const interval = setInterval(() => {
        const timeLeft = Math.max(0, Math.ceil((300000 - (Date.now() - Date.now())) / 1000))
        setBlockTimeLeft(timeLeft)
        
        if (timeLeft === 0) {
          resetLoginAttempts()
          clearInterval(interval)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isBlocked, resetLoginAttempts])

  // Validação em tempo real
  React.useEffect(() => {
    if (password) {
      const validation = validatePassword(password)
      setPasswordValidation(validation)
    } else {
      setPasswordValidation(null)
    }
  }, [password, validatePassword])

  // Limpar erro quando mudar a senha
  React.useEffect(() => {
    if (error) {
      clearError()
    }
  }, [password, clearError, error])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isBlocked) {
      return
    }

    if (!password) {
      return
    }

    try {
      const result = await login(password)
      
      if (result.success) {
        // Login será redirecionado automaticamente pelo store
        setPassword('')
      }
    } catch (err) {
      console.error('Erro no login:', err)
    }
  }

  const remainingAttempts = Math.max(0, 5 - loginAttempts)

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
              onClick={() => setScreen('initial')}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-bazari-primary">
                {t('acesso.login')}
              </h1>
              <p className="text-bazari-dark/70">
                Digite sua senha para acessar
              </p>
            </div>
          </div>

          {/* Security Info */}
          <Card className="p-4 border-bazari-primary/20 bg-bazari-primary/5">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-bazari-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-bazari-dark mb-1">
                  Acesso Seguro
                </p>
                <p className="text-xs text-bazari-dark/70">
                  Sua senha é criptografada e nunca é enviada para nossos servidores.
                </p>
              </div>
            </div>
          </Card>

          {/* Blocked Warning */}
          {isBlocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Alert variant="error" className="flex items-start space-x-3">
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Acesso Temporariamente Bloqueado</p>
                  <p className="text-sm">
                    Muitas tentativas incorretas. Tente novamente em {blockTimeLeft} segundos.
                  </p>
                </div>
              </Alert>
            </motion.div>
          )}

          {/* Login Form */}
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Input */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('acesso.password_placeholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || isBlocked}
                    className="pr-12"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-bazari-primary transition-colors"
                    disabled={isLoading || isBlocked}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {passwordValidation && password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Força da senha:</span>
                      <span className={`font-medium ${
                        passwordValidation.strength === 'forte' ? 'text-success' :
                        passwordValidation.strength === 'média' ? 'text-warning' :
                        'text-error'
                      }`}>
                        {passwordValidation.strength}
                      </span>
                    </div>
                    
                    {/* Strength Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <motion.div
                        className={`h-full rounded-full ${
                          passwordValidation.strength === 'forte' ? 'bg-success' :
                          passwordValidation.strength === 'média' ? 'bg-warning' :
                          'bg-error'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ 
                          width: passwordValidation.strength === 'forte' ? '100%' :
                                 passwordValidation.strength === 'média' ? '60%' : '30%'
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert variant="error" className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Erro no login</p>
                      <p className="text-sm">{error}</p>
                      {remainingAttempts > 0 && (
                        <p className="text-xs mt-1 opacity-80">
                          {remainingAttempts} tentativa{remainingAttempts !== 1 ? 's' : ''} restante{remainingAttempts !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </Alert>
                </motion.div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={isLoading}
                disabled={!password || isBlocked}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>

              {/* Forgot Password Info */}
              <div className="text-center">
                <p className="text-sm text-bazari-dark/70 mb-2">
                  Esqueceu sua senha?
                </p>
                <p className="text-xs text-bazari-dark/60 leading-relaxed">
                  Use sua <strong>seed phrase</strong> para recuperar o acesso.
                  Vá em "Importar Conta" na tela inicial.
                </p>
              </div>
            </form>
          </Card>

          {/* Bottom Info */}
          <div className="text-center">
            <p className="text-xs text-bazari-dark/50">
              Esta senha é usada apenas neste dispositivo
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default TelaLogin