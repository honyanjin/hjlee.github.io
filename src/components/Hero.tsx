import React from 'react'
import { motion } from 'framer-motion'

export interface HeroProps {
  id?: string
  title?: string | null
  subtitle?: string | null
  description?: string | null
  bgImageUrl?: string | null
  ctaLabel?: string | null
  ctaUrl?: string | null
  className?: string
  children?: React.ReactNode
}

const Hero: React.FC<HeroProps> = ({
  id = 'hero-section',
  title,
  subtitle,
  description,
  bgImageUrl,
  ctaLabel,
  ctaUrl,
  className = '',
  children
}) => {
  const backgroundStyle = bgImageUrl
    ? { backgroundImage: `url(${bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' as const }
    : undefined

  return (
    <section
      id={id}
      className={`pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-3 sm:px-4 lg:px-6 ${className}`}
      style={backgroundStyle}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-4 sm:mb-6"
            >
              {subtitle}
            </motion.p>
          )}

          {title && (
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6"
            >
              {title}
            </motion.h1>
          )}

          {description && (
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4"
            >
              {description}
            </motion.p>
          )}

          {ctaLabel && ctaUrl && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-6"
            >
              <a
                href={ctaUrl}
                className="inline-flex items-center px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {ctaLabel}
              </a>
            </motion.div>
          )}
        </motion.div>

        {children}
      </div>
    </section>
  )
}

export default Hero

// Also provide a named export for flexibility in imports
export { Hero }


