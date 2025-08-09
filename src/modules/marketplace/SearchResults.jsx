import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Filter, Grid, List, ArrowLeft, SlidersHorizontal,
  Star, MapPin, Eye, Package, Store, Shield, Heart, ShoppingCart,
  TrendingUp, Clock, Tag, Users, Zap, X, ChevronDown, AlertCircle
} from 'lucide-react'
import { Button, Card, Badge, Input, Loading, Avatar } from '@components/BaseComponents'
import { useMarketplace, useFavorites, useCart } from './useMarketplaceStore'
import { useTranslation } from '@i18n/useTranslation'
import FiltersComponent from './FiltersComponent'

// ===============================
// SEARCH RESULTS COMPONENT
// ===============================
const SearchResults = () => {
  const { t } = useTranslation()
  const {
    businesses,
    products,
    searchQuery,
    isLoading,
    filters,
    sortBy,
    navigateTo,
    applyFilters,
    clearFilters,
    setSortBy,
    search
  } = useMarketplace()

  const [viewMode, setViewMode] = React.useState('grid') // grid, list
  const [activeTab, setActiveTab] = React.useState('all') // all, products, businesses
  const [showFilters, setShowFilters] = React.useState(false)
  const [showSortMenu, setShowSortMenu] = React.useState(false)

  // Filtrar resultados por aba ativa
  const filteredResults = React.useMemo(() => {
    switch (activeTab) {
      case 'products':
        return { businesses: [], products }
      case 'businesses':
        return { businesses, products: [] }
      default:
        return { businesses, products }
    }
  }, [activeTab, businesses, products])

  const totalResults = filteredResults.businesses.length + filteredResults.products.length
  const hasActiveFilters = Object.values(filters || {}).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : 
    typeof filter === 'object' ? Object.values(filter).some(v => v !== 0 && v !== '') :
    filter !== '' && filter !== 'all' && filter !== 0
  )

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="min-h-screen bg-bazari-light">
      {/* Header */}
      <SearchHeader
        searchQuery={searchQuery}
        totalResults={totalResults}
        onBack={() => navigateTo('home')}
        onSearch={search}
      />

      {/* Controls */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <SearchControls
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showSortMenu={showSortMenu}
          setShowSortMenu={setShowSortMenu}
          hasActiveFilters={hasActiveFilters}
          onShowFilters={() => setShowFilters(true)}
          onClearFilters={clearFilters}
          businessesCount={businesses.length}
          productsCount={products.length}
          totalResults={totalResults}
        />

        {/* Results */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {totalResults === 0 ? (
              <EmptyResultsState searchQuery={searchQuery} />
            ) : (
              <SearchResultsList
                results={filteredResults}
                viewMode={viewMode}
                activeTab={activeTab}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Filters Modal */}
      <FiltersComponent
        show={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={applyFilters}
        currentFilters={filters}
      />
    </div>
  )
}

// ===============================
// SEARCH HEADER
// ===============================
const SearchHeader = ({ searchQuery, totalResults, onBack, onSearch }) => {
  const [localQuery, setLocalQuery] = React.useState(searchQuery)

  const handleSearch = (e) => {
    e.preventDefault()
    if (localQuery.trim()) {
      onSearch(localQuery.trim())
    }
  }

  return (
    <header className="bg-white border-b border-bazari-primary/10 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={18} className="mr-1" />
            Voltar
          </Button>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bazari-dark/40" />
              <Input
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Buscar produtos, serviços, negócios..."
                className="pl-10 pr-4"
              />
            </div>
          </form>

          {/* Results Count */}
          <div className="hidden md:flex items-center text-sm text-bazari-dark/60">
            <span className="font-medium text-bazari-dark">{totalResults}</span>
            <span className="ml-1">
              {totalResults === 1 ? 'resultado' : 'resultados'} 
              {searchQuery && ` para "${searchQuery}"`}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

// ===============================
// SEARCH CONTROLS
// ===============================
const SearchControls = ({
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  showSortMenu,
  setShowSortMenu,
  hasActiveFilters,
  onShowFilters,
  onClearFilters,
  businessesCount,
  productsCount,
  totalResults
}) => {
  const sortOptions = [
    { value: 'relevance', label: 'Relevância' },
    { value: 'price_low', label: 'Menor preço' },
    { value: 'price_high', label: 'Maior preço' },
    { value: 'rating', label: 'Melhor avaliação' },
    { value: 'popular', label: 'Mais popular' },
    { value: 'newest', label: 'Mais recente' }
  ]

  const tabs = [
    { id: 'all', label: `Todos (${totalResults})`, count: totalResults },
    { id: 'products', label: `Produtos (${productsCount})`, count: productsCount },
    { id: 'businesses', label: `Negócios (${businessesCount})`, count: businessesCount }
  ]

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-bazari-primary/10">
      {/* Top Row - Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-1 bg-bazari-light rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'bg-white text-bazari-primary shadow-sm'
                  : 'text-bazari-dark/60 hover:text-bazari-dark'
                }
              `}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile Results Count */}
        <div className="md:hidden text-sm text-bazari-dark/60">
          {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}
        </div>
      </div>

      {/* Bottom Row - Controls */}
      <div className="flex items-center justify-between">
        {/* Left - Filters */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onShowFilters}
            className={hasActiveFilters ? 'border-bazari-primary text-bazari-primary' : ''}
          >
            <SlidersHorizontal size={16} className="mr-1" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="primary" size="sm" className="ml-2">
                Ativos
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X size={14} className="mr-1" />
              Limpar
            </Button>
          )}
        </div>

        {/* Right - View & Sort */}
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="hidden md:flex bg-bazari-light rounded-lg p-1">
            <button
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-bazari-primary shadow-sm'
                  : 'text-bazari-dark/60 hover:text-bazari-dark'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </button>
            <button
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-bazari-primary shadow-sm'
                  : 'text-bazari-dark/60 hover:text-bazari-dark'
              }`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              <span className="hidden sm:inline mr-2">Ordenar:</span>
              {sortOptions.find(option => option.value === sortBy)?.label}
              <ChevronDown size={14} className="ml-1" />
            </Button>

            {showSortMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-bazari-primary/10 z-50">
                <div className="py-2">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      className={`
                        w-full px-4 py-2 text-left text-sm hover:bg-bazari-light transition-colors
                        ${sortBy === option.value 
                          ? 'text-bazari-primary bg-bazari-light' 
                          : 'text-bazari-dark'
                        }
                      `}
                      onClick={() => {
                        setSortBy(option.value)
                        setShowSortMenu(false)
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ===============================
// SEARCH RESULTS LIST
// ===============================
const SearchResultsList = ({ results, viewMode, activeTab }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Businesses Section */}
      {results.businesses.length > 0 && (
        <ResultsSection
          title="Negócios"
          count={results.businesses.length}
          icon={Store}
        >
          <div className={`
            grid gap-6
            ${viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
            }
          `}>
            {results.businesses.map(business => (
              <BusinessResultCard
                key={business.id}
                business={business}
                viewMode={viewMode}
              />
            ))}
          </div>
        </ResultsSection>
      )}

      {/* Products Section */}
      {results.products.length > 0 && (
        <ResultsSection
          title="Produtos"
          count={results.products.length}
          icon={Package}
        >
          <div className={`
            grid gap-6
            ${viewMode === 'grid'
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              : 'grid-cols-1'
            }
          `}>
            {results.products.map(product => (
              <ProductResultCard
                key={product.id}
                product={product}
                viewMode={viewMode}
              />
            ))}
          </div>
        </ResultsSection>
      )}
    </motion.div>
  )
}

// ===============================
// RESULTS SECTION
// ===============================
const ResultsSection = ({ title, count, icon: Icon, children }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Icon className="w-6 h-6 text-bazari-primary" />
        <h2 className="text-xl font-bold text-bazari-dark">
          {title}
        </h2>
        <Badge variant="outline" size="sm">
          {count}
        </Badge>
      </div>
      {children}
    </div>
  )
}

// ===============================
// BUSINESS RESULT CARD
// ===============================
const BusinessResultCard = ({ business, viewMode }) => {
  const { toggleFavorite, isFavorite } = useFavorites()
  const { navigateTo } = useMarketplace()
  const isBusinessFavorite = isFavorite(business.id, 'business')

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    toggleFavorite(business.id, 'business')
  }

  const handleClick = () => {
    navigateTo('business', { selectedBusiness: business })
  }

  if (viewMode === 'list') {
    return (
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleClick}>
        <div className="flex space-x-6">
          {/* Image */}
          <div className="w-24 h-24 bg-bazari-light rounded-xl overflow-hidden flex-shrink-0">
            <img
              src={business.images?.[0] || `https://picsum.photos/100/100?random=${business.id}`}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-bold text-bazari-dark text-lg line-clamp-1">
                    {business.name}
                  </h3>
                  {business.verified && (
                    <Badge variant="success" size="sm">
                      <Shield size={10} className="mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-bazari-dark/60 mb-2">
                  <MapPin size={14} className="mr-1" />
                  {business.location}
                </div>
                
                <p className="text-bazari-dark/70 line-clamp-2 mb-3">
                  {business.description}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteClick}
                className={isBusinessFavorite ? 'text-red-500' : 'text-bazari-dark/40'}
              >
                <Heart 
                  size={18} 
                  fill={isBusinessFavorite ? 'currentColor' : 'none'}
                />
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-bazari-dark/60">
                <div className="flex items-center">
                  <Star size={14} className="mr-1 text-yellow-500" />
                  {business.stats?.rating?.toFixed(1) || '0.0'}
                </div>
                <div className="flex items-center">
                  <Eye size={14} className="mr-1" />
                  {business.stats?.views || 0}
                </div>
                <div className="flex items-center">
                  <Package size={14} className="mr-1" />
                  {business.stats?.sales || 0} vendas
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Badge variant="primary" size="sm">
                  {business.token?.price?.toFixed(3)} BZR
                </Badge>
                <span className={`text-sm ${
                  business.token?.change24h > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {business.token?.change24h > 0 ? '+' : ''}{business.token?.change24h?.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Grid view
  return (
    <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
      <Card className="overflow-hidden cursor-pointer group h-full" onClick={handleClick}>
        {/* Image */}
        <div className="relative h-48">
          <img
            src={business.images?.[0] || `https://picsum.photos/400/300?random=${business.id}`}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {business.verified && (
            <Badge variant="success" className="absolute top-3 left-3 text-xs">
              <Shield size={12} className="mr-1" />
              Verificado
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-3 right-3 ${isBusinessFavorite ? 'text-red-500' : 'text-white'} hover:scale-110`}
            onClick={handleFavoriteClick}
          >
            <Heart 
              size={16} 
              fill={isBusinessFavorite ? 'currentColor' : 'none'}
            />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-bazari-dark group-hover:text-bazari-primary transition-colors line-clamp-1">
              {business.name}
            </h3>
            <Badge variant="primary" size="sm">
              {business.token?.price?.toFixed(3)} BZR
            </Badge>
          </div>
          
          <div className="flex items-center text-sm text-bazari-dark/60 mb-2">
            <MapPin size={14} className="mr-1" />
            {business.location}
          </div>
          
          <p className="text-sm text-bazari-dark/70 mb-4 line-clamp-2">
            {business.description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-bazari-dark/60">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Star size={12} className="mr-1 text-yellow-500" />
                {business.stats?.rating?.toFixed(1) || '0.0'}
              </span>
              <span className="flex items-center">
                <Eye size={12} className="mr-1" />
                {business.stats?.views || 0}
              </span>
            </div>
            <span className={`flex items-center text-xs ${
              business.token?.change24h > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp size={12} className="mr-1" />
              {business.token?.change24h > 0 ? '+' : ''}{business.token?.change24h?.toFixed(1)}%
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ===============================
// PRODUCT RESULT CARD
// ===============================
const ProductResultCard = ({ product, viewMode }) => {
  const { addToCart } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { navigateTo } = useMarketplace()
  const isProductFavorite = isFavorite(product.id, 'product')

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(product.id, 1)
  }

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    toggleFavorite(product.id, 'product')
  }

  const handleClick = () => {
    navigateTo('product', { selectedProduct: product })
  }

  if (viewMode === 'list') {
    return (
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleClick}>
        <div className="flex space-x-6">
          {/* Image */}
          <div className="w-24 h-24 bg-bazari-light rounded-xl overflow-hidden flex-shrink-0">
            <img
              src={product.images?.[0] || `https://picsum.photos/100/100?random=${product.id}`}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-bazari-dark text-lg mb-2 line-clamp-1">
                  {product.name}
                </h3>
                
                <p className="text-bazari-dark/70 line-clamp-2 mb-3">
                  {product.description}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-bazari-dark/60">
                  <div className="flex items-center">
                    <Star size={14} className="mr-1 text-yellow-500" />
                    {product.stats?.rating?.toFixed(1) || '0.0'}
                  </div>
                  <div className="flex items-center">
                    <Eye size={14} className="mr-1" />
                    {product.stats?.views || 0}
                  </div>
                  <div className="flex items-center">
                    <Package size={14} className="mr-1" />
                    {product.stats?.sales || 0} vendas
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteClick}
                className={isProductFavorite ? 'text-red-500' : 'text-bazari-dark/40'}
              >
                <Heart 
                  size={18} 
                  fill={isProductFavorite ? 'currentColor' : 'none'}
                />
              </Button>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-bazari-primary">
                {product.price?.toFixed(2)} BZR
              </div>
              
              <Button onClick={handleAddToCart} size="sm">
                <ShoppingCart size={14} className="mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Grid view
  return (
    <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
      <Card className="overflow-hidden cursor-pointer group h-full" onClick={handleClick}>
        {/* Image */}
        <div className="relative h-40">
          <img
            src={product.images?.[0] || `https://picsum.photos/300/300?random=${product.id}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-2 right-2 ${isProductFavorite ? 'text-red-500' : 'text-white'} hover:scale-110`}
            onClick={handleFavoriteClick}
          >
            <Heart 
              size={14} 
              fill={isProductFavorite ? 'currentColor' : 'none'}
            />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-bazari-dark group-hover:text-bazari-primary transition-colors mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <p className="text-sm text-bazari-dark/70 mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-bold text-bazari-primary">
              {product.price?.toFixed(2)} BZR
            </div>
            
            <div className="flex items-center text-sm text-bazari-dark/60">
              <Star size={12} className="mr-1 text-yellow-500" />
              {product.stats?.rating?.toFixed(1) || '0.0'}
            </div>
          </div>
          
          <Button
            onClick={handleAddToCart}
            className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
            size="sm"
          >
            <ShoppingCart size={14} className="mr-1" />
            Adicionar
          </Button>

          {/* Stats */}
          <div className="flex items-center justify-between mt-3 text-xs text-bazari-dark/60">
            <span>{product.stats?.sales || 0} vendas</span>
            <span>{product.stats?.views || 0} views</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ===============================
// EMPTY RESULTS STATE
// ===============================
const EmptyResultsState = ({ searchQuery }) => {
  const { navigateTo, search } = useMarketplace()
  
  const suggestions = [
    'celulares',
    'roupas',
    'comida',
    'eletrônicos',
    'beleza'
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 bg-bazari-light rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-12 h-12 text-bazari-dark/40" />
      </div>
      
      <h2 className="text-2xl font-bold text-bazari-dark mb-4">
        Nenhum resultado encontrado
      </h2>
      
      <p className="text-bazari-dark/60 mb-8 max-w-md mx-auto">
        Não encontramos nada para "{searchQuery}". 
        Tente ajustar sua busca ou explore nossas categorias.
      </p>

      {/* Suggestions */}
      <div className="mb-8">
        <p className="text-sm text-bazari-dark/60 mb-4">
          Que tal tentar uma dessas buscas populares?
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {suggestions.map(suggestion => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => search(suggestion)}
            >
              <Search size={14} className="mr-1" />
              {suggestion}
            </Button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button onClick={() => navigateTo('categories')} size="lg">
          <Tag size={18} className="mr-2" />
          Explorar Categorias
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => navigateTo('home')} 
          size="lg"
        >
          <ArrowLeft size={18} className="mr-2" />
          Voltar ao Início
        </Button>
      </div>
    </motion.div>
  )
}

// ===============================
// LOADING STATE
// ===============================
const LoadingState = () => (
  <div className="min-h-screen bg-bazari-light flex items-center justify-center">
    <div className="text-center">
      <Loading size="lg" />
      <p className="mt-4 text-bazari-dark/60">Buscando resultados...</p>
    </div>
  </div>
)

export default SearchResults