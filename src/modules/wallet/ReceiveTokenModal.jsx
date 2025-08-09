// ===============================
// RECEIVE TOKEN MODAL - Bazari dApp
// ===============================

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Copy, 
  Download, 
  QrCode,
  Share2,
  Check,
  Wallet
} from 'lucide-react'

import { Button, Input, Modal, Badge } from '@components/BaseComponents'
import { useReceiveToken, useWallet, useTokens } from './useWalletStore'
import WalletService from '@services/WalletService'

// ===============================
// RECEIVE TOKEN MODAL
// ===============================

const ReceiveTokenModal = () => {
  const { receiveModal, closeReceiveModal } = useReceiveToken()
  const { walletData } = useWallet()
  const { tokens } = useTokens()
  
  const [selectedToken, setSelectedToken] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [copied, setCopied] = useState(false)

  // Use selected token from modal or default to first token
  const token = receiveModal.token || selectedToken || tokens[0]
  
  const copyAddress = () => {
    navigator.clipboard.writeText(walletData.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareAddress = async () => {
    const shareData = {
      title: 'Meu endereço Bazari',
      text: `Envie tokens para: ${walletData.address}`,
      url: `https://bazari.com/wallet/${walletData.address}`
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Erro ao compartilhar:', error)
        copyAddress() // Fallback para copiar
      }
    } else {
      copyAddress() // Fallback para copiar
    }
  }

  if (!receiveModal.isOpen) return null

  return (
    <AnimatePresence>
      <Modal
        isOpen={receiveModal.isOpen}
        onClose={closeReceiveModal}
        size="md"
        className="p-0 overflow-hidden"
      >
        <div className="bg-white rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500/10 to-green-500/20 rounded-full flex items-center justify-center">
                <Download size={20} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Receber Tokens</h2>
                <p className="text-sm text-gray-600">
                  Compartilhe seu endereço para receber pagamentos
                </p>
              </div>
            </div>
            <button
              onClick={closeReceiveModal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Token Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de token preferido
              </label>
              <div className="grid grid-cols-2 gap-3">
                {tokens.slice(0, 4).map((tokenOption) => (
                  <button
                    key={tokenOption.id}
                    onClick={() => setSelectedToken(tokenOption)}
                    className={`p-3 border-2 rounded-xl flex items-center gap-3 transition-all ${
                      token?.id === tokenOption.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-bazari-primary/10 to-bazari-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-lg">{tokenOption.icon}</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">{tokenOption.symbol}</div>
                      <div className="text-xs text-gray-600">{tokenOption.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* QR Code Area */}
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-4 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center">
                <QRCodePlaceholder address={walletData.address} token={token?.symbol} amount={customAmount} />
              </div>
              
              <p className="text-sm text-gray-600">
                {customAmount 
                  ? `Solicitando ${customAmount} ${token?.symbol}`
                  : `QR Code para receber ${token?.symbol || 'tokens'}`
                }
              </p>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor específico (opcional)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="pr-20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-sm font-medium text-gray-600">
                    {token?.symbol}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Deixe vazio para permitir qualquer valor
              </p>
            </div>

            {/* Wallet Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seu endereço
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 rounded-xl p-3 font-mono text-sm break-all">
                  {walletData.address}
                </div>
                <button
                  onClick={copyAddress}
                  className="p-3 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
                  title="Copiar endereço"
                >
                  {copied ? (
                    <Check size={18} className="text-green-600" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
              
              {copied && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-green-600 mt-2 text-center"
                >
                  ✅ Endereço copiado!
                </motion.p>
              )}
            </div>

            {/* Network Info */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Dica importante</h4>
              <p className="text-sm text-blue-800">
                Este endereço pode receber qualquer token da rede Bazari. 
                Certifique-se de que o remetente está usando a rede correta.
              </p>
            </div>

            {/* Recent Transactions */}
            <RecentReceived />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={shareAddress}
              >
                <Share2 size={18} />
                Compartilhar
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={copyAddress}
              >
                <Copy size={18} />
                Copiar Endereço
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </AnimatePresence>
  )
}

// ===============================
// QR CODE PLACEHOLDER
// ===============================

const QRCodePlaceholder = ({ address, token, amount }) => {
  // In a real app, this would generate an actual QR code
  // For now, we'll show a stylized placeholder
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
      <div className="grid grid-cols-8 gap-1 mb-4">
        {Array.from({ length: 64 }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-sm ${
              Math.random() > 0.5 ? 'bg-gray-800' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      
      <div className="text-center">
        <QrCode size={32} className="text-gray-400 mx-auto mb-2" />
        <p className="text-xs text-gray-500">QR Code</p>
        {amount && (
          <p className="text-xs text-gray-600 mt-1">
            {amount} {token}
          </p>
        )}
      </div>
    </div>
  )
}

// ===============================
// RECENT RECEIVED TRANSACTIONS
// ===============================

const RecentReceived = () => {
  // Mock recent received transactions
  const recentReceived = [
    {
      id: '1',
      token: 'BZR',
      amount: 50,
      from: '0x742d...35f4',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: '2',
      token: 'DEV',
      amount: 5,
      from: '0x123f...89c1',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    }
  ]

  if (recentReceived.length === 0) return null

  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">Recebidos recentemente</h4>
      <div className="space-y-3">
        {recentReceived.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Download size={14} className="text-green-600" />
              </div>
              <div>
                <div className="font-medium text-sm">
                  +{WalletService.formatTokenAmount(tx.amount)} {tx.token}
                </div>
                <div className="text-xs text-gray-600">
                  De {WalletService.shortenAddress(tx.from)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="success" className="text-xs">
                Recebido
              </Badge>
              <div className="text-xs text-gray-600 mt-1">
                {new Date(tx.timestamp).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReceiveTokenModal