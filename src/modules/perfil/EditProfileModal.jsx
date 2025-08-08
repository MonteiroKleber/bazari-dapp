import React from 'react'
import { motion } from 'framer-motion'
import { 
  X, Camera, MapPin, Globe, Twitter, Instagram, 
  Plus, Trash2, Upload, Save
} from 'lucide-react'
import { Button, Input, Modal, Alert, Avatar, Badge } from '@components/BaseComponents'
import { useTranslation } from '@i18n/useTranslation'
import { useAuth } from '@modules/acesso/useAuthStore'
import { useProfile, useProfileUI } from './useProfileStore'

// ===============================
// EDIT PROFILE MODAL
// ===============================
const EditProfileModal = () => {
  const { user } = useAuth()
  const { 
    profile, 
    isLoading, 
    error, 
    updateProfile, 
    uploadAvatar, 
    clearError 
  } = useProfile()
  const { showEditProfile, setShowEditProfile } = useProfileUI()

  // Estados do formulário
  const [formData, setFormData] = React.useState({
    name: '',
    bio: '',
    location: '',
    skills: [],
    interests: [],
    social: {
      website: '',
      twitter: '',
      instagram: ''
    }
  })
  
  const [newSkill, setNewSkill] = React.useState('')
  const [newInterest, setNewInterest] = React.useState('')
  const [avatarFile, setAvatarFile] = React.useState(null)
  const [avatarPreview, setAvatarPreview] = React.useState(null)

  // Carregar dados do perfil no formulário
  React.useEffect(() => {
    if (profile && showEditProfile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        skills: profile.skills || [],
        interests: profile.interests || [],
        social: {
          website: profile.social?.website || '',
          twitter: profile.social?.twitter || '',
          instagram: profile.social?.instagram || ''
        }
      })
      setAvatarPreview(profile.avatar)
    }
  }, [profile, showEditProfile])

  // Limpar erro ao abrir modal
  React.useEffect(() => {
    if (showEditProfile && error) {
      clearError()
    }
  }, [showEditProfile, error, clearError])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSocialChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [platform]: value
      }
    }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      
      // Preview
      const reader = new FileReader()
      reader.onload = (e) => setAvatarPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }))
      setNewInterest('')
    }
  }

  const removeInterest = (interestToRemove) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user?.id) return

    try {
      // Upload avatar first if changed
      let avatarUrl = avatarPreview
      if (avatarFile) {
        const result = await uploadAvatar(user.id, avatarFile)
        if (result.success) {
          avatarUrl = result.profile.avatar
        } else {
          return // Error will be shown by store
        }
      }

      // Update profile
      const result = await updateProfile(user.id, {
        ...formData,
        avatar: avatarUrl
      })

      if (result.success) {
        setShowEditProfile(false)
        // Reset form
        setAvatarFile(null)
        setAvatarPreview(null)
      }
    } catch (err) {
      console.error('Erro ao salvar perfil:', err)
    }
  }

  const handleClose = () => {
    setShowEditProfile(false)
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  return (
    <Modal
      isOpen={showEditProfile}
      onClose={handleClose}
      title="Editar Perfil"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="text-center">
          <div className="relative inline-block">
            <Avatar
              src={avatarPreview}
              alt="Preview"
              fallback={formData.name?.charAt(0) || 'U'}
              size="xl"
            />
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-bazari-primary rounded-full flex items-center justify-center text-white hover:bg-bazari-primary-hover cursor-pointer transition-colors">
              <Camera size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-sm text-bazari-dark/60 mt-2">
            Clique na câmera para alterar a foto
          </p>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Seu nome completo"
            disabled={isLoading}
          />
          
          <div className="relative">
            <Input
              label="Localização"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Cidade, Estado"
              disabled={isLoading}
              className="pl-10"
            />
            <MapPin size={18} className="absolute left-3 top-9 text-gray-400" />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-bazari-dark mb-2">
            Biografia
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Conte um pouco sobre você..."
            disabled={isLoading}
            rows={3}
            maxLength={200}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-bazari-primary focus:ring-4 focus:ring-bazari-primary/20 focus:outline-none resize-none"
          />
          <div className="text-xs text-bazari-dark/60 mt-1">
            {formData.bio.length}/200 caracteres
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-bazari-dark mb-2">
            Habilidades
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.skills.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center"
              >
                <Badge variant="primary" size="sm" className="pr-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </div>
          <div className="flex space-x-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Adicionar habilidade"
              disabled={isLoading}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button
              type="button"
              onClick={addSkill}
              disabled={!newSkill.trim() || isLoading}
              size="sm"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-bazari-dark mb-2">
            Interesses
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.interests.map((interest, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center"
              >
                <Badge variant="secondary" size="sm" className="pr-1">
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </div>
          <div className="flex space-x-2">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Adicionar interesse"
              disabled={isLoading}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
            />
            <Button
              type="button"
              onClick={addInterest}
              disabled={!newInterest.trim() || isLoading}
              size="sm"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        {/* Social Media */}
        <div>
          <label className="block text-sm font-medium text-bazari-dark mb-3">
            Redes Sociais
          </label>
          <div className="space-y-3">
            <div className="relative">
              <Globe size={18} className="absolute left-3 top-3 text-gray-400" />
              <Input
                value={formData.social.website}
                onChange={(e) => handleSocialChange('website', e.target.value)}
                placeholder="https://seusite.com"
                disabled={isLoading}
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <Twitter size={18} className="absolute left-3 top-3 text-gray-400" />
              <Input
                value={formData.social.twitter}
                onChange={(e) => handleSocialChange('twitter', e.target.value)}
                placeholder="@seutwitter"
                disabled={isLoading}
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <Instagram size={18} className="absolute left-3 top-3 text-gray-400" />
              <Input
                value={formData.social.instagram}
                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                placeholder="@seuinstagram"
                disabled={isLoading}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Error Alert */}
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
            disabled={!formData.name.trim()}
          >
            <Save size={16} className="mr-2" />
            Salvar Perfil
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EditProfileModal