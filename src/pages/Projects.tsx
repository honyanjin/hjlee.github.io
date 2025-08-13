import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Github, Eye } from 'lucide-react'
import Navbar from '../components/Navbar'
import DotNavigation from '../components/DotNavigation'
import SEO from '../components/SEO'
import ImageWithFallback from '../components/ImageWithFallback'
import Hero from '../components/Hero'
import { supabase, testSupabaseConnection } from '../lib/supabase'
import type { Project, ProjectCategory } from '../lib/supabase'

// Intersection Observer 커스텀 훅
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

// Project 타입 정의 (카테고리 정보 포함)
interface ProjectWithCategory extends Project {
  project_category?: ProjectCategory;
}

// Project Card 컴포넌트
interface ProjectCardProps {
  project: ProjectWithCategory;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const [ref, inView] = useInView(0.2);
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="relative overflow-hidden">
        <ImageWithFallback 
          src={project.image_url}
          alt={project.title}
          className="w-full h-48 sm:h-56 lg:h-64 object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-1 sm:gap-2">
          {project.live_url && (
            <a 
              href={project.live_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-gray-900 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ExternalLink size={14} className="sm:w-4 sm:h-4" />
            </a>
          )}
          {project.github_url && (
            <a 
              href={project.github_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-gray-900 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Github size={14} className="sm:w-4 sm:h-4" />
            </a>
          )}
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
          {project.title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {project.tags.map((tag) => (
            <span 
              key={tag}
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded-full dark:bg-blue-900 dark:text-blue-200"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          {project.live_url && (
            <a 
              href={project.live_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 sm:gap-2 bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <Eye size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Live Demo</span>
              <span className="sm:hidden">Demo</span>
            </a>
          )}
          {project.github_url && (
            <a 
              href={project.github_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 sm:gap-2 bg-gray-800 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm sm:text-base"
            >
              <Github size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Source Code</span>
              <span className="sm:hidden">Code</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [projects, setProjects] = useState<ProjectWithCategory[]>([])
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageSettings, setPageSettings] = useState<{
    hero_title?: string | null
    hero_description?: string | null
    hero_bg_image_url?: string | null
    hero_cta_label?: string | null
    hero_cta_url?: string | null
  } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 먼저 연결 테스트
        const isConnected = await testSupabaseConnection()
        if (!isConnected) {
          throw new Error('Supabase 연결에 실패했습니다.')
        }
        
        // 프로젝트 카테고리 가져오기
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('project_categories')
          .select('*')
          .order('sort_order', { ascending: true })

        if (categoriesError) {
          console.error('카테고리 로딩 에러:', categoriesError)
        } else {
          setCategories(categoriesData || [])
        }
        
        // 페이지 설정 가져오기
        const { data: settingsData, error: settingsError } = await supabase
          .from('projects_page_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle()

        if (!settingsError && settingsData) {
          setPageSettings(settingsData)
        }

        // 프로젝트 데이터 가져오기 (카테고리 정보 포함)
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            project_category:project_categories(*)
          `)
          .eq('is_published', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false })



        if (error) {
          console.error('Supabase 에러:', error)
          throw error
        }

        setProjects(data || [])
      } catch (err: any) {
        console.error('프로젝트를 불러오는 중 오류가 발생했습니다:', err)
        console.error('에러 상세 정보:', {
          message: err.message,
          code: err.code,
          details: err.details,
          hint: err.hint
        })
        setError(`프로젝트를 불러오는데 실패했습니다: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.project_category?.slug === activeFilter)

  const featuredProjects = projects.filter(project => project.featured)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300">프로젝트를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-red-600 dark:text-red-400 text-base sm:text-lg lg:text-xl mb-4 px-4">
              {error}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DotNavigation
        sections={[
          'projects-hero',
          ...(featuredProjects.length > 0 ? ['featured-projects-section'] : []),
          'all-projects-section',
        ]}
      />
      <SEO 
        title="Projects - 이호진 포트폴리오"
        description="프론트엔드 개발자 이호진의 프로젝트들을 확인하세요. React, TypeScript, Node.js를 활용한 다양한 웹 애플리케이션들을 소개합니다."
        keywords="프로젝트, 포트폴리오, 웹개발, React, TypeScript, Node.js, 프로젝트 갤러리"
        type="website"
      />
      <Navbar />
      
      {/* Hero Section */}
      <Hero
        id="projects-hero"
        title={pageSettings?.hero_title ?? "My Projects"}
        description={pageSettings?.hero_description ?? "지금까지 작업한 프로젝트들을 소개합니다. 각 프로젝트는 사용자 경험을 중시하며, 최신 기술 스택을 활용하여 개발되었습니다."}
        bgImageUrl={pageSettings?.hero_bg_image_url ?? undefined}
        ctaLabel={pageSettings?.hero_cta_label ?? undefined}
        ctaUrl={pageSettings?.hero_cta_url ?? undefined}
      >

          {/* Filter Buttons */}
          <div className="mb-12 px-4">
            {/* Desktop: Centered flex layout */}
            <div className="hidden sm:flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                전체
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveFilter(category.slug)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeFilter === category.slug
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            {/* Mobile: Scrollable horizontal layout */}
            <div className="sm:hidden overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 min-w-max px-2">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap flex-shrink-0 ${
                    activeFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  전체
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveFilter(category.slug)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap flex-shrink-0 ${
                      activeFilter === category.slug
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Hero>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section id="featured-projects-section" className="py-12 sm:py-16 lg:py-20 px-4 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Featured Projects
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300">
                대표 프로젝트들을 소개합니다
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {featuredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Projects */}
      <section id="all-projects-section" className="py-12 sm:py-16 lg:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              All Projects
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300">
              모든 프로젝트를 확인해보세요
            </p>
          </motion.div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                해당 카테고리의 프로젝트가 없습니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative overflow-hidden">
                    <ImageWithFallback 
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-40 sm:h-48 object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="flex gap-1.5 sm:gap-2 opacity-0 hover:opacity-100 transition-opacity">
                        {project.live_url && (
                          <a 
                            href={project.live_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white text-gray-900 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <ExternalLink size={14} className="sm:w-4 sm:h-4" />
                          </a>
                        )}
                        {project.github_url && (
                          <a 
                            href={project.github_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white text-gray-900 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Github size={14} className="sm:w-4 sm:h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {project.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Projects 