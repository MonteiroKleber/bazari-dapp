// apps/web/src/lib/i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translations - ajustar os caminhos conforme necessário
import ptBR from '../locales/pt-BR/common.json'
import enUS from '../locales/en-US/common.json'
import esES from '../locales/es-ES/common.json'

// Configurar recursos com namespace correto
const resources = {
  'pt-BR': {
    translation: ptBR
  },
  'en-US': {
    translation: enUS
  },
  'es-ES': {
    translation: esES
  }
}

// Inicializar i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    supportedLngs: ['pt-BR', 'en-US', 'es-ES'],
    
    // Desabilitar keySeparator para permitir chaves com pontos
    keySeparator: '.',
    
    // Namespace padrão
    ns: ['translation'],
    defaultNS: 'translation',
    
    debug: true, // Ativar temporariamente para debug
    
    interpolation: {
      escapeValue: false // React já faz escape
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'bazari_language',
    },
    
    // Retornar a chave se não encontrar tradução
    returnNull: false,
    returnEmptyString: false,
    
    // Load language as is (não cortar sufixo regional)
    load: 'currentOnly',
  })

export default i18n