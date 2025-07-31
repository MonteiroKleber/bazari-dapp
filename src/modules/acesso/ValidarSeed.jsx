import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function ValidarSeed() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [inputSeed, setInputSeed] = useState('');
  const [error, setError] = useState('');

  const originalSeed = "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12";

  const handleValidation = () => {
    if (inputSeed.trim() === originalSeed) {
      setError('');
      navigate('/dashboard');
    } else {
      setError(t('validarSeed.errors.invalid'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral font-nunito text-dark px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-primary mb-2">
            {t('validarSeed.title')}
          </h1>
          <p className="text-base">{t('validarSeed.description')}</p>
        </header>

        <div className="mb-4">
          <label htmlFor="seed" className="block font-semibold mb-2">
            {t('validarSeed.label')}
          </label>
          <textarea
            id="seed"
            rows={3}
            className="w-full border-2 border-primary rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder={t('validarSeed.placeholder')}
            value={inputSeed}
            onChange={(e) => setInputSeed(e.target.value)}
          />
        </div>

        <div className="bg-[#fff6e5] border border-yellow-500 p-3 rounded-md text-sm text-primary mb-4">
          ⚠️ {t('validarSeed.alert')}
        </div>

        {error && (
          <div className="text-red-600 font-medium mb-3 text-sm">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/show-seed')}
            className="w-1/2 bg-white text-primary border-2 border-primary py-3 rounded-lg font-bold text-lg hover:bg-primary hover:text-white transition"
          >
            ⬅️ {t('common.back')}
          </button>

          <button
            onClick={handleValidation}
            className="w-1/2 bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-red-800 transition"
          >
            {t('validarSeed.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

