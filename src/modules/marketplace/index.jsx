// src/modules/marketplace/index.jsx - MÓDULO MARKETPLACE CORRIGIDO

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Store, Search, Filter, Grid, 
  MapPin, Star, Eye, Users, TrendingUp,
  ShoppingBag, Package, Plus
} from 'lucide-react'
import { Button, Card, Badge, Input, Alert, Loading } from '@components/BaseComponents'
import { useBusinesses } from '@modules/perfil/useProfileStore'
import { useAuth } from '@modules/acesso/useAuthStore'

// ===============================
// MARKETPLACE MODULE PRINCIPAL
// ===============================
const MarketplaceModule = () => {
  const { user } = useAuth()
  const { 
    businesses = [], 
    isLoading, 
    error 
  } = useBusinesses()

  // Estado para busca e filtros
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState(null)

  // Log para debug
  React.useEffect(() => {
    console.log('🛒 MarketplaceModule carregado')
    console.log('📊 Businesses encontrados:', businesses?.length || 0)
  }, [businesses])

  // Garantir que businesses seja sempre array
  const safeBusinesses = Array.isArray(businesses) ? businesses : []

  // Filtrar negócios
  const filteredBusinesses = safeBusinesses.filter(business => {
    const matchesSearch = !searchTerm || 
      business.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || 
      business.categories?.includes(selectedCategory)
    
    return matchesSearch && matchesCategory
  })

  if (error) {
    return (
      <Alert variant="error" className="max-w-md mx-auto">
        <p className="font-medium">Erro no Marketplace</p>
        <p className="text-sm mt-1">{error}</p>
      </Alert>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <MarketplaceHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        businessCount={safeBusinesses.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de Categorias */}
        <div className="lg:col-span-1">
          <CategoriesNavigation 
            businesses={safeBusinesses}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Conteúdo Principal */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <LoadingBusinesses />
          ) : (
            <BusinessGrid businesses={filteredBusinesses} searchTerm={searchTerm} />
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ===============================
// HEADER DO MARKETPLACE
// ===============================
const MarketplaceHeader = ({ searchTerm, setSearchTerm, businessCount }) => (
  <div className="bg-white rounded-xl p-6 shadow-bazari">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-2xl font-bold text-bazari-dark flex items-center">
          <Store className="w-6 h-6 text-bazari-primary mr-2" />
          Marketplace
        </h1>
        <p className="text-bazari-dark/70">
          Descubra negócios tokenizados da comunidade
        </p>
      </div>
      
      <Badge variant="primary" size="lg">
        {businessCount} Negócios
      </Badge>
    </div>

    {/* Barra de Busca */}
    <div className="flex space-x-3">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-bazari-dark/40" />
        <Input
          placeholder="Buscar negócios, produtos ou serviços..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Button variant="outline" className="flex items-center">
        <Filter className="w-4 h-4 mr-2" />
        Filtros
      </Button>
    </div>
  </div>
)

// ===============================
// NAVEGAÇÃO DE CATEGORIAS
// ===============================
const CategoriesNavigation = ({ businesses, selectedCategory, onSelectCategory }) => {
  // Extrair categorias únicas
  const getUniqueCategories = () => {
    if (!businesses || businesses.length === 0) return []
    
    const categories = businesses
      .flatMap(business => business.categories || [])
      .filter(Boolean)
    
    return [...new Set(categories)]
  }

  const categories = getUniqueCategories()
  
  // Categorias padrão se não houver negócios
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
        {/* Opção "Todas" */}
        <motion.button
          whileHover={{ x: 4 }}
          onClick={() => onSelectCategory(null)}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left
            ${selectedCategory === null 
              ? 'bg-bazari-primary text-white' 
              : 'bg-gray-50 hover:bg-bazari-light'
            }`}
        >
          <div className="flex items-center">
            <Store className="w-4 h-4 mr-3" />
            <span className="font-medium">Todas</span>
          </div>
          <span className="text-sm opacity-75">
            {businesses?.length || 0}
          </span>
        </motion.button>

        {/* Categorias */}
        {displayCategories.map((category, index) => {
          const count = businesses?.filter(business => 
            business.categories?.includes(category)
          ).length || 0

          return (
            <motion.button
              key={index}
              whileHover={{ x: 4 }}
              onClick={() => onSelectCategory(category)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left
                ${selectedCategory === category 
                  ? 'bg-bazari-primary text-white' 
                  : 'bg-gray-50 hover:bg-bazari-light'
                }`}
            >
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-3" />
                <span className="font-medium">{category}</span>
              </div>
              <span className="text-sm opacity-75">
                {count}
              </span>
            </motion.button>
          )
        })}
      </div>

      {businesses?.length === 0 && (
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
// GRID DE NEGÓCIOS
// ===============================
const BusinessGrid = ({ businesses, searchTerm }) => {
  if (businesses.length === 0) {
    return <EmptyState searchTerm={searchTerm} />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {businesses.map((business, index) => (
        <BusinessCard key={business.id || index} business={business} />
      ))}
    </div>
  )
}

// ===============================
// CARD DE NEGÓCIO
// ===============================
const BusinessCard = ({ business }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    className="group"
  >
    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Imagem */}
      {business.image ? (
        <div className="h-40 overflow-hidden">
          <img 
            src={business.image} 
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="h-40 bg-gradient-to-br from-bazari-light to-bazari-primary/20 flex items-center justify-center">
          <Store className="w-12 h-12 text-bazari-primary" />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-bazari-dark line-clamp-1">
              {business.name || 'Negócio sem nome'}
            </h3>
            {business.location && (
              <div className="flex items-center text-sm text-bazari-dark/60 mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {business.location}
              </div>
            )}
          </div>
          
          {business.stats?.rating > 0 && (
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">
                {business.stats.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Descrição */}
        {business.description && (
          <p className="text-sm text-bazari-dark/70 line-clamp-2 mb-3">
            {business.description}
          </p>
        )}

        {/* Categorias */}
        {business.categories?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {business.categories.slice(0, 2).map((category, idx) => (
              <Badge key={idx} variant="secondary" size="sm">
                {category}
              </Badge>
            ))}
            {business.categories.length > 2 && (
              <Badge variant="outline" size="sm">
                +{business.categories.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center text-xs text-bazari-dark/60">
              <Eye className="w-3 h-3 mr-1" />
              {business.stats?.views || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-xs text-bazari-dark/60">
              <Users className="w-3 h-3 mr-1" />
              {business.stats?.followers || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-xs text-bazari-dark/60">
              <TrendingUp className="w-3 h-3 mr-1" />
              {business.token?.price?.toFixed(4) || '0.0100'} BZR
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full" size="sm">
          <Package className="w-4 h-4 mr-2" />
          Ver Negócio
        </Button>
      </div>
    </Card>
  </motion.div>
)

// ===============================
// ESTADO VAZIO
// ===============================
const EmptyState = ({ searchTerm }) => (
  <div className="col-span-full text-center py-12">
    <div className="w-24 h-24 bg-bazari-light rounded-full flex items-center justify-center mx-auto mb-4">
      <ShoppingBag className="w-12 h-12 text-bazari-primary" />
    </div>
    
    <h3 className="text-xl font-semibold text-bazari-dark mb-2">
      {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum negócio disponível'}
    </h3>
    
    <p className="text-bazari-dark/70 mb-6 max-w-md mx-auto">
      {searchTerm 
        ? `Não encontramos negócios para "${searchTerm}". Tente outros termos.`
        : 'Ainda não há negócios tokenizados no marketplace. Seja o primeiro!'
      }
    </p>
    
    {!searchTerm && (
      <Button onClick={() => window.location.href = '/perfil?tab=businesses'}>
        <Plus className="w-4 h-4 mr-2" />
        Criar Primeiro Negócio
      </Button>
    )}
  </div>
)

// ===============================
// LOADING STATE
// ===============================
const LoadingBusinesses = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="h-80 animate-pulse">
        <div className="h-40 bg-gray-200"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </Card>
    ))}
  </div>
)

export default MarketplaceModule