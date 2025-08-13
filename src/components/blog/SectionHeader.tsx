import React from 'react'
import { motion } from 'framer-motion'

interface SectionHeaderProps {
  id?: string
  title: string
  description?: string
  className?: string
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ id, title, description, className }) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className={`text-center mb-8 sm:mb-12 lg:mb-16 ${className ?? ''}`}
    >
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300">{description}</p>
      )}
    </motion.div>
  )
}

export default SectionHeader



