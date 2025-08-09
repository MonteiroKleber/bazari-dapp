import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Share, Heart, Star, Store, ShoppingCart, Plus, Minus,
  Package, Eye, Clock, Shield, Flag, Camera, Zap, Truck, Award,
  MessageCircle, ThumbsUp, ThumbsDown, MoreHorizontal, ExternalLink,
  AlertCircle, CheckCircle, Info, Tag, Coins, Users
} from 'lucide-react'
import { Button, Card, Badge, Avatar, Loading, Modal, Input } from '@components/BaseComponents'
import { useProducts, useBusinesses, useCart, useFavorites, useMarketplace } from './useMarketplaceStore'
import { useAuth } from '@modules/acesso/useAuthStore'
import { useTranslation } from '@i18n/useTranslation'

// ===============================
// PRODUCT VIEW COMPONENT
// ===============================
const ProductView = ({ productId }) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { navigateTo } = useMarketplace()
  const { 
    selectedProduct,
    loadProduct,
    isLoading,
    error
  } = useProducts()
  
  const { 
    businesses,
    loadBusiness
  } = useBusinesses()
  
  const { addToCart, cart } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  
  const [quantity, setQuantity] = React.useState(1)
  const [selectedVariant, setSelectedVariant] = React.useState(null)
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  const [showShareModal, setShowShareModal] = React.useState(false)
  const [showReportModal, setShowReportModal] = React.useState(false)

  // Carregar dados do produto
  React.useEffect(() => {
    if (productId) {
      loadProduct(productId)
    }
  }, [productId])

  // Carregar dados do negócio quando produto for carregado
  React.useEffect(() => {
    if (selectedProduct?.businessId) {
      loadBusiness(selectedProduct.businessId)
    }
  }, [selectedProduct])

  if (isLoading) {
    return <LoadingState />
  }

  if (error || !selectedProduct) {
    return <ErrorState error={error} onBack={() => navigateTo('home')} />
  }

  const product = selectedProduct
  const business = businesses.find(b => b.id === product.businessId)
  const isOwner = user?.id === business?.ownerId
  const isProductFavorite = isFavorite(productId, 'product')
  const images = product.images || []

  return (
    <div className="min-h-screen bg-bazari-light">
      {/* Header */}
      <ProductHeader
        product={product}
        business={business}
        isOwner={isOwner}
        isFavorite={isProductFavorite}
        onBack={() => navigateTo('home')}
        onShare={() => setShowShareModal(true)}
        onFavorite={() => toggleFavorite(productId, 'product')}
        onReport={() => setShowReportModal(true)}
      />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <ProductImageGallery
              images={images}
              productName={product.name}
              currentIndex={currentImageIndex}
              onIndexChange={setCurrentImageIndex}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <ProductInfo product={product} business={business} />
            
            <ProductOptions
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              selectedVariant={selectedVariant}
              setSelectedVariant={setSelectedVariant}
            />
            
            <ProductActions
              product={product}
              quantity={quantity}
              selectedVariant={selectedVariant}
              onAddToCart={() => addToCart(product.id, quantity, selectedVariant)}
              cart={cart}
              isOwner={isOwner}
            />
            
            {business && (
              <SellerInfo 
                business={business} 
                onViewBusiness={() => navigateTo('business', { selectedBusiness: business })}
              />
            )}
          </div>
        </div>

        {/* Additional Sections */}
        <div className="mt-12 space-y-8">
          <ProductDetails product={product} />
          <ProductReviews product={product} />
          <RelatedProducts product={product} />
        </div>
      </div>

      {/* Modals */}
      <ShareModal 
        show={showShareModal}
        onClose={() => setShowShareModal(false)}
        product={product}
      />
      
      <ReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        product={product}
      />
    </div>
  )
}

// ===============================
// PRODUCT HEADER
// ===============================
const ProductHeader = ({ 
  product, 
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
            
            <div>
              <h1 className="text-xl font-bold text-bazari-dark line-clamp-1">
                {product.name}
              </h1>
              {business && (
                <div className="flex items-center text-sm text-bazari-dark/60">
                  <Store size={14} className="mr-1" />
                  {business.name}
                  {business.verified && (
                    <Shield size={12} className="ml-1 text-green-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onShare}>
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
                <MoreHorizontal size={16} />
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
                      Reportar produto
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
// PRODUCT IMAGE GALLERY
// ===============================
const ProductImageGallery = ({ images, productName, currentIndex, onIndexChange }) => {
  if (images.length === 0) {
    images = [`https://picsum.photos/600/600?random=${Math.random()}`]
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-bazari-light rounded-xl overflow-hidden">
        <img
          src={images[currentIndex]}
          alt={productName}
          className="w-full h-full object-cover"
        />
        
        {images.length > 1 && (
          <>
            {/* Navigation Arrows */}
            <div className="absolute inset-0 flex items-center justify-between p-4">
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/20 text-white hover:bg-black/40"
                onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
              >
                <ArrowLeft size={16} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/20 text-white hover:bg-black/40"
                onClick={() => onIndexChange(Math.min(images.length - 1, currentIndex + 1))}
                disabled={currentIndex === images.length - 1}
              >
                <ArrowLeft size={16} className="rotate-180" />
              </Button>
            </div>

            {/* Image Counter */}
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="bg-black/50 text-white border-white/20">
                <Camera size={12} className="mr-1" />
                {currentIndex + 1}/{images.length}
              </Badge>
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={`
                aspect-square bg-bazari-light rounded-lg overflow-hidden border-2 transition-colors
                ${currentIndex === index 
                  ? 'border-bazari-primary' 
                  : 'border-transparent hover:border-bazari-primary/50'
                }
              `}
              onClick={() => onIndexChange(index)}
            >
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ===============================
// PRODUCT INFO
// ===============================
const ProductInfo = ({ product, business }) => {
  return (
    <div className="space-y-6">
      {/* Title and Rating */}
      <div>
        <h1 className="text-2xl font-bold text-bazari-dark mb-2">
          {product.name}
        </h1>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                size={16}
                className={`${
                  star <= (product.stats?.rating || 0)
                    ? 'text-yellow-500 fill-current'
                    : 'text-bazari-dark/20'
                }`}
              />
            ))}
            <span className="text-sm text-bazari-dark/60 ml-2">
              ({product.stats?.reviews || 0} avaliações)
            </span>
          </div>
          
          <div className="flex items-center text-sm text-bazari-dark/60">
            <Eye size={14} className="mr-1" />
            {product.stats?.views || 0} visualizações
          </div>
        </div>

        <p className="text-bazari-dark/70 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Price */}
      <div className="bg-bazari-light/50 rounded-xl p-6 border border-bazari-primary/10">
        <div className="flex items-baseline space-x-3">
          <div className="text-3xl font-bold text-bazari-primary">
            {product.price?.toFixed(2)} BZR
          </div>
          
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="text-lg text-bazari-dark/50 line-through">
              {product.originalPrice.toFixed(2)} BZR
            </div>
          )}
        </div>
        
        <div className="text-sm text-bazari-dark/60 mt-1">
          ≈ R$ {((product.price || 0) * 5.5).toFixed(2)}
        </div>
        
        {product.originalPrice && product.originalPrice > product.price && (
          <Badge variant="success" size="sm" className="mt-2">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </Badge>
        )}
      </div>

      {/* Key Features */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-bazari-dark/70">
          <Package size={16} className="text-green-500" />
          <span>Em estoque</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-bazari-dark/70">
          <Truck size={16} className="text-blue-500" />
          <span>Entrega rápida disponível</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-bazari-dark/70">
          <Shield size={16} className="text-bazari-primary" />
          <span>Garantia do vendedor</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-bazari-dark/70">
          <Award size={16} className="text-purple-500" />
          <span>Produto verificado</span>
        </div>
      </div>
    </div>
  )
}

// ===============================
// PRODUCT OPTIONS
// ===============================
const ProductOptions = ({ 
  product, 
  quantity, 
  setQuantity, 
  selectedVariant, 
  setSelectedVariant 
}) => {
  // Mock variants - in real app, this would come from product data
  const variants = product.variants || [
    { id: 'default', name: 'Padrão', price: product.price, available: true }
  ]

  const availableVariants = variants.filter(v => v.available)

  return (
    <div className="space-y-6">
      {/* Variants */}
      {variants.length > 1 && (
        <div>
          <h3 className="font-semibold text-bazari-dark mb-3">
            Opções disponíveis
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {variants.map(variant => (
              <button
                key={variant.id}
                className={`
                  p-3 border-2 rounded-lg text-left transition-colors
                  ${selectedVariant?.id === variant.id
                    ? 'border-bazari-primary bg-bazari-primary/5'
                    : 'border-bazari-primary/20 hover:border-bazari-primary/40'
                  }
                  ${!variant.available && 'opacity-50 cursor-not-allowed'}
                `}
                onClick={() => variant.available && setSelectedVariant(variant)}
                disabled={!variant.available}
              >
                <div className="font-medium text-sm text-bazari-dark">
                  {variant.name}
                </div>
                {variant.price !== product.price && (
                  <div className="text-xs text-bazari-primary">
                    +{(variant.price - product.price).toFixed(2)} BZR
                  </div>
                )}
                {!variant.available && (
                  <div className="text-xs text-red-600">Indisponível</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <h3 className="font-semibold text-bazari-dark mb-3">Quantidade</h3>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-bazari-light rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10"
            >
              <Minus size={16} />
            </Button>
            
            <div className="w-16 text-center font-medium">
              {quantity}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10"
            >
              <Plus size={16} />
            </Button>
          </div>
          
          <div className="text-sm text-bazari-dark/60">
            Estoque: {product.stock || 99}+ unidades
          </div>
        </div>
      </div>
    </div>
  )
}

// ===============================
// PRODUCT ACTIONS
// ===============================
const ProductActions = ({ 
  product, 
  quantity, 
  selectedVariant, 
  onAddToCart, 
  cart, 
  isOwner 
}) => {
  const [isAdding, setIsAdding] = React.useState(false)
  
  const handleAddToCart = async () => {
    setIsAdding(true)
    await onAddToCart()
    setIsAdding(false)
  }

  const totalPrice = (selectedVariant?.price || product.price) * quantity
  const isInCart = cart.items?.some(item => item.productId === product.id)

  return (
    <div className="space-y-4">
      {/* Price Summary */}
      <div className="bg-white rounded-lg border border-bazari-primary/10 p-4">
        <div className="flex justify-between items-center">
          <span className="text-bazari-dark/70">Total ({quantity}x)</span>
          <div className="text-right">
            <div className="text-xl font-bold text-bazari-primary">
              {totalPrice.toFixed(2)} BZR
            </div>
            <div className="text-sm text-bazari-dark/60">
              ≈ R$ {(totalPrice * 5.5).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {isOwner ? (
          <div className="space-y-2">
            <Button className="w-full" size="lg">
              Editar Produto
            </Button>
            <Button variant="outline" className="w-full">
              Ver Estatísticas
            </Button>
          </div>
        ) : (
          <>
            <Button
              onClick={handleAddToCart}
              disabled={isAdding || !product.stock}
              className="w-full"
              size="lg"
            >
              {isAdding ? (
                <Loading size="sm" />
              ) : (
                <>
                  <ShoppingCart size={18} className="mr-2" />
                  {isInCart ? 'Adicionar Mais' : 'Adicionar ao Carrinho'}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Zap size={18} className="mr-2" />
              Comprar Agora
            </Button>
          </>
        )}
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              Pagamento Seguro
            </h4>
            <p className="text-sm text-blue-800">
              Todas as transações são processadas com segurança na blockchain BazariChain.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===============================
// SELLER INFO
// ===============================
const SellerInfo = ({ business, onViewBusiness }) => {
  return (
    <Card className="p-6">
      <div className="flex items-start space-x-4">
        <Avatar
          src={business.images?.[0]}
          alt={business.name}
          size="md"
          fallback={business.name?.[0]}
        />
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-bazari-dark">
              {business.name}
            </h3>
            {business.verified && (
              <Badge variant="success" size="sm">
                <Shield size={10} className="mr-1" />
                Verificado
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-bazari-dark/60 mb-3">
            <div className="flex items-center">
              <Star size={14} className="mr-1 text-yellow-500" />
              {business.stats?.rating?.toFixed(1) || '0.0'}
            </div>
            <div className="flex items-center">
              <Eye size={14} className="mr-1" />
              {business.stats?.views || 0} views
            </div>
            <div className="flex items-center">
              <Package size={14} className="mr-1" />
              {business.stats?.sales || 0} vendas
            </div>
          </div>
          
          <p className="text-sm text-bazari-dark/70 mb-4 line-clamp-2">
            {business.description}
          </p>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewBusiness}
            >
              <Store size={14} className="mr-1" />
              Ver Loja
            </Button>
            
            <Button
              variant="outline"
              size="sm"
            >
              <MessageCircle size={14} className="mr-1" />
              Contatar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ===============================
// PRODUCT DETAILS
// ===============================
const ProductDetails = ({ product }) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-bazari-dark mb-6">
        Detalhes do Produto
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Specifications */}
        <div>
          <h3 className="font-semibold text-bazari-dark mb-4">
            Especificações
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-bazari-primary/10">
              <span className="text-bazari-dark/70">Categoria</span>
              <span className="text-bazari-dark">
                {product.categories?.[0]?.split('.').pop() || 'Geral'}
              </span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-bazari-primary/10">
              <span className="text-bazari-dark/70">Disponibilidade</span>
              <span className="text-green-600">Em estoque</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-bazari-primary/10">
              <span className="text-bazari-dark/70">Vendido por</span>
              <span className="text-bazari-dark">{product.businessId}</span>
            </div>
            
            {product.unit && (
              <div className="flex justify-between py-2 border-b border-bazari-primary/10">
                <span className="text-bazari-dark/70">Unidade</span>
                <span className="text-bazari-dark">{product.unit}</span>
              </div>
            )}
            
            {product.warranty && (
              <div className="flex justify-between py-2 border-b border-bazari-primary/10">
                <span className="text-bazari-dark/70">Garantia</span>
                <span className="text-bazari-dark">{product.warranty}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Tags */}
        <div>
          <h3 className="font-semibold text-bazari-dark mb-4">
            Tags
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {(product.tags || ['qualidade', 'popular', 'recomendado']).map(tag => (
              <Badge key={tag} variant="outline">
                <Tag size={12} className="mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

// ===============================
// PRODUCT REVIEWS
// ===============================
const ProductReviews = ({ product }) => {
  const reviews = [
    {
      id: 1,
      user: { name: 'Ana Costa', avatar: null },
      rating: 5,
      comment: 'Produto excelente! Chegou rápido e exatamente como esperado.',
      date: '2024-01-20',
      helpful: 12,
      images: []
    },
    {
      id: 2,
      user: { name: 'Carlos Silva', avatar: null },
      rating: 4,
      comment: 'Boa qualidade, recomendo. Só achei o preço um pouco alto.',
      date: '2024-01-18',
      helpful: 8,
      images: []
    }
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-bazari-dark">
          Avaliações ({reviews.length})
        </h2>
        
        <Button variant="outline" size="sm">
          Escrever Avaliação
        </Button>
      </div>
      
      {/* Rating Summary */}
      <div className="flex items-center space-x-8 mb-8 pb-6 border-b border-bazari-primary/10">
        <div className="text-center">
          <div className="text-3xl font-bold text-bazari-primary">
            {product.stats?.rating?.toFixed(1) || '0.0'}
          </div>
          <div className="flex items-center justify-center mt-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                size={16}
                className={`${
                  star <= (product.stats?.rating || 0)
                    ? 'text-yellow-500 fill-current'
                    : 'text-bazari-dark/20'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-bazari-dark/60 mt-1">
            {product.stats?.reviews || 0} avaliações
          </div>
        </div>
        
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center space-x-3 mb-2">
              <span className="text-sm text-bazari-dark/60 w-8">
                {rating}★
              </span>
              <div className="flex-1 bg-bazari-light rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ 
                    width: `${rating === 5 ? 60 : rating === 4 ? 30 : 10}%` 
                  }}
                />
              </div>
              <span className="text-sm text-bazari-dark/60 w-8">
                {rating === 5 ? 6 : rating === 4 ? 3 : 1}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map(review => (
          <div key={review.id} className="border-b border-bazari-primary/10 pb-6 last:border-b-0 last:pb-0">
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
                
                <p className="text-bazari-dark/70 leading-relaxed mb-4">
                  {review.comment}
                </p>
                
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-1 text-sm text-bazari-dark/60 hover:text-bazari-dark">
                    <ThumbsUp size={14} />
                    <span>Útil ({review.helpful})</span>
                  </button>
                  
                  <button className="flex items-center space-x-1 text-sm text-bazari-dark/60 hover:text-bazari-dark">
                    <ThumbsDown size={14} />
                    <span>Não útil</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Load More */}
      <div className="text-center mt-6">
        <Button variant="outline">
          Carregar mais avaliações
        </Button>
      </div>
    </Card>
  )
}

// ===============================
// RELATED PRODUCTS
// ===============================
const RelatedProducts = ({ product }) => {
  // Mock related products
  const relatedProducts = [
    {
      id: 'related_1',
      name: 'Produto Relacionado 1',
      price: 15.99,
      images: [`https://picsum.photos/200/200?random=rel1`],
      stats: { rating: 4.5, reviews: 23 }
    },
    {
      id: 'related_2',
      name: 'Produto Relacionado 2',
      price: 22.50,
      images: [`https://picsum.photos/200/200?random=rel2`],
      stats: { rating: 4.2, reviews: 15 }
    },
    {
      id: 'related_3',
      name: 'Produto Relacionado 3',
      price: 8.75,
      images: [`https://picsum.photos/200/200?random=rel3`],
      stats: { rating: 4.8, reviews: 41 }
    }
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-bazari-dark">
        Produtos Relacionados
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedProducts.map(relatedProduct => (
          <Card key={relatedProduct.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="aspect-square bg-bazari-light overflow-hidden">
              <img
                src={relatedProduct.images[0]}
                alt={relatedProduct.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <div className="p-4">
              <h4 className="font-medium text-bazari-dark mb-2 line-clamp-2">
                {relatedProduct.name}
              </h4>
              
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-bold text-bazari-primary">
                  {relatedProduct.price.toFixed(2)} BZR
                </div>
                
                <div className="flex items-center text-sm text-bazari-dark/60">
                  <Star size={12} className="mr-1 text-yellow-500" />
                  {relatedProduct.stats.rating.toFixed(1)}
                </div>
              </div>
              
              <Button className="w-full" size="sm">
                <ShoppingCart size={14} className="mr-1" />
                Adicionar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ===============================
// MODAL COMPONENTS
// ===============================
const ShareModal = ({ show, onClose, product }) => {
  if (!show) return null
  
  const shareUrl = `${window.location.origin}/marketplace/product/${product.id}`
  const shareText = `Confira ${product.name} no Marketplace Bazari!`
  
  return (
    <Modal size="sm" onClose={onClose}>
      <div className="p-6 text-center">
        <h3 className="text-lg font-bold text-bazari-dark mb-4">
          Compartilhar Produto
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
                    title: product.name,
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

const ReportModal = ({ show, onClose, product }) => {
  if (!show) return null
  
  return (
    <Modal size="sm" onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-bold text-bazari-dark mb-4">
          Reportar Produto
        </h3>
        
        <p className="text-sm text-bazari-dark/70 mb-6">
          Por que você está reportando este produto?
        </p>
        
        <div className="space-y-3 mb-6">
          {[
            'Produto falsificado',
            'Informações incorretas',
            'Conteúdo inadequado',
            'Preço incorreto',
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
      <p className="mt-4 text-bazari-dark/60">Carregando produto...</p>
    </div>
  </div>
)

const ErrorState = ({ error, onBack }) => (
  <div className="min-h-screen bg-bazari-light flex items-center justify-center">
    <div className="text-center max-w-md mx-auto px-4">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Package className="w-10 h-10 text-red-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-bazari-dark mb-4">
        Produto não encontrado
      </h2>
      
      <p className="text-bazari-dark/60 mb-8">
        {error || 'O produto que você está procurando não existe ou foi removido.'}
      </p>
      
      <Button onClick={onBack}>
        <ArrowLeft size={16} className="mr-2" />
        Voltar ao Marketplace
      </Button>
    </div>
  </div>
)

export default ProductView