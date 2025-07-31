// src/i18n/i18n.js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Importar traduções
import en from './en.json'
import pt from './pt.json'
import es from './es.json'

i18n
  .use(LanguageDetector) // Detecta idioma do navegador/dispositivo
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      es: { translation: es },
    },
    interpolation: {
      escapeValue: false, // react já faz isso
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'], // salva preferência do usuário
    },
  })

export default i18n

