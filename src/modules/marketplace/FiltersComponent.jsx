import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Filter, X, Search, MapPin, Star, DollarSign, Clock, 
  Package, Store, Shield, TrendingUp, Calendar, Tag,
  ChevronDown, ChevronRight, Check, RefreshCw, Sliders
} from 'lucide-react'
import { Button, Card, Badge, Input, Modal, Loading } from '@components/BaseComponents'
import { useMarketplace, useCategories } from './useMarketplaceStore'
import { useTranslation } from '@i18n/useTranslation'

// ===============================
// FILTERS COMPONENT
// ===============================
const FiltersComponent = ({ show, onClose, onApplyFilters, currentFilters = {} }) => {
  const { t } = useTranslation()
  const { categories } = useCategories()
  
  // Estados dos filtros
  const [filters, setFilters] = React.useState({
    // Categorias
    categories: currentFilters.categories || [],
    
    // Preço
    priceRange: currentFilters.priceRange || { min: 0, max: 1000 },
    
    // Localização
    location: currentFilters.location || '',
    locationRadius: currentFilters.locationRadius || 10,
    
    // Avaliação
    minRating: currentFilters.minRating || 0,
    
    // Tipo de negócio
    businessType: currentFilters.businessType || 'all', // all, verified, new
    
    // Disponibilidade
    availability: currentFilters.availability || 'all', // all, inStock, preOrder
    
    // Ordenação
    sortBy: currentFilters.sortBy || 'relevance',
    
    // Data
    dateRange: currentFilters.dateRange || 'all', // all, today, week, month
    
    // Recursos especiais
    features: currentFilters.features || [], // fastDelivery, warranty, returns
    
    // Faixa de vendas (para negócios)
    salesRange: currentFilters.salesRange || { min: 0, max: 1000 }
  })

  // Estados da UI
  const [expandedSections, setExpandedSections] = React.useState({
    categories: true,
    price: true,
    location: false,
    rating: false,
    business: false,
    availability: false,
    features: false
  })
  
  const [activeTab, setActiveTab] = React.useState('products') // products, businesses
  const [isApplying, setIsApplying] = React.useState(false)

  // Aplicar filtros
  const handleApplyFilters = async () => {
    setIsApplying(true)
    await onApplyFilters(filters)
    setIsApplying(false)
    onClose()
  }

  // Limpar filtros
  const handleClearFilters = () => {
    const defaultFilters = {
      categories: [],
      priceRange: { min: 0, max: 1000 },
      location: '',
      locationRadius: 10,
      minRating: 0,
      businessType: 'all',
      availability: 'all',
      sortBy: 'relevance',
      dateRange: 'all',
      features: [],
      salesRange: { min: 0, max: 1000 }
    }
    setFilters(defaultFilters)
  }

  // Toggle seção
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Contar filtros ativos
  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    if (filters.categories.length > 0) count++
    if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) count++
    if (filters.location) count++
    if (filters.minRating > 0) count++
    if (filters.businessType !== 'all') count++
    if (filters.availability !== 'all') count++
    if (filters.features.length > 0) count++
    if (filters.dateRange !== 'all') count++
    return count
  }, [filters])

  if (!show) return null

  return (
    <Modal size="lg" onClose={onClose}>
      <div className="max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-bazari-primary/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-bazari-primary rounded-xl flex items-center justify-center">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-bazari-dark">
                  Filtros Avançados
                </h2>
                <p className="text-sm text-bazari-dark/60">
                  {activeFiltersCount > 0 
                    ? `${activeFiltersCount} filtros ativos`
                    : 'Nenhum filtro aplicado'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  <RefreshCw size={16} className="mr-1" />
                  Limpar
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={20} />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mt-6 bg-bazari-light rounded-lg p-1">
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'products'
                  ? 'bg-white text-bazari-primary shadow-sm'
                  : 'text-bazari-dark/60 hover:text-bazari-dark'
              }`}
              onClick={() => setActiveTab('products')}
            >
              <Package size={16} className="mr-2 inline" />
              Produtos
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'businesses'
                  ? 'bg-white text-bazari-primary shadow-sm'
                  : 'text-bazari-dark/60 hover:text-bazari-dark'
              }`}
              onClick={() => setActiveTab('businesses')}
            >
              <Store size={16} className="mr-2 inline" />
              Negócios
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'products' ? (
              <ProductFilters
                filters={filters}
                setFilters={setFilters}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                categories={categories}
              />
            ) : (
              <BusinessFilters
                filters={filters}
                setFilters={setFilters}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                categories={categories}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-bazari-primary/10 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-sm text-bazari-dark/60">
              {activeFiltersCount > 0 && (
                <>
                  {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro ativo' : 'filtros ativos'}
                </>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleApplyFilters}
                disabled={isApplying}
                className="min-w-[120px]"
              >
                {isApplying ? (
                  <Loading size="sm" />
                ) : (
                  'Aplicar Filtros'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ===============================
// PRODUCT FILTERS
// ===============================
const ProductFilters = ({ 
  filters, 
  setFilters, 
  expandedSections, 
  toggleSection, 
  categories 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Categorias */}
      <FilterSection
        title="Categorias"
        icon={Tag}
        expanded={expandedSections.categories}
        onToggle={() => toggleSection('categories')}
        count={filters.categories.length}
      >
        <CategoryFilter
          categories={categories}
          selectedCategories={filters.categories}
          onCategoryChange={(categories) => 
            setFilters(prev => ({ ...prev, categories }))
          }
        />
      </FilterSection>

      {/* Preço */}
      <FilterSection
        title="Faixa de Preço"
        icon={DollarSign}
        expanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
        count={filters.priceRange.min > 0 || filters.priceRange.max < 1000 ? 1 : 0}
      >
        <PriceRangeFilter
          priceRange={filters.priceRange}
          onPriceChange={(priceRange) => 
            setFilters(prev => ({ ...prev, priceRange }))
          }
        />
      </FilterSection>

      {/* Localização */}
      <FilterSection
        title="Localização"
        icon={MapPin}
        expanded={expandedSections.location}
        onToggle={() => toggleSection('location')}
        count={filters.location ? 1 : 0}
      >
        <LocationFilter
          location={filters.location}
          radius={filters.locationRadius}
          onLocationChange={(location) => 
            setFilters(prev => ({ ...prev, location }))
          }
          onRadiusChange={(locationRadius) => 
            setFilters(prev => ({ ...prev, locationRadius }))
          }
        />
      </FilterSection>

      {/* Avaliação */}
      <FilterSection
        title="Avaliação Mínima"
        icon={Star}
        expanded={expandedSections.rating}
        onToggle={() => toggleSection('rating')}
        count={filters.minRating > 0 ? 1 : 0}
      >
        <RatingFilter
          minRating={filters.minRating}
          onRatingChange={(minRating) => 
            setFilters(prev => ({ ...prev, minRating }))
          }
        />
      </FilterSection>

      {/* Disponibilidade */}
      <FilterSection
        title="Disponibilidade"
        icon={Package}
        expanded={expandedSections.availability}
        onToggle={() => toggleSection('availability')}
        count={filters.availability !== 'all' ? 1 : 0}
      >
        <AvailabilityFilter
          availability={filters.availability}
          onAvailabilityChange={(availability) => 
            setFilters(prev => ({ ...prev, availability }))
          }
        />
      </FilterSection>

      {/* Recursos Especiais */}
      <FilterSection
        title="Recursos Especiais"
        icon={Shield}
        expanded={expandedSections.features}
        onToggle={() => toggleSection('features')}
        count={filters.features.length}
      >
        <FeaturesFilter
          features={filters.features}
          onFeaturesChange={(features) => 
            setFilters(prev => ({ ...prev, features }))
          }
        />
      </FilterSection>
    </motion.div>
  )
}

// ===============================
// BUSINESS FILTERS
// ===============================
const BusinessFilters = ({ 
  filters, 
  setFilters, 
  expandedSections, 
  toggleSection, 
  categories 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Categorias */}
      <FilterSection
        title="Categorias"
        icon={Tag}
        expanded={expandedSections.categories}
        onToggle={() => toggleSection('categories')}
        count={filters.categories.length}
      >
        <CategoryFilter
          categories={categories}
          selectedCategories={filters.categories}
          onCategoryChange={(categories) => 
            setFilters(prev => ({ ...prev, categories }))
          }
        />
      </FilterSection>

      {/* Localização */}
      <FilterSection
        title="Localização"
        icon={MapPin}
        expanded={expandedSections.location}
        onToggle={() => toggleSection('location')}
        count={filters.location ? 1 : 0}
      >
        <LocationFilter
          location={filters.location}
          radius={filters.locationRadius}
          onLocationChange={(location) => 
            setFilters(prev => ({ ...prev, location }))
          }
          onRadiusChange={(locationRadius) => 
            setFilters(prev => ({ ...prev, locationRadius }))
          }
        />
      </FilterSection>

      {/* Avaliação */}
      <FilterSection
        title="Avaliação Mínima"
        icon={Star}
        expanded={expandedSections.rating}
        onToggle={() => toggleSection('rating')}
        count={filters.minRating > 0 ? 1 : 0}
      >
        <RatingFilter
          minRating={filters.minRating}
          onRatingChange={(minRating) => 
            setFilters(prev => ({ ...prev, minRating }))
          }
        />
      </FilterSection>

      {/* Tipo de Negócio */}
      <FilterSection
        title="Tipo de Negócio"
        icon={Store}
        expanded={expandedSections.business}
        onToggle={() => toggleSection('business')}
        count={filters.businessType !== 'all' ? 1 : 0}
      >
        <BusinessTypeFilter
          businessType={filters.businessType}
          onTypeChange={(businessType) => 
            setFilters(prev => ({ ...prev, businessType }))
          }
        />
      </FilterSection>

      {/* Faixa de Vendas */}
      <FilterSection
        title="Faixa de Vendas"
        icon={TrendingUp}
        expanded={expandedSections.sales}
        onToggle={() => toggleSection('sales')}
        count={filters.salesRange.min > 0 || filters.salesRange.max < 1000 ? 1 : 0}
      >
        <SalesRangeFilter
          salesRange={filters.salesRange}
          onSalesChange={(salesRange) => 
            setFilters(prev => ({ ...prev, salesRange }))
          }
        />
      </FilterSection>
    </motion.div>
  )
}

// ===============================
// FILTER SECTION
// ===============================
const FilterSection = ({ title, icon: Icon, expanded, onToggle, count, children }) => {
  return (
    <div className="border border-bazari-primary/10 rounded-xl overflow-hidden">
      <button
        className="w-full p-4 flex items-center justify-between bg-white hover:bg-bazari-light/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3">
          <Icon size={18} className="text-bazari-primary" />
          <span className="font-medium text-bazari-dark">{title}</span>
          {count > 0 && (
            <Badge variant="primary" size="sm">
              {count}
            </Badge>
          )}
        </div>
        <ChevronDown 
          size={18} 
          className={`text-bazari-dark/60 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-bazari-light/20 border-t border-bazari-primary/10">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ===============================
// CATEGORY FILTER
// ===============================
const CategoryFilter = ({ categories, selectedCategories, onCategoryChange }) => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [expandedCategories, setExpandedCategories] = React.useState({})

  // Filtrar categorias pela busca
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery) return categories
    
    // Implementar busca em categorias
    return categories // Placeholder
  }, [categories, searchQuery])

  const toggleCategory = (categoryId) => {
    const isSelected = selectedCategories.includes(categoryId)
    if (isSelected) {
      onCategoryChange(selectedCategories.filter(id => id !== categoryId))
    } else {
      onCategoryChange([...selectedCategories, categoryId])
    }
  }

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-bazari-dark/40" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar categorias..."
          className="pl-10"
          size="sm"
        />
      </div>

      {/* Categories List */}
      <div className="max-h-60 overflow-y-auto space-y-2">
        {Object.entries(categories.products || {}).map(([categoryId, category]) => (
          <CategoryItem
            key={categoryId}
            categoryId={categoryId}
            category={category}
            level={0}
            expanded={expandedCategories[categoryId]}
            selected={selectedCategories.includes(categoryId)}
            onToggle={() => toggleCategory(categoryId)}
            onToggleExpansion={() => toggleCategoryExpansion(categoryId)}
          />
        ))}
      </div>

      {/* Selected Count */}
      {selectedCategories.length > 0 && (
        <div className="text-sm text-bazari-dark/60">
          {selectedCategories.length} {selectedCategories.length === 1 ? 'categoria selecionada' : 'categorias selecionadas'}
        </div>
      )}
    </div>
  )
}

// ===============================
// CATEGORY ITEM
// ===============================
const CategoryItem = ({ 
  categoryId, 
  category, 
  level, 
  expanded, 
  selected, 
  onToggle, 
  onToggleExpansion 
}) => {
  const hasSubcategories = category.subcategories && Object.keys(category.subcategories).length > 0
  const paddingLeft = level * 16

  return (
    <div>
      <div 
        className="flex items-center space-x-2 py-2 hover:bg-white/50 rounded-lg cursor-pointer"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        {hasSubcategories && (
          <button
            onClick={onToggleExpansion}
            className="p-1 hover:bg-bazari-primary/10 rounded"
          >
            <ChevronRight 
              size={14} 
              className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
            />
          </button>
        )}
        
        <button
          onClick={onToggle}
          className={`
            flex-1 flex items-center space-x-2 text-left p-2 rounded-lg transition-colors
            ${selected ? 'bg-bazari-primary/10 text-bazari-primary' : 'hover:bg-white/50'}
          `}
        >
          <span className="text-lg">{category.icon}</span>
          <span className="text-sm">{category.name?.pt || categoryId}</span>
          {selected && <Check size={14} />}
        </button>
      </div>

      {/* Subcategories */}
      {hasSubcategories && expanded && (
        <div className="ml-4">
          {Object.entries(category.subcategories).map(([subCategoryId, subCategory]) => (
            <CategoryItem
              key={subCategoryId}
              categoryId={`${categoryId}.${subCategoryId}`}
              category={subCategory}
              level={level + 1}
              expanded={false}
              selected={false}
              onToggle={() => {}}
              onToggleExpansion={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ===============================
// PRICE RANGE FILTER
// ===============================
const PriceRangeFilter = ({ priceRange, onPriceChange }) => {
  const [localRange, setLocalRange] = React.useState(priceRange)

  const handleRangeChange = (field, value) => {
    const newRange = { ...localRange, [field]: parseFloat(value) || 0 }
    setLocalRange(newRange)
    onPriceChange(newRange)
  }

  const presetRanges = [
    { label: 'Até 10 BZR', min: 0, max: 10 },
    { label: '10 - 50 BZR', min: 10, max: 50 },
    { label: '50 - 100 BZR', min: 50, max: 100 },
    { label: '100+ BZR', min: 100, max: 1000 }
  ]

  return (
    <div className="space-y-4">
      {/* Custom Range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-bazari-dark/70 mb-1">
            Preço Mínimo
          </label>
          <Input
            type="number"
            value={localRange.min}
            onChange={(e) => handleRangeChange('min', e.target.value)}
            placeholder="0"
            size="sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-bazari-dark/70 mb-1">
            Preço Máximo
          </label>
          <Input
            type="number"
            value={localRange.max}
            onChange={(e) => handleRangeChange('max', e.target.value)}
            placeholder="1000"
            size="sm"
          />
        </div>
      </div>

      {/* Preset Ranges */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-bazari-dark/70 mb-2">
          Faixas populares:
        </div>
        <div className="grid grid-cols-2 gap-2">
          {presetRanges.map(range => (
            <button
              key={range.label}
              className={`
                p-2 text-xs rounded-lg border transition-colors
                ${localRange.min === range.min && localRange.max === range.max
                  ? 'border-bazari-primary bg-bazari-primary/10 text-bazari-primary'
                  : 'border-bazari-primary/20 hover:border-bazari-primary/40 text-bazari-dark/70'
                }
              `}
              onClick={() => {
                setLocalRange(range)
                onPriceChange(range)
              }}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ===============================
// LOCATION FILTER
// ===============================
const LocationFilter = ({ location, radius, onLocationChange, onRadiusChange }) => {
  const cities = [
    'São Paulo, SP',
    'Rio de Janeiro, RJ', 
    'Belo Horizonte, MG',
    'Brasília, DF',
    'Salvador, BA'
  ]

  return (
    <div className="space-y-4">
      {/* Location Input */}
      <div>
        <label className="block text-xs font-medium text-bazari-dark/70 mb-1">
          Cidade ou Região
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-bazari-dark/40" />
          <Input
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="Digite sua cidade..."
            className="pl-10"
            size="sm"
          />
        </div>
      </div>

      {/* Popular Cities */}
      <div>
        <div className="text-xs font-medium text-bazari-dark/70 mb-2">
          Cidades populares:
        </div>
        <div className="flex flex-wrap gap-2">
          {cities.map(city => (
            <button
              key={city}
              className={`
                px-3 py-1 text-xs rounded-full border transition-colors
                ${location === city
                  ? 'border-bazari-primary bg-bazari-primary/10 text-bazari-primary'
                  : 'border-bazari-primary/20 hover:border-bazari-primary/40 text-bazari-dark/70'
                }
              `}
              onClick={() => onLocationChange(city)}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Radius */}
      {location && (
        <div>
          <label className="block text-xs font-medium text-bazari-dark/70 mb-2">
            Raio: {radius} km
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={radius}
            onChange={(e) => onRadiusChange(parseInt(e.target.value))}
            className="w-full h-2 bg-bazari-light rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-bazari-dark/60 mt-1">
            <span>1 km</span>
            <span>100 km</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ===============================
// RATING FILTER
// ===============================
const RatingFilter = ({ minRating, onRatingChange }) => {
  const ratings = [
    { value: 0, label: 'Todas as avaliações' },
    { value: 4, label: '4+ estrelas' },
    { value: 4.5, label: '4.5+ estrelas' },
    { value: 5, label: '5 estrelas' }
  ]

  return (
    <div className="space-y-2">
      {ratings.map(rating => (
        <label
          key={rating.value}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <input
            type="radio"
            name="rating"
            checked={minRating === rating.value}
            onChange={() => onRatingChange(rating.value)}
            className="text-bazari-primary"
          />
          <div className="flex items-center space-x-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={14}
                  className={`${
                    star <= rating.value
                      ? 'text-yellow-500 fill-current'
                      : 'text-bazari-dark/20'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-bazari-dark/70">
              {rating.label}
            </span>
          </div>
        </label>
      ))}
    </div>
  )
}

// ===============================
// AVAILABILITY FILTER
// ===============================
const AvailabilityFilter = ({ availability, onAvailabilityChange }) => {
  const options = [
    { value: 'all', label: 'Todos os produtos', icon: Package },
    { value: 'inStock', label: 'Em estoque', icon: Check },
    { value: 'preOrder', label: 'Pré-venda', icon: Clock }
  ]

  return (
    <div className="space-y-2">
      {options.map(option => {
        const Icon = option.icon
        return (
          <label
            key={option.value}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <input
              type="radio"
              name="availability"
              checked={availability === option.value}
              onChange={() => onAvailabilityChange(option.value)}
              className="text-bazari-primary"
            />
            <div className="flex items-center space-x-2">
              <Icon size={16} className="text-bazari-primary" />
              <span className="text-sm text-bazari-dark">
                {option.label}
              </span>
            </div>
          </label>
        )
      })}
    </div>
  )
}

// ===============================
// FEATURES FILTER
// ===============================
const FeaturesFilter = ({ features, onFeaturesChange }) => {
  const availableFeatures = [
    { id: 'fastDelivery', label: 'Entrega rápida', icon: Clock },
    { id: 'warranty', label: 'Com garantia', icon: Shield },
    { id: 'returns', label: 'Aceita devoluções', icon: RefreshCw },
    { id: 'verified', label: 'Produto verificado', icon: Check }
  ]

  const toggleFeature = (featureId) => {
    const isSelected = features.includes(featureId)
    if (isSelected) {
      onFeaturesChange(features.filter(id => id !== featureId))
    } else {
      onFeaturesChange([...features, featureId])
    }
  }

  return (
    <div className="space-y-2">
      {availableFeatures.map(feature => {
        const Icon = feature.icon
        const isSelected = features.includes(feature.id)
        
        return (
          <label
            key={feature.id}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleFeature(feature.id)}
              className="text-bazari-primary"
            />
            <div className="flex items-center space-x-2">
              <Icon size={16} className="text-bazari-primary" />
              <span className="text-sm text-bazari-dark">
                {feature.label}
              </span>
            </div>
          </label>
        )
      })}
    </div>
  )
}

// ===============================
// BUSINESS TYPE FILTER
// ===============================
const BusinessTypeFilter = ({ businessType, onTypeChange }) => {
  const options = [
    { value: 'all', label: 'Todos os negócios', icon: Store },
    { value: 'verified', label: 'Somente verificados', icon: Shield },
    { value: 'new', label: 'Novos negócios', icon: Clock },
    { value: 'trending', label: 'Em alta', icon: TrendingUp }
  ]

  return (
    <div className="space-y-2">
      {options.map(option => {
        const Icon = option.icon
        return (
          <label
            key={option.value}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <input
              type="radio"
              name="businessType"
              checked={businessType === option.value}
              onChange={() => onTypeChange(option.value)}
              className="text-bazari-primary"
            />
            <div className="flex items-center space-x-2">
              <Icon size={16} className="text-bazari-primary" />
              <span className="text-sm text-bazari-dark">
                {option.label}
              </span>
            </div>
          </label>
        )
      })}
    </div>
  )
}

// ===============================
// SALES RANGE FILTER
// ===============================
const SalesRangeFilter = ({ salesRange, onSalesChange }) => {
  const [localRange, setLocalRange] = React.useState(salesRange)

  const handleRangeChange = (field, value) => {
    const newRange = { ...localRange, [field]: parseInt(value) || 0 }
    setLocalRange(newRange)
    onSalesChange(newRange)
  }

  const presetRanges = [
    { label: 'Até 10 vendas', min: 0, max: 10 },
    { label: '10 - 50 vendas', min: 10, max: 50 },
    { label: '50 - 100 vendas', min: 50, max: 100 },
    { label: '100+ vendas', min: 100, max: 1000 }
  ]

  return (
    <div className="space-y-4">
      {/* Custom Range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-bazari-dark/70 mb-1">
            Mínimo de Vendas
          </label>
          <Input
            type="number"
            value={localRange.min}
            onChange={(e) => handleRangeChange('min', e.target.value)}
            placeholder="0"
            size="sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-bazari-dark/70 mb-1">
            Máximo de Vendas
          </label>
          <Input
            type="number"
            value={localRange.max}
            onChange={(e) => handleRangeChange('max', e.target.value)}
            placeholder="1000"
            size="sm"
          />
        </div>
      </div>

      {/* Preset Ranges */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-bazari-dark/70 mb-2">
          Faixas populares:
        </div>
        <div className="grid grid-cols-2 gap-2">
          {presetRanges.map(range => (
            <button
              key={range.label}
              className={`
                p-2 text-xs rounded-lg border transition-colors
                ${localRange.min === range.min && localRange.max === range.max
                  ? 'border-bazari-primary bg-bazari-primary/10 text-bazari-primary'
                  : 'border-bazari-primary/20 hover:border-bazari-primary/40 text-bazari-dark/70'
                }
              `}
              onClick={() => {
                setLocalRange(range)
                onSalesChange(range)
              }}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FiltersComponent