// ===============================
// PERFIL MAIN - CORRIGIDO
// ===============================

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Edit, Camera, MapPin, Globe, Twitter, Instagram,
  Award, Crown, Copy, Star, TrendingUp, Users, Calendar,
  ChevronRight, Plus
} from 'lucide-react'
import { useProfile, useProfileUI } from './useProfileStore'
import { Button, Card, Badge, Avatar } from '@components/BaseComponents'

// ===============================
// TAB SKELETON COMPONENT (DEFINIDO)
// ===============================
const TabSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
    <div className="h-32 bg-gray-200 rounded"></div>
  </div>
)

// ===============================
// PERFIL MAIN COMPONENT
// ===============================

const PerfilMain = () => {
  const { profile, reputation, isLoading } = useProfile()
  const { activeTab, setActiveTab } = useProfileUI()
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = () => {
    if (profile?.address) {
      navigator.clipboard.writeText(profile.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleEditProfile = () => {
    // Implementar edição de perfil
    console.log('Editar perfil')
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: User },
    { id: 'businesses', label: 'Negócios', icon: Users },
    { id: 'activity', label: 'Atividade', icon: TrendingUp },
    { id: 'token', label: 'Meu Token', icon: Star }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bazari-bg pb-20">
        <div className="px-4 pt-6">
          <TabSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bazari-bg pb-20">
      {/* Header do Perfil */}
      <div className="bg-gradient-to-br from-bazari-primary to-bazari-primary-dark text-white">
        <div className="px-4 pt-6 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar
                src={profile?.avatar || `/api/placeholder/120/120`}
                alt={profile?.name || 'Usuário'}
                size="xl"
                className="border-4 border-white/20"
              />
              <button 
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-bazari-primary rounded-full flex items-center justify-center text-white hover:bg-bazari-primary-hover transition-colors"
                onClick={handleEditProfile}
              >
                <Camera size={16} />
              </button>
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2">
                <h1 className="text-2xl font-bold text-white">
                  {profile?.name || 'Nome do Usuário'}
                </h1>
                {reputation?.level === 'Lendário' && (
                  <Crown className="w-5 h-5 text-yellow-400" />
                )}
                {reputation?.level === 'Especialista' && (
                  <Award className="w-5 h-5 text-purple-400" />
                )}
              </div>

              <p className="text-white/80 mb-3">
                {profile?.bio || 'Adicione uma biografia para se apresentar melhor.'}
              </p>

              {profile?.location && (
                <div className="flex items-center justify-center sm:justify-start space-x-1 text-sm text-white/70 mb-2">
                  <MapPin size={14} />
                  <span>{profile.location}</span>
                </div>
              )}

              {/* Endereço da carteira */}
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs font-mono bg-white/10 rounded-lg p-2 max-w-fit mb-3">
                <span className="text-white/80">
                  {profile?.address ? `${profile.address.substring(0, 12)}...${profile.address.slice(-4)}` : 'Carregando...'}
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="text-white/80 hover:text-white"
                >
                  <Copy size={12} />
                </button>
              </div>

              {copied && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs bg-white/20 px-2 py-1 rounded-full text-center mb-2"
                >
                  ✅ Endereço copiado!
                </motion.div>
              )}

              {/* Redes sociais */}
              {profile?.social && (
                <div className="flex items-center justify-center sm:justify-start space-x-3">
                  {profile.social.website && (
                    <a 
                      href={profile.social.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-white"
                    >
                      <Globe size={18} />
                    </a>
                  )}
                  {profile.social.twitter && (
                    <a 
                      href={`https://twitter.com/${profile.social.twitter}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-white"
                    >
                      <Twitter size={18} />
                    </a>
                  )}
                  {profile.social.instagram && (
                    <a 
                      href={`https://instagram.com/${profile.social.instagram}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-white"
                    >
                      <Instagram size={18} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Stats do perfil */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-white">{reputation?.score || 0}</div>
                <div className="text-xs text-white/70">Reputação</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">{profile?.completeness || 0}%</div>
                <div className="text-xs text-white/70">Completo</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">R$ {profile?.tokenValue || '0,00'}</div>
                <div className="text-xs text-white/70">Valor Token</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação por abas */}
      <div className="px-4 mb-6 -mt-4">
        <div className="bg-white rounded-2xl p-1 shadow-lg">
          <div className="grid grid-cols-4 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl font-medium text-xs transition-all duration-300 ${
                    isActive
                      ? 'bg-bazari-primary text-white shadow-lg'
                      : 'text-gray-600 hover:text-bazari-primary hover:bg-bazari-primary/5'
                  }`}
                >
                  <Icon size={18} className="mb-1" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Conteúdo das abas */}
      <div className="px-4">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <OverviewTab profile={profile} reputation={reputation} />}
          {activeTab === 'businesses' && <BusinessesTab />}
          {activeTab === 'activity' && <ActivityTab />}
          {activeTab === 'token' && <TokenTab profile={profile} />}
        </motion.div>
      </div>
    </div>
  )
}

// ===============================
// OVERVIEW TAB
// ===============================
const OverviewTab = ({ profile, reputation }) => {
  return (
    <div className="space-y-6">
      {/* Card de Reputação */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-bazari-dark">Reputação</h3>
          <Badge variant="success" className="text-sm">
            {reputation?.level || 'Iniciante'}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Pontuação atual</span>
            <span className="font-medium">{reputation?.score || 0} pontos</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-bazari-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${((reputation?.score || 0) / 1000) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-600">
            <span>0</span>
            <span>1000 pontos</span>
          </div>
        </div>
      </Card>

      {/* Habilidades */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-bazari-dark mb-4">Habilidades</h3>
        <div className="flex flex-wrap gap-2">
          {profile?.skills?.length > 0 ? (
            profile.skills.map((skill, index) => (
              <Badge key={index} variant="outline" className="text-sm">
                {skill}
              </Badge>
            ))
          ) : (
            <p className="text-gray-600 text-sm">Nenhuma habilidade adicionada ainda.</p>
          )}
        </div>
        <Button variant="outline" size="sm" className="mt-4">
          <Plus size={16} />
          Adicionar habilidade
        </Button>
      </Card>

      {/* Completude do perfil */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-bazari-dark mb-4">Completude do Perfil</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span className="font-medium">{profile?.completeness || 0}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${profile?.completeness || 0}%` }}
            />
          </div>
          
          <div className="space-y-2 mt-4">
            {[
              { label: 'Foto de perfil', completed: !!profile?.avatar },
              { label: 'Biografia', completed: !!profile?.bio },
              { label: 'Localização', completed: !!profile?.location },
              { label: 'Habilidades', completed: profile?.skills?.length > 0 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <span className={item.completed ? 'text-green-600' : 'text-gray-400'}>
                  {item.completed ? '✅' : '⭕'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

// ===============================
// PLACEHOLDER TABS
// ===============================
const BusinessesTab = () => (
  <Card className="p-8 text-center">
    <Users size={48} className="mx-auto mb-4 text-gray-400" />
    <h3 className="text-xl font-semibold mb-2">Meus Negócios</h3>
    <p className="text-gray-600">Gerencie seus negócios tokenizados</p>
  </Card>
)

const ActivityTab = () => (
  <Card className="p-8 text-center">
    <TrendingUp size={48} className="mx-auto mb-4 text-gray-400" />
    <h3 className="text-xl font-semibold mb-2">Atividade</h3>
    <p className="text-gray-600">Seu feed de atividades descentralizado</p>
  </Card>
)

const TokenTab = ({ profile }) => (
  <Card className="p-8 text-center">
    <Star size={48} className="mx-auto mb-4 text-gray-400" />
    <h3 className="text-xl font-semibold mb-2">Meu Token</h3>
    <p className="text-gray-600">Valor atual: R$ {profile?.tokenValue || '0,00'}</p>
  </Card>
)

export default PerfilMain