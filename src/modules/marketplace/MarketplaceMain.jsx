// src/modules/marketplace/MarketplaceMain.jsx - COMPONENTE ADICIONAL

import React from 'react'
import { motion } from 'framer-motion'
import { Store, TrendingUp, Package, Star } from 'lucide-react'
import { Card, Badge } from '@components/BaseComponents'

// ===============================
// MARKETPLACE MAIN - COMPONENTIZADO  
// ===============================
const MarketplaceMain = ({ businesses = [] }) => {
  const safeBusinesses = Array.isArray(businesses) ? businesses : []

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <MarketplaceStats businesses={safeBusinesses} />
      
      {/* Featured Businesses */}
      <FeaturedBusinesses businesses={safeBusinesses.slice(0, 3)} />
      
      {/* Popular Categories */}
      <PopularCategories businesses={safeBusinesses} />
    </div>
  )
}

// ===============================
// MARKETPLACE STATS
// ===============================
const MarketplaceStats = ({ businesses }) => {
  const stats = {
    totalBusinesses: businesses.length,
    totalCategories: [...new Set(businesses.flatMap(b => b.categories || []))].length,
    averageRating: businesses.reduce((acc, b) => acc + (b.stats?.rating || 0), 0) / businesses.length || 0,
    totalTokenValue: businesses.reduce((acc, b) => acc + (b.token?.marketCap || 0), 0)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <StatCard
        icon={<Store className="w-6 h-6 text-bazari-primary" />}
        title="Negócios Ativos"
        value={stats.totalBusinesses}
        subtitle="Tokenizados"
      />
      <StatCard
        icon={<Package className="w-6 h-6 text-bazari-secondary" />}
        title="Categorias"
        value={stats.totalCategories}
        subtitle="Disponíveis"
      />
      <StatCard
        icon={<Star className="w-6 h-6 text-yellow-500" />}
        title="Avaliação Média"
        value={stats.averageRating.toFixed(1)}
        subtitle="De 5 estrelas"
      />
      <StatCard
        icon={<TrendingUp className="w-6 h-6 text-green-500" />}
        title="Valor Total"
        value={`${stats.totalTokenValue.toFixed(2)} BZR`}
        subtitle="Market Cap"
      />
    </div>
  )
}

const StatCard = ({ icon, title, value, subtitle }) => (
  <Card className="p-4 text-center">
    <div className="flex justify-center mb-3">{icon}</div>
    <div className="text-2xl font-bold text-bazari-dark mb-1">{value}</div>
    <div className="text-sm text-bazari-dark/60 mb-1">{title}</div>
    <div className="text-xs text-bazari-dark/40">{subtitle}</div>
  </Card>
)

// ===============================
// FEATURED BUSINESSES
// ===============================
const FeaturedBusinesses = ({ businesses }) => {
  if (businesses.length === 0) return null

  return (
    <div className="bg-white rounded-xl p-6 shadow-bazari">
      <h2 className="text-xl font-bold text-bazari-dark mb-4">
        Negócios em Destaque
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {businesses.map((business, index) => (
          <FeaturedBusinessCard key={business.id || index} business={business} />
        ))}
      </div>
    </div>
  )
}

const FeaturedBusinessCard = ({ business }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
  >
    <div className="flex items-center space-x-3 mb-3">
      <div className="w-12 h-12 bg-bazari-light rounded-lg flex items-center justify-center">
        <Store className="w-6 h-6 text-bazari-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-bazari-dark">{business.name}</h3>
        <p className="text-sm text-bazari-dark/60">{business.location}</p>
      </div>
    </div>
    
    {business.categories && (
      <div className="flex flex-wrap gap-1 mb-3">
        {business.categories.slice(0, 2).map((cat, idx) => (
          <Badge key={idx} variant="secondary" size="sm">{cat}</Badge>
        ))}
      </div>
    )}
    
    <div className="flex justify-between items-center text-sm">
      <span className="text-bazari-dark/60">Token Price</span>
      <span className="font-semibold text-bazari-primary">
        {business.token?.price?.toFixed(4) || '0.0100'} BZR
      </span>
    </div>
  </motion.div>
)

// ===============================
// POPULAR CATEGORIES
// ===============================
const PopularCategories = ({ businesses }) => {
  const categoryStats = businesses.reduce((acc, business) => {
    business.categories?.forEach(category => {
      acc[category] = (acc[category] || 0) + 1
    })
    return acc
  }, {})

  const topCategories = Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)

  if (topCategories.length === 0) return null

  return (
    <div className="bg-white rounded-xl p-6 shadow-bazari">
      <h2 className="text-xl font-bold text-bazari-dark mb-4">
        Categorias Populares
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {topCategories.map(([category, count]) => (
          <motion.div
            key={category}
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between p-3 bg-bazari-light rounded-lg hover:bg-bazari-primary/10 transition-colors cursor-pointer"
          >
            <span className="font-medium text-bazari-dark">{category}</span>
            <Badge variant="primary" size="sm">{count}</Badge>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default MarketplaceMain

// ===============================
// CATEGORIES NAVIGATION - ARQUIVO SEPARADO
// ===============================
// src/modules/marketplace/CategoriesNavigation.jsx

export const CategoriesNavigation = ({ businesses = [], selectedCategory, onSelectCategory }) => {
  // Implementação já fornecida no módulo principal
  return null // Placeholder - usar implementação do index.jsx
}