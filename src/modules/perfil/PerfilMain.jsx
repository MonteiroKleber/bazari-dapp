import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Edit, Camera, MapPin, Globe, Twitter, Instagram,
  TrendingUp, Users, Briefcase, Activity, Star, 
  Plus, ExternalLink, Copy, Crown, Award
} from 'lucide-react'
import { Button, Card, Avatar, Badge, Alert } from '@components/BaseComponents'
import { useTranslation } from '@i18n/useTranslation'
import { useAuth } from '@modules/acesso/useAuthStore'
import { useProfile, useProfileUI } from './useProfileStore'

// ===============================
// MAIN PROFILE COMPONENT
// ===============================
const PerfilMain = () => {
  const { user } = useAuth()
  const { 
    profile, 
    reputation, 
    isLoading, 
    error, 
    loadProfile, 
    clearError, 
    getProfileStats, 
    isProfileComplete, 
    getProfileNextSteps 
  } = useProfile()
  const { activeTab, setActiveTab, setShowEditProfile } = useProfileUI()

  // Carregar perfil ao montar componente
  React.useEffect(() => {
    if (user?.id) {
      loadProfile(user.id)
    }
  }, [user?.id, loadProfile])

  // Limpar erro ao mudar
  React.useEffect(() => {
    if (error) clearError()
  }, [error, clearError])

  const stats = getProfileStats()
  const nextSteps = getProfileNextSteps()
  const complete = isProfileComplete()

  if (isLoading && !profile) {
    return <ProfileSkeleton />
  }

  if (error) {
    return (
      <Alert variant="error" className="max-w-md mx-auto">
        <p className="font-medium">Erro ao carregar perfil</p>
        <p className="text-sm mt-1">{error}</p>
        <Button 
          size="sm" 
          className="mt-3"
          onClick={() => user?.id && loadProfile(user.id)}
        >
          Tentar novamente
        </Button>
      </Alert>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: User },
    { id: 'businesses', label: 'Negócios', icon: Briefcase },
    { id: 'activity', label: 'Atividade', icon: Activity },
    { id: 'token', label: 'Token', icon: TrendingUp }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header do Perfil */}
      <ProfileHeader 
        profile={profile}
        reputation={reputation}
        stats={stats}
        onEdit={() => setShowEditProfile(true)}
      />

      {/* Alerta de perfil incompleto */}
      {!complete && nextSteps.length > 0 && (
        <ProfileCompletionAlert steps={nextSteps} />
      )}

      {/* Navegação por abas */}
      <Card className="p-0 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors
                  whitespace-nowrap min-w-0 flex-shrink-0
                  ${activeTab === tab.id
                    ? 'border-bazari-primary text-bazari-primary bg-bazari-primary/5'
                    : 'border-transparent text-gray-600 hover:text-bazari-primary hover:border-gray-300'
                  }
                `}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo das abas */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <React.Suspense fallback={<TabSkeleton />}>
                {activeTab === 'overview' && <OverviewTab profile={profile} reputation={reputation} stats={stats} />}
                {activeTab === 'businesses' && <BusinessesTab />}
                {activeTab === 'activity' && <ActivityTab />}
                {activeTab === 'token' && <TokenTab profile={profile} />}
              </React.Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>
    </div>
  )
}

// ===============================
// PROFILE HEADER
// ===============================
const ProfileHeader = ({ profile, reputation, stats, onEdit }) => {
  const handleCopyAddress = () => {
    if (profile?.address) {
      navigator.clipboard.writeText(profile.address)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8 space-y-6 lg:space-y-0">
        {/* Avatar e info básica */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6 space-y-4 sm:space-y-0">
          <div className="relative">
            <Avatar
              src={profile?.avatar}
              alt={profile?.name || 'Perfil'}
              fallback={profile?.name?.charAt(0) || 'U'}
              size="xl"
              className="mx-auto sm:mx-0"
            />
            <button 
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-bazari-primary rounded-full flex items-center justify-center text-white hover:bg-bazari-primary-hover transition-colors"
              onClick={onEdit}
            >
              <Camera size={16} />
            </button>
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2">
              <h1 className="text-2xl font-bold text-bazari-dark">
                {profile?.name || 'Nome do Usuário'}
              </h1>
              {reputation?.level === 'Lendário' && (
                <Crown className="w-5 h-5 text-yellow-500" />
              )}
              {reputation?.level === 'Especialista' && (
                <Award className="w-5 h-5 text-purple-500" />
              )}
            </div>

            <p className="text-bazari-dark/70 mb-3">
              {profile?.bio || 'Adicione uma biografia para se apresentar melhor.'}
            </p>

            {profile?.location && (
              <div className="flex items-center justify-center sm:justify-start space-x-1 text-sm text-bazari-dark/60 mb-2">
                <MapPin size={14} />
                <span>{profile.location}</span>
              </div>
            )}

            {/* Endereço da carteira */}
            <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs font-mono bg-gray-100 rounded-lg p-2 max-w-fit">
              <span className="text-bazari-dark/60">
                {profile?.address ? `${profile.address.substring(0, 12)}...${profile.address.slice(-4)}` : 'Carregando...'}
              </span>
              <button
                onClick={handleCopyAddress}
                className="text-bazari-primary hover:text-bazari-primary-hover"
              >
                <Copy size={12} />
              </button>
            </div>

            {/* Redes sociais */}
            {profile?.social && (
              <div className="flex items-center justify-center sm:justify-start space-x-3 mt-3">
                {profile.social.website && (
                  <a 
                    href={profile.social.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-bazari-dark/60 hover:text-bazari-primary"
                  >
                    <Globe size={18} />
                  </a>
                )}
                {profile.social.twitter && (
                  <a 
                    href={`https://twitter.com/${profile.social.twitter}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-bazari-dark/60 hover:text-bazari-primary"
                  >
                    <Twitter size={18} />
                  </a>
                )}
                {profile.social.instagram && (
                  <a 
                    href={`https://instagram.com/${profile.social.instagram}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-bazari-dark/60 hover:text-bazari-primary"
                  >
                    <Instagram size={18} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="flex-shrink-0">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <StatCard
              label="Reputação"
              value={reputation?.score || 0}
              suffix="/100"
              color="text-bazari-primary"
              badge={reputation?.level || 'Iniciante'}
            />
            <StatCard
              label="Seguidores"
              value={stats?.followers || 0}
              color="text-blue-600"
            />
            <StatCard
              label="Token"
              value={stats?.tokenPrice || 0}
              suffix=" BZR"
              color="text-bazari-secondary"
            />
            <StatCard
              label="Negócios"
              value={stats?.totalBusinesses || 0}
              color="text-green-600"
            />
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex-shrink-0 flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
          <Button size="sm" onClick={onEdit}>
            <Edit size={16} className="mr-2" />
            Editar
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink size={16} className="mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ===============================
// STAT CARD COMPONENT
// ===============================
const StatCard = ({ label, value, suffix = '', color = 'text-bazari-dark', badge }) => (
  <div className="text-center lg:text-right">
    <div className={`text-xl font-bold ${color}`}>
      {value.toLocaleString('pt-BR')}{suffix}
    </div>
    <div className="text-sm text-bazari-dark/60">{label}</div>
    {badge && (
      <Badge variant="primary" size="sm" className="mt-1">
        {badge}
      </Badge>
    )}
  </div>
)

// ===============================
// PROFILE COMPLETION ALERT
// ===============================
const ProfileCompletionAlert = ({ steps }) => (
  <Alert variant="warning" className="flex items-start space-x-3">
    <Star className="w-5 h-5 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="font-semibold mb-2">Complete seu perfil para aumentar sua reputação!</p>
      <div className="space-y-1">
        {steps.slice(0, 3).map((step, index) => (
          <div key={step.field} className="flex items-center text-sm">
            <div className="w-2 h-2 bg-bazari-secondary rounded-full mr-2" />
            {step.label}
          </div>
        ))}
        {steps.length > 3 && (
          <p className="text-xs text-bazari-dark/60 mt-2">
            +{steps.length - 3} mais {steps.length - 3 === 1 ? 'item' : 'itens'}
          </p>
        )}
      </div>
    </div>
  </Alert>
)

// ===============================
// OVERVIEW TAB
// ===============================
const OverviewTab = ({ profile, reputation, stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Informações pessoais */}
      <div>
        <h3 className="text-lg font-semibold text-bazari-dark mb-4">Sobre</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-bazari-dark/70">Biografia</label>
            <p className="text-bazari-dark mt-1">
              {profile?.bio || 'Nenhuma biografia adicionada ainda.'}
            </p>
          </div>
          
          {profile?.skills?.length > 0 && (
            <div>
              <label className="text-sm font-medium text-bazari-dark/70">Habilidades</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="primary" size="sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {profile?.interests?.length > 0 && (
            <div>
              <label className="text-sm font-medium text-bazari-dark/70">Interesses</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" size="sm">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas detalhadas */}
      <div>
        <h3 className="text-lg font-semibold text-bazari-dark mb-4">Estatísticas</h3>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-bazari-dark/70">Completude do Perfil</span>
              <span className="text-sm font-medium">{stats?.completeness || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-bazari-primary"
                initial={{ width: 0 }}
                animate={{ width: `${stats?.completeness || 0}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-bazari-light rounded-lg">
              <div className="text-xl font-bold text-bazari-primary">
                {stats?.totalPosts || 0}
              </div>
              <div className="text-sm text-bazari-dark/70">Posts</div>
            </div>
            <div className="text-center p-3 bg-bazari-light rounded-lg">
              <div className="text-xl font-bold text-bazari-primary">
                {stats?.following || 0}
              </div>
              <div className="text-sm text-bazari-dark/70">Seguindo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// ===============================
// PLACEHOLDER TABS
// ===============================
const BusinessesTab = React.lazy(() => import('./BusinessesTab'))
const ActivityTab = React.lazy(() => import('./ActivityTab'))  
const TokenTab = React.lazy(() => import('./TokenTab'))

// ===============================
// SKELETON LOADING
// ===============================
const ProfileSkeleton = () => (
  <div className="max-w-6xl mx-auto space-y-6">
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-6 lg:space-y-0">
        <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
          <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse" />
          <div className="space-y-3 flex-1">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-48" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-64" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
          </div>
        </div>
      </div>
    </Card>
  </div>
)

export default PerfilMain