import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface DotNavigationProps {
  sections: string[]
  titles?: Record<string, string>
}

const DotNavigation = ({ sections, titles = {} }: DotNavigationProps) => {
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3

      let currentSection = 0
      sections.forEach((sectionId, index) => {
        const element = document.getElementById(sectionId)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            currentSection = index
          }
        }
      })
      setActiveSection(currentSection)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const getSectionTitle = (sectionId: string): string => {
    const defaultTitles: Record<string, string> = {
      // 홈 페이지 기본 매핑
      'hero-section': '홈',
      'about-section': '소개',
      'featured-projects-section': '대표 프로젝트',
      'projects-section': '모든 프로젝트',
      'contact-section': '연락처',

      // 페이지별 일반적인 섹션 id 대응
      'about-hero': '소개',
      'experience-section': '경력',
      'education-section': '학력',
      'projects-hero': '프로젝트',
      'all-projects-section': '전체 프로젝트',
      'blog-hero': '블로그',
      'featured-post-section': '추천 글',
      'all-posts-section': '전체 글',
      'contact-hero': '문의',
      'contact-form-section': '연락하기',
    }
    const map = { ...defaultTitles, ...titles }
    return map[sectionId] || sectionId
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 1.2 }}
      className="fixed right-4 lg:right-8 top-1/2 transform -translate-y-1/2 z-50 hidden md:block"
    >
      <div className="flex flex-col gap-3 lg:gap-4">
        {sections.map((sectionId, index) => (
          <motion.button
            key={sectionId}
            onClick={() => scrollToSection(sectionId)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={`relative w-3 h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-300 ${
              activeSection === index
                ? 'bg-gray-800 dark:bg-white shadow-lg scale-125'
                : 'bg-gray-600/50 dark:bg-white/50 hover:bg-gray-700 dark:hover:bg-white/80'
            }`}
            title={getSectionTitle(sectionId)}
          >
            <motion.div
              className={`w-full h-full rounded-full ${
                activeSection === index ? 'bg-gray-800 dark:bg-white' : 'bg-transparent'
              }`}
              animate={{
                scale: activeSection === index ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 0.5,
                repeat: activeSection === index ? Infinity : 0,
              }}
            />
            {/* 툴팁 */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute right-5 lg:right-6 top-1/2 transform -translate-y-1/2 bg-gray-800/90 dark:bg-white/90 text-white dark:text-gray-800 text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none"
            >
              {getSectionTitle(sectionId)}
            </motion.div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default DotNavigation 