import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Plus, Check, Edit2, Trash2, Key, Upload } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@components/ui/button'
import { Account } from '@bazari/wallet-core'
import { truncateAddress } from '@lib/utils'

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  accounts: Account[]
  activeAccount: Account | null
  onSelectAccount: (account: Account) => void
  onCreateAccount: (options: any) => Promise<Account | null>
}

export default function AccountModal({
  isOpen,
  onClose,
  accounts,
  activeAccount,
  onSelectAccount,
  onCreateAccount
}: AccountModalProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'list' | 'create'>('list')
  const [createType, setCreateType] = useState<'derive' | 'new' | 'import'>('derive')
  const [accountName, setAccountName] = useState('')
  const [derivationPath, setDerivationPath] = useState('')
  const [importSeed, setImportSeed] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  
  const handleCreate = async () => {
    if (!accountName) return
    
    setIsCreating(true)
    
    try {
      const options: any = {
        name: accountName,
        derivationType: createType
      }
      
      if (createType === 'derive' && derivationPath) {
        options.derivationPath = derivationPath
      } else if (createType === 'import' && importSeed) {
        options.seed = importSeed
      }
      
      const newAccount = await onCreateAccount(options)
      
      if (newAccount) {
        setMode('list')
        setAccountName('')
        setDerivationPath('')
        setImportSeed('')
      }
    } finally {
      setIsCreating(false)
    }
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
          className="relative bg-bazari-black border border-bazari-red/20 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-bazari-sand/60 hover:text-bazari-sand"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-bold text-bazari-sand mb-4">
            {mode === 'list' ? t('wallet.accounts') : t('wallet.createAccount')}
          </h2>
          
          {mode === 'list' ? (
            <>
              <div className="space-y-2 mb-4">
                {accounts.map((account) => (
                  <div
                    key={account.address}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      activeAccount?.address === account.address
                        ? 'border-bazari-gold bg-bazari-gold/10'
                        : 'border-bazari-red/20 hover:border-bazari-red/40'
                    }`}
                    onClick={() => {
                      onSelectAccount(account)
                      onClose()
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-bazari-sand">
                            {account.name}
                          </span>
                          {activeAccount?.address === account.address && (
                            <Check className="w-4 h-4 text-bazari-gold" />
                          )}
                        </div>
                        <p className="text-sm text-bazari-sand/60 font-mono">
                          {truncateAddress(account.address)}
                        </p>
                        {account.derivationPath && (
                          <p className="text-xs text-bazari-sand/40">
                            {account.derivationPath}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button className="p-1 text-bazari-sand/60 hover:text-bazari-gold">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {accounts.length > 1 && (
                          <button className="p-1 text-bazari-sand/60 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={() => setMode('create')}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('wallet.newAccount')}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bazari-sand mb-2">
                  {t('wallet.accountName')}
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder={t('wallet.accountNamePlaceholder')}
                  className="w-full px-4 py-2 bg-bazari-black/50 border border-bazari-red/20 rounded-xl text-bazari-sand focus:outline-none focus:border-bazari-gold"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-bazari-sand mb-2">
                  {t('wallet.accountType')}
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setCreateType('derive')}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      createType === 'derive'
                        ? 'border-bazari-gold bg-bazari-gold/10'
                        : 'border-bazari-red/20 hover:border-bazari-red/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Key className="w-5 h-5 text-bazari-gold" />
                      <div className="flex-1">
                        <p className="font-medium text-bazari-sand">
                          {t('wallet.deriveAccount')}
                        </p>
                        <p className="text-xs text-bazari-sand/60">
                          {t('wallet.deriveDescription')}
                        </p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setCreateType('new')}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      createType === 'new'
                        ? 'border-bazari-gold bg-bazari-gold/10'
                        : 'border-bazari-red/20 hover:border-bazari-red/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Plus className="w-5 h-5 text-bazari-gold" />
                      <div className="flex-1">
                        <p className="font-medium text-bazari-sand">
                          {t('wallet.newSeed')}
                        </p>
                        <p className="text-xs text-bazari-sand/60">
                          {t('wallet.newSeedDescription')}
                        </p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setCreateType('import')}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      createType === 'import'
                        ? 'border-bazari-gold bg-bazari-gold/10'
                        : 'border-bazari-red/20 hover:border-bazari-red/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Upload className="w-5 h-5 text-bazari-gold" />
                      <div className="flex-1">
                        <p className="font-medium text-bazari-sand">
                          {t('wallet.importSeed')}
                        </p>
                        <p className="text-xs text-bazari-sand/60">
                          {t('wallet.importDescription')}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
              
              {createType === 'derive' && (
                <div>
                  <label className="block text-sm font-medium text-bazari-sand mb-2">
                    {t('wallet.derivationPath')} ({t('common.optional')})
                  </label>
                  <input
                    type="text"
                    value={derivationPath}
                    onChange={(e) => setDerivationPath(e.target.value)}
                    placeholder="//0 or //myaccount"
                    className="w-full px-4 py-2 bg-bazari-black/50 border border-bazari-red/20 rounded-xl text-bazari-sand focus:outline-none focus:border-bazari-gold font-mono"
                  />
                </div>
              )}
              
              {createType === 'import' && (
                <div>
                  <label className="block text-sm font-medium text-bazari-sand mb-2">
                    {t('wallet.seedPhrase')}
                  </label>
                  <textarea
                    value={importSeed}
                    onChange={(e) => setImportSeed(e.target.value)}
                    placeholder={t('wallet.enterSeedPhrase')}
                    rows={3}
                    className="w-full px-4 py-2 bg-bazari-black/50 border border-bazari-red/20 rounded-xl text-bazari-sand focus:outline-none focus:border-bazari-gold font-mono text-sm"
                  />
                </div>
              )}
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setMode('list')}
                  disabled={isCreating}
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!accountName || isCreating || (createType === 'import' && !importSeed)}
                  className="flex-1"
                >
                  {t('wallet.create')}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}