import { useState } from 'react'
import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, Download } from 'lucide-react'
import Navbar from '../components/Navbar'

const Home = () => {
  const [activeFilter, setActiveFilter] = useState('all')

  const projects = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      category: 'web',
      image: '/src/content/pic_projects/Project_Temp_0.jpg',
      description: 'React와 Node.js로 개발한 풀스택 이커머스 플랫폼',
      tags: ['React', 'Node.js', 'MongoDB']
    },
    {
      id: 2,
      title: 'Task Management App',
      category: 'app',
      image: '/src/content/pic_projects/Project_Temp_1.jpg',
      description: 'TypeScript와 Firebase를 활용한 실시간 태스크 관리 앱',
      tags: ['TypeScript', 'Firebase', 'Tailwind']
    },
    {
      id: 3,
      title: 'Portfolio Website',
      category: 'web',
      image: '/src/content/pic_projects/Project_Temp_2.jpg',
      description: 'React와 Tailwind CSS로 제작한 반응형 포트폴리오',
      tags: ['React', 'Tailwind', 'Framer Motion']
    },
    {
      id: 4,
      title: 'Weather Dashboard',
      category: 'app',
      image: '/src/content/pic_projects/Project_Temp_3.jpg',
      description: 'OpenWeather API를 활용한 날씨 대시보드',
      tags: ['JavaScript', 'API', 'CSS3']
    }
  ]

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter)

  return (
    <div id="home-page" className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section id="hero-section" className="relative h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 overflow-hidden">
        {/* Background Animation */}
        <div id="hero-background" className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-white opacity-5 rounded-full"></div>
        </div>

        <div id="hero-content" className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              id="hero-text"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white text-center lg:text-left"
            >
              <motion.h1 
                id="hero-title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl lg:text-6xl font-bold mb-4"
              >
                안녕하세요!<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                  HJLEE
                </span>입니다
              </motion.h1>
              <motion.p 
                id="hero-subtitle"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl lg:text-2xl mb-8 text-blue-100"
              >
                풀스택 개발자 & UI/UX 디자이너
              </motion.p>
              <motion.p 
                id="hero-description"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-lg mb-8 text-blue-100 max-w-lg"
              >
                사용자 경험을 중시하는 웹 애플리케이션을 개발합니다.
                React, TypeScript, Node.js를 주로 사용하며,
                깔끔하고 직관적인 솔루션을 제공합니다.
              </motion.p>
              <motion.div 
                id="hero-buttons"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <button id="download-resume-btn" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                  <Download size={20} />
                  이력서 다운로드
                </button>
                <button id="view-projects-btn" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  프로젝트 보기
                </button>
              </motion.div>
            </motion.div>

            {/* Profile Image */}
            <motion.div
              id="hero-profile"
              initial={{ opacity: 0, x: 50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative">
                {/* Main Profile Image */}
                <div id="profile-image-container" className="relative w-80 h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl border-4 border-white/20">
                  <img 
                    id="profile-image"
                    src="/src/content/pic_profile/hjlee_Profile_0.JPG" 
                    alt="HJLEE Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Floating Elements */}
                <motion.div
                  id="floating-react"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-4 -right-4 bg-white rounded-lg p-3 shadow-lg"
                >
                  <div className="text-blue-600 font-bold text-sm">React</div>
                </motion.div>
                
                <motion.div
                  id="floating-typescript"
                  animate={{ 
                    y: [0, 10, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-lg p-3 shadow-lg"
                >
                  <div className="text-purple-600 font-bold text-sm">TypeScript</div>
                </motion.div>
                
                <motion.div
                  id="floating-nodejs"
                  animate={{ 
                    x: [0, 10, 0],
                    rotate: [0, 3, 0]
                  }}
                  transition={{ 
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                  className="absolute top-1/2 -left-8 bg-white rounded-lg p-3 shadow-lg"
                >
                  <div className="text-green-600 font-bold text-sm">Node.js</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          id="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            id="scroll-indicator-container"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
          >
            <motion.div
              id="scroll-indicator-dot"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about-section" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            id="about-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 id="about-title" className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              About Me
            </h2>
            <p id="about-description" className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              안녕하세요! 저는 사용자 경험을 중시하는 풀스택 개발자입니다. 
              React, TypeScript, Node.js를 주로 사용하며, 
              깔끔하고 직관적인 웹 애플리케이션을 만드는 것을 좋아합니다.
            </p>
          </motion.div>

          {/* Skills Grid */}
          <div id="skills-grid" className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div 
              id="frontend-skills"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Frontend</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>React & TypeScript</li>
                <li>Next.js & Vue.js</li>
                <li>Tailwind CSS & Styled Components</li>
                <li>Framer Motion & GSAP</li>
              </ul>
            </motion.div>

            <motion.div 
              id="backend-skills"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Backend</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>Node.js & Express</li>
                <li>Python & Django</li>
                <li>PostgreSQL & MongoDB</li>
                <li>AWS & Docker</li>
              </ul>
            </motion.div>

            <motion.div 
              id="tools-skills"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Tools</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>Git & GitHub</li>
                <li>Figma & Adobe XD</li>
                <li>Jira & Notion</li>
                <li>Vercel & Netlify</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects-section" className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            id="projects-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 id="projects-title" className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              My Projects
            </h2>
            <p id="projects-description" className="text-xl text-gray-600 dark:text-gray-300">
              최근 작업한 프로젝트들을 소개합니다
            </p>
          </motion.div>

          {/* Filter Buttons */}
          <div id="project-filters" className="flex justify-center gap-4 mb-12">
            {['all', 'web', 'app'].map((filter) => (
              <button
                key={filter}
                id={`filter-${filter}`}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {filter === 'all' ? '전체' : filter === 'web' ? '웹' : '앱'}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div id="projects-grid" className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                id={`project-${project.id}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative overflow-hidden">
                  <img 
                    id={`project-image-${project.id}`}
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <button id={`project-view-btn-${project.id}`} className="bg-white text-gray-900 px-4 py-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                      자세히 보기
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 id={`project-title-${project.id}`} className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {project.title}
                  </h3>
                  <p id={`project-description-${project.id}`} className="text-gray-600 dark:text-gray-300 mb-4">
                    {project.description}
                  </p>
                  <div id={`project-tags-${project.id}`} className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-900 dark:text-blue-200"
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

      {/* Contact Section */}
      <section id="contact-section" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            id="contact-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 id="contact-title" className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Get In Touch
            </h2>
            <p id="contact-description" className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              프로젝트나 협업에 관심이 있으시다면 언제든 연락주세요!
            </p>
            <div id="contact-buttons" className="flex justify-center gap-6">
              <a id="email-contact-btn" href="mailto:email@example.com" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                <Mail size={20} />
                이메일 보내기
              </a>
              <a id="github-contact-btn" href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors">
                <Github size={20} />
                GitHub
              </a>
              <a id="linkedin-contact-btn" href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors">
                <Linkedin size={20} />
                LinkedIn
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home 