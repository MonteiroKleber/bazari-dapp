import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Briefcase, MapPin, Star, TrendingUp, 
  Users, Eye, ExternalLink, Edit, MoreHorizontal 
} from 'lucide-react'
import { Button, Card, Badge, Avatar, Modal, Input, Alert } from '@components/BaseComponents'
import { useTranslation } from '@i18n/useTranslation'
import { useAuth } from '@modules/acesso/useAuthStore'
import { useBusinesses } from './useProfileStore'
import profileService from '@services/ProfileService'

// ===============================
// BUSINESSES TAB
// ===============================
const BusinessesTab = () => {
  const { user } = useAuth()
  const { 
    businesses, 
    createBusiness, 
    showCreateBusiness, 
    setShowCreateBusiness,
    isLoading, 
    error 
  } = useBusinesses()

  React.useEffect(() => {
    // Businesses já são carregados pelo loadProfile no componente principal
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-bazari-dark">Meus Negócios</h2>
          <p className="text-bazari-dark/70">
            Gerencie seus negócios tokenizados e acompanhe sua performance
          </p>
        </div>
        
        <Button onClick={() => setShowCreateBusiness(true)}>
          <Plus size={16} className="mr-2" />
          Novo Negócio
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      {/* Businesses List */}
      <AnimatePresence>
        {businesses.length === 0 ? (
          <EmptyBusinessesState onCreateClick={() => setShowCreateBusiness(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business, index) => (
              <BusinessCard 
                key={business.id} 
                business={business} 
                index={index}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Create Business Modal */}
      <CreateBusinessModal />
    </div>
  )
}

// ===============================
// BUSINESS CARD
// ===============================
const BusinessCard = ({ business, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Card hover className="p-6 h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-bazari-dark mb-1">
              {business.name}
            </h3>
            <p className="text-sm text-bazari-dark/70 mb-2">
              {business.description}
            </p>
            
            {business.location && (
              <div className="flex items-center text-xs text-bazari-dark/60">
                <MapPin size={12} className="mr-1" />
                {business.location}
              </div>
            )}
          </div>
          
          <button className="text-gray-400 hover:text-bazari-primary">
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Business Image */}
        {business.image && (
          <div className="w-full h-32 rounded-lg mb-4 overflow-hidden">
            <img 
              src={business.image} 
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Categories */}
        <div className="flex flex-wrap gap-1 mb-4">
          {business.categories?.slice(0, 2).map((category, idx) => (
            <Badge key={idx} variant="secondary" size="sm">
              {category}
            </Badge>
          ))}
          {business.categories?.length > 2 && (
            <Badge variant="outline" size="sm">
              +{business.categories.length - 2}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Eye size={12} />
              <span className="text-sm font-medium text-bazari-dark">
                {business.stats?.views || 0}
              </span>
            </div>
            <div className="text-xs text-bazari-dark/60">Visualizações</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Users size={12} />
              <span className="text-sm font-medium text-bazari-dark">
                {business.stats?.followers || 0}
              </span>
            </div>
            <div className="text-xs text-bazari-dark/60">Seguidores</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Star size={12} />
              <span className="text-sm font-medium text-bazari-dark">
                {business.stats?.rating || 0}
              </span>
            </div>
            <div className="text-xs text-bazari-dark/60">Avaliação</div>
          </div>
        </div>

        {/* Token Info */}
        <div className="bg-bazari-light p-3 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-bazari-dark">
              Token {business.token?.symbol}
            </span>
            <Badge variant="primary" size="sm">
              {business.token?.price?.toFixed(4) || '0.0100'} BZR
            </Badge>
          </div>
          <div className="flex items-center text-xs text-bazari-dark/60">
            <TrendingUp size={10} className="mr-1" />
            Cap: {business.token?.marketCap?.toFixed(2) || '0.00'} BZR
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Edit size={14} className="mr-1" />
            Editar
          </Button>
          <Button size="sm" className="flex-1">
            <ExternalLink size={14} className="mr-1" />
            Ver
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

// ===============================
// EMPTY STATE
// ===============================
const EmptyBusinessesState = ({ onCreateClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-24 h-24 bg-bazari-light rounded-full flex items-center justify-center mx-auto mb-6">
      <Briefcase className="w-12 h-12 text-bazari-primary" />
    </div>
    
    <h3 className="text-xl font-semibold text-bazari-dark mb-2">
      Nenhum negócio criado ainda
    </h3>
    
    <p className="text-bazari-dark/70 mb-6 max-w-md mx-auto">
      Crie seu primeiro negócio tokenizado e comece a construir sua presença 
      no marketplace descentralizado do Bazari.
    </p>
    
    <div className="space-y-3">
      <Button onClick={onCreateClick} size="lg">
        <Plus size={18} className="mr-2" />
        Criar Primeiro Negócio
      </Button>
      
      <div className="text-sm text-bazari-dark/60">
        ✨ Cada negócio gera seu próprio token
      </div>
    </div>
  </motion.div>
)

// ===============================
// CREATE BUSINESS MODAL
// ===============================
const CreateBusinessModal = () => {
  const { user } = useAuth()
  const { 
    createBusiness, 
    showCreateBusiness, 
    setShowCreateBusiness,
    isLoading, 
    error 
  } = useBusinesses()

  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    location: '',
    categories: [],
    image: null
  })

  const [imagePreview, setImagePreview] = React.useState(null)
  const [selectedCategory, setSelectedCategory] = React.useState('')
  const [selectedSubcategory, setSelectedSubcategory] = React.useState('')

  const categories = profileService.getBusinessCategories()

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }))
      
      // Preview
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const addCategory = () => {
    if (selectedCategory && selectedSubcategory) {
      const categoryKey = `${selectedCategory}.${selectedSubcategory}`
      if (!formData.categories.includes(categoryKey)) {
        setFormData(prev => ({
          ...prev,
          categories: [...prev.categories, categoryKey]
        }))
      }
      setSelectedCategory('')
      setSelectedSubcategory('')
    }
  }

  const removeCategory = (categoryToRemove) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat !== categoryToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user?.id) return

    try {
      const result = await createBusiness(user.id, {
        ...formData,
        image: imagePreview // In real implementation, this would be uploaded to IPFS
      })

      if (result.success) {
        // Reset form
        setFormData({
          name: '',
          description: '',
          location: '',
          categories: [],
          image: null
        })
        setImagePreview(null)
        setSelectedCategory('')
        setSelectedSubcategory('')
      }
    } catch (err) {
      console.error('Erro ao criar negócio:', err)
    }
  }

  const handleClose = () => {
    setShowCreateBusiness(false)
    setImagePreview(null)
  }

  return (
    <Modal
      isOpen={showCreateBusiness}
      onClose={handleClose}
      title="Criar Novo Negócio"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Image */}
        <div className="text-center">
          <div className="w-full h-40 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden mb-3">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Adicionar imagem do negócio</p>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="business-image"
          />
          <label
            htmlFor="business-image"
            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Escolher Imagem
          </label>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome do Negócio"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Nome do seu negócio"
            disabled={isLoading}
            required
          />
          
          <Input
            label="Localização"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Cidade, Bairro"
            disabled={isLoading}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-bazari-dark mb-2">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Descreva seu negócio..."
            disabled={isLoading}
            rows={3}
            maxLength={300}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-bazari-primary focus:ring-4 focus:ring-bazari-primary/20 focus:outline-none resize-none"
          />
          <div className="text-xs text-bazari-dark/60 mt-1">
            {formData.description.length}/300 caracteres
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-bazari-dark mb-3">
            Categorias do Negócio
          </label>
          
          {/* Selected Categories */}
          {formData.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.categories.map((category, index) => {
                const [catKey, subKey] = category.split('.')
                const catName = categories[catKey]?.name.pt
                const subName = categories[catKey]?.subcategories[subKey]?.pt
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Badge variant="primary" size="sm" className="pr-1">
                      {catName} → {subName}
                      <button
                        type="button"
                        onClick={() => removeCategory(category)}
                        className="ml-2 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  </motion.div>
                )
              })}
            </div>
          )}
          
          {/* Category Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setSelectedSubcategory('')
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:border-bazari-primary focus:outline-none"
              disabled={isLoading}
            >
              <option value="">Selecionar categoria</option>
              {Object.entries(categories).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.name.pt}
                </option>
              ))}
            </select>
            
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              disabled={!selectedCategory || isLoading}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:border-bazari-primary focus:outline-none disabled:bg-gray-100"
            >
              <option value="">Subcategoria</option>
              {selectedCategory && Object.entries(categories[selectedCategory].subcategories).map(([key, sub]) => (
                <option key={key} value={key}>
                  {sub.pt}
                </option>
              ))}
            </select>
            
            <Button
              type="button"
              onClick={addCategory}
              disabled={!selectedCategory || !selectedSubcategory || isLoading}
              size="sm"
            >
              Adicionar
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="error">{error}</Alert>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={!formData.name.trim() || !formData.description.trim() || formData.categories.length === 0}
          >
            Criar Negócio
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default BusinessesTab