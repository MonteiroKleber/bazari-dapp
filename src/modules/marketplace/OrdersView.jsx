import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck,
  MapPin, Calendar, Receipt, Eye, Star, MessageCircle,
  RefreshCw, AlertCircle, ChevronRight, Filter, Search,
  Download, Share, MoreHorizontal, Package2, Store
} from 'lucide-react'
import { Button, Card, Badge, Avatar, Loading, Input, Modal } from '@components/BaseComponents'
import { useOrders, useMarketplace } from './useMarketplaceStore'
import { useAuth } from '@modules/acesso/useAuthStore'
import { useTranslation } from '@i18n/useTranslation'

// ===============================
// ORDERS VIEW COMPONENT
// ===============================
const OrdersView = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { navigateTo } = useMarketplace()
  const { 
    orders,
    loadOrders,
    isLoading,
    error
  } = useOrders()

  const [activeTab, setActiveTab] = React.useState('all') // all, pending, processing, completed, cancelled
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedOrder, setSelectedOrder] = React.useState(null)
  const [showOrderDetails, setShowOrderDetails] = React.useState(false)

  // Carregar pedidos ao montar componente
  React.useEffect(() => {
    if (user?.id) {
      loadOrders(user.id)
    }
  }, [user])

  // Filtrar pedidos por status
  const filteredOrders = React.useMemo(() => {
    let filtered = orders || []
    
    if (activeTab !== 'all') {
      filtered = filtered.filter(order => order.status === activeTab)
    }
    
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items?.some(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }
    
    return filtered
  }, [orders, activeTab, searchQuery])

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="min-h-screen bg-bazari-light">
      {/* Header */}
      <OrdersHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onBack={() => navigateTo('home')}
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <OrdersTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          orders={orders}
        />

        {/* Orders List */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {error ? (
              <ErrorState error={error} onRetry={() => loadOrders(user?.id)} />
            ) : filteredOrders.length === 0 ? (
              <EmptyOrdersState activeTab={activeTab} />
            ) : (
              <OrdersList
                orders={filteredOrders}
                onViewOrder={(order) => {
                  setSelectedOrder(order)
                  setShowOrderDetails(true)
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        show={showOrderDetails}
        order={selectedOrder}
        onClose={() => {
          setShowOrderDetails(false)
          setSelectedOrder(null)
        }}
      />
    </div>
  )
}

// ===============================
// ORDERS HEADER
// ===============================
const OrdersHeader = ({ searchQuery, setSearchQuery, onBack }) => {
  return (
    <header className="bg-white border-b border-bazari-primary/10 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={18} className="mr-1" />
            Voltar
          </Button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-bazari-primary rounded-xl flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-bazari-dark">
                Meus Pedidos
              </h1>
              <p className="text-sm text-bazari-dark/60">
                Acompanhe seus pedidos e compras
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
                placeholder="Buscar pedidos..."
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
// ORDERS TABS
// ===============================
const OrdersTabs = ({ activeTab, setActiveTab, orders }) => {
  const getOrdersCount = (status) => {
    if (status === 'all') return orders.length
    return orders.filter(order => order.status === status).length
  }

  const tabs = [
    { id: 'all', label: 'Todos', count: getOrdersCount('all') },
    { id: 'pending', label: 'Pendentes', count: getOrdersCount('pending') },
    { id: 'processing', label: 'Processando', count: getOrdersCount('processing') },
    { id: 'shipped', label: 'Enviados', count: getOrdersCount('shipped') },
    { id: 'delivered', label: 'Entregues', count: getOrdersCount('delivered') },
    { id: 'cancelled', label: 'Cancelados', count: getOrdersCount('cancelled') }
  ]

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-bazari-primary/10">
      <div className="flex space-x-1 bg-bazari-light rounded-lg p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-white text-bazari-primary shadow-sm'
                : 'text-bazari-dark/60 hover:text-bazari-dark'
              }
            `}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <Badge variant={activeTab === tab.id ? 'primary' : 'outline'} size="sm">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ===============================
// ORDERS LIST
// ===============================
const OrdersList = ({ orders, onViewOrder }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {orders.map(order => (
        <OrderCard
          key={order.id}
          order={order}
          onViewOrder={onViewOrder}
        />
      ))}
    </motion.div>
  )
}

// ===============================
// ORDER CARD
// ===============================
const OrderCard = ({ order, onViewOrder }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'Pendente', 
          variant: 'warning', 
          icon: Clock,
          description: 'Aguardando processamento'
        }
      case 'processing':
        return { 
          label: 'Processando', 
          variant: 'primary', 
          icon: Package,
          description: 'Preparando pedido'
        }
      case 'shipped':
        return { 
          label: 'Enviado', 
          variant: 'primary', 
          icon: Truck,
          description: 'Em transporte'
        }
      case 'delivered':
        return { 
          label: 'Entregue', 
          variant: 'success', 
          icon: CheckCircle,
          description: 'Pedido entregue'
        }
      case 'cancelled':
        return { 
          label: 'Cancelado', 
          variant: 'error', 
          icon: XCircle,
          description: 'Pedido cancelado'
        }
      default:
        return { 
          label: 'Desconhecido', 
          variant: 'outline', 
          icon: AlertCircle,
          description: ''
        }
    }
  }

  const statusConfig = getStatusConfig(order.status)
  const StatusIcon = statusConfig.icon
  const itemsCount = order.items?.length || 0
  const firstItems = order.items?.slice(0, 3) || []

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-bold text-bazari-dark">
                Pedido #{order.id.slice(-8).toUpperCase()}
              </h3>
              <Badge variant={statusConfig.variant} size="sm">
                <StatusIcon size={12} className="mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-bazari-dark/60">
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                {new Date(order.createdAt).toLocaleDateString('pt-BR')}
              </div>
              <div className="flex items-center">
                <Package2 size={14} className="mr-1" />
                {itemsCount} {itemsCount === 1 ? 'item' : 'itens'}
              </div>
            </div>
            
            {statusConfig.description && (
              <p className="text-sm text-bazari-dark/60 mt-1">
                {statusConfig.description}
              </p>
            )}
          </div>

          <div className="text-right">
            <div className="text-xl font-bold text-bazari-primary">
              {order.total?.toFixed(2)} BZR
            </div>
            <div className="text-sm text-bazari-dark/60">
              Total do pedido
            </div>
          </div>
        </div>

        {/* Items Preview */}
        <div className="border-t border-bazari-primary/10 pt-4">
          <div className="flex items-center space-x-4">
            {/* Items Images */}
            <div className="flex -space-x-2">
              {firstItems.map((item, index) => (
                <div
                  key={index}
                  className="w-12 h-12 bg-bazari-light rounded-lg overflow-hidden border-2 border-white"
                >
                  <img
                    src={item.image || `https://picsum.photos/48/48?random=${item.id}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {itemsCount > 3 && (
                <div className="w-12 h-12 bg-bazari-primary/10 rounded-lg border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-medium text-bazari-primary">
                    +{itemsCount - 3}
                  </span>
                </div>
              )}
            </div>

            {/* Items Names */}
            <div className="flex-1">
              <div className="text-sm text-bazari-dark font-medium">
                {firstItems.map(item => item.name).join(', ')}
                {itemsCount > 3 && ` e mais ${itemsCount - 3} ${itemsCount - 3 === 1 ? 'item' : 'itens'}`}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-bazari-primary/10">
          <div className="flex space-x-3">
            {order.status === 'delivered' && (
              <Button variant="outline" size="sm">
                <Star size={14} className="mr-1" />
                Avaliar
              </Button>
            )}
            
            {(order.status === 'pending' || order.status === 'processing') && (
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <XCircle size={14} className="mr-1" />
                Cancelar
              </Button>
            )}
            
            <Button variant="outline" size="sm">
              <MessageCircle size={14} className="mr-1" />
              Suporte
            </Button>
          </div>

          <Button
            onClick={() => onViewOrder(order)}
            size="sm"
          >
            <Eye size={14} className="mr-1" />
            Ver Detalhes
            <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ===============================
// ORDER DETAILS MODAL
// ===============================
const OrderDetailsModal = ({ show, order, onClose }) => {
  if (!show || !order) return null

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'Pendente', variant: 'warning', icon: Clock }
      case 'processing':
        return { label: 'Processando', variant: 'primary', icon: Package }
      case 'shipped':
        return { label: 'Enviado', variant: 'primary', icon: Truck }
      case 'delivered':
        return { label: 'Entregue', variant: 'success', icon: CheckCircle }
      case 'cancelled':
        return { label: 'Cancelado', variant: 'error', icon: XCircle }
      default:
        return { label: 'Desconhecido', variant: 'outline', icon: AlertCircle }
    }
  }

  const statusConfig = getStatusConfig(order.status)
  const StatusIcon = statusConfig.icon

  return (
    <Modal size="lg" onClose={onClose}>
      <div className="max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-bazari-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-bazari-dark">
                Pedido #{order.id.slice(-8).toUpperCase()}
              </h2>
              <div className="flex items-center space-x-3 mt-2">
                <Badge variant={statusConfig.variant}>
                  <StatusIcon size={12} className="mr-1" />
                  {statusConfig.label}
                </Badge>
                <span className="text-sm text-bazari-dark/60">
                  {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download size={16} className="mr-1" />
                PDF
              </Button>
              <Button variant="outline" size="sm">
                <Share size={16} className="mr-1" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Progress */}
          <OrderProgress status={order.status} />

          {/* Items */}
          <div>
            <h3 className="font-semibold text-bazari-dark mb-4">
              Itens do Pedido ({order.items?.length || 0})
            </h3>
            <div className="space-y-4">
              {order.items?.map(item => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-bazari-light/30 rounded-lg">
                  <div className="w-16 h-16 bg-bazari-light rounded-lg overflow-hidden">
                    <img
                      src={item.image || `https://picsum.photos/64/64?random=${item.id}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-bazari-dark">
                      {item.name}
                    </h4>
                    <div className="text-sm text-bazari-dark/60">
                      Quantidade: {item.quantity}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-bazari-dark">
                      {(item.price * item.quantity).toFixed(2)} BZR
                    </div>
                    <div className="text-sm text-bazari-dark/60">
                      {item.price.toFixed(2)} BZR cada
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg border border-bazari-primary/10 p-4">
            <h3 className="font-semibold text-bazari-dark mb-4">
              Resumo do Pedido
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-bazari-dark/70">Subtotal</span>
                <span className="text-bazari-dark">{order.total?.toFixed(2)} BZR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-bazari-dark/70">Taxa de entrega</span>
                <span className="text-green-600">Grátis</span>
              </div>
              <div className="border-t border-bazari-primary/10 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-bazari-dark">Total</span>
                  <span className="text-xl font-bold text-bazari-primary">
                    {order.total?.toFixed(2)} BZR
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg border border-bazari-primary/10 p-4">
            <h3 className="font-semibold text-bazari-dark mb-4">
              Informações de Pagamento
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-bazari-dark/70">Método</span>
                <span className="text-bazari-dark">Carteira BZR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bazari-dark/70">Status</span>
                <Badge variant="success" size="sm">Pago</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-bazari-dark/70">Data do pagamento</span>
                <span className="text-bazari-dark">
                  {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          {order.status !== 'cancelled' && (
            <div className="bg-white rounded-lg border border-bazari-primary/10 p-4">
              <h3 className="font-semibold text-bazari-dark mb-4">
                Informações de Entrega
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin size={16} className="text-bazari-primary mt-1" />
                  <div>
                    <div className="font-medium text-bazari-dark">
                      {order.customerInfo?.name || 'Nome do Cliente'}
                    </div>
                    <div className="text-sm text-bazari-dark/70">
                      Rua Exemplo, 123 - Centro<br />
                      São Paulo, SP - 01234-567
                    </div>
                  </div>
                </div>
                
                {order.status === 'shipped' || order.status === 'delivered' ? (
                  <div className="flex items-start space-x-3">
                    <Truck size={16} className="text-bazari-primary mt-1" />
                    <div>
                      <div className="font-medium text-bazari-dark">
                        Código de rastreamento
                      </div>
                      <div className="text-sm text-bazari-primary font-mono">
                        BR123456789SP
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-3">
                    <Clock size={16} className="text-bazari-primary mt-1" />
                    <div>
                      <div className="font-medium text-bazari-dark">
                        Previsão de entrega
                      </div>
                      <div className="text-sm text-bazari-dark/70">
                        3-5 dias úteis
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-bazari-primary/10">
          <div className="flex justify-between">
            <div className="flex space-x-3">
              {order.status === 'delivered' && (
                <Button variant="outline">
                  <Star size={16} className="mr-1" />
                  Avaliar Compra
                </Button>
              )}
              
              <Button variant="outline">
                <MessageCircle size={16} className="mr-1" />
                Contatar Suporte
              </Button>
            </div>
            
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ===============================
// ORDER PROGRESS
// ===============================
const OrderProgress = ({ status }) => {
  const steps = [
    { id: 'pending', label: 'Pedido Criado', icon: Receipt },
    { id: 'processing', label: 'Processando', icon: Package },
    { id: 'shipped', label: 'Enviado', icon: Truck },
    { id: 'delivered', label: 'Entregue', icon: CheckCircle }
  ]

  const getStepStatus = (stepId) => {
    const stepIndex = steps.findIndex(step => step.id === stepId)
    const currentIndex = steps.findIndex(step => step.id === status)
    
    if (status === 'cancelled') {
      return stepIndex === 0 ? 'completed' : 'cancelled'
    }
    
    if (stepIndex <= currentIndex) return 'completed'
    if (stepIndex === currentIndex + 1) return 'current'
    return 'pending'
  }

  if (status === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center text-red-700">
          <XCircle size={20} className="mr-3" />
          <div>
            <div className="font-medium">Pedido Cancelado</div>
            <div className="text-sm text-red-600">
              Este pedido foi cancelado e o valor será estornado em até 3 dias úteis.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-bazari-primary/10 p-4">
      <h3 className="font-semibold text-bazari-dark mb-4">
        Acompanhar Pedido
      </h3>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-bazari-light">
          <div 
            className="h-full bg-bazari-primary transition-all duration-500"
            style={{ 
              width: `${(steps.findIndex(step => step.id === status) / (steps.length - 1)) * 100}%`
            }}
          />
        </div>
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map(step => {
            const stepStatus = getStepStatus(step.id)
            const StepIcon = step.icon
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors
                  ${stepStatus === 'completed' 
                    ? 'bg-bazari-primary border-bazari-primary text-white'
                    : stepStatus === 'current'
                    ? 'bg-white border-bazari-primary text-bazari-primary'
                    : stepStatus === 'cancelled'
                    ? 'bg-red-100 border-red-300 text-red-600'
                    : 'bg-white border-bazari-light text-bazari-dark/40'
                  }
                `}>
                  <StepIcon size={20} />
                </div>
                
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${
                    stepStatus === 'completed' || stepStatus === 'current'
                      ? 'text-bazari-dark'
                      : 'text-bazari-dark/60'
                  }`}>
                    {step.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ===============================
// EMPTY ORDERS STATE
// ===============================
const EmptyOrdersState = ({ activeTab }) => {
  const { navigateTo } = useMarketplace()
  
  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'pending':
        return {
          title: 'Nenhum pedido pendente',
          description: 'Todos os seus pedidos foram processados.',
          action: null
        }
      case 'processing':
        return {
          title: 'Nenhum pedido sendo processado',
          description: 'Não há pedidos em processamento no momento.',
          action: null
        }
      case 'delivered':
        return {
          title: 'Nenhum pedido entregue',
          description: 'Você ainda não recebeu nenhum pedido.',
          action: null
        }
      case 'cancelled':
        return {
          title: 'Nenhum pedido cancelado',
          description: 'Você não possui pedidos cancelados.',
          action: null
        }
      default:
        return {
          title: 'Nenhum pedido encontrado',
          description: 'Você ainda não fez nenhum pedido. Que tal explorar nosso marketplace?',
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
      <div className="w-24 h-24 bg-bazari-light rounded-full flex items-center justify-center mx-auto mb-6">
        <Package className="w-12 h-12 text-bazari-dark/40" />
      </div>
      
      <h3 className="text-xl font-semibold text-bazari-dark mb-2">
        {title}
      </h3>
      
      <p className="text-bazari-dark/60 mb-8 max-w-md mx-auto">
        {description}
      </p>
      
      {action && (
        <Button onClick={action.onClick} size="lg">
          <Package size={18} className="mr-2" />
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}

// ===============================
// ERROR STATE
// ===============================
const ErrorState = ({ error, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <AlertCircle className="w-12 h-12 text-red-600" />
    </div>
    
    <h3 className="text-xl font-semibold text-bazari-dark mb-2">
      Erro ao carregar pedidos
    </h3>
    
    <p className="text-bazari-dark/60 mb-8 max-w-md mx-auto">
      {error || 'Ocorreu um erro inesperado. Tente novamente.'}
    </p>
    
    <Button onClick={onRetry} size="lg">
      <RefreshCw size={18} className="mr-2" />
      Tentar Novamente
    </Button>
  </motion.div>
)

// ===============================
// LOADING STATE
// ===============================
const LoadingState = () => (
  <div className="min-h-screen bg-bazari-light flex items-center justify-center">
    <div className="text-center">
      <Loading size="lg" />
      <p className="mt-4 text-bazari-dark/60">Carregando pedidos...</p>
    </div>
  </div>
)

export default OrdersView