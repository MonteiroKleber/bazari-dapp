// src/modules/marketplace/CategoriesNavigation.jsx

import React from 'react'
import { motion } from 'framer-motion'
import { Grid, ChevronRight, Store } from 'lucide-react'

// ===============================
// COMPONENTE CATEGORIES NAVIGATION
// ===============================
const CategoriesNavigation = ({ businesses = [] }) => {
  // Garantir que businesses é sempre um array
  const safeBusinesses = Array.isArray(businesses) ? businesses : []
  
  // Função para extrair categorias únicas dos negócios
  const getUniqueCategories = () => {
    if (safeBusinesses.length === 0) return []
    
    const categories = safeBusinesses
      .flatMap(business => business.categories || [])
      .filter(Boolean) // Remove valores falsy
    
    return [...new Set(categories)] // Remove duplicatas
  }

  const categories = getUniqueCategories()

  // Se não há negócios, mostrar categorias padrão
  const defaultCategories = [
    'Alimentação', 'Serviços', 'Comércio', 
    'Tecnologia', 'Beleza', 'Artesanato'
  ]

  const displayCategories = categories.length > 0 ? categories : defaultCategories

  return (
    <div className="bg-white rounded-xl p-6 shadow-bazari">
      <div className="flex items-center mb-4">
        <Grid className="w-5 h-5 text-bazari-primary mr-2" />
        <h3 className="text-lg font-semibold text-bazari-dark">
          Categorias
        </h3>
      </div>

      <div className="space-y-2">
        {displayCategories.map((category, index) => {
          // Contar negócios por categoria
          const count = safeBusinesses.filter(business => 
            business.categories?.includes(category)
          ).length

          return (
            <motion.button
              key={index}
              whileHover={{ x: 4 }}
              className="w-full flex items-center justify-between p-3 rounded-lg 
                        bg-gray-50 hover:bg-bazari-light transition-colors text-left"
            >
              <div className="flex items-center">
                <Store className="w-4 h-4 text-bazari-primary mr-3" />
                <span className="text-bazari-dark font-medium">
                  {category}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm text-bazari-dark/60 mr-2">
                  {count || 0}
                </span>
                <ChevronRight className="w-4 h-4 text-bazari-dark/40" />
              </div>
            </motion.button>
          )
        })}
      </div>

      {safeBusinesses.length === 0 && (
        <div className="mt-4 p-3 bg-bazari-light rounded-lg">
          <p className="text-sm text-bazari-dark/60 text-center">
            Nenhum negócio encontrado ainda
          </p>
        </div>
      )}
    </div>
  )
}

// ===============================
// EXPORTAÇÃO PRINCIPAL
// ===============================
export default CategoriesNavigation

// Exportação nomeada (para compatibilidade)
export { CategoriesNavigation }