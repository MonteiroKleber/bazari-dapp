import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import React, { useState } from 'react'
import LanguageSelector from '../../components/LanguageSelector'

export default function AcessoIndex() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleAccess = () => {
    if (!password) {
      setError(t('errors.password_required'))
      return
    }

    setError('')
    // Redirecionar após validação (exemplo)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral font-nunito text-dark px-4">
      {/* Idioma */}
      <LanguageSelector />
      
      {/* Card de Acesso */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 mt-12">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-primary mb-2">{t('welcome')}</h1>
          <p className="text-base">{t('protect_wallet')}</p>
        </header>

        {/* Campo Senha */}
        <div className="mb-4 relative">
          <label htmlFor="senha" className="block font-semibold mb-2">
            {t('access_password')}
          </label>
          <input
            id="senha"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('password_placeholder')}
            className="w-full border-2 border-primary rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-accent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-xl"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        {/* Erro */}
        {error && (
          <div className="text-red-600 font-medium mb-3 text-sm">{error}</div>
        )}

        {/* Botões */}
        <button
          onClick={handleAccess}
          className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-red-800 transition mb-3"
        >
          {t('enter_dapp')}
        </button>

        <button className="w-full bg-accent text-dark py-3 rounded-lg font-bold text-base hover:bg-yellow-500 transition mb-3">
          {t('reset_wallet')}
        </button>

        <button
          onClick={() => navigate('/create-account')}
          className="w-full border-2 border-primary text-primary py-3 rounded-lg font-bold text-base hover:bg-primary hover:text-white transition"
        >
          {t('create_account')}
        </button>
      </div>
    </div>
  )
}

