import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  X, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  Wallet,
  CheckCircle
} from 'lucide-react'
import { useWallet } from '@hooks/useWallet'
import { Button } from '@components/ui/button'
import { cn } from '@lib/utils'

interface SendModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SendModal({ isOpen, onClose }: SendModalProps) {
  const { 
    activeAccount, 
    balances, 
    sendTransaction, 
    isSending,
    formatBalance 
  } = useWallet()
  
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState<'BZR' | 'LIVO'>('BZR')
  const [memo, setMemo] = useState('')
  const [error, setError] = useState('')
  const [txHash, setTxHash] = useState('')
  
  const availableBalance = balances 
    ? token === 'BZR' 
      ? parseFloat(balances.BZR.available) / 1e12
      : parseFloat(balances.LIVO.balance) / 1e12
    : 0
    
  const estimatedFee = 0.01 // BZR
  const total = parseFloat(amount || '0') + (token === 'BZR' ? estimatedFee : 0)

  const validateForm = () => {
    if (!recipient) {
      setError('Digite o endereço do destinatário')
      return false
    }
    
    if (recipient.length !== 48 || !recipient.startsWith('5')) {
      setError('Endereço inválido')
      return false
    }
    
    if (recipient === activeAccount?.address) {
      setError('Você não pode enviar para si mesmo')
      return false
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Digite um valor válido')
      return false
    }
    
    if (parseFloat(amount) > availableBalance) {
      setError('Saldo insuficiente')
      return false
    }
    
    if (token === 'BZR' && total > availableBalance) {
      setError('Saldo insuficiente (incluindo taxa)')
      return false
    }
    
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setStep('confirm')
  }

  const handleConfirm = async () => {
    try {
      setError('')
      const hash = await sendTransaction({
        to: recipient,
        amount: (parseFloat(amount) * 1e12).toString(),
        token
      })
      
      if (hash) {
        setTxHash(hash)
        setStep('success')
      } else {
        throw new Error('Falha ao enviar transação')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar transação')
      setStep('form')
    }
  }

  const handleClose = () => {
    setStep('form')
    setRecipient('')
    setAmount('')
    setToken('BZR')
    setMemo('')
    setError('')
    setTxHash('')
    onClose()
  }

  const handleSetMax = () => {
    const max = token === 'BZR' 
      ? Math.max(0, availableBalance - estimatedFee)
      : availableBalance
    setAmount(max.toFixed(6))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md"
        >
          <div className="bg-bazari-black border border-bazari-gold/30 rounded-2xl shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-bazari-gold/20">
              <h2 className="text-xl font-bold text-bazari-sand flex items-center gap-2">
                <Send className="h-5 w-5 text-bazari-gold" />
                Enviar {token}
              </h2>
              <button
                onClick={handleClose}
                className="text-bazari-sand/50 hover:text-bazari-sand"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 'form' && (
                <div className="space-y-4">
                  {/* Token Selection */}
                  <div>
                    <label className="text-sm font-medium text-bazari-sand">Token</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        className={cn(
                          "p-3 rounded-lg border transition-colors",
                          token === 'BZR'
                            ? "border-bazari-gold bg-bazari-gold/10 text-white"
                            : "border-bazari-gold/30 hover:bg-bazari-gold/5 text-bazari-sand"
                        )}
                        onClick={() => setToken('BZR')}
                      >
                        <div className="font-bold">BZR</div>
                        <div className="text-xs opacity-70">
                          Saldo: {balances ? formatBalance(balances.BZR.available) : '0.00'}
                        </div>
                      </button>
                      
                      <button
                        className={cn(
                          "p-3 rounded-lg border transition-colors",
                          token === 'LIVO'
                            ? "border-bazari-gold bg-bazari-gold/10 text-white"
                            : "border-bazari-gold/30 hover:bg-bazari-gold/5 text-bazari-sand"
                        )}
                        onClick={() => setToken('LIVO')}
                      >
                        <div className="font-bold">LIVO</div>
                        <div className="text-xs opacity-70">
                          Saldo: {balances ? formatBalance(balances.LIVO.balance) : '0.00'}
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Recipient */}
                  <div>
                    <label className="text-sm font-medium text-bazari-sand">
                      Endereço do Destinatário
                    </label>
                    <input
                      type="text"
                      placeholder="5..."
                      className="w-full mt-2 px-4 py-2 rounded-lg bg-bazari-black/50 border border-bazari-gold/30 text-white placeholder-bazari-sand/50 focus:border-bazari-gold focus:outline-none"
                      value={recipient}
                      onChange={(e) => {
                        setRecipient(e.target.value)
                        setError('')
                      }}
                    />
                  </div>
                  
                  {/* Amount */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-bazari-sand">Valor</label>
                      <button
                        onClick={handleSetMax}
                        className="text-xs text-bazari-gold hover:text-bazari-gold/80"
                      >
                        Máximo
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        step="0.000001"
                        className="w-full px-4 py-2 pr-16 rounded-lg bg-bazari-black/50 border border-bazari-gold/30 text-white placeholder-bazari-sand/50 focus:border-bazari-gold focus:outline-none"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value)
                          setError('')
                        }}
                      />
                      <span className="absolute right-4 top-2.5 text-bazari-sand">
                        {token}
                      </span>
                    </div>
                  </div>
                  
                  {/* Memo (optional) */}
                  <div>
                    <label className="text-sm font-medium text-bazari-sand">
                      Mensagem (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Pagamento do aluguel"
                      className="w-full mt-2 px-4 py-2 rounded-lg bg-bazari-black/50 border border-bazari-gold/30 text-white placeholder-bazari-sand/50 focus:border-bazari-gold focus:outline-none"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      maxLength={100}
                    />
                  </div>
                  
                  {/* Fee Info */}
                  <div className="p-3 rounded-lg bg-bazari-gold/5 border border-bazari-gold/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-bazari-sand/70">Taxa de rede:</span>
                      <span className="text-white">{estimatedFee} BZR</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-bazari-sand/70">Total:</span>
                      <span className="font-bold text-white">
                        {total.toFixed(6)} {token === 'BZR' ? 'BZR' : `${token} + ${estimatedFee} BZR`}
                      </span>
                    </div>
                  </div>
                  
                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}
                </div>
              )}
              
              {step === 'confirm' && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bazari-gold/10 mb-4">
                      <Send className="h-8 w-8 text-bazari-gold" />
                    </div>
                    <h3 className="text-lg font-bold text-bazari-sand">Confirmar Envio</h3>
                    <p className="text-sm text-bazari-sand/70 mt-1">
                      Revise os detalhes da transação
                    </p>
                  </div>
                  
                  <div className="space-y-3 p-4 rounded-lg bg-bazari-black/50 border border-bazari-gold/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-bazari-sand/70">De:</span>
                      <code className="text-white">{activeAccount?.address.slice(0, 8)}...{activeAccount?.address.slice(-8)}</code>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-bazari-sand/70">Para:</span>
                      <code className="text-white">{recipient.slice(0, 8)}...{recipient.slice(-8)}</code>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-bazari-sand/70">Valor:</span>
                      <span className="font-bold text-white">{amount} {token}</span>
                    </div>
                    {memo && (
                      <div className="flex justify-between text-sm">
                        <span className="text-bazari-sand/70">Mensagem:</span>
                        <span className="text-white">{memo}</span>
                      </div>
                    )}
                    <div className="border-t border-bazari-gold/20 pt-3 mt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-bazari-sand/70">Taxa:</span>
                        <span className="text-white">{estimatedFee} BZR</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="font-medium text-bazari-sand">Total:</span>
                        <span className="font-bold text-bazari-gold">
                          {total.toFixed(6)} {token === 'BZR' ? 'BZR' : `${token} + ${estimatedFee} BZR`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {step === 'success' && (
                <div className="text-center py-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6"
                  >
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-bazari-sand mb-2">
                    Transação Enviada!
                  </h3>
                  <p className="text-sm text-bazari-sand/70 mb-6">
                    Sua transação foi enviada com sucesso e está sendo processada
                  </p>
                  
                  {txHash && (
                    <div className="p-3 rounded-lg bg-bazari-black/50 border border-bazari-gold/20 mb-4">
                      <p className="text-xs text-bazari-sand/70 mb-1">Hash da Transação:</p>
                      <code className="text-xs text-white break-all">{txHash}</code>
                    </div>
                  )}
                  
                  <Button
                    className="w-full bg-bazari-red hover:bg-bazari-red/90"
                    onClick={handleClose}
                  >
                    Fechar
                  </Button>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {step !== 'success' && (
              <div className="flex gap-3 p-6 border-t border-bazari-gold/20">
                {step === 'confirm' && (
                  <Button
                    variant="outline"
                    className="flex-1 border-bazari-gold/30 hover:bg-bazari-gold/10"
                    onClick={() => setStep('form')}
                    disabled={isSending}
                  >
                    Voltar
                  </Button>
                )}
                
                {step === 'form' && (
                  <Button
                    className="flex-1 bg-bazari-red hover:bg-bazari-red/90"
                    onClick={handleSubmit}
                  >
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                
                {step === 'confirm' && (
                  <Button
                    className="flex-1 bg-bazari-red hover:bg-bazari-red/90"
                    onClick={handleConfirm}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Confirmar Envio
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}