import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Share, Heart, Star, MapPin, Phone, Mail, Globe,
  Instagram, Twitter, Shield, Eye, Users, TrendingUp, Package,
  Plus, ShoppingCart, Coins, Store, Clock, Award, ExternalLink,
  Camera, Edit, MessageCircle, Flag, MoreVertical
} from 'lucide-react'
import { Button, Card, Badge, Avatar, Loading, Modal } from '@components/BaseComponents'
import { useBusinesses, useProducts, useFavorites, useCart, useMarketplace } from './useMarketplaceStore'
import { useAuth } from '@modules/acesso/useAuthStore'
import { useTranslation } from '@i18n/useTranslation'

// ===============================
// BUSINESS VIEW COMPONENT
// ===============================
const BusinessView = ({ businessId }) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { navigateTo } = useMarketplace()
  const { 
    selectedBusiness,
    loadBusiness,
    isLoading,
    error
  } = useBusinesses()
  
  const { 
    products,
    loadProducts,
    isLoadingProducts
  } = useProducts()
  
  const { toggleFavorite, isFavorite } = useFavorites()
  
  const [activeTab, setActiveTab] = React.useState('overview')
  const [showShareModal, setShowShareModal] = React.useState(false)
  const [showReportModal, setShowReportModal] = React.useState(false)

  // Carregar dados do negócio
  React.useEffect(() => {
    if (businessId) {
      loadBusiness(businessId)
      loadProducts({ businessId })
    }
  }, [businessId])

  if (isLoading) {
    return <LoadingState />
  }

  if (error || !selectedBusiness) {
    return <ErrorState error={error} onBack={() => navigateTo('home')} />
  }

  const business = selectedBusiness
  const businessProducts = products.filter(p => p.businessId === businessId)
  const isOwner = user?.id === business.ownerId
  const isBusinessFavorite = isFavorite(businessId, 'business')

  return (
    <div className="min-h-screen bg-bazari-light">
      {/* Header */}
      <BusinessHeader
        business={business}
        isOwner={isOwner}
        isFavorite={isBusinessFavorite}
        onBack={() => navigateTo('home')}
        onShare={() => setShowShareModal(true)}
        onFavorite={() => toggleFavorite(businessId, 'business')}
        onReport={() => setShowReportModal(true)}
      />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Business Info Card */}
            <BusinessInfoCard business={business} />

            {/* Tabs */}
            <BusinessTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              productsCount={businessProducts.length}
            />

            {/* Tab Content */}
            <div className="mt-6">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <OverviewTab business={business} />
                )}
                {activeTab === 'products' && (
                  <ProductsTab 
                    products={businessProducts}
                    isLoading={isLoadingProducts}
                    business={business}
                    isOwner={isOwner}
                  />
                )}
                {activeTab === 'reviews' && (
                  <ReviewsTab business={business} />
                )}
                {activeTab === 'about' && (
                  <AboutTab business={business} />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Token Card */}
              <BusinessTokenCard business={business} />
              
              {/* Contact Card */}
              <BusinessContactCard business={business} />
              
              {/* Stats Card */}
              <BusinessStatsCard business={business} />
              
              {/* Quick Actions */}
              <QuickActionsCard business={business} isOwner={isOwner} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ShareModal 
        show={showShareModal}
        onClose={() => setShowShareModal(false)}
        business={business}
      />
      
      <ReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        business={business}
      />
    </div>
  )
}

// ===============================
// BUSINESS HEADER
// ===============================
const BusinessHeader = ({ 
  business, 
  isOwner, 
  isFavorite, 
  onBack, 
  onShare, 
  onFavorite, 
  onReport 
}) => {
  const [showMenu, setShowMenu] = React.useState(false)

  return (
    <header className="bg-white border-b border-bazari-primary/10 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft size={18} className="mr-1" />
              Voltar
            </Button>
            
            <div className="flex items-center space-x-3">
              <Avatar
                src={business.images?.[0]}
                alt={business.name}
                size="md"
                fallback={business.name?.[0] || 'N'}
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-bazari-dark">
                    {business.name}
                  </h1>
                  {business.verified && (
                    <Badge variant="success" size="sm">
                      <Shield size={10} className="mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-sm text-bazari-dark/60">
                  <MapPin size={14} className="mr-1" />
                  {business.location}
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
            >
              <Share size={16} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onFavorite}
              className={isFavorite ? 'text-red-500' : ''}
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </Button>

            {isOwner && (
              <Button size="sm">
                <Edit size={16} className="mr-1" />
                Editar
              </Button>
            )}

            {/* More Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical size={16} />
              </Button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-bazari-primary/10 z-50">
                  <div className="py-2">
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-bazari-dark hover:bg-bazari-light flex items-center"
                      onClick={() => {
                        onReport()
                        setShowMenu(false)
                      }}
                    >
                      <Flag size={14} className="mr-2" />
                      Reportar negócio
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

// ===============================
// BUSINESS INFO CARD
// ===============================
const BusinessInfoCard = ({ business }) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  const images = business.images || []

  return (
    <Card className="overflow-hidden mb-6">
      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="relative">
          <div className="aspect-video bg-bazari-light overflow-hidden">
            <img
              src={images[currentImageIndex] || `https://picsum.photos/800/400?random=${business.id}`}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Image Navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentImageIndex === index
                        ? 'bg-white'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Image Counter */}
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-black/50 text-white border-white/20">
              <Camera size={12} className="mr-1" />
              {currentImageIndex + 1}/{images.length}
            </Badge>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-bazari-dark mb-2">
              {business.name}
            </h2>
            <p className="text-bazari-dark/70 leading-relaxed">
              {business.description}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-bazari-primary/10">
          <div className="text-center">
            <div className="font-bold text-bazari-primary text-lg">
              {business.stats?.rating?.toFixed(1) || '0.0'}
            </div>
            <div className="text-sm text-bazari-dark/60 flex items-center justify-center">
              <Star size={12} className="mr-1 text-yellow-500" />
              Avaliação
            </div>
          </div>
          
          <div className="text-center">
            <div className="font-bold text-bazari-primary text-lg">
              {business.stats?.views || 0}
            </div>
            <div className="text-sm text-bazari-dark/60 flex items-center justify-center">
              <Eye size={12} className="mr-1" />
              Visualizações
            </div>
          </div>
          
          <div className="text-center">
            <div className="font-bold text-bazari-primary text-lg">
              {business.stats?.followers || 0}
            </div>
            <div className="text-sm text-bazari-dark/60 flex items-center justify-center">
              <Users size={12} className="mr-1" />
              Seguidores
            </div>
          </div>
          
          <div className="text-center">
            <div className="font-bold text-bazari-primary text-lg">
              {business.stats?.sales || 0}
            </div>
            <div className="text-sm text-bazari-dark/60 flex items-center justify-center">
              <Package size={12} className="mr-1" />
              Vendas
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ===============================
// BUSINESS TABS
// ===============================
const BusinessTabs = ({ activeTab, setActiveTab, productsCount }) => {
  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Store },
    { id: 'products', label: `Produtos (${productsCount})`, icon: Package },
    { id: 'reviews', label: 'Avaliações', icon: Star },
    { id: 'about', label: 'Sobre', icon: MessageCircle }
  ]

  return (
    <div className="border-b border-bazari-primary/10">
      <div className="flex space-x-8 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`
                flex items-center space-x-2 py-4 px-1 border-b-2 whitespace-nowrap transition-colors
                ${activeTab === tab.id
                  ? 'border-bazari-primary text-bazari-primary'
                  : 'border-transparent text-bazari-dark/60 hover:text-bazari-dark'
                }
              `}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              <span className="font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ===============================
// OVERVIEW TAB
// ===============================
const OverviewTab = ({ business }) => {
  const categories = business.categories || []
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Categories */}
      {categories.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-bazari-dark mb-4">
            Categorias
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Badge key={category} variant="outline">
                {category.split('.').pop()}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-bazari-dark mb-4">
          Atividade Recente
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm text-bazari-dark">
                Novo produto adicionado: "Pão Francês"
              </p>
              <p className="text-xs text-bazari-dark/60">Há 2 dias</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm text-bazari-dark">
                Perfil atualizado com novas informações
              </p>
              <p className="text-xs text-bazari-dark/60">Há 1 semana</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm text-bazari-dark">
                Negócio criado e tokenizado
              </p>
              <p className="text-xs text-bazari-dark/60">Há 1 mês</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Hours */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-bazari-dark mb-4">
          Horário de Funcionamento
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-bazari-dark/70">Segunda - Sexta</span>
            <span className="text-bazari-dark">8:00 - 18:00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bazari-dark/70">Sábado</span>
            <span className="text-bazari-dark">8:00 - 14:00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bazari-dark/70">Domingo</span>
            <span className="text-red-600">Fechado</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-700">
            <Clock size={16} className="mr-2" />
            <span className="text-sm font-medium">Aberto agora</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ===============================
// PRODUCTS TAB
// ===============================
const ProductsTab = ({ products, isLoading, business, isOwner }) => {
  const { addToCart } = useCart()
  const [viewMode, setViewMode] = React.useState('grid')

  if (isLoading) {
    return <LoadingState />
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <Package className="w-16 h-16 text-bazari-dark/40 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-bazari-dark mb-2">
          Nenhum produto cadastrado
        </h3>
        <p className="text-bazari-dark/60 mb-6">
          {isOwner 
            ? 'Adicione produtos para começar a vender.'
            : 'Este negócio ainda não cadastrou produtos.'
          }
        </p>
        {isOwner && (
          <Button>
            <Plus size={16} className="mr-2" />
            Adicionar Produto
          </Button>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-bazari-dark">
            Produtos ({products.length})
          </h3>
          <p className="text-sm text-bazari-dark/60">
            Produtos disponíveis neste negócio
          </p>
        </div>
        
        {isOwner && (
          <Button size="sm">
            <Plus size={16} className="mr-1" />
            Adicionar
          </Button>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            business={business}
            onAddToCart={(productId, quantity) => addToCart(productId, quantity)}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ===============================
// PRODUCT CARD
// ===============================
const ProductCard = ({ product, business, onAddToCart }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-bazari-light overflow-hidden">
        <img
          src={product.images?.[0] || `https://picsum.photos/300/300?random=${product.id}`}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-4">
        <h4 className="font-semibold text-bazari-dark mb-2 line-clamp-2">
          {product.name}
        </h4>
        
        <p className="text-sm text-bazari-dark/70 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold text-bazari-primary">
            {product.price?.toFixed(2)} BZR
          </div>
          
          <div className="flex items-center text-sm text-bazari-dark/60">
            <Star size={12} className="mr-1 text-yellow-500" />
            {product.stats?.rating?.toFixed(1) || '0.0'}
          </div>
        </div>
        
        <Button
          onClick={() => onAddToCart(product.id, 1)}
          className="w-full"
          size="sm"
        >
          <ShoppingCart size={14} className="mr-2" />
          Adicionar ao Carrinho
        </Button>
      </div>
    </Card>
  )
}

// ===============================
// REVIEWS TAB
// ===============================
const ReviewsTab = ({ business }) => {
  const reviews = [
    {
      id: 1,
      user: { name: 'Maria Silva', avatar: null },
      rating: 5,
      comment: 'Excelente negócio! Produtos de qualidade e atendimento nota 10.',
      date: '2024-01-15'
    },
    {
      id: 2,
      user: { name: 'João Santos', avatar: null },
      rating: 4,
      comment: 'Muito bom, recomendo. Apenas o tempo de entrega poderia ser menor.',
      date: '2024-01-10'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Rating Summary */}
      <Card className="p-6">
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-bazari-primary">
              {business.stats?.rating?.toFixed(1) || '0.0'}
            </div>
            <div className="flex items-center justify-center mt-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={16}
                  className={`${
                    star <= (business.stats?.rating || 0)
                      ? 'text-yellow-500 fill-current'
                      : 'text-bazari-dark/20'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-bazari-dark/60 mt-1">
              {business.stats?.reviews || 0} avaliações
            </div>
          </div>
          
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center space-x-3 mb-1">
                <span className="text-sm text-bazari-dark/60 w-8">
                  {rating}★
                </span>
                <div className="flex-1 bg-bazari-light rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : 10}%` }}
                  />
                </div>
                <span className="text-sm text-bazari-dark/60 w-8">
                  {rating === 5 ? 7 : rating === 4 ? 2 : 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map(review => (
          <Card key={review.id} className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar
                src={review.user.avatar}
                alt={review.user.name}
                fallback={review.user.name[0]}
              />
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-bazari-dark">
                    {review.user.name}
                  </h4>
                  <span className="text-sm text-bazari-dark/60">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center mb-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={14}
                      className={`${
                        star <= review.rating
                          ? 'text-yellow-500 fill-current'
                          : 'text-bazari-dark/20'
                      }`}
                    />
                  ))}
                </div>
                
                <p className="text-bazari-dark/70 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline">
          Carregar mais avaliações
        </Button>
      </div>
    </motion.div>
  )
}

// ===============================
// ABOUT TAB
// ===============================
const AboutTab = ({ business }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-bazari-dark mb-4">
          Sobre o Negócio
        </h3>
        <p className="text-bazari-dark/70 leading-relaxed mb-6">
          {business.description}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-bazari-dark mb-2">Informações</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-bazari-dark/70">Criado em</span>
                <span className="text-bazari-dark">
                  {new Date(business.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-bazari-dark/70">Última atualização</span>
                <span className="text-bazari-dark">
                  {new Date(business.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-bazari-dark/70">Status</span>
                <Badge variant={business.verified ? 'success' : 'warning'} size="sm">
                  {business.verified ? 'Verificado' : 'Não verificado'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-bazari-dark mb-2">Token</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-bazari-dark/70">Símbolo</span>
                <span className="text-bazari-dark font-mono">
                  {business.token?.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-bazari-dark/70">Preço atual</span>
                <span className="text-bazari-primary font-bold">
                  {business.token?.price?.toFixed(4)} BZR
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-bazari-dark/70">Variação 24h</span>
                <span className={`${
                  business.token?.change24h > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {business.token?.change24h > 0 ? '+' : ''}
                  {business.token?.change24h?.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ===============================
// SIDEBAR COMPONENTS
// ===============================
const BusinessTokenCard = ({ business }) => {
  const token = business.token || {}
  
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-bazari-dark mb-4">
        Token do Negócio
      </h3>
      
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-bazari-primary">
          {token.price?.toFixed(4)} BZR
        </div>
        <div className={`text-sm ${
          token.change24h > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {token.change24h > 0 ? '+' : ''}{token.change24h?.toFixed(1)}%
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-bazari-dark/70">Market Cap</span>
          <span className="text-bazari-dark">
            {token.marketCap?.toFixed(2)} BZR
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-bazari-dark/70">Holders</span>
          <span className="text-bazari-dark">{token.holders}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-bazari-dark/70">Supply</span>
          <span className="text-bazari-dark">
            {token.supply?.toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Button className="w-full" size="sm">
          <Coins size={14} className="mr-2" />
          Comprar Token
        </Button>
        <Button variant="outline" className="w-full" size="sm">
          Ver Gráfico
        </Button>
      </div>
    </Card>
  )
}

const BusinessContactCard = ({ business }) => {
  if (!business.contact && !business.social) return null
  
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-bazari-dark mb-4">
        Contato
      </h3>
      
      <div className="space-y-3">
        {business.contact?.phone && (
          <div className="flex items-center space-x-3">
            <Phone size={16} className="text-bazari-primary" />
            <span className="text-sm text-bazari-dark">
              {business.contact.phone}
            </span>
          </div>
        )}
        
        {business.contact?.email && (
          <div className="flex items-center space-x-3">
            <Mail size={16} className="text-bazari-primary" />
            <span className="text-sm text-bazari-dark">
              {business.contact.email}
            </span>
          </div>
        )}
        
        {business.contact?.website && (
          <div className="flex items-center space-x-3">
            <Globe size={16} className="text-bazari-primary" />
            <a
              href={business.contact.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-bazari-primary hover:underline"
            >
              Website
            </a>
          </div>
        )}
        
        {(business.social?.instagram || business.social?.twitter) && (
          <div className="pt-3 border-t border-bazari-primary/10">
            <div className="flex space-x-3">
              {business.social?.instagram && (
                <a
                  href={`https://instagram.com/${business.social.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bazari-primary hover:text-bazari-primary-hover"
                >
                  <Instagram size={18} />
                </a>
              )}
              {business.social?.twitter && (
                <a
                  href={`https://twitter.com/${business.social.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bazari-primary hover:text-bazari-primary-hover"
                >
                  <Twitter size={18} />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

const BusinessStatsCard = ({ business }) => {
  const stats = business.stats || {}
  
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-bazari-dark mb-4">
        Estatísticas
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye size={16} className="text-bazari-primary" />
            <span className="text-sm text-bazari-dark/70">Visualizações</span>
          </div>
          <span className="font-medium text-bazari-dark">
            {stats.views || 0}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users size={16} className="text-bazari-primary" />
            <span className="text-sm text-bazari-dark/70">Seguidores</span>
          </div>
          <span className="font-medium text-bazari-dark">
            {stats.followers || 0}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package size={16} className="text-bazari-primary" />
            <span className="text-sm text-bazari-dark/70">Vendas</span>
          </div>
          <span className="font-medium text-bazari-dark">
            {stats.sales || 0}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star size={16} className="text-bazari-primary" />
            <span className="text-sm text-bazari-dark/70">Avaliações</span>
          </div>
          <span className="font-medium text-bazari-dark">
            {stats.reviews || 0}
          </span>
        </div>
      </div>
    </Card>
  )
}

const QuickActionsCard = ({ business, isOwner }) => {
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-bazari-dark mb-4">
        Ações Rápidas
      </h3>
      
      <div className="space-y-3">
        {isOwner ? (
          <>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Edit size={14} className="mr-2" />
              Editar Negócio
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Plus size={14} className="mr-2" />
              Adicionar Produto
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <TrendingUp size={14} className="mr-2" />
              Ver Analytics
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <MessageCircle size={14} className="mr-2" />
              Entrar em Contato
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Users size={14} className="mr-2" />
              Seguir Negócio
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Award size={14} className="mr-2" />
              Avaliar Negócio
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}

// ===============================
// MODAL COMPONENTS
// ===============================
const ShareModal = ({ show, onClose, business }) => {
  if (!show) return null
  
  const shareUrl = `${window.location.origin}/marketplace/business/${business.id}`
  const shareText = `Confira ${business.name} no Marketplace Bazari!`
  
  return (
    <Modal size="sm" onClose={onClose}>
      <div className="p-6 text-center">
        <h3 className="text-lg font-bold text-bazari-dark mb-4">
          Compartilhar Negócio
        </h3>
        
        <div className="space-y-4">
          <div className="p-3 bg-bazari-light rounded-lg text-sm font-mono text-bazari-dark">
            {shareUrl}
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigator.clipboard.writeText(shareUrl)}
            >
              Copiar Link
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: business.name,
                    text: shareText,
                    url: shareUrl
                  })
                }
              }}
            >
              Compartilhar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

const ReportModal = ({ show, onClose, business }) => {
  if (!show) return null
  
  return (
    <Modal size="sm" onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-bold text-bazari-dark mb-4">
          Reportar Negócio
        </h3>
        
        <p className="text-sm text-bazari-dark/70 mb-6">
          Por que você está reportando este negócio?
        </p>
        
        <div className="space-y-3 mb-6">
          {[
            'Informações incorretas',
            'Conteúdo inadequado',
            'Spam ou fraude',
            'Violação de direitos',
            'Outro motivo'
          ].map(reason => (
            <label key={reason} className="flex items-center space-x-3">
              <input type="radio" name="reason" className="text-bazari-primary" />
              <span className="text-sm text-bazari-dark">{reason}</span>
            </label>
          ))}
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={onClose} className="flex-1">
            Enviar Report
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ===============================
// STATE COMPONENTS
// ===============================
const LoadingState = () => (
  <div className="min-h-screen bg-bazari-light flex items-center justify-center">
    <div className="text-center">
      <Loading size="lg" />
      <p className="mt-4 text-bazari-dark/60">Carregando negócio...</p>
    </div>
  </div>
)

const ErrorState = ({ error, onBack }) => (
  <div className="min-h-screen bg-bazari-light flex items-center justify-center">
    <div className="text-center max-w-md mx-auto px-4">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ExternalLink className="w-10 h-10 text-red-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-bazari-dark mb-4">
        Negócio não encontrado
      </h2>
      
      <p className="text-bazari-dark/60 mb-8">
        {error || 'O negócio que você está procurando não existe ou foi removido.'}
      </p>
      
      <Button onClick={onBack}>
        <ArrowLeft size={16} className="mr-2" />
        Voltar ao Marketplace
      </Button>
    </div>
  </div>
)

export default BusinessView