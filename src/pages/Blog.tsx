import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('all')

  const blogPosts = [
    {
      id: 1,
      title: 'React 18의 새로운 기능들',
      excerpt: 'React 18에서 도입된 새로운 기능들을 살펴보고, 실제 프로젝트에 어떻게 적용할 수 있는지 알아봅니다.',
      content: 'React 18은 Concurrent Features, Automatic Batching, Suspense on the Server 등 많은 새로운 기능들을 도입했습니다...',
      category: 'react',
      author: 'HJLEE',
      date: '2024-01-15',
      readTime: '5분',
      image: 'https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=React+18',
      tags: ['React', 'JavaScript', 'Frontend']
    },
    {
      id: 2,
      title: 'TypeScript로 더 안전한 코드 작성하기',
      excerpt: 'TypeScript를 사용하여 타입 안전성을 확보하고, 개발 생산성을 높이는 방법을 소개합니다.',
      content: 'TypeScript는 JavaScript에 정적 타입을 추가하여 개발 시 발생할 수 있는 오류를 미리 방지할 수 있습니다...',
      category: 'typescript',
      author: 'HJLEE',
      date: '2024-01-10',
      readTime: '7분',
      image: 'https://via.placeholder.com/600x400/3178C6/FFFFFF?text=TypeScript',
      tags: ['TypeScript', 'JavaScript', 'Development']
    },
    {
      id: 3,
      title: 'Tailwind CSS로 빠른 UI 개발하기',
      excerpt: 'Tailwind CSS를 활용하여 빠르고 일관된 UI를 개발하는 방법과 팁을 공유합니다.',
      content: 'Tailwind CSS는 유틸리티 퍼스트 CSS 프레임워크로, 빠른 UI 개발을 가능하게 합니다...',
      category: 'css',
      author: 'HJLEE',
      date: '2024-01-05',
      readTime: '4분',
      image: 'https://via.placeholder.com/600x400/06B6D4/FFFFFF?text=Tailwind',
      tags: ['CSS', 'Tailwind', 'Frontend']
    },
    {
      id: 4,
      title: 'Node.js와 Express로 REST API 구축하기',
      excerpt: 'Node.js와 Express를 사용하여 RESTful API를 구축하는 방법을 단계별로 설명합니다.',
      content: 'Node.js는 서버 사이드 JavaScript 런타임으로, Express와 함께 사용하면 빠르게 API를 구축할 수 있습니다...',
      category: 'backend',
      author: 'HJLEE',
      date: '2023-12-28',
      readTime: '8분',
      image: 'https://via.placeholder.com/600x400/339933/FFFFFF?text=Node.js',
      tags: ['Node.js', 'Express', 'Backend']
    },
    {
      id: 5,
      title: '데이터베이스 설계의 기본 원칙',
      excerpt: '효율적인 데이터베이스 설계를 위한 기본 원칙들과 실제 적용 사례를 살펴봅니다.',
      content: '데이터베이스 설계는 애플리케이션의 성능과 확장성에 직접적인 영향을 미칩니다...',
      category: 'database',
      author: 'HJLEE',
      date: '2023-12-20',
      readTime: '6분',
      image: 'https://via.placeholder.com/600x400/336791/FFFFFF?text=Database',
      tags: ['Database', 'SQL', 'Backend']
    },
    {
      id: 6,
      title: 'Git과 GitHub로 협업하기',
      excerpt: 'Git과 GitHub를 사용하여 팀 프로젝트에서 효과적으로 협업하는 방법을 알아봅니다.',
      content: 'Git은 분산 버전 관리 시스템으로, 여러 개발자가 함께 작업할 때 필수적인 도구입니다...',
      category: 'git',
      author: 'HJLEE',
      date: '2023-12-15',
      readTime: '5분',
      image: 'https://via.placeholder.com/600x400/F05032/FFFFFF?text=Git',
      tags: ['Git', 'GitHub', 'Collaboration']
    }
  ]

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'react', name: 'React' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'css', name: 'CSS' },
    { id: 'backend', name: 'Backend' },
    { id: 'database', name: 'Database' },
    { id: 'git', name: 'Git' }
  ]

  const filteredPosts = activeCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory)

  const featuredPost = blogPosts[0]

  return (
    <div id="blog-page" className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section id="blog-hero" className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            id="blog-hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 id="blog-hero-title" className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Blog
            </h1>
            <p id="blog-hero-description" className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              개발 경험과 기술적인 내용을 공유하는 블로그입니다. 
              새로운 기술을 배우고 적용하는 과정에서 얻은 인사이트를 나눕니다.
            </p>
          </motion.div>

          {/* Category Filter */}
          <div id="blog-category-filters" className="flex justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                id={`category-filter-${category.id}`}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeCategory === category.id
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

      {/* Featured Post */}
      <section id="featured-post-section" className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            id="featured-post-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 id="featured-post-title" className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Post
            </h2>
            <p id="featured-post-description" className="text-xl text-gray-600 dark:text-gray-300">
              최신 블로그 포스트를 확인해보세요
            </p>
          </motion.div>

          <motion.div
            id="featured-post-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg"
          >
            <div className="grid lg:grid-cols-2">
              <div className="relative overflow-hidden">
                <img 
                  id="featured-post-image"
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <span id="featured-post-category" className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-900 dark:text-blue-200">
                    {featuredPost.category}
                  </span>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar size={16} />
                    <span id="featured-post-date" className="text-sm">{featuredPost.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock size={16} />
                    <span id="featured-post-read-time" className="text-sm">{featuredPost.readTime}</span>
                  </div>
                </div>
                <h3 id="featured-post-title-text" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {featuredPost.title}
                </h3>
                <p id="featured-post-excerpt" className="text-gray-600 dark:text-gray-300 mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <User size={16} />
                    <span id="featured-post-author" className="text-sm">{featuredPost.author}</span>
                  </div>
                  <button id="featured-post-read-more" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
                    <span>자세히 보기</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* All Posts */}
      <section id="all-posts-section" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            id="all-posts-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 id="all-posts-title" className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              All Posts
            </h2>
            <p id="all-posts-description" className="text-xl text-gray-600 dark:text-gray-300">
              모든 블로그 포스트를 확인해보세요
            </p>
          </motion.div>

          <div id="all-posts-grid" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                id={`blog-post-${post.id}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative overflow-hidden">
                  <img 
                    id={`blog-post-image-${post.id}`}
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span id={`blog-post-category-${post.id}`} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span id={`blog-post-date-${post.id}`}>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span id={`blog-post-read-time-${post.id}`}>{post.readTime}</span>
                    </div>
                  </div>
                  <h3 id={`blog-post-title-${post.id}`} className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {post.title}
                  </h3>
                  <p id={`blog-post-excerpt-${post.id}`} className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div id={`blog-post-tags-${post.id}`} className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full dark:bg-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <User size={14} />
                      <span id={`blog-post-author-${post.id}`} className="text-sm">{post.author}</span>
                    </div>
                    <button id={`blog-post-read-more-${post.id}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
                      <span className="text-sm">자세히 보기</span>
                      <ArrowRight size={14} />
                    </button>
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

export default Blog 