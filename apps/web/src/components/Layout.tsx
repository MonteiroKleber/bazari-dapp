import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
  LayoutDashboard
} from 'lucide-react'
import { WalletConnect } from '@components/wallet/WalletConnect'
import { useTranslation } from 'react-i18next'
import { cn } from '@lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: t('modules.wallet'), href: '/wallet', icon: Wallet },
    { name: t('modules.marketplace'), href: '/marketplace', icon: ShoppingBag },
    { name: t('modules.dao'), href: '/dao', icon: Users },
    { name: t('modules.studio'), href: '/studio', icon: Palette },
    { name: t('modules.p2p'), href: '/p2p', icon: ArrowRightLeft },
    { name: t('modules.social'), href: '/social', icon: MessageCircle },
    { name: t('modules.profile'), href: '/profile', icon: User },
    { name: t('modules.dashboard'), href: '/dashboard', icon: LayoutDashboard }
  ]

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="min-h-screen bg-bazari-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bazari-black/95 backdrop-blur-sm border-b border-bazari-gold/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-bazari-red to-bazari-gold rounded-full" />
              <span className="text-xl font-bold text-bazari-sand">Bazari</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                      location.pathname.startsWith(item.href)
                        ? "bg-bazari-gold/10 text-bazari-gold"
                        : "text-bazari-sand/70 hover:text-bazari-sand hover:bg-bazari-gold/5"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="hidden md:block bg-transparent border border-bazari-gold/30 rounded-lg px-3 py-1 text-sm text-bazari-sand focus:border-bazari-gold focus:outline-none"
              >
                <option value="pt-BR" className="bg-bazari-black">🇧🇷 PT</option>
                <option value="en-US" className="bg-bazari-black">🇺🇸 EN</option>
                <option value="es-ES" className="bg-bazari-black">🇪🇸 ES</option>
              </select>

              {/* Wallet Connect */}
              <WalletConnect variant="compact" />

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden text-bazari-sand"
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
          className="lg:hidden fixed inset-x-0 top-16 z-30 bg-bazari-black/95 backdrop-blur-sm border-b border-bazari-gold/20"
        >
          <nav className="container mx-auto px-4 py-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      location.pathname.startsWith(item.href)
                        ? "bg-bazari-gold/10 text-bazari-gold"
                        : "text-bazari-sand/70 hover:text-bazari-sand hover:bg-bazari-gold/5"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Mobile Language Selector */}
            <div className="mt-4 pt-4 border-t border-bazari-gold/20">
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="w-full bg-bazari-black/50 border border-bazari-gold/30 rounded-lg px-4 py-2 text-bazari-sand focus:border-bazari-gold focus:outline-none"
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
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-bazari-black/50 border-t border-bazari-gold/20 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-bazari-sand/50">
              {t('footer.copyright')}
            </p>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="text-sm text-bazari-sand/50 hover:text-bazari-sand">
                {t('footer.legal.terms')}
              </Link>
              <Link to="/privacy" className="text-sm text-bazari-sand/50 hover:text-bazari-sand">
                {t('footer.legal.privacy')}
              </Link>
              <a 
                href="https://github.com/bazari" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-bazari-sand/50 hover:text-bazari-sand"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}