// apps/web/src/pages/Landing.tsx
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Wallet, 
  ShoppingBag, 
  Users, 
  Sparkles, 
  ArrowUpDown, 
  MessageCircle,
  BarChart3,
  User,
  Globe,
  ChevronRight,
  Menu,
  X,
  ArrowRight,
  Shield,
  Zap,
  Coins,
  Github,
  Twitter,
  MessageSquare,
  Send
} from 'lucide-react'
import { useState } from 'react'

export default function Landing() {
  const { t, i18n } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const modules = [
    { id: 'wallet', icon: Wallet, path: '/wallet', color: 'hover:bg-bazari-red' },
    { id: 'marketplace', icon: ShoppingBag, path: '/marketplace', color: 'hover:bg-bazari-gold' },
    { id: 'dao', icon: Users, path: '/dao', color: 'hover:bg-bazari-red' },
    { id: 'studio', icon: Sparkles, path: '/studio', color: 'hover:bg-bazari-gold' },
    { id: 'p2p', icon: ArrowUpDown, path: '/p2p', color: 'hover:bg-bazari-red' },
    { id: 'social', icon: MessageCircle, path: '/social', color: 'hover:bg-bazari-gold' },
    { id: 'dashboard', icon: BarChart3, path: '/dashboard', color: 'hover:bg-bazari-red' },
    { id: 'profile', icon: User, path: '/profile', color: 'hover:bg-bazari-gold' },
  ]

  const features = [
    { key: 'wallet', icon: Wallet },
    { key: 'marketplace', icon: ShoppingBag },
    { key: 'dao', icon: Users },
    { key: 'studio', icon: Sparkles },
    { key: 'p2p', icon: ArrowUpDown },
    { key: 'social', icon: MessageCircle },
  ]

  const economics = [
    { label: 'economics.seller', value: '88%', color: 'bg-bazari-red' },
    { label: 'economics.dao_treasury', value: '8%', color: 'bg-bazari-gold' },
    { label: 'economics.validators', value: '2%', color: 'bg-orange-600' },
    { label: 'economics.cashback', value: '2%', color: 'bg-green-600' },
  ]

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('bazari_language', lang)
  }

  return (
    <div className="min-h-screen bg-bazari-black text-bazari-sand overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-bazari-black/95 backdrop-blur-md z-50 border-b border-bazari-red/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-bazari-red to-bazari-gold rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-2xl font-bold text-gradient-bazari">Bazari</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="hover:text-bazari-gold transition-colors">{t('nav.home')}</Link>
              <a href="#features" className="hover:text-bazari-gold transition-colors">{t('nav.features')}</a>
              <a href="#economics" className="hover:text-bazari-gold transition-colors">{t('nav.economics')}</a>
              <a href="#docs" className="hover:text-bazari-gold transition-colors">{t('nav.docs')}</a>
            </div>

            {/* Language Selector & Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <select 
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent border border-bazari-red/50 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-bazari-gold"
              >
                <option value="pt-BR" className="bg-bazari-black">🇧🇷 PT</option>
                <option value="en-US" className="bg-bazari-black">🇺🇸 EN</option>
                <option value="es-ES" className="bg-bazari-black">🇪🇸 ES</option>
              </select>
              
              <Link 
                to="/auth" 
                className="px-4 py-2 text-bazari-gold hover:text-bazari-sand transition-colors"
              >
                {t('nav.login')}
              </Link>
              <Link 
                to="/auth" 
                className="px-4 py-2 bg-bazari-red text-white rounded-xl hover:bg-bazari-red/80 transition-all hover:shadow-lg"
              >
                {t('nav.register')}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-bazari-sand hover:text-bazari-gold"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-bazari-black/95 border-t border-bazari-red/20"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link to="/" className="block hover:text-bazari-gold transition-colors">{t('nav.home')}</Link>
              <a href="#features" className="block hover:text-bazari-gold transition-colors">{t('nav.features')}</a>
              <a href="#economics" className="block hover:text-bazari-gold transition-colors">{t('nav.economics')}</a>
              <a href="#docs" className="block hover:text-bazari-gold transition-colors">{t('nav.docs')}</a>
              <div className="pt-4 border-t border-bazari-red/20 space-y-2">
                <Link 
                  to="/auth" 
                  className="block w-full px-4 py-2 text-bazari-gold hover:text-bazari-sand transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.login')}
                </Link>
                <Link 
                  to="/auth" 
                  className="block w-full px-4 py-2 bg-bazari-red text-white rounded-xl hover:bg-bazari-red/80 transition-all text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.register')}
                </Link>
              </div>
              <div className="pt-4 border-t border-bazari-red/20">
                <select 
                  value={i18n.language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="w-full bg-transparent border border-bazari-red/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-bazari-gold"
                >
                  <option value="pt-BR" className="bg-bazari-black">🇧🇷 Português</option>
                  <option value="en-US" className="bg-bazari-black">🇺🇸 English</option>
                  <option value="es-ES" className="bg-bazari-black">🇪🇸 Español</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-gradient-bazari">{t('hero.title')}</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-4 text-bazari-sand/80">
              {t('hero.subtitle')}
            </p>
            
            <p className="text-lg mb-8 text-bazari-sand/60 max-w-2xl mx-auto">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/auth">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-bazari-red text-white rounded-2xl font-semibold text-lg hover:bg-bazari-red/80 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <span>{t('hero.cta.getStarted')}</span>
                  <ArrowRight size={20} />
                </motion.button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-transparent border-2 border-bazari-gold text-bazari-gold rounded-2xl font-semibold text-lg hover:bg-bazari-gold/10 transition-all flex items-center justify-center space-x-2"
              >
                <span>{t('hero.cta.learnMore')}</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Modules Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-center mb-8 text-bazari-sand/80">
              {t('modules.title')}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {modules.map((module, index) => {
                const Icon = module.icon
                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Link
                      to={module.path}
                      className={`block p-6 bg-bazari-black/50 border border-bazari-red/20 rounded-2xl ${module.color} transition-all hover:scale-105 hover:shadow-lg group`}
                    >
                      <Icon className="w-8 h-8 text-bazari-sand mb-3 group-hover:text-white transition-colors" />
                      <p className="text-sm font-medium text-bazari-sand group-hover:text-white transition-colors">
                        {t(`modules.${module.id}`)}
                      </p>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gradient-to-b from-bazari-black to-bazari-black/80">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-bazari-sand">
              {t('features.title')}
            </h2>
            <p className="text-lg text-bazari-sand/60">
              {t('features.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-bazari-black/50 border border-bazari-red/20 rounded-2xl p-6 hover:border-bazari-gold/50 transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-bazari-red to-bazari-gold rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-bazari-sand">
                    {t(`features.${feature.key}.title`)}
                  </h3>
                  <p className="text-bazari-sand/60">
                    {t(`features.${feature.key}.description`)}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Economics Section */}
      <section id="economics" className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-bazari-sand">
              {t('economics.title')}
            </h2>
            <p className="text-lg text-bazari-sand/60">
              {t('economics.subtitle')}
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {economics.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-center justify-between bg-bazari-black/50 border border-bazari-red/20 rounded-xl p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-bazari-sand font-medium">
                      {t(item.label)}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-bazari-sand">
                    {item.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-bazari-red to-bazari-gold rounded-3xl p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {t('cta.title')}
            </h2>
            <p className="text-lg mb-8 text-white/90">
              {t('cta.subtitle')}
            </p>
            <Link to="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-bazari-red rounded-2xl font-semibold text-lg hover:bg-white/90 transition-all shadow-xl"
              >
                {t('cta.button')}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bazari-black border-t border-bazari-red/20 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-bazari-red to-bazari-gold rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">B</span>
                </div>
                <span className="text-2xl font-bold text-gradient-bazari">Bazari</span>
              </div>
              <p className="text-bazari-sand/60 text-sm">
                {t('footer.description')}
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">
                  <Github size={20} />
                </a>
                <a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">
                  <MessageSquare size={20} />
                </a>
                <a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">
                  <Send size={20} />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold mb-4 text-bazari-sand">{t('footer.links.title')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">{t('footer.links.about')}</a></li>
                <li><a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">{t('footer.links.docs')}</a></li>
                <li><a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">{t('footer.links.blog')}</a></li>
                <li><a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">{t('footer.links.support')}</a></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="font-semibold mb-4 text-bazari-sand">{t('footer.community.title')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">{t('footer.community.discord')}</a></li>
                <li><a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">{t('footer.community.telegram')}</a></li>
                <li><a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">{t('footer.community.twitter')}</a></li>
                <li><a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">{t('footer.community.github')}</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4 text-bazari-sand">{t('footer.legal.title')}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">{t('footer.legal.terms')}</a></li>
                <li><a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">{t('footer.legal.privacy')}</a></li>
                <li><a href="#" className="text-bazari-sand/60 hover:text-bazari-gold transition-colors">{t('footer.legal.cookies')}</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-bazari-red/20 text-center text-sm text-bazari-sand/40">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}