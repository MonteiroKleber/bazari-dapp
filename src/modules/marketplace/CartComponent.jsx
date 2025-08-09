import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, Plus, Minus, X, Trash2, ArrowLeft,
  CreditCard, Wallet, QrCode, CheckCircle, AlertCircle,
  Package, Store, Clock, Shield, Coins, Receipt
} from 'lucide-react'
import { Button, Card, Badge, Input, Loading, Modal } from '@components/BaseComponents'
import { useCart, useOrders, useMarketplace } from './useMarketplaceStore'
import { useAuth } from '@modules/acesso/useAuthStore'
import { useTranslation } from '@i18n/useTranslation'

// ===============================
// CART COMPONENT
// ===============================
const CartComponent = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { navigateTo } = useMarketplace()
  const {
    cart,
    isLoadingCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart
  } = useCart()

  const [showCheckout, setShowCheckout] = React.useState(false)

  // Carregar carrinho ao montar componente
  React.useEffect(() => {
    // loadCart já é chamado automaticamente pelo store
  }, [])

  if (isLoadingCart) {
    return <LoadingState />
  }

  if (!cart.items || cart.items.length === 0) {
    return <EmptyCartState onContinueShopping={() => navigateTo('home')} />
  }

  return (
    <div className="min-h-screen bg-bazari-light">
      {/* Header */}
      <CartHeader 
        itemsCount={cart.items.length}
        onBack={() => navigateTo('home')}
        onClear={clearCart}
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2">
            <CartItemsList
              items={cart.items}
              onUpdateQuantity={updateCartItemQuantity}
              onRemoveItem={removeFromCart}
            />
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <CartSummary
              cart={cart}
              onCheckout={() => setShowCheckout(true)}
            />
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        show={showCheckout}
        onClose={() => setShowCheckout(false)}
        cart={cart}
      />
    </div>
  )
}

// ===============================
// CART HEADER
// ===============================
const CartHeader = ({ itemsCount, onBack, onClear }) => {
  const { t } = useTranslation()

  return (
    <header className="bg-white border-b border-bazari-primary/10 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft size={18} className="mr-1" />
              Voltar
            </Button>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-6 h-6 text-bazari-primary" />
              <h1 className="text-xl font-bold text-bazari-dark">
                Carrinho ({itemsCount})
              </h1>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={16} className="mr-1" />
            Limpar
          </Button>
        </div>
      </div>
    </header>
  )
}

// ===============================
// CART ITEMS LIST
// ===============================
const CartItemsList = ({ items, onUpdateQuantity, onRemoveItem }) => {
  // Agrupar itens por negócio
  const itemsByBusiness = React.useMemo(() => {
    const grouped = {}
    items.forEach(item => {
      if (!grouped[item.businessId]) {
        grouped[item.businessId] = []
      }
      grouped[item.businessId].push(item)
    })
    return grouped
  }, [items])

  return (
    <div className="space-y-6">
      {Object.entries(itemsByBusiness).map(([businessId, businessItems]) => (
        <BusinessCartSection
          key={businessId}
          businessId={businessId}
          items={businessItems}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
        />
      ))}
    </div>
  )
}

// ===============================
// BUSINESS CART SECTION
// ===============================
const BusinessCartSection = ({ businessId, items, onUpdateQuantity, onRemoveItem }) => {
  const [businessInfo, setBusinessInfo] = React.useState(null)
  
  // Mock business info - em um app real, isso viria do store
  React.useEffect(() => {
    // Simular busca de informações do negócio
    setBusinessInfo({
      id: businessId,
      name: 'Padaria do João',
      location: 'São Paulo, SP',
      verified: true
    })
  }, [businessId])

  const sectionTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <Card className="overflow-hidden">
      {/* Business Header */}
      <div className="p-4 bg-bazari-light/30 border-b border-bazari-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-bazari-primary rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-bazari-dark">
                  {businessInfo?.name || 'Carregando...'}
                </h3>
                {businessInfo?.verified && (
                  <Badge variant="success" size="sm">
                    <Shield size={10} className="mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
              <p className="text-sm text-bazari-dark/60">
                {businessInfo?.location || ''}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-bazari-primary">
              {sectionTotal.toFixed(2)} BZR
            </div>
            <div className="text-xs text-bazari-dark/60">
              {items.length} {items.length === 1 ? 'item' : 'itens'}
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="p-4 space-y-4">
        <AnimatePresence>
          {items.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemoveItem}
            />
          ))}
        </AnimatePresence>
      </div>
    </Card>
  )
}

// ===============================
// CART ITEM
// ===============================
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [isUpdating, setIsUpdating] = React.useState(false)

  const handleQuantityChange = async (newQuantity) => {
    setIsUpdating(true)
    await onUpdateQuantity(item.id, newQuantity)
    setIsUpdating(false)
  }

  const handleRemove = async () => {
    setIsUpdating(true)
    await onRemove(item.id)
  }

  const itemTotal = item.price * item.quantity

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, height: 0 }}
      className="flex space-x-4 p-4 bg-white rounded-lg border border-bazari-primary/10 hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="w-20 h-20 bg-bazari-light rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={item.image || `https://picsum.photos/80/80?random=${item.productId}`}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-bazari-dark line-clamp-2">
            {item.name}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUpdating}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 ml-2"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Options */}
        {item.options && Object.keys(item.options).length > 0 && (
          <div className="mb-3">
            {Object.entries(item.options).map(([key, value]) => (
              <div key={key} className="text-xs text-bazari-dark/60">
                {key}: {value}
              </div>
            ))}
          </div>
        )}

        {/* Quantity and Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-bazari-dark/60">Quantidade:</span>
            
            {/* Quantity Controls */}
            <div className="flex items-center space-x-2 bg-bazari-light rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange(Math.max(0, item.quantity - 1))}
                disabled={isUpdating || item.quantity <= 1}
                className="w-8 h-8 p-0"
              >
                <Minus size={14} />
              </Button>
              
              <span className="w-12 text-center text-sm font-medium">
                {isUpdating ? (
                  <Loading size="sm" />
                ) : (
                  item.quantity
                )}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating}
                className="w-8 h-8 p-0"
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="text-sm text-bazari-dark/60">
              {item.price.toFixed(2)} BZR × {item.quantity}
            </div>
            <div className="font-bold text-bazari-primary">
              {itemTotal.toFixed(2)} BZR
            </div>
          </div>
        </div>

        {/* Added time */}
        <div className="flex items-center text-xs text-bazari-dark/40 mt-2">
          <Clock size={10} className="mr-1" />
          Adicionado {new Date(item.addedAt).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  )
}

// ===============================
// CART SUMMARY
// ===============================
const CartSummary = ({ cart, onCheckout }) => {
  const [promoCode, setPromoCode] = React.useState('')
  const [discount, setDiscount] = React.useState(0)
  
  const subtotal = cart.total || 0
  const discountAmount = subtotal * discount
  const total = subtotal - discountAmount
  
  const handleApplyPromo = () => {
    // Mock promo code validation
    if (promoCode.toLowerCase() === 'bazari10') {
      setDiscount(0.1) // 10% discount
    } else {
      setDiscount(0)
    }
  }

  return (
    <div className="sticky top-24">
      <Card className="p-6">
        <h3 className="text-lg font-bold text-bazari-dark mb-6">
          Resumo do Pedido
        </h3>

        {/* Items Summary */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-bazari-dark/70">
              Subtotal ({cart.items?.length || 0} {cart.items?.length === 1 ? 'item' : 'itens'})
            </span>
            <span className="font-medium text-bazari-dark">
              {subtotal.toFixed(2)} BZR
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">
                Desconto ({(discount * 100).toFixed(0)}%)
              </span>
              <span className="font-medium text-green-600">
                -{discountAmount.toFixed(2)} BZR
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-bazari-dark/70">Taxa de transação</span>
            <span className="font-medium text-bazari-dark">Grátis</span>
          </div>
        </div>

        {/* Promo Code */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-bazari-dark mb-2">
            Código promocional
          </label>
          <div className="flex space-x-2">
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Insira o código"
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={handleApplyPromo}>
              Aplicar
            </Button>
          </div>
          {discount > 0 && (
            <p className="text-sm text-green-600 mt-1">
              Código aplicado com sucesso!
            </p>
          )}
        </div>

        {/* Total */}
        <div className="border-t border-bazari-primary/10 pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-bazari-dark">Total</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-bazari-primary">
                {total.toFixed(2)} BZR
              </div>
              <div className="text-sm text-bazari-dark/60">
                ≈ R$ {(total * 5.5).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          onClick={onCheckout}
          size="lg"
          className="w-full mb-4"
        >
          <CreditCard size={18} className="mr-2" />
          Finalizar Compra
        </Button>

        {/* Payment Info */}
        <div className="bg-bazari-light/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-bazari-primary" />
            <span className="text-sm font-medium text-bazari-dark">
              Pagamento Seguro
            </span>
          </div>
          <p className="text-xs text-bazari-dark/60">
            Transações processadas na blockchain BazariChain com total segurança e transparência.
          </p>
        </div>
      </Card>
    </div>
  )
}

// ===============================
// CHECKOUT MODAL
// ===============================
const CheckoutModal = ({ show, onClose, cart }) => {
  const { user } = useAuth()
  const { createOrder } = useOrders()
  const [currentStep, setCurrentStep] = React.useState(1) // 1: Payment, 2: Confirmation, 3: Success
  const [paymentMethod, setPaymentMethod] = React.useState('bzr_wallet')
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [orderResult, setOrderResult] = React.useState(null)

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const orderData = {
        userId: user?.id,
        paymentMethod,
        paymentStatus: 'completed',
        customerInfo: {
          name: user?.name,
          email: user?.email
        }
      }

      const result = await createOrder(orderData)
      
      if (result.success) {
        setOrderResult(result.order)
        setCurrentStep(3)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Payment error:', error)
      // Handle error
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setOrderResult(null)
    onClose()
  }

  if (!show) return null

  return (
    <Modal size="lg" onClose={handleClose}>
      <div className="p-6">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <PaymentStep
              cart={cart}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              onNext={() => setCurrentStep(2)}
              onClose={handleClose}
            />
          )}
          
          {currentStep === 2 && (
            <ConfirmationStep
              cart={cart}
              paymentMethod={paymentMethod}
              isProcessing={isProcessing}
              onConfirm={handlePayment}
              onBack={() => setCurrentStep(1)}
            />
          )}
          
          {currentStep === 3 && orderResult && (
            <SuccessStep
              order={orderResult}
              onClose={handleClose}
            />
          )}
        </AnimatePresence>
      </div>
    </Modal>
  )
}

// ===============================
// PAYMENT STEP
// ===============================
const PaymentStep = ({ cart, paymentMethod, setPaymentMethod, onNext, onClose }) => {
  const paymentMethods = [
    {
      id: 'bzr_wallet',
      name: 'Carteira BZR',
      description: 'Pague com seus tokens BZR',
      icon: <Wallet className="w-5 h-5" />,
      available: true
    },
    {
      id: 'crypto',
      name: 'Criptomoedas',
      description: 'BTC, ETH, USDT e outras',
      icon: <Coins className="w-5 h-5" />,
      available: false
    },
    {
      id: 'pix',
      name: 'PIX',
      description: 'Pagamento instantâneo',
      icon: <QrCode className="w-5 h-5" />,
      available: false
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-bazari-dark">
          Método de Pagamento
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4 mb-6">
        {paymentMethods.map(method => (
          <div
            key={method.id}
            className={`
              p-4 border-2 rounded-xl cursor-pointer transition-all
              ${paymentMethod === method.id
                ? 'border-bazari-primary bg-bazari-primary/5'
                : 'border-bazari-primary/20 hover:border-bazari-primary/40'
              }
              ${!method.available && 'opacity-50 cursor-not-allowed'}
            `}
            onClick={() => method.available && setPaymentMethod(method.id)}
          >
            <div className="flex items-center space-x-3">
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center
                ${paymentMethod === method.id 
                  ? 'bg-bazari-primary text-white' 
                  : 'bg-bazari-light text-bazari-primary'
                }
              `}>
                {method.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-bazari-dark">
                    {method.name}
                  </h3>
                  {!method.available && (
                    <Badge variant="outline" size="sm">Em breve</Badge>
                  )}
                </div>
                <p className="text-sm text-bazari-dark/60">
                  {method.description}
                </p>
              </div>
              {paymentMethod === method.id && (
                <CheckCircle className="w-5 h-5 text-bazari-primary" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="bg-bazari-light/30 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-bazari-dark mb-3">Resumo</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-bazari-dark/70">
              {cart.items?.length || 0} itens
            </span>
            <span>{cart.total?.toFixed(2)} BZR</span>
          </div>
          <div className="flex justify-between font-medium text-bazari-dark">
            <span>Total</span>
            <span>{cart.total?.toFixed(2)} BZR</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={onNext}
          disabled={!paymentMethod || !paymentMethods.find(m => m.id === paymentMethod)?.available}
        >
          Continuar
        </Button>
      </div>
    </motion.div>
  )
}

// ===============================
// CONFIRMATION STEP
// ===============================
const ConfirmationStep = ({ cart, paymentMethod, isProcessing, onConfirm, onBack }) => {
  const getPaymentMethodName = () => {
    switch (paymentMethod) {
      case 'bzr_wallet': return 'Carteira BZR'
      case 'crypto': return 'Criptomoedas'
      case 'pix': return 'PIX'
      default: return 'Método desconhecido'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-bazari-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-8 h-8 text-bazari-primary" />
        </div>
        <h2 className="text-xl font-bold text-bazari-dark mb-2">
          Confirmar Pagamento
        </h2>
        <p className="text-bazari-dark/60">
          Revise os detalhes do seu pedido antes de finalizar
        </p>
      </div>

      {/* Order Details */}
      <div className="space-y-4 mb-6">
        <div className="bg-white rounded-lg border border-bazari-primary/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-bazari-dark">Itens do Pedido</h4>
            <span className="text-sm text-bazari-dark/60">
              {cart.items?.length || 0} {cart.items?.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {cart.items?.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-bazari-dark/70 line-clamp-1">
                  {item.quantity}× {item.name}
                </span>
                <span className="text-bazari-dark">
                  {(item.price * item.quantity).toFixed(2)} BZR
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-bazari-primary/10 p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-bazari-dark">Método de Pagamento</span>
            <div className="flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-bazari-primary" />
              <span className="text-bazari-dark">{getPaymentMethodName()}</span>
            </div>
          </div>
        </div>

        <div className="bg-bazari-primary/5 rounded-lg p-4 border border-bazari-primary/20">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-bazari-dark">Total a Pagar</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-bazari-primary">
                {cart.total?.toFixed(2)} BZR
              </div>
              <div className="text-sm text-bazari-dark/60">
                ≈ R$ {((cart.total || 0) * 5.5).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="text-center py-8">
          <Loading size="lg" />
          <p className="text-bazari-dark/60 mt-4">
            Processando pagamento...
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          Voltar
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isProcessing}
          className="min-w-[140px]"
        >
          {isProcessing ? <Loading size="sm" /> : 'Confirmar Pagamento'}
        </Button>
      </div>
    </motion.div>
  )
}

// ===============================
// SUCCESS STEP
// ===============================
const SuccessStep = ({ order, onClose }) => {
  const { navigateTo } = useMarketplace()

  const handleViewOrder = () => {
    onClose()
    navigateTo('orders')
  }

  const handleContinueShopping = () => {
    onClose()
    navigateTo('home')
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>

      <h2 className="text-2xl font-bold text-bazari-dark mb-2">
        Pedido Realizado com Sucesso!
      </h2>
      
      <p className="text-bazari-dark/60 mb-6">
        Seu pedido foi processado e os vendedores foram notificados.
      </p>

      {/* Order Info */}
      <div className="bg-bazari-light/30 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-bazari-dark/60">Número do Pedido</span>
            <div className="font-medium text-bazari-dark">#{order.id.slice(-8).toUpperCase()}</div>
          </div>
          <div>
            <span className="text-bazari-dark/60">Total Pago</span>
            <div className="font-bold text-bazari-primary">{order.total?.toFixed(2)} BZR</div>
          </div>
          <div>
            <span className="text-bazari-dark/60">Data</span>
            <div className="font-medium text-bazari-dark">
              {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div>
            <span className="text-bazari-dark/60">Status</span>
            <Badge variant="warning" size="sm">Processando</Badge>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button onClick={handleViewOrder} size="lg" className="w-full">
          <Receipt size={18} className="mr-2" />
          Ver Detalhes do Pedido
        </Button>
        
        <Button
          variant="outline"
          onClick={handleContinueShopping}
          size="lg"
          className="w-full"
        >
          Continuar Comprando
        </Button>
      </div>

      <p className="text-xs text-bazari-dark/60 mt-6">
        Você receberá uma notificação quando seu pedido for atualizado.
      </p>
    </motion.div>
  )
}

// ===============================
// EMPTY CART STATE
// ===============================
const EmptyCartState = ({ onContinueShopping }) => {
  return (
    <div className="min-h-screen bg-bazari-light flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-24 h-24 bg-bazari-light rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-12 h-12 text-bazari-dark/40" />
        </div>
        
        <h2 className="text-2xl font-bold text-bazari-dark mb-4">
          Seu carrinho está vazio
        </h2>
        
        <p className="text-bazari-dark/60 mb-8">
          Explore o marketplace e adicione produtos incríveis ao seu carrinho.
        </p>
        
        <div className="space-y-3">
          <Button onClick={onContinueShopping} size="lg" className="w-full">
            <Package size={18} className="mr-2" />
            Explorar Produtos
          </Button>
        </div>
      </div>
    </div>
  )
}

// ===============================
// LOADING STATE
// ===============================
const LoadingState = () => (
  <div className="min-h-screen bg-bazari-light flex items-center justify-center">
    <div className="text-center">
      <Loading size="lg" />
      <p className="mt-4 text-bazari-dark/60">Carregando carrinho...</p>
    </div>
  </div>
)

export default CartComponent