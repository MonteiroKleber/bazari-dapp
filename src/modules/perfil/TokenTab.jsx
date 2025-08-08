import React from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  BarChart3, PieChart, Copy, ExternalLink, 
  ArrowUpRight, ArrowDownRight, Coins, Star,
  Info, Wallet, Activity
} from 'lucide-react'
import { Button, Card, Badge, Alert, Input } from '@components/BaseComponents'
import { useTranslation } from '@i18n/useTranslation'
import { useAuth } from '@modules/acesso/useAuthStore'
import { useProfile, useProfileToken } from './useProfileStore'

// ===============================
// TOKEN TAB
// ===============================
const TokenTab = () => {
  const { user } = useAuth()
  const { profile, reputation } = useProfile()
  const { simulateTokenTrade, isLoading, error } = useProfileToken()

  const token = profile?.token
  const [tradeAmount, setTradeAmount] = React.useState('')
  const [tradeType, setTradeType] = React.useState('buy') // buy or sell

  const handleTrade = async () => {
    if (!user?.id || !tradeAmount || isNaN(tradeAmount)) return

    try {
      const result = await simulateTokenTrade(user.id, tradeType, parseFloat(tradeAmount))
      if (result.success) {
        setTradeAmount('')
      }
    } catch (err) {
      console.error('Erro no trade:', err)
    }
  }

  const copyTokenAddress = () => {
    if (token?.symbol) {
      navigator.clipboard.writeText(`${token.symbol}_${user?.id}`)
    }
  }

  const priceChange24h = 0.05 // Simulated 5% change
  const isPositive = priceChange24h >= 0

  return (
    <div className="max-w-4xl space-y-6">
      {/* Token Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Token Info */}
        <div className="lg:col-span-2">
          <TokenOverviewCard 
            token={token}
            profile={profile}
            priceChange24h={priceChange24h}
            isPositive={isPositive}
            onCopyAddress={copyTokenAddress}
          />
        </div>

        {/* Quick Trade */}
        <div>
          <QuickTradeCard
            token={token}
            tradeAmount={tradeAmount}
            setTradeAmount={setTradeAmount}
            tradeType={tradeType}
            setTradeType={setTradeType}
            onTrade={handleTrade}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>

      {/* Token Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TokenStatCard
          title="Preço Atual"
          value={`${token?.price?.toFixed(4) || '0.0010'} BZR`}
          change={`${isPositive ? '+' : ''}${(priceChange24h * 100).toFixed(2)}%`}
          changeColor={isPositive ? 'text-success' : 'text-error'}
          icon={DollarSign}
        />
        
        <TokenStatCard
          title="Market Cap"
          value={`${(token?.marketCap || 0).toFixed(2)} BZR`}
          subtitle="Valor total do token"
          icon={BarChart3}
        />
        
        <TokenStatCard
          title="Supply Total"
          value={`${(token?.supply || 0).toLocaleString()} ${token?.symbol || 'TOKENS'}`}
          subtitle="Tokens em circulação"
          icon={Coins}
        />
        
        <TokenStatCard
          title="Holders"
          value={token?.holders || 1}
          subtitle="Pessoas que possuem"
          icon={Users}
        />
      </div>

      {/* Token Performance & Reputation Link */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TokenPerformanceCard token={token} profile={profile} />
        <ReputationImpactCard reputation={reputation} token={token} />
      </div>

      {/* Token Economics */}
      <TokenEconomicsCard token={token} profile={profile} reputation={reputation} />
    </div>
  )
}

// ===============================
// TOKEN OVERVIEW CARD
// ===============================
const TokenOverviewCard = ({ token, profile, priceChange24h, isPositive, onCopyAddress }) => (
  <Card className="p-6">
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-bazari-primary rounded-full flex items-center justify-center text-white font-bold">
            {token?.symbol?.charAt(0) || 'T'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-bazari-dark">
              Token {token?.symbol || 'PROFILE'}
            </h2>
            <p className="text-bazari-dark/70">
              Token pessoal de {profile?.name || 'Usuário'}
            </p>
          </div>
        </div>
        
        <button
          onClick={onCopyAddress}
          className="flex items-center space-x-2 text-sm text-bazari-dark/60 hover:text-bazari-primary transition-colors"
        >
          <span className="font-mono">
            {token?.symbol ? `${token.symbol}_${profile?.id?.substring(0, 8)}` : 'Carregando...'}
          </span>
          <Copy size={14} />
        </button>
      </div>

      <Badge variant="primary" size="sm">
        Ativo
      </Badge>
    </div>

    {/* Price Display */}
    <div className="mb-6">
      <div className="flex items-end space-x-4">
        <div>
          <div className="text-3xl font-bold text-bazari-dark">
            {token?.price?.toFixed(4) || '0.0010'} BZR
          </div>
          <div className={`flex items-center text-sm ${isPositive ? 'text-success' : 'text-error'}`}>
            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span>{isPositive ? '+' : ''}{(priceChange24h * 100).toFixed(2)}% (24h)</span>
          </div>
        </div>

        <div className="text-sm text-bazari-dark/60">
          <div>Market Cap: {(token?.marketCap || 0).toFixed(2)} BZR</div>
          <div>Volume 24h: {((token?.marketCap || 0) * 0.1).toFixed(2)} BZR</div>
        </div>
      </div>
    </div>

    {/* Mini Chart Placeholder */}
    <div className="h-24 bg-bazari-light rounded-lg flex items-center justify-center mb-4">
      <div className="text-bazari-dark/60 text-sm">
        <TrendingUp className="w-6 h-6 mx-auto mb-1" />
        Gráfico de preço (em breve)
      </div>
    </div>

    {/* Quick Actions */}
    <div className="flex space-x-3">
      <Button size="sm" className="flex-1">
        <Wallet size={16} className="mr-1" />
        Comprar
      </Button>
      <Button variant="outline" size="sm" className="flex-1">
        <Activity size={16} className="mr-1" />
        Vender
      </Button>
      <Button variant="ghost" size="sm">
        <ExternalLink size={16} />
      </Button>
    </div>
  </Card>
)

// ===============================
// QUICK TRADE CARD
// ===============================
const QuickTradeCard = ({ 
  token, 
  tradeAmount, 
  setTradeAmount, 
  tradeType, 
  setTradeType, 
  onTrade, 
  isLoading, 
  error 
}) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold text-bazari-dark mb-4">
      Trade Rápido
    </h3>

    <div className="space-y-4">
      {/* Buy/Sell Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setTradeType('buy')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            tradeType === 'buy' 
              ? 'bg-success text-white shadow-sm' 
              : 'text-gray-600'
          }`}
        >
          Comprar
        </button>
        <button
          onClick={() => setTradeType('sell')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            tradeType === 'sell' 
              ? 'bg-error text-white shadow-sm' 
              : 'text-gray-600'
          }`}
        >
          Vender
        </button>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-bazari-dark mb-2">
          Quantidade (BZR)
        </label>
        <Input
          type="number"
          step="0.0001"
          min="0"
          value={tradeAmount}
          onChange={(e) => setTradeAmount(e.target.value)}
          placeholder="0.0000"
          disabled={isLoading}
        />
        <div className="text-xs text-bazari-dark/60 mt-1">
          Min: 0.0001 BZR
        </div>
      </div>

      {/* Trade Summary */}
      {tradeAmount && !isNaN(tradeAmount) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bazari-light p-3 rounded-lg"
        >
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Você vai {tradeType === 'buy' ? 'comprar' : 'vender'}:</span>
              <span className="font-medium">
                {(parseFloat(tradeAmount) / (token?.price || 0.001)).toFixed(0)} {token?.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Preço unitário:</span>
              <span>{token?.price?.toFixed(4)} BZR</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>{parseFloat(tradeAmount || 0).toFixed(4)} BZR</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="error" className="text-sm">
          {error}
        </Alert>
      )}

      {/* Trade Button */}
      <Button
        onClick={onTrade}
        disabled={!tradeAmount || isNaN(tradeAmount) || parseFloat(tradeAmount) <= 0 || isLoading}
        loading={isLoading}
        className="w-full"
        variant={tradeType === 'buy' ? 'primary' : 'outline'}
      >
        {tradeType === 'buy' ? 'Comprar Tokens' : 'Vender Tokens'}
      </Button>

      {/* Disclaimer */}
      <div className="text-xs text-bazari-dark/60 text-center">
        <Info size={12} className="inline mr-1" />
        Esta é uma simulação para demonstração
      </div>
    </div>
  </Card>
)

// ===============================
// TOKEN STAT CARD
// ===============================
const TokenStatCard = ({ title, value, subtitle, change, changeColor, icon: Icon }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between mb-2">
      <Icon size={20} className="text-bazari-primary" />
      {change && (
        <span className={`text-sm font-medium ${changeColor}`}>
          {change}
        </span>
      )}
    </div>
    <div className="text-lg font-bold text-bazari-dark mb-1">
      {value}
    </div>
    <div className="text-sm text-bazari-dark/60">
      {subtitle || title}
    </div>
  </Card>
)

// ===============================
// TOKEN PERFORMANCE CARD
// ===============================
const TokenPerformanceCard = ({ token, profile }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold text-bazari-dark mb-4">
      Performance do Token
    </h3>
    
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-bazari-dark/70">Variação 1h</span>
        <span className="text-success">+1.2%</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-bazari-dark/70">Variação 24h</span>
        <span className="text-success">+5.0%</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-bazari-dark/70">Variação 7d</span>
        <span className="text-error">-2.1%</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-bazari-dark/70">ATH (Máxima histórica)</span>
        <span className="font-medium">{((token?.price || 0) * 1.15).toFixed(4)} BZR</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-bazari-dark/70">ATL (Mínima histórica)</span>
        <span className="font-medium">{((token?.price || 0) * 0.8).toFixed(4)} BZR</span>
      </div>
    </div>
  </Card>
)

// ===============================
// REPUTATION IMPACT CARD
// ===============================
const ReputationImpactCard = ({ reputation, token }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold text-bazari-dark mb-4">
      Impacto da Reputação
    </h3>
    
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-bazari-dark/70">Score de Reputação</span>
        <div className="flex items-center space-x-2">
          <Badge variant="primary" size="sm">
            {reputation?.score || 0}/100
          </Badge>
          <Star size={16} className="text-bazari-secondary" />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-bazari-dark/70">Multiplicador de Preço</span>
        <span className="font-medium">
          {(1 + (reputation?.score || 0) / 200).toFixed(2)}x
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-bazari-dark/70">Bonus por Nível</span>
        <span className="font-medium text-success">
          +{((reputation?.score || 0) * 0.5).toFixed(0)}%
        </span>
      </div>

      <div className="bg-bazari-light p-3 rounded-lg">
        <div className="text-sm text-bazari-dark/80">
          <strong>Dica:</strong> Aumente sua reputação completando o perfil, 
          criando negócios e participando da DAO para valorizar seu token!
        </div>
      </div>
    </div>
  </Card>
)

// ===============================
// TOKEN ECONOMICS CARD
// ===============================
const TokenEconomicsCard = ({ token, profile, reputation }) => (
  <Card className="p-6">
    <h3 className="text-xl font-semibold text-bazari-dark mb-6">
      Economia do Token
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <h4 className="font-medium text-bazari-dark mb-3">Distribuição</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-bazari-dark/70">Criador (você)</span>
            <span>70%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bazari-dark/70">Pool de Liquidez</span>
            <span>20%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bazari-dark/70">Reserva DAO</span>
            <span>10%</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-bazari-dark mb-3">Utilidade</h4>
        <div className="space-y-2 text-sm text-bazari-dark/70">
          <div>• Acesso a conteúdo premium</div>
          <div>• Desconto em seus negócios</div>
          <div>• Voto em suas decisões</div>
          <div>• Stake para recompensas</div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-bazari-dark mb-3">Métricas</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-bazari-dark/70">TVL</span>
            <span>{(token?.marketCap || 0).toFixed(2)} BZR</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bazari-dark/70">Yield APY</span>
            <span className="text-success">12.5%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-bazari-dark/70">Burn Rate</span>
            <span>0.1%/mês</span>
          </div>
        </div>
      </div>
    </div>
  </Card>
)

export default TokenTab