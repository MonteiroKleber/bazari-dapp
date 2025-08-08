import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import translations from './translations.json'

// Store para gerenciar idioma
const useLanguageStore = create(
  persist(
    (set) => ({
      language: 'pt', // Idioma padrão: português
      setLanguage: (language) => set({ language }),
      availableLanguages: ['pt', 'en', 'es']
    }),
    {
      name: 'bazari-language'
    }
  )
)

// Hook principal de tradução
export const useTranslation = () => {
  const { language, setLanguage, availableLanguages } = useLanguageStore()

  // Função para buscar tradução aninhada
  const getNestedTranslation = (obj, path, targetLanguage) => {
    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current[key]) {
        current = current[key]
      } else {
        return null
      }
    }

    // Se chegou no objeto final, busca o idioma
    if (current && typeof current === 'object' && current[targetLanguage]) {
      return current[targetLanguage]
    }

    return null
  }

  // Função principal de tradução
  const t = (key, fallback = key) => {
    try {
      const translation = getNestedTranslation(translations, key, language)
      
      if (translation) {
        return translation
      }

      // Fallback para inglês se não encontrar no idioma atual
      if (language !== 'en') {
        const englishTranslation = getNestedTranslation(translations, key, 'en')
        if (englishTranslation) {
          return englishTranslation
        }
      }

      // Fallback para português se não encontrar em inglês
      if (language !== 'pt') {
        const portugueseTranslation = getNestedTranslation(translations, key, 'pt')
        if (portugueseTranslation) {
          return portugueseTranslation
        }
      }

      // Se não encontrou nada, retorna o fallback ou a própria chave
      return fallback
    } catch (error) {
      console.warn(`Translation error for key: ${key}`, error)
      return fallback
    }
  }

  // Função para traduzir com interpolação (para futuro uso)
  const tInterpolate = (key, variables = {}, fallback = key) => {
    let text = t(key, fallback)
    
    // Substituir variáveis do tipo {{variable}}
    Object.keys(variables).forEach(variable => {
      const regex = new RegExp(`{{${variable}}}`, 'g')
      text = text.replace(regex, variables[variable])
    })

    return text
  }

  return {
    t,
    tInterpolate,
    language,
    setLanguage,
    availableLanguages,
    isRTL: false // Futuro suporte para idiomas RTL
  }
}

// Hook para componentes que só precisam do idioma atual
export const useLanguage = () => {
  const { language, setLanguage, availableLanguages } = useLanguageStore()
  return { language, setLanguage, availableLanguages }
}

// Função utilitária para formatar moeda baseada no idioma
export const formatCurrency = (value, language = 'pt') => {
  const formatters = {
    pt: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }),
    en: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }),
    es: new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    })
  }

  return formatters[language]?.format(value) || `${value} BZR`
}

// Função utilitária para formatar números
export const formatNumber = (value, language = 'pt') => {
  const formatters = {
    pt: new Intl.NumberFormat('pt-BR'),
    en: new Intl.NumberFormat('en-US'),
    es: new Intl.NumberFormat('es-ES')
  }

  return formatters[language]?.format(value) || value.toString()
}