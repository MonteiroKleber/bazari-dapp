import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Heart, Search, Grid, List, Filter, Star, MapPin,
  Eye, Package, Store, Shield, ShoppingCart, X, Trash2,
  SlidersHorizontal, Tag, TrendingUp, Clock, AlertCircle,
  Share, ExternalLink, Users, RefreshCw
} from 'lucide-react'
import { Button, Card, Badge, Input, Loading, Avatar } from '@components/BaseComponents'
import { useFavorites, useMarketplace, useCart } from './useMarketplaceStore'
import { useAuth } from '@modules/acesso/useAuthStore'
import { useTranslation } from '@i18n/useTranslation'

// ===============================
// FAVORITES VIEW COMPONENT
// ===============================
const FavoritesView = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { navigateTo } = useMarketplace()
  const { 
    favorites,
    loadFavorites,
    toggleFavorite,
    isFavorite
  } = useFavorites()

  const [activeTab, setActiveTab] = React.useState('all') // all, products, businesses
  const [viewMode, setViewMode] = React.useState('grid') // grid, list
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedItems, setSelectedItems] = React.useState([])
  const [showBulkActions, setShowBulkActions] = React.useState(false)

  // Carregar favoritos ao montar componente
  React.useEffect(() => {
    loadFavorites()
  }, [])

  // Obter itens favoritos detalhados
  const favoriteItems = React.useMemo(() => {
    // Mock data - in real app, this would fetch full item details
    return favorites.map(fav => ({
      id: fav.id,
      type: fav.type,
      addedAt: fav.addedAt,
      // Mock item data
      name: fav.type === 'product' ? 'Produto Exemplo' : 'Negócio Exemplo',
      description: 'Descrição do item favorito...',
      price: fav.type === 'product' ? 25.99 : null,
      image: `https://picsum.photos/300/300?random=${fav.id}`,
      location: fav.type === 'business' ? 'São Paulo, SP' : null,
      rating: 4.5,
      stats: {
        views: 120,
        sales: 45,
        reviews: 23
      },
      verified: fav.type === 'business' ? Math.random() > 0.5 : null,
      token: fav.type === 'business' ? {
        symbol: 'TEST',
        price: 0.045,
        change24h: 2.3
      } : null
    }))
  }, [favorites])

  // Filtrar itens por aba ativa
  const filteredItems = React.useMemo(() => {
    let filtered = favoriteItems

    if (activeTab !== 'all') {
      filtered = filtered.filter(item => 
        activeTab === 'products' ? item.type === 'product' : item.type === 'business'
      )
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [favoriteItems, activeTab, searchQuery])

  const productsCount = favoriteItems.filter(item => item.type === 'product').length
  const businessesCount = favoriteItems.filter(item => item.type === 'business').length

  return (
    <div className="min-h-screen bg-bazari-light">
      {/* Header */}
      <FavoritesHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onBack={() => navigateTo('home')}
      />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Controls */}
        <FavoritesControls
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          viewMode={viewMode}
          setViewMode={setViewMode}
          productsCount={productsCount}
          businessesCount={businessesCount}
          totalCount={favoriteItems.length}
          selectedItems={selectedItems}
          showBulkActions={showBulkActions}
          setShowBulkActions={setShowBulkActions}
          onClearSelected={() => setSelectedItems([])}
          onRemoveSelected={() => {
            selectedItems.forEach(itemId => {
              const item = favoriteItems.find(i => i.id === itemId)
              if (item) {
                toggleFavorite(item.id, item.type)
              }
            })
            setSelectedItems([])
            setShowBulkActions(false)
          }}
        />

        {/* Items List */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {filteredItems.length === 0 ? (
              <EmptyFavoritesState 
                activeTab={activeTab} 
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery('')}
              />
            ) : (
              <FavoritesList
                items={filteredItems}
                viewMode={viewMode}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                showBulkActions={showBulkActions}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ===============================
// FAVORITES HEADER
// ===============================
const FavoritesHeader = ({ searchQuery, setSearchQuery, onBack }) => {
  return (
    <header className="bg-white border-b border-bazari-primary/10 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={18} className="mr-1" />
            Voltar
          </Button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Heart size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-bazari-dark">
                Meus Favoritos
              </h1>
              <p className="text-sm text-bazari-dark/60">
                Produtos e negócios que você salvou
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-bazari-dark/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar favoritos..."
                className="pl-10"
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

// ===============================
// FAVORITES CONTROLS
// ===============================
const FavoritesControls = ({
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  productsCount,
  businessesCount,
  totalCount,
  selectedItems,
  showBulkActions,
  setShowBulkActions,
  onClearSelected,
  onRemoveSelected
}) => {
  const tabs = [
    { id: 'all', label: `Todos (${totalCount})`, count: totalCount },
    { id: 'products', label: `Produtos (${productsCount})`, count: productsCount },
    { id: 'businesses', label: `Negócios (${businessesCount})`, count: businessesCount }
  ]

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-bazari-primary/10">
      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {showBulkActions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between p-3 bg-bazari-primary/5 rounded-lg mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-bazari-dark">
                  {selectedItems.length} {selectedItems.length === 1 ? 'item selecionado' : 'itens selecionados'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRemoveSelected}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <Trash2 size={14} className="mr-1" />
                  Remover Selecionados
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClearSelected()
                    setShowBulkActions(false)
                  }}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

        {/* Bulk Select Toggle */}
        {totalCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkActions(!showBulkActions)}
            className={showBulkActions ? 'border-bazari-primary text-bazari-primary' : ''}
          >
            <SlidersHorizontal size={16} className="mr-1" />
            {showBulkActions ? 'Cancelar Seleção' : 'Selecionar'}
          </Button>
        )}
      </div>

      {/* Bottom Row - View Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-bazari-dark/60">
          {totalCount === 0 ? 'Nenhum item' : `${totalCount} ${totalCount === 1 ? 'item' : 'itens'}`} 
          {activeTab !== 'all' && ' nesta categoria'}
        </div>

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
      </div>
    </div>
  )
}

// ===============================
// FAVORITES LIST
// ===============================
const FavoritesList = ({ 
  items, 
  viewMode, 
  selectedItems, 
  setSelectedItems, 
  showBulkActions,
  onToggleFavorite 
}) => {
  const handleItemSelect = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId))
    } else {
      setSelectedItems([...selectedItems, itemId])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className={`
        grid gap-6
        ${viewMode === 'grid'
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1'
        }
      `}>
        {items.map(item => (
          <FavoriteCard
            key={item.id}
            item={item}
            viewMode={viewMode}
            isSelected={selectedItems.includes(item.id)}
            showBulkActions={showBulkActions}
            onSelect={() => handleItemSelect(item.id)}
            onToggleFavorite={() => onToggleFavorite(item.id, item.type)}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ===============================
// FAVORITE CARD
// ===============================
const FavoriteCard = ({ 
  item, 
  viewMode, 
  isSelected, 
  showBulkActions, 
  onSelect, 
  onToggleFavorite 
}) => {
  const { addToCart } = useCart()
  const { navigateTo } = useMarketplace()

  const handleClick = () => {
    if (showBulkActions) {
      onSelect()
    } else {
      if (item.type === 'product') {
        navigateTo('product', { selectedProduct: item })
      } else {
        navigateTo('business', { selectedBusiness: item })
      }
    }
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    if (item.type === 'product') {
      addToCart(item.id, 1)
    }
  }

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    onToggleFavorite()
  }

  if (viewMode === 'list') {
    return (
      <Card className={`
        p-6 hover:shadow-lg transition-all cursor-pointer
        ${isSelected ? 'ring-2 ring-bazari-primary ring-opacity-50 bg-bazari-primary/5' : ''}
      `} onClick={handleClick}>
        <div className="flex space-x-6">
          {/* Selection Checkbox */}
          {showBulkActions && (
            <div className="flex items-start pt-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
                className="w-4 h-4 text-bazari-primary border-gray-300 rounded focus:ring-bazari-primary"
              />
            </div>
          )}

          {/* Image */}
          <div className="w-24 h-24 bg-bazari-light rounded-xl overflow-hidden flex-shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-bold text-bazari-dark text-lg line-clamp-1">
                    {item.name}
                  </h3>
                  
                  <Badge variant="outline" size="sm">
                    {item.type === 'product' ? 'Produto' : 'Negócio'}
                  </Badge>
                  
                  {item.type === 'business' && item.verified && (
                    <Badge variant="success" size="sm">
                      <Shield size={10} className="mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
                
                {item.type === 'business' && item.location && (
                  <div className="flex items-center text-sm text-bazari-dark/60 mb-2">
                    <MapPin size={14} className="mr-1" />
                    {item.location}
                  </div>
                )}
                
                <p className="text-bazari-dark/70 line-clamp-2 mb-3">
                  {item.description}
                </p>
                
                <div className="flex items-center text-sm text-bazari-dark/60 mb-2">
                  <Clock size={14} className="mr-1" />
                  Adicionado em {new Date(item.addedAt).toLocaleDateString('pt-BR')}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteClick}
                className="text-red-500 hover:text-red-600"
              >
                <Heart size={18} fill="currentColor" />
              </Button>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between">
              {/* Stats */}
              <div className="flex items-center space-x-4 text-sm text-bazari-dark/60">
                <div className="flex items-center">
                  <Star size={14} className="mr-1 text-yellow-500" />
                  {item.rating?.toFixed(1)}
                </div>
                <div className="flex items-center">
                  <Eye size={14} className="mr-1" />
                  {item.stats?.views}
                </div>
                {item.type === 'product' && (
                  <div className="flex items-center">
                    <Package size={14} className="mr-1" />
                    {item.stats?.sales} vendas
                  </div>
                )}
                {item.type === 'business' && (
                  <div className="flex items-center">
                    <Users size={14} className="mr-1" />
                    {item.stats?.reviews} avaliações
                  </div>
                )}
              </div>

              {/* Price/Actions */}
              <div className="flex items-center space-x-3">
                {item.type === 'product' ? (
                  <>
                    <div className="text-xl font-bold text-bazari-primary">
                      {item.price?.toFixed(2)} BZR
                    </div>
                    <Button onClick={handleAddToCart} size="sm">
                      <ShoppingCart size={14} className="mr-1" />
                      Adicionar
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-right">
                      <div className="text-sm font-medium text-bazari-primary">
                        {item.token?.price?.toFixed(3)} BZR
                      </div>
                      <div className={`text-xs ${
                        item.token?.change24h > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.token?.change24h > 0 ? '+' : ''}{item.token?.change24h?.toFixed(1)}%
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Store size={14} className="mr-1" />
                      Ver Loja
                    </Button>
                  </>
                )}
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
      <Card className={`
        overflow-hidden cursor-pointer group h-full relative
        ${isSelected ? 'ring-2 ring-bazari-primary ring-opacity-50' : ''}
      `} onClick={handleClick}>
        {/* Selection Checkbox */}
        {showBulkActions && (
          <div className="absolute top-3 left-3 z-10">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}}
              className="w-4 h-4 text-bazari-primary border-gray-300 rounded focus:ring-bazari-primary"
            />
          </div>
        )}

        {/* Image */}
        <div className="relative h-48">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Type Badge */}
          <Badge
            variant={item.type === 'product' ? 'primary' : 'secondary'}
            className="absolute top-3 right-3"
            size="sm"
          >
            {item.type === 'product' ? 'Produto' : 'Negócio'}
          </Badge>
          
          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-3 right-3 text-red-500 bg-white/80 hover:bg-white hover:scale-110"
            onClick={handleFavoriteClick}
          >
            <Heart size={16} fill="currentColor" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-bazari-dark group-hover:text-bazari-primary transition-colors line-clamp-1">
              {item.name}
            </h3>
            
            {item.type === 'business' && item.verified && (
              <Badge variant="success" size="sm">
                <Shield size={10} className="mr-1" />
                Verificado
              </Badge>
            )}
          </div>
          
          {item.type === 'business' && item.location && (
            <div className="flex items-center text-sm text-bazari-dark/60 mb-2">
              <MapPin size={14} className="mr-1" />
              {item.location}
            </div>
          )}
          
          <p className="text-sm text-bazari-dark/70 mb-4 line-clamp-2">
            {item.description}
          </p>

          {/* Added Date */}
          <div className="flex items-center text-xs text-bazari-dark/50 mb-3">
            <Clock size={12} className="mr-1" />
            {new Date(item.addedAt).toLocaleDateString('pt-BR')}
          </div>
          
          {/* Bottom Section */}
          {item.type === 'product' ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-bold text-bazari-primary">
                  {item.price?.toFixed(2)} BZR
                </div>
                
                <div className="flex items-center text-sm text-bazari-dark/60">
                  <Star size={12} className="mr-1 text-yellow-500" />
                  {item.rating?.toFixed(1)}
                </div>
              </div>
              
              <Button
                onClick={handleAddToCart}
                className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                size="sm"
              >
                <ShoppingCart size={14} className="mr-1" />
                Adicionar ao Carrinho
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-bazari-dark/60">
                  <Star size={12} className="mr-1 text-yellow-500" />
                  {item.rating?.toFixed(1)}
                  <span className="mx-2">•</span>
                  <Users size={12} className="mr-1" />
                  {item.stats?.reviews}
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-bazari-primary">
                    {item.token?.price?.toFixed(3)} BZR
                  </div>
                  <div className={`text-xs ${
                    item.token?.change24h > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.token?.change24h > 0 ? '+' : ''}{item.token?.change24h?.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                size="sm"
              >
                <Store size={14} className="mr-1" />
                Ver Negócio
              </Button>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

// ===============================
// EMPTY FAVORITES STATE
// ===============================
const EmptyFavoritesState = ({ activeTab, searchQuery, onClearSearch }) => {
  const { navigateTo } = useMarketplace()
  
  const getEmptyMessage = () => {
    if (searchQuery) {
      return {
        title: 'Nenhum favorito encontrado',
        description: `Não encontramos favoritos para "${searchQuery}".`,
        action: {
          label: 'Limpar Busca',
          onClick: onClearSearch
        }
      }
    }

    switch (activeTab) {
      case 'products':
        return {
          title: 'Nenhum produto favorito',
          description: 'Você ainda não salvou nenhum produto como favorito. Explore nosso marketplace e salve os produtos que mais gostar!',
          action: {
            label: 'Explorar Produtos',
            onClick: () => navigateTo('home')
          }
        }
      case 'businesses':
        return {
          title: 'Nenhum negócio favorito',
          description: 'Você ainda não salvou nenhum negócio como favorito. Descubra negócios incríveis e salve seus preferidos!',
          action: {
            label: 'Explorar Negócios',
            onClick: () => navigateTo('home')
          }
        }
      default:
        return {
          title: 'Nenhum item favorito',
          description: 'Você ainda não salvou nenhum item como favorito. Comece explorando nosso marketplace e salvando os produtos e negócios que mais gostar!',
          action: {
            label: 'Explorar Marketplace',
            onClick: () => navigateTo('home')
          }
        }
    }
  }

  const { title, description, action } = getEmptyMessage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Heart className="w-12 h-12 text-red-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-bazari-dark mb-2">
        {title}
      </h3>
      
      <p className="text-bazari-dark/60 mb-8 max-w-md mx-auto">
        {description}
      </p>
      
      <div className="space-y-3">
        <Button onClick={action.onClick} size="lg">
          {searchQuery ? (
            <X size={18} className="mr-2" />
          ) : (
            <Heart size={18} className="mr-2" />
          )}
          {action.label}
        </Button>
        
        {!searchQuery && (
          <div className="text-sm text-bazari-dark/60">
            Dica: Clique no ❤️ dos itens para adicioná-los aos favoritos
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default FavoritesView