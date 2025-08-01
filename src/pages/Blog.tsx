import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, User, ArrowRight, Search, Tag } from 'lucide-react'
import Navbar from '../components/Navbar'
import SEO from '../components/SEO'
import ShareButtons from '../components/ShareButtons'
import { supabase } from '../lib/supabase'
import type { BlogPost, Category } from '../lib/supabase'

const Blog = () => {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('all')
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // 포스트 데이터 가져오기
  useEffect(() => {
    fetchPosts()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (err: any) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (err: any) {
      setError('포스트를 불러오는데 실패했습니다.')
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }

  // 필터링된 포스트
  const filteredPosts = posts.filter(post => {
    const categoryMatch = activeCategory === 'all' || post.category === activeCategory
    const searchMatch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return categoryMatch && searchMatch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 dark:text-gray-400">포스트를 불러오는 중...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              포스트를 불러올 수 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchPosts}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 카테고리별 CSS 클래스
  const getCategoryClass = (category: string) => {
    // 기본 색상 (카테고리를 찾을 수 없는 경우)
    const defaultColors: Record<string, string> = {
      'react': 'bg-gradient-to-br from-blue-400 to-blue-600',
      'typescript': 'bg-gradient-to-br from-blue-500 to-blue-700',
      'javascript': 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      'css': 'bg-gradient-to-br from-blue-600 to-blue-800',
      'backend': 'bg-gradient-to-br from-green-500 to-green-700',
      'database': 'bg-gradient-to-br from-blue-700 to-blue-900',
      'git': 'bg-gradient-to-br from-orange-500 to-orange-700',
      'default': 'bg-gradient-to-br from-gray-500 to-gray-700'
    }
    
    // 카테고리가 없거나 빈 문자열인 경우 기본값 반환
    if (!category || category.trim() === '') {
      return defaultColors['default']
    }
    
    // 먼저 기본 색상에서 찾기
    const defaultResult = defaultColors[category.toLowerCase()]
    if (defaultResult) {
      return defaultResult
    }
    
    // 동적 카테고리에서 찾기
    const foundCategory = categories.find(cat => 
      cat.id === category || 
      cat.slug === category || 
      cat.name.toLowerCase() === category.toLowerCase()
    )
    
    if (foundCategory) {
      // 색상에 따른 기본 그라데이션 매핑
      const colorToGradient: Record<string, string> = {
        '#61DAFB': 'bg-gradient-to-br from-blue-400 to-blue-600', // React
        '#3178C6': 'bg-gradient-to-br from-blue-500 to-blue-700', // TypeScript
        '#F7DF1E': 'bg-gradient-to-br from-yellow-400 to-yellow-600', // JavaScript
        '#1572B6': 'bg-gradient-to-br from-blue-600 to-blue-800', // CSS
        '#4CAF50': 'bg-gradient-to-br from-green-500 to-green-700', // Backend
        '#2196F3': 'bg-gradient-to-br from-blue-700 to-blue-900', // Database
        '#F05032': 'bg-gradient-to-br from-orange-500 to-orange-700', // Git
        '#FF6B6B': 'bg-gradient-to-br from-red-400 to-red-600', // Red
        '#4ECDC4': 'bg-gradient-to-br from-teal-400 to-teal-600', // Teal
        '#45B7D1': 'bg-gradient-to-br from-cyan-400 to-cyan-600', // Cyan
        '#96CEB4': 'bg-gradient-to-br from-emerald-400 to-emerald-600', // Emerald
        '#FFEAA7': 'bg-gradient-to-br from-amber-400 to-amber-600', // Amber
        '#DDA0DD': 'bg-gradient-to-br from-purple-400 to-purple-600', // Purple
        '#98D8C8': 'bg-gradient-to-br from-green-400 to-green-600', // Green
        '#F7DC6F': 'bg-gradient-to-br from-yellow-400 to-yellow-600', // Yellow
        '#BB8FCE': 'bg-gradient-to-br from-violet-400 to-violet-600', // Violet
        '#85C1E9': 'bg-gradient-to-br from-sky-400 to-sky-600', // Sky
        '#F8C471': 'bg-gradient-to-br from-orange-400 to-orange-600', // Orange
        '#82E0AA': 'bg-gradient-to-br from-emerald-400 to-emerald-600', // Emerald
        '#F1948A': 'bg-gradient-to-br from-rose-400 to-rose-600', // Rose
        '#FF69B4': 'bg-gradient-to-br from-pink-400 to-pink-600', // Pink
        '#FF1493': 'bg-gradient-to-br from-pink-500 to-pink-700', // Deep Pink
        '#FFB6C1': 'bg-gradient-to-br from-pink-300 to-pink-500', // Light Pink
        '#FFC0CB': 'bg-gradient-to-br from-pink-200 to-pink-400', // Pink
      }
      
      return colorToGradient[foundCategory.color] || defaultColors['default']
    }
    
    return defaultColors['default']
  }

  // 포스트 이미지 처리
  const getPostImageProps = (post: BlogPost) => {
    if (post.image_url) {
      return {
        src: post.image_url,
        className: "w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      }
    }
    return {
      className: `${getCategoryClass(post.category || '')} w-full h-full flex items-center justify-center hover:scale-105 transition-transform duration-300`
    }
  }

  // 배경 이미지용 클래스 (이미지가 없을 때)
  const getBackgroundClass = (post: BlogPost) => {
    if (post.image_url) return ""
    return getCategoryClass(post.category || '')
  }

  const featuredPost = posts[0]

  return (
    <div id="blog-page" className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO 
        title="블로그 - 이호진 포트폴리오"
        description="프론트엔드 개발자 이호진의 기술 블로그입니다. React, TypeScript, 웹 개발 관련 글들을 확인하세요."
        keywords="블로그, 기술블로그, React, TypeScript, 웹개발, 프론트엔드"
        type="website"
      />
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

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-md mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="포스트 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </motion.div>

          {/* Category Filter */}
          <div id="blog-category-filters" className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              전체
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                id={`category-filter-${category.slug}`}
                onClick={() => setActiveCategory(category.slug)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeCategory === category.slug
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

          {featuredPost ? (
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
                  {featuredPost.image_url ? (
                    <img 
                      id="featured-post-image"
                      {...getPostImageProps(featuredPost)}
                      alt={featuredPost.title}
                    />
                  ) : (
                    <div 
                      id="featured-post-image"
                      className={`w-full h-full flex items-center justify-center hover:scale-105 transition-transform duration-300 ${getBackgroundClass(featuredPost)}`}
                    >
                      <div className="text-white text-center">
                        <div className="text-4xl font-bold mb-2">{featuredPost.category?.toUpperCase()}</div>
                        <div className="text-lg opacity-90">Blog Post</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span id="featured-post-category" className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-900 dark:text-blue-200">
                      {featuredPost.category}
                    </span>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar size={16} />
                      <span id="featured-post-date" className="text-sm">
                        {new Date(featuredPost.published_at || featuredPost.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <h3 id="featured-post-title-text" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {featuredPost.title}
                  </h3>
                  <p id="featured-post-excerpt" className="text-gray-600 dark:text-gray-300 mb-6">
                    {featuredPost.excerpt}
                  </p>
                  {featuredPost.tags && featuredPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {featuredPost.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full dark:bg-gray-600 dark:text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <User size={16} />
                      <span id="featured-post-author" className="text-sm">{featuredPost.author}</span>
                    </div>
                    <button 
                      id="featured-post-read-more" 
                      onClick={() => navigate(`/blog/${featuredPost.id}`)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span>자세히 보기</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">아직 발행된 포스트가 없습니다.</p>
            </div>
          )}
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

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || activeCategory !== 'all' 
                  ? '검색 결과가 없습니다.' 
                  : '아직 발행된 포스트가 없습니다.'}
              </p>
            </div>
          ) : (
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
                    {post.image_url ? (
                      <img 
                        id={`blog-post-image-${post.id}`}
                        {...getPostImageProps(post)}
                        alt={post.title}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div 
                        id={`blog-post-image-${post.id}`}
                        className={`w-full h-48 flex items-center justify-center hover:scale-105 transition-transform duration-300 ${getBackgroundClass(post)}`}
                      >
                        <div className="text-white text-center">
                          <div className="text-2xl font-bold mb-1">
                            {(() => {
                              const foundCategory = categories.find(cat => cat.id === post.category || cat.slug === post.category)
                              return foundCategory ? foundCategory.name.toUpperCase() : (post.category?.toUpperCase() || 'BLOG')
                            })()}
                          </div>
                          <div className="text-sm opacity-90">Blog Post</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span id={`blog-post-category-${post.id}`} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                        {(() => {
                          const foundCategory = categories.find(cat => cat.id === post.category || cat.slug === post.category)
                          return foundCategory ? foundCategory.name : post.category
                        })()}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span id={`blog-post-date-${post.id}`}>
                          {new Date(post.published_at || post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <h3 id={`blog-post-title-${post.id}`} className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {post.title}
                    </h3>
                    <p id={`blog-post-excerpt-${post.id}`} className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    {post.tags && post.tags.length > 0 && (
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
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <User size={14} />
                        <span id={`blog-post-author-${post.id}`} className="text-sm">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShareButtons 
                          title={post.title}
                          url={`${window.location.origin}/blog/${post.id}`}
                          description={post.excerpt}
                          size="sm"
                        />
                        <button 
                          id={`blog-post-read-more-${post.id}`} 
                          onClick={() => navigate(`/blog/${post.id}`)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <span className="text-sm">자세히 보기</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
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

export default Blog 