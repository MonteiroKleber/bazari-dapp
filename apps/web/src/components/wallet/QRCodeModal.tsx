import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Copy, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'qrcode'
import { Button } from '@components/ui/button'
import { useCopyToClipboard } from '@hooks/useCopyToClipboard'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  address: string
  token?: 'BZR' | 'LIVO'
  amount?: string
}

export default function QRCodeModal({
  isOpen,
  onClose,
  address,
  token = 'BZR',
  amount
}: QRCodeModalProps) {
  const { t } = useTranslation()
  const [copiedText, copy] = useCopyToClipboard()
  const [qrDataUrl, setQrDataUrl] = useState('')
  
  useEffect(() => {
    if (isOpen && address) {
      generateQR()
    }
  }, [isOpen, address, token, amount])
  
  const generateQR = async () => {
    const data = {
      address,
      token,
      amount,
      network: 'bazari'
    }
    
    const url = await QRCode.toDataURL(JSON.stringify(data), {
      width: 256,
      margin: 2,
      color: {
        dark: '#8B0000',
        light: '#F5F1E0'
      }
    })
    
    setQrDataUrl(url)
  }
  
  const handleCopy = () => {
    copy(address)
  }
  
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `bazari-${token}-receive.png`
    link.click()
  }
  
  if (!isOpen) return null
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative bg-bazari-black border border-bazari-red/20 rounded-2xl p-6 max-w-sm w-full"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-bazari-sand/60 hover:text-bazari-sand"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-bold text-bazari-sand mb-4">
            {t('wallet.receive')} {token}
          </h2>
          
          <div className="bg-bazari-sand p-4 rounded-xl mb-4">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR Code" className="w-full h-auto" />
            )}
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-bazari-sand/60">
                {t('wallet.address')}
              </label>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="text"
                  value={address}
                  readOnly
                  className="flex-1 px-3 py-2 bg-bazari-black/50 border border-bazari-red/20 rounded-lg text-bazari-sand text-sm font-mono"
                />
                <button
                  onClick={handleCopy}
                  className="p-2 text-bazari-sand/60 hover:text-bazari-gold"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copiedText && (
                <p className="text-xs text-green-500 mt-1">{t('common.copied')}</p>
              )}
            </div>
            
            {amount && (
              <div>
                <label className="text-sm text-bazari-sand/60">
                  {t('wallet.amount')}
                </label>
                <p className="text-bazari-sand font-semibold">
                  {amount} {token}
                </p>
              </div>
            )}
            
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('wallet.downloadQR')}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}