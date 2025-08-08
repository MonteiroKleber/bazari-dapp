import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Activity, Heart, MessageCircle, Share, 
  Image, Video, MapPin, Clock, Users, Send,
  Camera, Paperclip, Smile, Trash2, Edit
} from 'lucide-react'
import { Button, Card, Avatar, Badge, Input, Alert } from '@components/BaseComponents'
import { useTranslation } from '@i18n/useTranslation'
import { useAuth } from '@modules/acesso/useAuthStore'
import { useActivity, useProfile } from './useProfileStore'

// ===============================
// ACTIVITY TAB
// ===============================
const ActivityTab = () => {
  const { user } = useAuth()
  const { profile } = useProfile()
  const { 
    activityFeed, 
    addActivity, 
    reloadActivityFeed, 
    isLoading, 
    error 
  } = useActivity()

  const [newPost, setNewPost] = React.useState('')
  const [showCreatePost, setShowCreatePost] = React.useState(false)
  const [postType, setPostType] = React.useState('text') // text, image, location

  React.useEffect(() => {
    if (user?.id) {
      reloadActivityFeed(user.id)
    }
  }, [user?.id, reloadActivityFeed])

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user?.id) return

    try {
      const activity = {
        type: 'post',
        content: newPost.trim(),
        postType: postType,
        likes: 0,
        comments: 0,
        shares: 0
      }

      const result = await addActivity(user.id, activity)
      
      if (result.success) {
        setNewPost('')
        setShowCreatePost(false)
        setPostType('text')
      }
    } catch (err) {
      console.error('Erro ao criar post:', err)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Create Post Section */}
      <CreatePostCard
        profile={profile}
        newPost={newPost}
        setNewPost={setNewPost}
        showCreatePost={showCreatePost}
        setShowCreatePost={setShowCreatePost}
        postType={postType}
        setPostType={setPostType}
        onCreatePost={handleCreatePost}
        isLoading={isLoading}
      />

      {/* Error Display */}
      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      {/* Activity Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-bazari-dark">
            Suas Atividades
          </h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => user?.id && reloadActivityFeed(user.id)}
            disabled={isLoading}
          >
            <Activity size={16} className="mr-1" />
            Atualizar
          </Button>
        </div>

        <AnimatePresence>
          {activityFeed.length === 0 ? (
            <EmptyActivityState onCreateFirst={() => setShowCreatePost(true)} />
          ) : (
            activityFeed.map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                profile={profile}
                index={index}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ===============================
// CREATE POST CARD
// ===============================
const CreatePostCard = ({ 
  profile, 
  newPost, 
  setNewPost, 
  showCreatePost, 
  setShowCreatePost,
  postType,
  setPostType,
  onCreatePost, 
  isLoading 
}) => {
  return (
    <Card className="p-6">
      <div className="flex items-start space-x-4">
        <Avatar
          src={profile?.avatar}
          alt={profile?.name}
          fallback={profile?.name?.charAt(0) || 'U'}
          size="md"
        />
        
        <div className="flex-1">
          {!showCreatePost ? (
            <button
              onClick={() => setShowCreatePost(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-bazari-dark/70"
            >
              O que você está fazendo hoje?
            </button>
          ) : (
            <div className="space-y-4">
              {/* Post Type Selector */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setPostType('text')}
                  className={`flex items-center px-3 py-1 rounded-full text-sm transition-colors ${
                    postType === 'text' 
                      ? 'bg-bazari-primary text-white' 
                      : 'bg-gray-100 text-bazari-dark hover:bg-gray-200'
                  }`}
                >
                  <MessageCircle size={14} className="mr-1" />
                  Texto
                </button>
                <button
                  onClick={() => setPostType('image')}
                  className={`flex items-center px-3 py-1 rounded-full text-sm transition-colors ${
                    postType === 'image' 
                      ? 'bg-bazari-primary text-white' 
                      : 'bg-gray-100 text-bazari-dark hover:bg-gray-200'
                  }`}
                >
                  <Image size={14} className="mr-1" />
                  Imagem
                </button>
                <button
                  onClick={() => setPostType('location')}
                  className={`flex items-center px-3 py-1 rounded-full text-sm transition-colors ${
                    postType === 'location' 
                      ? 'bg-bazari-primary text-white' 
                      : 'bg-gray-100 text-bazari-dark hover:bg-gray-200'
                  }`}
                >
                  <MapPin size={14} className="mr-1" />
                  Local
                </button>
              </div>

              {/* Text Input */}
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={
                  postType === 'text' ? 'Compartilhe suas ideias...' :
                  postType === 'image' ? 'Descreva sua imagem...' :
                  'Onde você está?'
                }
                disabled={isLoading}
                rows={3}
                maxLength={500}
                className="w-full px-0 py-2 border-none resize-none focus:outline-none text-bazari-dark placeholder-bazari-dark/50"
              />
              
              <div className="text-xs text-bazari-dark/60">
                {newPost.length}/500 caracteres
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <button className="text-bazari-dark/60 hover:text-bazari-primary">
                    <Camera size={18} />
                  </button>
                  <button className="text-bazari-dark/60 hover:text-bazari-primary">
                    <Paperclip size={18} />
                  </button>
                  <button className="text-bazari-dark/60 hover:text-bazari-primary">
                    <Smile size={18} />
                  </button>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCreatePost(false)
                      setNewPost('')
                    }}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={onCreatePost}
                    disabled={!newPost.trim() || isLoading}
                    loading={isLoading}
                  >
                    <Send size={14} className="mr-1" />
                    Publicar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// ===============================
// ACTIVITY CARD
// ===============================
const ActivityCard = ({ activity, profile, index }) => {
  const [liked, setLiked] = React.useState(false)
  const [showComments, setShowComments] = React.useState(false)

  const getActivityIcon = () => {
    switch (activity.type) {
      case 'post': return <MessageCircle size={16} />
      case 'business_created': return <Users size={16} />
      case 'dao_vote': return <Activity size={16} />
      default: return <Activity size={16} />
    }
  }

  const getActivityColor = () => {
    switch (activity.type) {
      case 'post': return 'text-blue-600'
      case 'business_created': return 'text-green-600'
      case 'dao_vote': return 'text-purple-600'
      default: return 'text-bazari-primary'
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora há pouco'
    if (diffInHours < 24) return `${diffInHours}h atrás`
    if (diffInHours < 48) return 'Ontem'
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar
            src={profile?.avatar}
            alt={profile?.name}
            fallback={profile?.name?.charAt(0) || 'U'}
            size="md"
          />
          
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-bazari-dark">
                {profile?.name || 'Usuário'}
              </span>
              <div className={`${getActivityColor()}`}>
                {getActivityIcon()}
              </div>
              <span className="text-sm text-bazari-dark/60">
                {formatTimeAgo(activity.createdAt)}
              </span>
            </div>

            {/* Content */}
            <div className="mb-4">
              <p className="text-bazari-dark leading-relaxed">
                {activity.content}
              </p>
              
              {activity.postType === 'location' && (
                <div className="flex items-center text-sm text-bazari-dark/70 mt-2">
                  <MapPin size={14} className="mr-1" />
                  Em {activity.location || 'algum lugar'}
                </div>
              )}
            </div>

            {/* Interaction Stats */}
            <div className="flex items-center justify-between text-sm text-bazari-dark/60 mb-3">
              <div className="flex space-x-4">
                <span>{activity.likes || 0} curtidas</span>
                <span>{activity.comments || 0} comentários</span>
                <span>{activity.shares || 0} compartilhamentos</span>
              </div>
              <div className="flex items-center">
                <Clock size={12} className="mr-1" />
                {formatTimeAgo(activity.createdAt)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex space-x-6">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center space-x-2 text-sm transition-colors ${
                    liked ? 'text-red-500' : 'text-bazari-dark/60 hover:text-red-500'
                  }`}
                >
                  <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                  <span>Curtir</span>
                </button>
                
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-2 text-sm text-bazari-dark/60 hover:text-bazari-primary transition-colors"
                >
                  <MessageCircle size={16} />
                  <span>Comentar</span>
                </button>
                
                <button className="flex items-center space-x-2 text-sm text-bazari-dark/60 hover:text-bazari-primary transition-colors">
                  <Share size={16} />
                  <span>Compartilhar</span>
                </button>
              </div>

              {/* Owner Actions */}
              <div className="flex space-x-2">
                <button className="text-bazari-dark/40 hover:text-bazari-primary">
                  <Edit size={14} />
                </button>
                <button className="text-bazari-dark/40 hover:text-error">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Comments Section */}
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-gray-100"
              >
                <div className="space-y-3">
                  {/* Comment Input */}
                  <div className="flex items-center space-x-3">
                    <Avatar
                      src={profile?.avatar}
                      fallback="U"
                      size="sm"
                    />
                    <Input
                      placeholder="Escreva um comentário..."
                      className="flex-1"
                      size="sm"
                    />
                    <Button size="sm">
                      <Send size={14} />
                    </Button>
                  </div>
                  
                  {/* Sample Comment */}
                  <div className="text-sm text-bazari-dark/70">
                    Nenhum comentário ainda. Seja o primeiro!
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ===============================
// EMPTY STATE
// ===============================
const EmptyActivityState = ({ onCreateFirst }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-24 h-24 bg-bazari-light rounded-full flex items-center justify-center mx-auto mb-6">
      <Activity className="w-12 h-12 text-bazari-primary" />
    </div>
    
    <h3 className="text-xl font-semibold text-bazari-dark mb-2">
      Nenhuma atividade ainda
    </h3>
    
    <p className="text-bazari-dark/70 mb-6 max-w-md mx-auto">
      Compartilhe suas ideias, experiências e negócios com a comunidade Bazari. 
      Construa sua reputação através de posts interessantes!
    </p>
    
    <Button onClick={onCreateFirst} size="lg">
      <Plus size={18} className="mr-2" />
      Criar Primeira Postagem
    </Button>
  </motion.div>
)

export default ActivityTab