import React from 'react'
import { motion } from 'framer-motion'
import { LogIn, Download, UserPlus, Smartphone, Shield, Coins } from 'lucide-react'
import { Button, Card } from '@components/BaseComponents'
import { useTranslation } from '@i18n/useTranslation'
import { useAuthNavigation, useLogin } from '@modules/acesso/useAuthStore'

// ===============================
// TELA INICIAL - SELEÇÃO DE AÇÃO
// ===============================
const TelaInicial = () => {
  const { t } = useTranslation()
  const { setScreen } = useAuthNavigation()
  const { checkExistingAccount } = useLogin()

  const hasAccount = checkExistingAccount()

  // Animações
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const floatingVariants = {
    initial: { y: 0, rotate: 0 },
    animate: {
      y: [-5, 5, -5],
      rotate: [0, 2, -2, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bazari-light via-white to-bazari-light/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header com Logo */}
          <motion.div variants={itemVariants} className="text-center">
            <motion.div
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 bg-bazari-primary rounded-3xl flex items-center justify-center shadow-bazari-lg mx-auto">
                <span className="text-3xl font-bold text-white">B</span>
              </div>
            </motion.div>
            
            <h1 className="text-3xl font-bold text-bazari-primary mb-2">
              {t('acesso.title')}
            </h1>
            <p className="text-bazari-dark/70 text-lg">
              {t('acesso.subtitle')}
            </p>
          </motion.div>

          {/* Features Preview */}
          <motion.div variants={itemVariants}>
            <Card className="p-4 bg-gradient-to-r from-bazari-primary/5 to-bazari-secondary/5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <Smartphone className="w-6 h-6 text-bazari-primary mb-2" />
                  <span className="text-xs text-bazari-dark font-medium">
                    Mobile First
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <Shield className="w-6 h-6 text-bazari-primary mb-2" />
                  <span className="text-xs text-bazari-dark font-medium">
                    Descentralizado
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <Coins className="w-6 h-6 text-bazari-primary mb-2" />
                  <span className="text-xs text-bazari-dark font-medium">
                    Tokenização
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Opções de Acesso */}
          <motion.div variants={itemVariants} className="space-y-4">
            {/* Login - só aparece se já tem conta */}
            {hasAccount && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  size="lg"
                  className="w-full justify-start relative overflow-hidden"
                  onClick={() => setScreen('login')}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                  <LogIn className="mr-3" size={20} />
                  <div className="text-left flex-1">
                    <div className="font-semibold">{t('acesso.login')}</div>
                    <div className="text-xs opacity-90">
                      Acesse sua conta existente
                    </div>
                  </div>
                </Button>
              </motion.div>
            )}

            {/* Importar Conta */}
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-start"
              onClick={() => setScreen('import')}
            >
              <Download className="mr-3" size={20} />
              <div className="text-left flex-1">
                <div className="font-semibold">{t('acesso.import_account')}</div>
                <div className="text-xs opacity-70">
                  Use sua seed phrase existente
                </div>
              </div>
            </Button>

            {/* Criar Nova Conta */}
            <Button
              variant="secondary"
              size="lg"
              className="w-full justify-start"
              onClick={() => setScreen('create')}
            >
              <UserPlus className="mr-3" size={20} />
              <div className="text-left flex-1">
                <div className="font-semibold">{t('acesso.create_account')}</div>
                <div className="text-xs opacity-80">
                  Primeira vez no Bazari
                </div>
              </div>
            </Button>
          </motion.div>

          {/* Info de Segurança */}
          <motion.div variants={itemVariants}>
            <Card className="p-4 border-bazari-secondary/20 bg-bazari-secondary/5">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-bazari-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-bazari-dark mb-1">
                    Totalmente Seguro
                  </p>
                  <p className="text-xs text-bazari-dark/70">
                    Suas chaves privadas nunca saem do seu dispositivo. 
                    Você tem controle total dos seus dados.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-xs text-bazari-dark/50">
              Versão 0.1.0 - Economia descentralizada para todos
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default TelaInicial