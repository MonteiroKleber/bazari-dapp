import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, 
  X, 
  Copy, 
  Check,
  Share2,
  QrCode
} from 'lucide-react'
import { useWallet } from '@hooks/useWallet'
import { useCopyToClipboard } from '@hooks/useCopyToClipboard'
import { Button } from '@components/ui/button'
import QRCode from 'qrcode'

interface ReceiveModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ReceiveModal({ isOpen, onClose }: ReceiveModalProps) {
  const { activeAccount } = useWallet()
  const [copiedText, copy] = useCopyToClipboard()
  const [qrCode, setQrCode] = useState('')
  const [shareData, setShareData] = useState('')
  
  useEffect(() => {
    if (activeAccount && isOpen) {
      generateQRCode()
    }
  }, [activeAccount, isOpen])

  const generateQRCode = async () => {
    if (!activeAccount) return
    
    const data = {
      address: activeAccount.address,
      network: 'bazari',
      chain: 'BazariChain'
    }
    
    try {
      const qr = await QRCode.toDataURL(JSON.stringify(data), {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#1C1C1C',
          light: '#F5F1E0'
        },
        width: 256
      })
      setQrCode(qr)
      setShareData(JSON.stringify(data))
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }

  const handleCopyAddress = () => {
    if (activeAccount) {
      copy(activeAccount.address)
    }
  }

  const handleShare = async () => {
    if (!activeAccount) return
    
    const shareText = `Meu endereço Bazari:\n${activeAccount.address}\n\nRede: BazariChain`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Endereço Bazari',
          text: shareText
        })
      } catch (error) {
        // User cancelled or share failed
        copy(shareText)
      }
    } else {
      copy(shareText)
    }
  }

  if (!isOpen || !activeAccount) return null

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
                <Download className="h-5 w-5 text-bazari-gold" />
                Receber Pagamento
              </h2>
              <button
                onClick={onClose}
                className="text-bazari-sand/50 hover:text-bazari-sand"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Account Info */}
              <div className="text-center">
                <p className="text-sm text-bazari-sand/70 mb-2">Conta Ativa</p>
                <p className="font-medium text-white">{activeAccount.name}</p>
              </div>

              {/* QR Code */}
              {qrCode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-center"
                >
                  <div className="relative p-4 bg-bazari-sand rounded-2xl">
                    <img 
                      src={qrCode} 
                      alt="QR Code" 
                      className="w-48 h-48"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 bg-bazari-black rounded-full flex items-center justify-center">
                        <QrCode className="h-6 w-6 text-bazari-gold" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-bazari-sand">
                  Seu Endereço
                </label>
                <div className="relative">
                  <div className="p-4 rounded-lg bg-bazari-black/50 border border-bazari-gold/30">
                    <code className="text-sm text-white break-all font-mono">
                      {activeAccount.address}
                    </code>
                  </div>
                  <button
                    onClick={handleCopyAddress}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-bazari-black hover:bg-bazari-gold/10 transition-colors"
                  >
                    {copiedText === activeAccount.address ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-bazari-gold" />
                    )}
                  </button>
                </div>
                {copiedText === activeAccount.address && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-green-500"
                  >
                    Endereço copiado!
                  </motion.p>
                )}
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-lg bg-bazari-gold/5 border border-bazari-gold/20">
                <h4 className="font-medium text-bazari-sand mb-2">Como receber:</h4>
                <ol className="space-y-2 text-sm text-bazari-sand/80">
                  <li className="flex gap-2">
                    <span className="text-bazari-gold">1.</span>
                    <span>Compartilhe seu endereço ou QR code com o remetente</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-bazari-gold">2.</span>
                    <span>Certifique-se de que estão usando a rede BazariChain</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-bazari-gold">3.</span>
                    <span>A transação aparecerá em seu histórico em segundos</span>
                  </li>
                </ol>
              </div>

              {/* Network Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-bazari-black/50 border border-bazari-gold/20">
                  <p className="text-bazari-sand/70">Rede</p>
                  <p className="font-medium text-white">BazariChain</p>
                </div>
                <div className="p-3 rounded-lg bg-bazari-black/50 border border-bazari-gold/20">
                  <p className="text-bazari-sand/70">Tokens Aceitos</p>
                  <p className="font-medium text-white">BZR, LIVO</p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 p-6 border-t border-bazari-gold/20">
              <Button
                variant="outline"
                className="flex-1 border-bazari-gold/30 hover:bg-bazari-gold/10"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
              
              <Button
                className="flex-1 bg-bazari-red hover:bg-bazari-red/90"
                onClick={handleCopyAddress}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Endereço
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}