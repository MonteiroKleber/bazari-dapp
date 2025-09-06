// apps/web/src/components/Layout.tsx
import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
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
                        ? "bg-bazari-red/20 text-bazari-red"
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
                className="w-full bg-bazari-black/50 border border-bazari-gold/30 rounded-lg px-3 py-2 text-bazari-sand focus:border-bazari-gold focus:outline-none"
              >
                <option value="pt-BR" className="bg-bazari-black">🇧🇷 Português</option>
                <option value="en-US" className="bg-bazari-black">🇺🇸 English</option>
                <option value="es-ES" className="bg-bazari-black">🇪🇸 Español</option>
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
      <footer className="bg-bazari-black border-t border-bazari-red/20 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-bazari-red to-bazari-gold rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">B</span>
                </div>
                <span className="text-xl font-bold text-bazari-sand">Bazari</span>
              </div>
              <p className="text-bazari-sand/60 text-sm">
                {t('footer.description')}
              </p>
              <div className="flex gap-3">
                <a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </a>
                <a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">
                  <Send className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-bazari-sand mb-4">{t('footer.quickLinks')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/marketplace" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    {t('footer.marketplace')}
                  </Link>
                </li>
                <li>
                  <Link to="/dao" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    {t('footer.dao')}
                  </Link>
                </li>
                <li>
                  <Link to="/wallet" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    {t('footer.wallet')}
                  </Link>
                </li>
                <li>
                  <a href="/docs" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    {t('footer.documentation')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-bazari-sand mb-4">{t('footer.resources')}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/whitepaper" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    {t('footer.whitepaper')}
                  </a>
                </li>
                <li>
                  <a href="/api" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    {t('footer.api')}
                  </a>
                </li>
                <li>
                  <a href="/developers" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    {t('footer.developers')}
                  </a>
                </li>
                <li>
                  <a href="/support" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    {t('footer.links.support')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="font-semibold text-bazari-sand mb-4">{t('footer.community.title')}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    {t('footer.community.discord')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    {t('footer.community.telegram')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    {t('footer.community.twitter')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-bazari-sand/60 hover:text-bazari-gold text-sm transition-colors">
                    {t('footer.community.github')}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-bazari-red/20 text-center">
            <p className="text-bazari-sand/40 text-sm">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}