import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Github, Eye } from 'lucide-react'
import Navbar from '../components/Navbar'

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('all')

  const projects = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      category: 'web',
      image: 'https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=E-Commerce',
      description: 'React와 Node.js로 개발한 풀스택 이커머스 플랫폼입니다. 사용자 인증, 상품 관리, 결제 시스템을 포함한 완전한 온라인 쇼핑몰입니다.',
      tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/example',
      featured: true
    },
    {
      id: 2,
      title: 'Task Management App',
      category: 'app',
      image: 'https://via.placeholder.com/600x400/10B981/FFFFFF?text=Task+App',
      description: 'TypeScript와 Firebase를 활용한 실시간 태스크 관리 앱입니다. 팀 협업과 실시간 업데이트 기능을 제공합니다.',
      tags: ['TypeScript', 'Firebase', 'Tailwind', 'React'],
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/example',
      featured: true
    },
    {
      id: 3,
      title: 'Portfolio Website',
      category: 'web',
      image: 'https://via.placeholder.com/600x400/8B5CF6/FFFFFF?text=Portfolio',
      description: 'React와 Tailwind CSS로 제작한 반응형 포트폴리오 웹사이트입니다. 모던한 디자인과 부드러운 애니메이션을 특징으로 합니다.',
      tags: ['React', 'Tailwind', 'Framer Motion'],
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/example',
      featured: false
    },
    {
      id: 4,
      title: 'Weather Dashboard',
      category: 'app',
      image: 'https://via.placeholder.com/600x400/F59E0B/FFFFFF?text=Weather',
      description: 'OpenWeather API를 활용한 날씨 대시보드입니다. 현재 날씨와 7일 예보를 제공하며, 위치 기반 서비스를 지원합니다.',
      tags: ['JavaScript', 'API', 'CSS3', 'HTML5'],
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/example',
      featured: false
    },
    {
      id: 5,
      title: 'Blog Platform',
      category: 'web',
      image: 'https://via.placeholder.com/600x400/EF4444/FFFFFF?text=Blog',
      description: 'Next.js와 Prisma를 사용한 블로그 플랫폼입니다. 마크다운 지원, 댓글 시스템, 관리자 패널을 포함합니다.',
      tags: ['Next.js', 'Prisma', 'PostgreSQL', 'TypeScript'],
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/example',
      featured: false
    },
    {
      id: 6,
      title: 'Chat Application',
      category: 'app',
      image: 'https://via.placeholder.com/600x400/06B6D4/FFFFFF?text=Chat',
      description: 'Socket.io를 활용한 실시간 채팅 애플리케이션입니다. 개인 메시지, 그룹 채팅, 파일 공유 기능을 제공합니다.',
      tags: ['Socket.io', 'Express', 'React', 'MongoDB'],
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/example',
      featured: false
    }
  ]

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter)

  const featuredProjects = projects.filter(project => project.featured)

  return (
    <div id="projects-page" className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section id="projects-hero" className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            id="projects-hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 id="projects-hero-title" className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              My Projects
            </h1>
            <p id="projects-hero-description" className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              지금까지 작업한 프로젝트들을 소개합니다. 
              각 프로젝트는 사용자 경험을 중시하며, 최신 기술 스택을 활용하여 개발되었습니다.
            </p>
          </motion.div>

          {/* Filter Buttons */}
          <div id="project-filters" className="flex justify-center gap-4 mb-12">
            {['all', 'web', 'app'].map((filter) => (
              <button
                key={filter}
                id={`filter-${filter}`}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {filter === 'all' ? '전체' : filter === 'web' ? '웹' : '앱'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="featured-projects-section" className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            id="featured-projects-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 id="featured-projects-title" className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Projects
            </h2>
            <p id="featured-projects-description" className="text-xl text-gray-600 dark:text-gray-300">
              대표 프로젝트들을 소개합니다
            </p>
          </motion.div>

          <div id="featured-projects-grid" className="grid lg:grid-cols-2 gap-8">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                id={`featured-project-${project.id}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="relative overflow-hidden">
                  <img 
                    id={`featured-project-image-${project.id}`}
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <a 
                      id={`featured-project-live-${project.id}`}
                      href={project.liveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <a 
                      id={`featured-project-github-${project.id}`}
                      href={project.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Github size={16} />
                    </a>
                  </div>
                </div>
                <div className="p-6">
                  <h3 id={`featured-project-title-${project.id}`} className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                    {project.title}
                  </h3>
                  <p id={`featured-project-description-${project.id}`} className="text-gray-600 dark:text-gray-300 mb-4">
                    {project.description}
                  </p>
                  <div id={`featured-project-tags-${project.id}`} className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div id={`featured-project-buttons-${project.id}`} className="flex gap-4">
                    <a 
                      id={`featured-project-live-btn-${project.id}`}
                      href={project.liveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye size={16} />
                      Live Demo
                    </a>
                    <a 
                      id={`featured-project-source-btn-${project.id}`}
                      href={project.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      <Github size={16} />
                      Source Code
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Projects */}
      <section id="all-projects-section" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            id="all-projects-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 id="all-projects-title" className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              All Projects
            </h2>
            <p id="all-projects-description" className="text-xl text-gray-600 dark:text-gray-300">
              모든 프로젝트를 확인해보세요
            </p>
          </motion.div>

          <div id="all-projects-grid" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                id={`project-${project.id}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative overflow-hidden">
                  <img 
                    id={`project-image-${project.id}`}
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
                      <a 
                        id={`project-live-${project.id}`}
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <a 
                        id={`project-github-${project.id}`}
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Github size={16} />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 id={`project-title-${project.id}`} className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {project.title}
                  </h3>
                  <p id={`project-description-${project.id}`} className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  <div id={`project-tags-${project.id}`} className="flex flex-wrap gap-2">
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
        </div>
      </section>
    </div>
  )
}

export default Projects 