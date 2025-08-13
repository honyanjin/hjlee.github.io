import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { isDark, toggleDarkMode } = useTheme()
  const { user, isPartner } = useAuth()

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const partnerPath = user && isPartner ? '/partner' : '/partner/login'
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Projects', path: '/projects' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
    { name: 'Partner', path: partnerPath }
  ]

  return (
    <motion.nav
      id="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-lg dark:bg-gray-900/90' 
          : 'bg-transparent'
      }`}
    >
      <div id="navbar-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div id="navbar-content" className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" id="navbar-logo" className="flex items-center space-x-2">
            <motion.div
              id="logo-text"
              whileHover={{ scale: 1.05 }}
              className={`text-2xl font-bold transition-colors duration-200 ${
                scrolled 
                  ? 'text-gray-900 dark:text-white' 
                  : location.pathname === '/'
                    ? 'text-white drop-shadow-lg'
                    : 'text-gray-900 dark:text-white'
              }`}
            >
              HJLEE
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div id="desktop-nav" className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                id={`nav-link-${item.name.toLowerCase()}`}
                to={item.path}
                className={`relative text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? scrolled 
                      ? 'text-blue-600 dark:text-blue-400'
                      : location.pathname === '/'
                        ? 'text-white drop-shadow-lg'
                        : 'text-blue-600 dark:text-blue-400'
                    : scrolled
                      ? 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                      : location.pathname === '/'
                        ? 'text-white hover:text-blue-200 drop-shadow-lg'
                        : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                }`}
              >
                {item.name}
                {location.pathname === item.path && (
                  <motion.div
                    id="active-tab-indicator"
                    layoutId="activeTab"
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 ${
                      scrolled 
                        ? 'bg-blue-600 dark:bg-blue-400' 
                        : location.pathname === '/'
                          ? 'bg-white'
                          : 'bg-blue-600 dark:bg-blue-400'
                    }`}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div id="navbar-actions" className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              id="dark-mode-toggle"
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Mobile menu button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div id="mobile-nav-content" className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 rounded-lg mt-2 shadow-lg">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    id={`mobile-nav-link-${item.name.toLowerCase()}`}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default Navbar 