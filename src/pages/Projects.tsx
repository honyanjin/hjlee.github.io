import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Github, Eye } from 'lucide-react'
import Navbar from '../components/Navbar'
import SEO from '../components/SEO'
import ImageWithFallback from '../components/ImageWithFallback'
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
          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          {project.live_url && (
            <a 
              href={project.live_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ExternalLink size={16} />
            </a>
          )}
          {project.github_url && (
            <a 
              href={project.github_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Github size={16} />
            </a>
          )}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
          {project.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag) => (
            <span 
              key={tag}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-900 dark:text-blue-200"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-4">
          {project.live_url && (
            <a 
              href={project.live_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye size={16} />
              Live Demo
            </a>
          )}
          {project.github_url && (
            <a 
              href={project.github_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
            >
              <Github size={16} />
              Source Code
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('프로젝트 데이터를 가져오는 중...')
        
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

        console.log('Supabase 응답:', { data, error })

        if (error) {
          console.error('Supabase 에러:', error)
          throw error
        }

        console.log('가져온 프로젝트 수:', data?.length || 0)
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
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">프로젝트를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-red-600 dark:text-red-400 text-xl mb-4">
              {error}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
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
      <SEO 
        title="Projects - 이호진 포트폴리오"
        description="프론트엔드 개발자 이호진의 프로젝트들을 확인하세요. React, TypeScript, Node.js를 활용한 다양한 웹 애플리케이션들을 소개합니다."
        keywords="프로젝트, 포트폴리오, 웹개발, React, TypeScript, Node.js, 프로젝트 갤러리"
        type="website"
      />
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              My Projects
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              지금까지 작업한 프로젝트들을 소개합니다. 
              각 프로젝트는 사용자 경험을 중시하며, 최신 기술 스택을 활용하여 개발되었습니다.
            </p>
          </motion.div>

          {/* Filter Buttons */}
          <div className="flex justify-center gap-4 mb-12">
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
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="py-20 px-4 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Featured Projects
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                대표 프로젝트들을 소개합니다
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {featuredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Projects */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              All Projects
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              모든 프로젝트를 확인해보세요
            </p>
          </motion.div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                해당 카테고리의 프로젝트가 없습니다.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
                        {project.live_url && (
                          <a 
                            href={project.live_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        {project.github_url && (
                          <a 
                            href={project.github_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Github size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200"
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