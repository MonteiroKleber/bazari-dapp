// apps/web/src/components/Layout.tsx
import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Menu, 
  X, 
  Wallet,
  ShoppingBag,
  Users,
  Palette,
  ArrowRightLeft,
  MessageCircle,
  User,
  LayoutDashboard,
  Globe,
  ChevronRight,
  Shield,
  Github,
  Twitter,
  MessageSquare,
  Send
} from 'lucide-react'
import { WalletConnect } from '@components/wallet/WalletConnect'
import { useTranslation } from 'react-i18next'
import { cn } from '@lib/utils'

interface LayoutProps {
  children?: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: t('modules.wallet'), href: '/wallet', icon: Wallet, color: 'hover:text-bazari-red' },
    { name: t('modules.marketplace'), href: '/marketplace', icon: ShoppingBag, color: 'hover:text-bazari-gold' },
    { name: t('modules.dao'), href: '/dao', icon: Users, color: 'hover:text-bazari-red' },
    { name: t('modules.studio'), href: '/studio', icon: Palette, color: 'hover:text-bazari-gold' },
    { name: t('modules.p2p'), href: '/p2p', icon: ArrowRightLeft, color: 'hover:text-bazari-red' },
    { name: t('modules.social'), href: '/social', icon: MessageCircle, color: 'hover:text-bazari-gold' },
    { name: t('modules.profile'), href: '/profile', icon: User, color: 'hover:text-bazari-red' },
    { name: t('modules.dashboard'), href: '/dashboard', icon: LayoutDashboard, color: 'hover:text-bazari-gold' }
  ]

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('bazari_language', lng)
  }

  return (
    <div className="min-h-screen bg-bazari-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bazari-black/95 backdrop-blur-sm border-b border-bazari-red/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-bazari-red to-bazari-gold rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-xl font-bold text-bazari-sand">Bazari</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname.startsWith(item.href)
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-bazari-red/20 text-bazari-red border border-bazari-red/30"
                        : "text-bazari-sand/70 hover:text-bazari-sand hover:bg-bazari-red/10 border border-transparent",
                      item.color
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-bazari-red/10 rounded-xl -z-10"
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="hidden md:block bg-bazari-black/50 border border-bazari-gold/30 rounded-lg px-3 py-1.5 text-sm text-bazari-sand focus:border-bazari-gold focus:outline-none focus:ring-1 focus:ring-bazari-gold/50"
              >
                <option value="pt-BR" className="bg-bazari-black">🇧🇷 PT</option>
                <option value="en-US" className="bg-bazari-black">🇺🇸 EN</option>
                <option value="es-ES" className="bg-bazari-black">🇪🇸 ES</option>
              </select>

              {/* Wallet Connect */}
              <WalletConnect variant="compact" />

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden text-bazari-sand hover:text-bazari-gold transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="lg:hidden fixed inset-x-0 top-16 z-30 bg-bazari-black/95 backdrop-blur-sm border-b border-bazari-red/20"
        >
          <nav className="container mx-auto px-4 py-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname.startsWith(item.href)
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      isActive
                        ? "bg-bazari-red/20 text-bazari-red border border-bazari-red/30"
                        : "text-bazari-sand/70 hover:text-bazari-sand hover:bg-bazari-red/10"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </Link>
                )
              })}
            </div>

            {/* Mobile Language Selector */}
            <div className="mt-4 pt-4 border-t border-bazari-red/20">
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="w-full bg-bazari-black/50 border border-bazari-gold/30 rounded-xl px-4 py-2.5 text-bazari-sand focus:border-bazari-gold focus:outline-none focus:ring-1 focus:ring-bazari-gold/50"
              >
                <option value="pt-BR">🇧🇷 Português</option>
                <option value="en-US">🇺🇸 English</option>
                <option value="es-ES">🇪🇸 Español</option>
              </select>
            </div>
          </nav>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <footer className="bg-bazari-black/80 border-t border-bazari-red/20 mt-12">
        <div className="container mx-auto px-4 py-12">
          {/* Footer Grid */}
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-bazari-red to-bazari-gold rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">B</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-bazari-red to-bazari-gold bg-clip-text text-transparent">
                  Bazari
                </span>
              </div>
              <p className="text-bazari-sand/60 text-sm">
                Marketplace descentralizado sem intermediários. 100% Web3, 100% do povo.
              </p>
              <div className="flex items-center gap-3">
                <a 
                  href="https://twitter.com/bazari" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-bazari-black/50 border border-bazari-gold/30 rounded-lg flex items-center justify-center text-bazari-sand/60 hover:text-bazari-gold hover:border-bazari-gold transition-all"
                >
                  <Twitter size={16} />
                </a>
                <a 
                  href="https://github.com/bazari" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-bazari-black/50 border border-bazari-gold/30 rounded-lg flex items-center justify-center text-bazari-sand/60 hover:text-bazari-gold hover:border-bazari-gold transition-all"
                >
                  <Github size={16} />
                </a>
                <a 
                  href="https://discord.gg/bazari" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-bazari-black/50 border border-bazari-gold/30 rounded-lg flex items-center justify-center text-bazari-sand/60 hover:text-bazari-gold hover:border-bazari-gold transition-all"
                >
                  <MessageSquare size={16} />
                </a>
                <a 
                  href="https://t.me/bazari" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-bazari-black/50 border border-bazari-gold/30 rounded-lg flex items-center justify-center text-bazari-sand/60 hover:text-bazari-gold hover:border-bazari-gold transition-all"
                >
                  <Send size={16} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-bazari-sand mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/marketplace" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link to="/dao" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    DAO
                  </Link>
                </li>
                <li>
                  <Link to="/wallet" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    Carteira
                  </Link>
                </li>
                <li>
                  <a href="/docs" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    Documentação
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-bazari-sand mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/whitepaper" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    Whitepaper
                  </a>
                </li>
                <li>
                  <a href="/api" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="/developers" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    Desenvolvedores
                  </a>
                </li>
                <li>
                  <a href="/blog" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-bazari-sand mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/terms" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link to="/compliance" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    Compliance
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    Suporte
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="pt-8 border-t border-bazari-red/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-bazari-sand/50">
                <Shield className="h-4 w-4" />
                <span>Segurança auditada • Código aberto • Descentralizado</span>
              </div>
              
              <p className="text-sm text-bazari-sand/50">
                © 2024 Bazari DAO. {t('footer.copyright')}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}