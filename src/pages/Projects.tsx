import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Github, Eye } from 'lucide-react'
import Navbar from '../components/Navbar'
import SEO from '../components/SEO'

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

// Project Card 컴포넌트
interface ProjectCardProps {
  project: {
    id: number;
    title: string;
    category: string;
    image: string;
    description: string;
    tags: string[];
    liveUrl: string;
    githubUrl: string;
    featured: boolean;
  };
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
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <a 
            href={project.liveUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ExternalLink size={16} />
          </a>
          <a 
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
          <a 
            href={project.liveUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye size={16} />
            Live Demo
          </a>
          <a 
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
  );
};

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('all')

  const projects = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      category: 'web',
      image: '/src/content/pic_projects/Project_Temp_0.jpg',
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
      image: '/src/content/pic_projects/Project_Temp_1.jpg',
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
      image: '/src/content/pic_projects/Project_Temp_2.jpg',
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
      image: '/src/content/pic_projects/Project_Temp_3.jpg',
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
      image: '/src/content/pic_projects/Project_Temp_0.jpg',
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
      image: '/src/content/pic_projects/Project_Temp_1.jpg',
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
            {['all', 'web', 'app'].map((filter) => (
              <button
                key={filter}
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
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <a 
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
        </div>
      </section>
    </div>
  )
}

export default Projects 