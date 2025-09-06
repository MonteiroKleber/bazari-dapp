// src/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// importe os bundles reais do projeto:
import pt from '../locales/pt-BR/common.json'
import en from '../locales/en-US/common.json'
import es from '../locales/es-ES/common.json'

// util p/ normalizar 'pt-BR' -> 'pt'
const normalize = (lng?: string) => {
  if (!lng) return 'en'
  const map: Record<string, string> = { 'pt-BR': 'pt', 'en-US': 'en', 'es-ES': 'es' }
  if (map[lng]) return map[lng]
  const idx = lng.indexOf('-')
  return idx > 0 ? lng.slice(0, idx) : lng
}

// tenta recuperar preferência salva
const saved = typeof window !== 'undefined' ? localStorage.getItem('bazari_language') : null
const initialLng = normalize(saved || (typeof navigator !== 'undefined' ? navigator.language : 'en'))

void i18n
  .use(initReactI18next)
  .init({
    lng: initialLng,
    fallbackLng: 'en',
    supportedLngs: ['pt', 'en', 'es'],
    load: 'languageOnly',         // <— casa com os bundles pt/en/es
    ns: ['common'],
    defaultNS: 'common',
    resources: {
      pt,
      en,
      es,
      // OBS: teus JSONs já incluem "hero", "features", "nav", etc. na raiz do namespace.
      // Ex.: t('hero.title') funciona pois está no mesmo objeto/namespace.
    },
    interpolation: { escapeValue: false },
    // evita tentar detectar sozinho e trocar antes da hora
    detection: undefined,
    debug: false,
    returnNull: false,
  })

export default i18n
