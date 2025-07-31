import React from 'react';
import i18n from '../i18n';

export default function LanguageSelector() {
  const changeToDeviceLanguage = () => {
    const browserLang = navigator.language.split('-')[0]; // "pt-BR" → "pt"
    const supportedLangs = ['pt', 'en', 'es'];
    const finalLang = supportedLangs.includes(browserLang) ? browserLang : 'pt';
    i18n.changeLanguage(finalLang);
  };

  return (
    <div className="absolute top-4 right-4 flex gap-2 flex-wrap justify-end">
      <button
        onClick={() => i18n.changeLanguage('pt')}
        className="text-sm font-bold px-3 py-1 rounded border border-primary text-primary hover:bg-primary hover:text-white transition"
      >
        PT
      </button>
      <button
        onClick={() => i18n.changeLanguage('en')}
        className="text-sm font-bold px-3 py-1 rounded border border-primary text-primary hover:bg-primary hover:text-white transition"
      >
        EN
      </button>
      <button
        onClick={() => i18n.changeLanguage('es')}
        className="text-sm font-bold px-3 py-1 rounded border border-primary text-primary hover:bg-primary hover:text-white transition"
      >
        ES
      </button>
      <button
        onClick={changeToDeviceLanguage}
        className="text-sm font-bold px-3 py-1 rounded border border-gray-500 text-gray-700 hover:bg-gray-800 hover:text-white transition"
      >
        🌐 Auto
      </button>
    </div>
  );
}

