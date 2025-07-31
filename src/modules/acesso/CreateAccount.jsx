import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export default function CreateAccount() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!password) {
      setError(t('createAccount.errors.password_required'))
      return
    }
    if (!acceptedTerms) {
      setError(t('createAccount.errors.accept_terms'))
      return
    }

    setError('')
    navigate('/show-seed')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral font-nunito text-dark px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-primary mb-2">
            {t('createAccount.title')}
          </h1>
          <p className="text-base">{t('createAccount.description')}</p>
        </header>

        {/* Campo Senha */}
        <div className="mb-4 relative">
          <label htmlFor="password" className="block font-semibold mb-2">
            {t('createAccount.password')}
          </label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('createAccount.password_placeholder')}
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

        {/* Termo de uso (rolável) */}
        <div className="mb-3 max-h-40 overflow-y-scroll border border-gray-300 rounded-lg p-3 text-sm bg-gray-100 whitespace-pre-wrap">
          {t('createAccount.terms_text')}
        </div>

        {/* Aceitação dos termos */}
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="accent-primary"
            />
            <span>{t('createAccount.accept_terms')}</span>
          </label>
        </div>

        {/* Erros */}
        {error && (
          <div className="text-red-600 font-medium mb-3 text-sm">{error}</div>
        )}

        {/* Botões */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-red-800 transition flex justify-center items-center gap-2"
          >
            {t('createAccount.continue')} <span className="text-xl">➡️</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-300 text-dark py-3 rounded-lg font-bold text-base hover:bg-gray-400 transition"
          >
            {t('createAccount.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

