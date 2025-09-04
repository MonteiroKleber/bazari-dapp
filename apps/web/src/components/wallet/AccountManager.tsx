import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  X, 
  Plus,
  Edit2,
  Trash2,
  Key,
  Download,
  Upload,
  Shield,
  Check,
  AlertCircle,
  Loader2,
  User
} from 'lucide-react'
import { useWallet } from '@hooks/useWallet'
import { Button } from '@components/ui/button'
import { cn } from '@lib/utils'

interface AccountManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function AccountManager({ isOpen, onClose }: AccountManagerProps) {
  const {
    accounts,
    activeAccount,
    setActiveAccount,
    createAccount,
    renameAccount,
    deleteAccount,
    exportSeed,
    isLoading
  } = useWallet()

  const [mode, setMode] = useState<'list' | 'create' | 'rename' | 'export'>('list')
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [newAccountName, setNewAccountName] = useState('')
  const [derivationType, setDerivationType] = useState<'derive' | 'new'>('derive')
  const [importSeed, setImportSeed] = useState('')
  const [derivationPath, setDerivationPath] = useState(`//account/${accounts.length}`)
  const [password, setPassword] = useState('')
  const [exportedSeed, setExportedSeed] = useState('')
  const [error, setError] = useState('')

  const handleCreateAccount = async () => {
    if (!newAccountName) {
      setError('Digite um nome para a conta')
      return
    }

    try {
      setError('')
      const account = await createAccount({
        name: newAccountName,
        derivationType,
        seed: importSeed || undefined,
        derivationPath: derivationType === 'derive' ? derivationPath : undefined
      })

      if (account) {
        setMode('list')
        setNewAccountName('')
        setImportSeed('')
        setDerivationPath(`//account/${accounts.length + 1}`)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta')
    }
  }

  const handleRename = async () => {
    if (!selectedAccount || !newAccountName) return

    try {
      setError('')
      await renameAccount(selectedAccount.address, newAccountName)
      setMode('list')
      setSelectedAccount(null)
      setNewAccountName('')
    } catch (err: any) {
      setError(err.message || 'Erro ao renomear conta')
    }
  }

  const handleDelete = async (account: any) => {
    if (accounts.length === 1) {
      setError('Você precisa manter pelo menos uma conta')
      return
    }

    if (!confirm(`Tem certeza que deseja excluir a conta "${account.name}"?`)) {
      return
    }

    try {
      setError('')
      await deleteAccount(account.address)
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir conta')
    }
  }

  const handleExportSeed = async () => {
    if (!selectedAccount || !password) {
      setError('Digite sua senha para exportar')
      return
    }

    try {
      setError('')
      const seed = await exportSeed(selectedAccount.address, password)
      setExportedSeed(seed)
    } catch (err: any) {
      setError(err.message || 'Senha incorreta')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl max-h-[80vh] overflow-hidden"
        >
          <div className="bg-bazari-black border border-bazari-gold/30 rounded-2xl shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-bazari-gold/20">
              <h2 className="text-xl font-bold text-bazari-sand flex items-center gap-2">
                <Settings className="h-5 w-5 text-bazari-gold" />
                Gerenciar Contas
              </h2>
              <button
                onClick={onClose}
                className="text-bazari-sand/50 hover:text-bazari-sand"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {mode === 'list' && (
                <div className="space-y-4">
                  {/* Account List */}
                  <div className="space-y-3">
                    {accounts.map((account) => (
                      <motion.div
                        key={account.address}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "p-4 rounded-lg border transition-colors",
                          account.address === activeAccount?.address
                            ? "bg-bazari-gold/10 border-bazari-gold"
                            : "bg-bazari-black/50 border-bazari-gold/30 hover:bg-bazari-gold/5"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bazari-red to-bazari-gold flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-white flex items-center gap-2">
                                {account.name}
                                {account.address === activeAccount?.address && (
                                  <span className="text-xs bg-bazari-gold text-bazari-black px-2 py-0.5 rounded">
                                    Ativa
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-bazari-sand/50 font-mono">
                                {`${account.address.slice(0, 12)}...${account.address.slice(-10)}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {account.address !== activeAccount?.address && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-bazari-gold/30 hover:bg-bazari-gold/10"
                                onClick={() => setActiveAccount(account)}
                              >
                                Ativar
                              </Button>
                            )}
                            
                            <button
                              className="p-2 text-bazari-sand/50 hover:text-bazari-sand rounded-lg hover:bg-bazari-gold/10"
                              onClick={() => {
                                setSelectedAccount(account)
                                setNewAccountName(account.name)
                                setMode('rename')
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            
                            <button
                              className="p-2 text-bazari-sand/50 hover:text-bazari-sand rounded-lg hover:bg-bazari-gold/10"
                              onClick={() => {
                                setSelectedAccount(account)
                                setMode('export')
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            
                            {accounts.length > 1 && (
                              <button
                                className="p-2 text-red-500/50 hover:text-red-500 rounded-lg hover:bg-red-500/10"
                                onClick={() => handleDelete(account)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Add Account Button */}
                  <Button
                    className="w-full bg-bazari-red hover:bg-bazari-red/90"
                    onClick={() => setMode('create')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Conta
                  </Button>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}
                </div>
              )}

              {mode === 'create' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-bazari-sand mb-4">Nova Conta</h3>

                  {/* Account Type */}
                  <div>
                    <label className="text-sm font-medium text-bazari-sand mb-2 block">
                      Tipo de Conta
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        className={cn(
                          "p-3 rounded-lg border transition-colors",
                          derivationType === 'derive'
                            ? "border-bazari-gold bg-bazari-gold/10 text-white"
                            : "border-bazari-gold/30 hover:bg-bazari-gold/5 text-bazari-sand"
                        )}
                        onClick={() => setDerivationType('derive')}
                      >
                        <Key className="h-5 w-5 mb-2 mx-auto" />
                        <div className="text-sm font-medium">Derivar</div>
                        <div className="text-xs opacity-70">Da seed principal</div>
                      </button>

                      <button
                        className={cn(
                          "p-3 rounded-lg border transition-colors",
                          derivationType === 'new'
                            ? "border-bazari-gold bg-bazari-gold/10 text-white"
                            : "border-bazari-gold/30 hover:bg-bazari-gold/5 text-bazari-sand"
                        )}
                        onClick={() => setDerivationType('new')}
                      >
                        <Upload className="h-5 w-5 mb-2 mx-auto" />
                        <div className="text-sm font-medium">Importar</div>
                        <div className="text-xs opacity-70">Nova seed</div>
                      </button>
                    </div>
                  </div>

                  {/* Account Name */}
                  <div>
                    <label className="text-sm font-medium text-bazari-sand">
                      Nome da Conta
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Conta Pessoal"
                      className="w-full mt-2 px-4 py-2 rounded-lg bg-bazari-black/50 border border-bazari-gold/30 text-white placeholder-bazari-sand/50 focus:border-bazari-gold focus:outline-none"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                    />
                  </div>

                  {/* Derivation Path */}
                  {derivationType === 'derive' && (
                    <div>
                      <label className="text-sm font-medium text-bazari-sand">
                        Caminho de Derivação
                      </label>
                      <input
                        type="text"
                        placeholder="//account/0"
                        className="w-full mt-2 px-4 py-2 rounded-lg bg-bazari-black/50 border border-bazari-gold/30 text-white placeholder-bazari-sand/50 focus:border-bazari-gold focus:outline-none"
                        value={derivationPath}
                        onChange={(e) => setDerivationPath(e.target.value)}
                      />
                      <p className="text-xs text-bazari-sand/50 mt-1">
                        Use // para hard derivation, / para soft derivation
                      </p>
                    </div>
                  )}

                  {/* Import Seed */}
                  {derivationType === 'new' && (
                    <div>
                      <label className="text-sm font-medium text-bazari-sand">
                        Frase de Recuperação
                      </label>
                      <textarea
                        placeholder="Digite sua frase de recuperação de 12 ou 24 palavras"
                        className="w-full mt-2 px-4 py-3 rounded-lg bg-bazari-black/50 border border-bazari-gold/30 text-white placeholder-bazari-sand/50 focus:border-bazari-gold focus:outline-none resize-none"
                        rows={3}
                        value={importSeed}
                        onChange={(e) => setImportSeed(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-bazari-gold/30 hover:bg-bazari-gold/10"
                      onClick={() => {
                        setMode('list')
                        setError('')
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 bg-bazari-red hover:bg-bazari-red/90"
                      onClick={handleCreateAccount}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Criar Conta
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {mode === 'rename' && selectedAccount && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-bazari-sand mb-4">Renomear Conta</h3>

                  <div>
                    <label className="text-sm font-medium text-bazari-sand">
                      Novo Nome
                    </label>
                    <input
                      type="text"
                      placeholder="Digite o novo nome"
                      className="w-full mt-2 px-4 py-2 rounded-lg bg-bazari-black/50 border border-bazari-gold/30 text-white placeholder-bazari-sand/50 focus:border-bazari-gold focus:outline-none"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-bazari-gold/30 hover:bg-bazari-gold/10"
                      onClick={() => {
                        setMode('list')
                        setSelectedAccount(null)
                        setError('')
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 bg-bazari-red hover:bg-bazari-red/90"
                      onClick={handleRename}
                      disabled={isLoading}
                    >
                      Renomear
                    </Button>
                  </div>
                </div>
              )}

              {mode === 'export' && selectedAccount && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-bazari-sand mb-4">Exportar Seed</h3>

                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div className="text-sm text-yellow-500">
                        <p className="font-semibold mb-1">Atenção!</p>
                        <p>Nunca compartilhe sua seed. Qualquer pessoa com acesso a ela pode roubar seus fundos.</p>
                      </div>
                    </div>
                  </div>

                  {!exportedSeed ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-bazari-sand">
                          Digite sua senha para continuar
                        </label>
                        <input
                          type="password"
                          placeholder="Senha da carteira"
                          className="w-full mt-2 px-4 py-2 rounded-lg bg-bazari-black/50 border border-bazari-gold/30 text-white placeholder-bazari-sand/50 focus:border-bazari-gold focus:outline-none"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      {/* Error Message */}
                      {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {error}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 border-bazari-gold/30 hover:bg-bazari-gold/10"
                          onClick={() => {
                            setMode('list')
                            setSelectedAccount(null)
                            setPassword('')
                            setError('')
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          className="flex-1 bg-bazari-red hover:bg-bazari-red/90"
                          onClick={handleExportSeed}
                          disabled={!password || isLoading}
                        >
                          Exportar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 rounded-lg bg-bazari-black/50 border border-bazari-gold/30">
                        <p className="text-xs text-bazari-sand/70 mb-2">Frase de Recuperação:</p>
                        <p className="text-sm text-white font-mono break-all">{exportedSeed}</p>
                      </div>

                      <Button
                        className="w-full bg-bazari-red hover:bg-bazari-red/90"
                        onClick={() => {
                          setMode('list')
                          setSelectedAccount(null)
                          setPassword('')
                          setExportedSeed('')
                          setError('')
                        }}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Concluído
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}