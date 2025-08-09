// ===============================
// SEND TOKEN MODAL - Bazari dApp
// ===============================

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Send, 
  QrCode, 
  Users, 
  Scan,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Wallet
} from 'lucide-react'

import { Button, Input, Modal, Alert, Avatar, Badge } from '@components/BaseComponents'
import { useSendToken, useTokens } from './useWalletStore'
import WalletService from '@services/WalletService'
import { useTranslation } from '@i18n/useTranslation'

// ===============================
// SEND TOKEN MODAL
// ===============================

const SendTokenModal = () => {
  const { t } = useTranslation()
  const { 
    sendModal, 
    closeSendModal, 
    updateSendForm, 
    sendToken, 
    isLoading, 
    error,
    isValid 
  } = useSendToken()
  
  const { tokens } = useTokens()
  const [step, setStep] = useState(1) // 1: Form, 2: Confirm, 3: Processing, 4: Success
  const [txResult, setTxResult] = useState(null)

  // Reset modal state when opening
  useEffect(() => {
    if (sendModal.isOpen) {
      setStep(1)
      setTxResult(null)
    }
  }, [sendModal.isOpen])

  const handleSend = async () => {
    if (!isValid) return

    setStep(3) // Processing
    
    try {
      const result = await sendToken()
      if (result) {
        setTxResult(result)
        setStep(4) // Success
      } else {
        setStep(2) // Back to confirm with error
      }
    } catch (error) {
      console.error('Erro no envio:', error)
      setStep(2) // Back to confirm with error
    }
  }

  const handleClose = () => {
    closeSendModal()
    setTimeout(() => {
      setStep(1)
      setTxResult(null)
    }, 300)
  }

  if (!sendModal.isOpen) return null

  return (
    <AnimatePresence>
      <Modal
        isOpen={sendModal.isOpen}
        onClose={handleClose}
        size="md"
        className="p-0 overflow-hidden"
      >
        <div className="bg-white rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-bazari-primary/10 to-bazari-primary/20 rounded-full flex items-center justify-center">
                <Send size={20} className="text-bazari-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Enviar Token</h2>
                <p className="text-sm text-gray-600">
                  {step === 1 && 'Preencha os dados do envio'}
                  {step === 2 && 'Confirme os detalhes'}
                  {step === 3 && 'Processando envio...'}
                  {step === 4 && 'Envio realizado!'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Form */}
            {step === 1 && (
              <SendForm 
                sendModal={sendModal}
                updateSendForm={updateSendForm}
                tokens={tokens}
                onNext={() => setStep(2)}
                isValid={isValid}
              />
            )}

            {/* Step 2: Confirmation */}
            {step === 2 && (
              <ConfirmSend
                sendModal={sendModal}
                onBack={() => setStep(1)}
                onConfirm={handleSend}
                isLoading={isLoading}
                error={error}
              />
            )}

            {/* Step 3: Processing */}
            {step === 3 && (
              <ProcessingSend />
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <SendSuccess
                transaction={txResult}
                onClose={handleClose}
              />
            )}
          </div>
        </div>
      </Modal>
    </AnimatePresence>
  )
}

// ===============================
// SEND FORM (Step 1)
// ===============================

const SendForm = ({ sendModal, updateSendForm, tokens, onNext, isValid }) => {
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showContacts, setShowContacts] = useState(false)

  const selectedToken = sendModal.token || tokens[0]
  const maxAmount = selectedToken?.balance || 0
  const amount = parseFloat(sendModal.amount) || 0
  const estimatedValue = amount * (selectedToken?.price || 0)

  const quickAmounts = [0.25, 0.5, 0.75, 1].map(percent => 
    Math.round(maxAmount * percent * 100) / 100
  )

  return (
    <div className="space-y-6">
      {/* Token Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Token para enviar
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tokens.slice(0, 4).map((token) => (
            <button
              key={token.id}
              onClick={() => updateSendForm('token', token)}
              className={`p-3 border-2 rounded-xl flex items-center gap-3 transition-all ${
                sendModal.token?.id === token.id
                  ? 'border-bazari-primary bg-bazari-primary/5'
                  : 'border-gray-200 hover:border-bazari-primary/50'
              }`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-bazari-primary/10 to-bazari-primary/20 rounded-full flex items-center justify-center">
                <span className="text-lg">{token.icon}</span>
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{token.symbol}</div>
                <div className="text-xs text-gray-600">
                  {WalletService.formatTokenAmount(token.balance)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantidade
        </label>
        <div className="relative">
          <Input
            type="number"
            placeholder="0.00"
            value={sendModal.amount}
            onChange={(e) => updateSendForm('amount', e.target.value)}
            className="text-lg pr-20"
            max={maxAmount}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-sm font-medium text-gray-600">
              {selectedToken?.symbol}
            </span>
          </div>
        </div>
        
        {/* Balance & Value */}
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>
            Saldo: {WalletService.formatTokenAmount(maxAmount)} {selectedToken?.symbol}
          </span>
          {amount > 0 && (
            <span>
              ≈ {WalletService.formatCurrency(estimatedValue)}
            </span>
          )}
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex gap-2 mt-3">
          {quickAmounts.map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => updateSendForm('amount', quickAmount.toString())}
              className="flex-1 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {quickAmount}
            </button>
          ))}
          <button
            onClick={() => updateSendForm('amount', maxAmount.toString())}
            className="px-3 py-2 text-xs bg-bazari-primary text-white rounded-lg hover:bg-bazari-primary-hover transition-colors"
          >
            Máx
          </button>
        </div>
      </div>

      {/* Recipient */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destinatário
        </label>
        <div className="relative">
          <Input
            placeholder="Endereço da carteira ou @usuário"
            value={sendModal.recipient}
            onChange={(e) => updateSendForm('recipient', e.target.value)}
            className="pr-24"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              onClick={() => setShowQRScanner(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Escanear QR Code"
            >
              <QrCode size={16} />
            </button>
            <button
              onClick={() => setShowContacts(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Contatos"
            >
              <Users size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Description (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição (opcional)
        </label>
        <Input
          placeholder="Para que é este pagamento?"
          value={sendModal.description}
          onChange={(e) => updateSendForm('description', e.target.value)}
        />
      </div>

      {/* Validation Errors */}
      {amount > maxAmount && (
        <Alert variant="error" className="text-sm">
          <AlertCircle size={16} />
          Saldo insuficiente. Máximo: {WalletService.formatTokenAmount(maxAmount)} {selectedToken?.symbol}
        </Alert>
      )}

      {/* Continue Button */}
      <Button
        variant="primary"
        className="w-full"
        disabled={!isValid || amount > maxAmount}
        onClick={onNext}
      >
        Continuar
        <ArrowRight size={18} />
      </Button>
    </div>
  )
}

// ===============================
// CONFIRM SEND (Step 2)
// ===============================

const ConfirmSend = ({ sendModal, onBack, onConfirm, isLoading, error }) => {
  const token = sendModal.token
  const amount = parseFloat(sendModal.amount)
  const estimatedValue = amount * token.price
  const networkFee = 0.001 // Simulated network fee
  const total = amount + networkFee

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-bazari-primary/10 to-bazari-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">{token.icon}</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">
          {WalletService.formatTokenAmount(amount)} {token.symbol}
        </h3>
        <p className="text-gray-600">
          ≈ {WalletService.formatCurrency(estimatedValue)}
        </p>
      </div>

      {/* Transaction Details */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Para:</span>
          <span className="font-medium">
            {WalletService.shortenAddress(sendModal.recipient)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Taxa de rede:</span>
          <span className="font-medium">
            {WalletService.formatTokenAmount(networkFee)} {token.symbol}
          </span>
        </div>
        
        <div className="border-t pt-3 flex justify-between font-semibold">
          <span>Total:</span>
          <span>
            {WalletService.formatTokenAmount(total)} {token.symbol}
          </span>
        </div>
        
        {sendModal.description && (
          <div className="border-t pt-3">
            <span className="text-gray-600">Descrição:</span>
            <p className="mt-1">{sendModal.description}</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error">
          <AlertCircle size={16} />
          {error}
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onBack}
          disabled={isLoading}
        >
          Voltar
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          Confirmar Envio
        </Button>
      </div>
    </div>
  )
}

// ===============================
// PROCESSING SEND (Step 3)
// ===============================

const ProcessingSend = () => (
  <div className="text-center py-8">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-16 h-16 border-4 border-bazari-primary/20 border-t-bazari-primary rounded-full mx-auto mb-6"
    />
    <h3 className="text-xl font-semibold mb-2">Processando envio...</h3>
    <p className="text-gray-600">
      Sua transação está sendo processada na blockchain.
      Isso pode levar alguns segundos.
    </p>
  </div>
)

// ===============================
// SEND SUCCESS (Step 4)
// ===============================

const SendSuccess = ({ transaction, onClose }) => (
  <div className="text-center py-8">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
    >
      <CheckCircle size={32} className="text-green-600" />
    </motion.div>
    
    <h3 className="text-xl font-semibold mb-2">Envio realizado!</h3>
    <p className="text-gray-600 mb-6">
      Sua transação foi enviada com sucesso.
    </p>

    {transaction && (
      <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
        <div className="text-sm text-gray-600 mb-1">ID da Transação:</div>
        <div className="font-mono text-sm break-all">{transaction.id}</div>
      </div>
    )}

    <Button
      variant="primary"
      className="w-full"
      onClick={onClose}
    >
      Concluir
    </Button>
  </div>
)

export default SendTokenModal