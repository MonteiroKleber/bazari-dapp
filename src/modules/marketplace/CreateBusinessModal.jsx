import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Upload, Camera, MapPin, Phone, Mail, Globe,
  Instagram, Twitter, CheckCircle, AlertCircle,
  ChevronDown, ChevronRight, Store, Coins, Info
} from 'lucide-react'
import { Button, Card, Badge, Input, Modal, Loading } from '@components/BaseComponents'
import { useBusinesses, useCategories } from './useMarketplaceStore'
import { useAuth } from '@modules/acesso/useAuthStore'
import marketplaceService from '@services/MarketplaceService'

// ===============================
// CREATE BUSINESS MODAL
// ===============================
const CreateBusinessModal = () => {
  const { user } = useAuth()
  const { 
    showCreateBusiness, 
    setShowCreateBusiness, 
    createBusiness,
    isLoading,
    error 
  } = useBusinesses()
  
  const { categories, getCategoryPath } = useCategories()

  // Estados do formulário
  const [currentStep, setCurrentStep] = React.useState(1)
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    location: '',
    categories: [],
    images: [],
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    social: {
      instagram: '',
      twitter: ''
    }
  })

  // Estados da UI
  const [imageFiles, setImageFiles] = React.useState([])
  const [uploadingImages, setUploadingImages] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState(null)
  const [showCategorySelector, setShowCategorySelector] = React.useState(false)
  const [errors, setErrors] = React.useState({})

  // Resetar formulário ao fechar
  React.useEffect(() => {
    if (!showCreateBusiness) {
      setCurrentStep(1)
      setFormData({
        name: '',
        description: '',
        location: '',
        categories: [],
        images: [],
        contact: { phone: '', email: '', website: '' },
        social: { instagram: '', twitter: '' }
      })
      setImageFiles([])
      setErrors({})
      setSelectedCategory(null)
    }
  }, [showCreateBusiness])

  // Validações
  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório'
      if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória'
      if (formData.description.length < 20) newErrors.description = 'Descrição deve ter pelo menos 20 caracteres'
      if (!formData.location.trim()) newErrors.location = 'Localização é obrigatória'
    }

    if (step === 2) {
      if (formData.categories.length === 0) newErrors.categories = 'Selecione pelo menos uma categoria'
    }

    if (step === 3) {
      if (imageFiles.length === 0) newErrors.images = 'Adicione pelo menos uma imagem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Navegar entre steps
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(4, currentStep + 1))
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1))
  }

  // Upload de imagens
  const handleImageUpload = async (files) => {
    setUploadingImages(true)
    
    try {
      const uploadPromises = Array.from(files).map(file => 
        marketplaceService.uploadToIPFS(file)
      )
      
      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter(result => result.success)
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...successfulUploads.map(upload => upload.url)]
      }))
      
      setImageFiles(prev => [...prev, ...Array.from(files)])
    } catch (error) {
      console.error('Erro no upload:', error)
    } finally {
      setUploadingImages(false)
    }
  }

  // Remover imagem
  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    setImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Adicionar categoria
  const handleAddCategory = (categoryPath) => {
    if (!formData.categories.includes(categoryPath)) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, categoryPath]
      }))
    }
    setShowCategorySelector(false)
    setSelectedCategory(null)
  }

  // Remover categoria
  const handleRemoveCategory = (categoryPath) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat !== categoryPath)
    }))
  }

  // Submissão do formulário
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    const businessData = {
      ...formData,
      ownerId: user?.id,
      ownerName: user?.name || 'Usuário'
    }

    const result = await createBusiness(businessData)
    
    if (result.success) {
      setShowCreateBusiness(false)
    }
  }

  if (!showCreateBusiness) return null

  return (
    <Modal size="lg" onClose={() => setShowCreateBusiness(false)}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-bazari-primary rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-bazari-dark">Criar Negócio</h2>
              <p className="text-sm text-bazari-dark/60">
                Tokenize seu negócio no marketplace
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateBusiness(false)}
          >
            <X size={20} />
          </Button>
        </div>

        {/* Progress */}
        <StepIndicator currentStep={currentStep} />

        {/* Content */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <BasicInfoStep
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            )}
            {currentStep === 2 && (
              <CategoriesStep
                formData={formData}
                categories={categories}
                showCategorySelector={showCategorySelector}
                setShowCategorySelector={setShowCategorySelector}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onAddCategory={handleAddCategory}
                onRemoveCategory={handleRemoveCategory}
                getCategoryPath={getCategoryPath}
                errors={errors}
              />
            )}
            {currentStep === 3 && (
              <ImagesStep
                formData={formData}
                imageFiles={imageFiles}
                uploadingImages={uploadingImages}
                onImageUpload={handleImageUpload}
                onRemoveImage={handleRemoveImage}
                errors={errors}
              />
            )}
            {currentStep === 4 && (
              <ContactStep
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowCreateBusiness(false)}
            >
              Cancelar
            </Button>
            
            {currentStep < 4 ? (
              <Button onClick={handleNextStep}>
                Próximo
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? <Loading size="sm" /> : 'Criar Negócio'}
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <AlertCircle size={16} className="mr-2" />
              {error}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ===============================
// STEP INDICATOR
// ===============================
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Informações Básicas', description: 'Nome, descrição e localização' },
    { number: 2, title: 'Categorias', description: 'Classifique seu negócio' },
    { number: 3, title: 'Imagens', description: 'Fotos do seu negócio' },
    { number: 4, title: 'Contato', description: 'Como te encontrar' }
  ]

  return (
    <div className="grid grid-cols-4 gap-2">
      {steps.map((step, index) => (
        <div key={step.number} className="flex flex-col items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
            ${currentStep >= step.number 
              ? 'bg-bazari-primary text-white' 
              : 'bg-bazari-light text-bazari-dark/60'
            }
          `}>
            {currentStep > step.number ? (
              <CheckCircle size={16} />
            ) : (
              step.number
            )}
          </div>
          <div className="text-center mt-2">
            <div className={`text-xs font-medium ${
              currentStep >= step.number ? 'text-bazari-dark' : 'text-bazari-dark/60'
            }`}>
              {step.title}
            </div>
            <div className="text-xs text-bazari-dark/40 hidden sm:block">
              {step.description}
            </div>
          </div>
          
          {index < steps.length - 1 && (
            <div className={`
              absolute top-4 left-1/2 w-full h-0.5 -z-10 transition-colors
              ${currentStep > step.number ? 'bg-bazari-primary' : 'bg-bazari-light'}
            `} />
          )}
        </div>
      ))}
    </div>
  )
}

// ===============================
// BASIC INFO STEP
// ===============================
const BasicInfoStep = ({ formData, setFormData, errors }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-bazari-dark mb-4">
          Informações Básicas
        </h3>
        
        <div className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-bazari-dark mb-2">
              Nome do Negócio *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Padaria do João"
              error={errors.name}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-bazari-dark mb-2">
              Descrição *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva seu negócio, produtos e diferenciais..."
              className={`
                w-full p-3 border rounded-xl resize-none transition-colors
                ${errors.description 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-bazari-primary/20 focus:border-bazari-primary'
                }
              `}
              rows={4}
            />
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${errors.description ? 'text-red-500' : 'text-bazari-dark/60'}`}>
                {errors.description || `${formData.description.length}/500 caracteres`}
              </span>
              <span className="text-xs text-bazari-dark/60">
                Mín. 20 caracteres
              </span>
            </div>
          </div>

          {/* Localização */}
          <div>
            <label className="block text-sm font-medium text-bazari-dark mb-2">
              Localização *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bazari-dark/40" />
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: São Paulo, SP"
                className="pl-10"
                error={errors.location}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Token Preview */}
      <Card className="p-4 bg-gradient-to-r from-bazari-primary/5 to-bazari-secondary/5 border-bazari-primary/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-bazari-primary to-bazari-secondary rounded-xl flex items-center justify-center">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-bazari-dark">
              Token {formData.name ? `${formData.name.substring(0, 3).toUpperCase()}B` : 'NEGB'}
            </h4>
            <p className="text-sm text-bazari-dark/60">
              Preço inicial: 0.01 BZR • Supply: 1M tokens
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ===============================
// CATEGORIES STEP
// ===============================
const CategoriesStep = ({
  formData,
  categories,
  showCategorySelector,
  setShowCategorySelector,
  selectedCategory,
  setSelectedCategory,
  onAddCategory,
  onRemoveCategory,
  getCategoryPath,
  errors
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-bazari-dark mb-4">
          Categorias do Negócio
        </h3>
        <p className="text-sm text-bazari-dark/60 mb-4">
          Selecione as categorias que melhor descrevem seu negócio. Isso ajudará os clientes a te encontrar.
        </p>

        {/* Selected Categories */}
        {formData.categories.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-bazari-dark mb-3">
              Categorias Selecionadas ({formData.categories.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {formData.categories.map((categoryPath) => {
                const pathResult = getCategoryPath(categoryPath)
                const path = pathResult.success ? pathResult.path : []
                const categoryName = path.length > 0 ? path[path.length - 1].name.pt : categoryPath
                
                return (
                  <Badge
                    key={categoryPath}
                    variant="primary"
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={() => onRemoveCategory(categoryPath)}
                  >
                    <span>{categoryName}</span>
                    <X size={12} />
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        {/* Add Category Button */}
        <Button
          variant="outline"
          onClick={() => setShowCategorySelector(true)}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Categoria
        </Button>

        {errors.categories && (
          <p className="text-sm text-red-500 mt-2">{errors.categories}</p>
        )}

        {/* Category Selector Modal */}
        <CategorySelectorModal
          show={showCategorySelector}
          onClose={() => setShowCategorySelector(false)}
          categories={categories}
          onSelect={onAddCategory}
        />
      </div>
    </motion.div>
  )
}

// ===============================
// IMAGES STEP
// ===============================
const ImagesStep = ({
  formData,
  imageFiles,
  uploadingImages,
  onImageUpload,
  onRemoveImage,
  errors
}) => {
  const fileInputRef = React.useRef(null)

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onImageUpload(files)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-bazari-dark mb-4">
          Imagens do Negócio
        </h3>
        <p className="text-sm text-bazari-dark/60 mb-6">
          Adicione fotos do seu estabelecimento, produtos ou serviços. A primeira imagem será a capa.
        </p>

        {/* Upload Area */}
        <div className="space-y-4">
          {/* Upload Button */}
          <div
            className={`
              border-2 border-dashed border-bazari-primary/20 rounded-xl p-8 text-center cursor-pointer
              hover:border-bazari-primary/40 hover:bg-bazari-primary/5 transition-colors
              ${errors.images ? 'border-red-300 bg-red-50' : ''}
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-bazari-primary mx-auto mb-4" />
            <h4 className="font-medium text-bazari-dark mb-2">
              {uploadingImages ? 'Enviando imagens...' : 'Clique para adicionar imagens'}
            </h4>
            <p className="text-sm text-bazari-dark/60">
              PNG, JPG até 5MB • Máximo 5 imagens
            </p>
            
            {uploadingImages && (
              <div className="mt-4">
                <Loading />
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploadingImages || imageFiles.length >= 5}
          />

          {errors.images && (
            <p className="text-sm text-red-500">{errors.images}</p>
          )}

          {/* Image Preview */}
          {imageFiles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-bazari-dark mb-3">
                Imagens Carregadas ({imageFiles.length}/5)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    
                    {index === 0 && (
                      <Badge
                        variant="success"
                        size="sm"
                        className="absolute top-2 left-2"
                      >
                        Capa
                      </Badge>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white hover:bg-black/70"
                      onClick={() => onRemoveImage(index)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ===============================
// CONTACT STEP
// ===============================
const ContactStep = ({ formData, setFormData, errors }) => {
  const updateContact = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }))
  }

  const updateSocial = (field, value) => {
    setFormData(prev => ({
      ...prev,
      social: { ...prev.social, [field]: value }
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-bazari-dark mb-4">
          Informações de Contato
        </h3>
        <p className="text-sm text-bazari-dark/60 mb-6">
          Como os clientes podem entrar em contato com seu negócio? (Opcional)
        </p>

        <div className="space-y-6">
          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-bazari-dark mb-4">Contato</h4>
            <div className="space-y-4">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-bazari-dark mb-2">
                  Telefone/WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bazari-dark/40" />
                  <Input
                    value={formData.contact.phone}
                    onChange={(e) => updateContact('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-bazari-dark mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bazari-dark/40" />
                  <Input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => updateContact('email', e.target.value)}
                    placeholder="contato@meunegocio.com"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-bazari-dark mb-2">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bazari-dark/40" />
                  <Input
                    value={formData.contact.website}
                    onChange={(e) => updateContact('website', e.target.value)}
                    placeholder="https://meunegocio.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-sm font-semibold text-bazari-dark mb-4">Redes Sociais</h4>
            <div className="space-y-4">
              {/* Instagram */}
              <div>
                <label className="block text-sm font-medium text-bazari-dark mb-2">
                  Instagram
                </label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bazari-dark/40" />
                  <Input
                    value={formData.social.instagram}
                    onChange={(e) => updateSocial('instagram', e.target.value)}
                    placeholder="@meunegocio"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Twitter */}
              <div>
                <label className="block text-sm font-medium text-bazari-dark mb-2">
                  Twitter
                </label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bazari-dark/40" />
                  <Input
                    value={formData.social.twitter}
                    onChange={(e) => updateSocial('twitter', e.target.value)}
                    placeholder="@meunegocio"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final Summary */}
      <Card className="p-4 bg-bazari-light/50">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-bazari-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-bazari-dark mb-1">Pronto para criar!</h4>
            <p className="text-sm text-bazari-dark/70">
              Seu negócio será tokenizado e ficará disponível no marketplace. 
              Você poderá editar essas informações a qualquer momento.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ===============================
// CATEGORY SELECTOR MODAL
// ===============================
const CategorySelectorModal = ({ show, onClose, categories, onSelect }) => {
  const [navigationPath, setNavigationPath] = React.useState([])
  const [currentLevel, setCurrentLevel] = React.useState(0)

  // Obter dados do nível atual
  const getCurrentLevelData = () => {
    if (navigationPath.length === 0) {
      return categories
    }

    let current = categories
    for (const pathItem of navigationPath) {
      if (current[pathItem.id]) {
        current = current[pathItem.id]
        if (current.subcategories) {
          current = current.subcategories
        } else if (current.items) {
          current = current.items
        }
      }
    }
    return current
  }

  // Navegar para categoria
  const handleCategoryClick = (categoryId, categoryData) => {
    const newPathItem = {
      id: categoryId,
      name: categoryData.name?.pt || categoryId,
      icon: categoryData.icon
    }

    const newPath = [...navigationPath, newPathItem]
    
    // Se for o último nível (items), selecionar categoria
    if (categoryData.items || currentLevel >= 2) {
      const fullCategoryPath = newPath.map(item => item.id).join('.')
      onSelect(fullCategoryPath)
      setNavigationPath([])
      setCurrentLevel(0)
      return
    }

    setNavigationPath(newPath)
    setCurrentLevel(currentLevel + 1)
  }

  // Voltar um nível
  const handleBackClick = () => {
    if (navigationPath.length > 0) {
      setNavigationPath(navigationPath.slice(0, -1))
      setCurrentLevel(Math.max(0, currentLevel - 1))
    }
  }

  if (!show) return null

  const currentData = getCurrentLevelData()
  const currentCategory = navigationPath[navigationPath.length - 1]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-bazari-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {navigationPath.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleBackClick}>
                  <ChevronLeft size={16} />
                </Button>
              )}
              <div>
                <h3 className="font-semibold text-bazari-dark">
                  {currentCategory ? currentCategory.name : 'Selecionar Categoria'}
                </h3>
                <p className="text-xs text-bazari-dark/60">
                  Nível {currentLevel + 1} de 4
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Categories List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {Object.entries(currentData || {}).map(([categoryId, categoryData]) => (
              <div
                key={categoryId}
                className="flex items-center justify-between p-3 hover:bg-bazari-light rounded-lg cursor-pointer transition-colors"
                onClick={() => handleCategoryClick(categoryId, categoryData)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{categoryData.icon}</span>
                  <span className="font-medium text-bazari-dark">
                    {categoryData.name?.pt || categoryId}
                  </span>
                </div>
                <ChevronRight size={16} className="text-bazari-dark/40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateBusinessModal