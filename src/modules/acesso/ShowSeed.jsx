import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function ShowSeed() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [seed] = useState('apple banana cat dog eagle forest gold hill ink juice kite lemon'); // seed fictícia
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(seed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleContinue = () => {
    navigate('/validar-seed');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral font-nunito text-dark px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-primary mb-2">{t('showSeed.title')}</h1>
          <p className="text-base">{t('showSeed.description')}</p>
        </header>

        <div className="border-2 border-primary rounded-lg p-4 text-center mb-4 whitespace-pre-wrap break-words bg-gray-50">
          {seed}
        </div>

        <button
          onClick={handleCopy}
          className="w-full bg-accent text-dark py-3 rounded-lg font-bold text-base hover:bg-yellow-500 transition mb-3"
        >
          {copied ? t('showSeed.copied') : t('showSeed.copy')}
        </button>

        <p className="text-sm text-center text-red-600 font-semibold mb-4">{t('showSeed.warning')}</p>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="w-1/2 bg-gray-300 text-dark py-3 rounded-lg font-bold text-base hover:bg-gray-400 transition"
          >
            {t('common.cancel')}
          </button>

          <button
            onClick={handleContinue}
            className="w-1/2 bg-primary text-white py-3 rounded-lg font-bold text-base hover:bg-red-800 transition"
          >
            {t('common.continue')} ➡️
          </button>
        </div>
      </div>
    </div>
  );
}

