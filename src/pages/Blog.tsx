import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, User, ArrowRight, Search, Tag } from 'lucide-react'
import Navbar from '../components/Navbar'
import DotNavigation from '../components/DotNavigation'
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
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // published_at이 null인 경우를 고려하여 정렬
      const sortedPosts = (data || []).sort((a, b) => {
        const aDate = a.published_at ? new Date(a.published_at) : new Date(a.created_at)
        const bDate = b.published_at ? new Date(b.published_at) : new Date(b.created_at)
        return bDate.getTime() - aDate.getTime() // 최신순 정렬
      })
      
      setPosts(sortedPosts)
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
    
    // 동적 카테고리에서 찾기 (post.category는 category.slug를 저장)
    const foundCategory = categories.find(cat => 
      cat.slug === category || 
      cat.id === category || 
      cat.name.toLowerCase() === category.toLowerCase()
    )
    
    if (foundCategory) {
      console.log('Found category:', foundCategory.name, 'Color:', foundCategory.color, 'Category input:', category)
      
      // 동적으로 입력된 색상을 사용하여 그라데이션 생성
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null
      }
      
      const rgb = hexToRgb(foundCategory.color)
      if (rgb) {
        // 더 어두운 색상 생성 (그라데이션 끝 색상)
        const darkerRgb = {
          r: Math.max(0, rgb.r - 40),
          g: Math.max(0, rgb.g - 40),
          b: Math.max(0, rgb.b - 40)
        }
        
        const darkerHex = `#${darkerRgb.r.toString(16).padStart(2, '0')}${darkerRgb.g.toString(16).padStart(2, '0')}${darkerRgb.b.toString(16).padStart(2, '0')}`
        
        const gradientClass = `bg-gradient-to-br from-[${foundCategory.color}] to-[${darkerHex}]`
        console.log('Generated gradient class:', gradientClass)
        return gradientClass
      }
      
      // 색상 변환에 실패한 경우 기본 색상 사용
      console.log('Color conversion failed for:', foundCategory.color)
      return defaultColors['default']
    }
    
    console.log('Category not found for:', category, 'Available categories:', categories.map(c => ({ name: c.name, slug: c.slug, id: c.id })))
    
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
      className: "w-full h-full flex items-center justify-center hover:scale-105 transition-transform duration-300"
    }
  }

  // 배경 이미지용 클래스 (이미지가 없을 때)
  const getBackgroundClass = (post: BlogPost) => {
    if (post.image_url) return ""
    return getCategoryClass(post.category || '')
  }

  // 동적 배경 스타일 생성
  const getBackgroundStyle = (post: BlogPost) => {
    if (post.image_url) return {}
    
    const foundCategory = categories.find(cat => 
      cat.slug === post.category || 
      cat.id === post.category || 
      cat.name.toLowerCase() === post.category?.toLowerCase()
    )
    
    if (foundCategory) {
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null
      }
      
      const rgb = hexToRgb(foundCategory.color)
      if (rgb) {
        const darkerRgb = {
          r: Math.max(0, rgb.r - 40),
          g: Math.max(0, rgb.g - 40),
          b: Math.max(0, rgb.b - 40)
        }
        
        const darkerHex = `#${darkerRgb.r.toString(16).padStart(2, '0')}${darkerRgb.g.toString(16).padStart(2, '0')}${darkerRgb.b.toString(16).padStart(2, '0')}`
        
        return {
          background: `linear-gradient(to bottom right, ${foundCategory.color}, ${darkerHex})`
        }
      }
    }
    
    return {
      background: 'linear-gradient(to bottom right, #6B7280, #374151)'
    }
  }

  // Featured Post는 created_at이 가장 최신인 포스트로 지정
  const featuredPost = posts.length > 0
    ? [...posts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : undefined

  return (
    <div id="blog-page" className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DotNavigation
        sections={[
          'blog-hero',
          'featured-post-section',
          'all-posts-section',
        ]}
      />
      <SEO 
        title="Blog - 이호진 포트폴리오"
        description="프론트엔드 개발자 이호진의 기술 블로그입니다. React, TypeScript, 웹 개발 관련 글들을 확인하세요."
        keywords="블로그, 기술블로그, React, TypeScript, 웹개발, 프론트엔드"
        type="website"
      />
      <Navbar />
      
      {/* Hero Section - 반응형 개선 */}
      <section id="blog-hero" className="pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-3 sm:px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            id="blog-hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h1 id="blog-hero-title" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Blog
            </h1>
            <p id="blog-hero-description" className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
              개발 경험과 기술적인 내용을 공유하는 블로그입니다. 
              새로운 기술을 배우고 적용하는 과정에서 얻은 인사이트를 나눕니다.
            </p>
          </motion.div>

          {/* Search Bar - 반응형 개선 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-sm sm:max-w-md lg:max-w-lg mx-auto mb-6 sm:mb-8"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="포스트 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-sm sm:text-base"
              />
            </div>
          </motion.div>

          {/* Category Filter - 반응형 개선 */}
          <div id="blog-category-filters" className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 mb-8 sm:mb-10 lg:mb-12 px-4">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
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
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
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

      {/* Featured Post - 반응형 개선 */}
      <section id="featured-post-section" className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 lg:px-6 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            id="featured-post-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h2 id="featured-post-title" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Featured Post
            </h2>
            <p id="featured-post-description" className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300">
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
                <div className="relative overflow-hidden h-48 sm:h-56 lg:h-auto">
                  {featuredPost.image_url ? (
                    <img 
                      id="featured-post-image"
                      {...getPostImageProps(featuredPost)}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => navigate(`/blog/${featuredPost.post_no}`)}
                    />
                  ) : (
                    <div 
                      id="featured-post-image"
                      className="w-full h-full flex items-center justify-center hover:scale-105 transition-transform duration-300 cursor-pointer"
                      style={getBackgroundStyle(featuredPost)}
                      onClick={() => navigate(`/blog/${featuredPost.post_no}`)}
                    >
                      <div className="text-white text-center px-4">
                        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
                          {(() => {
                            const foundCategory = categories.find(cat => cat.slug === featuredPost.category || cat.id === featuredPost.category)
                            return foundCategory ? foundCategory.name.toUpperCase() : (featuredPost.category?.toUpperCase() || 'BLOG')
                          })()}
                        </div>
                        <div className="text-sm sm:text-base lg:text-lg opacity-90">Blog Post</div>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                    <ShareButtons 
                      title={featuredPost.title}
                      url={`${window.location.origin}/blog/${featuredPost.post_no}`}
                      description={featuredPost.excerpt}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="p-4 sm:p-6 lg:p-8 flex flex-col">
                  {/* 상단 내용 (카테고리, 날짜, 제목, 요약, 태그) */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                      <span id="featured-post-category" className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded-full dark:bg-blue-900 dark:text-blue-200">
                        {(() => {
                          const foundCategory = categories.find(cat => cat.slug === featuredPost.category || cat.id === featuredPost.category)
                          return foundCategory ? foundCategory.name : featuredPost.category
                        })()}
                      </span>
                      <div className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar size={14} className="sm:w-4 sm:h-4" />
                        <span id="featured-post-date" className="text-xs sm:text-sm">
                          {new Date(featuredPost.published_at || featuredPost.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <h3 
                      id="featured-post-title-text" 
                      className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={() => navigate(`/blog/${featuredPost.post_no}`)}
                    >
                      {featuredPost.title}
                    </h3>
                    <p id="featured-post-excerpt" className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    {featuredPost.tags && featuredPost.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                        {featuredPost.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full dark:bg-gray-600 dark:text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* 하단 고정 영역 (작성자와 자세히 보기) */}
                  <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                      <div className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400">
                        <User size={14} className="sm:w-4 sm:h-4" />
                        <span id="featured-post-author" className="text-xs sm:text-sm">{featuredPost.author}</span>
                      </div>
                      <button 
                        id="featured-post-read-more" 
                        onClick={() => navigate(`/blog/${featuredPost.post_no}`)}
                        className="flex items-center gap-1 sm:gap-2 text-blue-600 hover:text-blue-700 transition-colors text-sm sm:text-base"
                      >
                        <span>자세히 보기</span>
                        <ArrowRight size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-600 dark:text-gray-400">아직 발행된 포스트가 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* All Posts - 반응형 개선 */}
      <section id="all-posts-section" className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            id="all-posts-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h2 id="all-posts-title" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              All Posts
            </h2>
            <p id="all-posts-description" className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300">
              모든 블로그 포스트를 확인해보세요
            </p>
          </motion.div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || activeCategory !== 'all' 
                  ? '검색 결과가 없습니다.' 
                  : '아직 발행된 포스트가 없습니다.'}
              </p>
            </div>
          ) : (
            <div id="all-posts-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  id={`blog-post-${post.id}`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col"
                >
                  <div className="relative overflow-hidden">
                    {post.image_url ? (
                      <img 
                        id={`blog-post-image-${post.id}`}
                        {...getPostImageProps(post)}
                        alt={post.title}
                        className="w-full h-40 sm:h-48 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => navigate(`/blog/${post.post_no}`)}
                      />
                    ) : (
                      <div 
                        id={`blog-post-image-${post.id}`}
                        className="w-full h-40 sm:h-48 flex items-center justify-center hover:scale-105 transition-transform duration-300 cursor-pointer"
                        style={getBackgroundStyle(post)}
                        onClick={() => navigate(`/blog/${post.post_no}`)}
                      >
                        <div className="text-white text-center px-3 sm:px-4">
                          <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">
                            {(() => {
                              const foundCategory = categories.find(cat => cat.id === post.category || cat.slug === post.category)
                              return foundCategory ? foundCategory.name.toUpperCase() : (post.category?.toUpperCase() || 'BLOG')
                            })()}
                          </div>
                          <div className="text-xs sm:text-sm opacity-90">Blog Post</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                      <span id={`blog-post-category-${post.id}`} className="px-2 sm:px-3 py-1 bg-blue-600 text-white text-xs sm:text-sm rounded-full">
                        {(() => {
                          const foundCategory = categories.find(cat => cat.id === post.category || cat.slug === post.category)
                          return foundCategory ? foundCategory.name : post.category
                        })()}
                      </span>
                    </div>
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                       <ShareButtons 
                        title={post.title}
                        url={`${window.location.origin}/blog/${post.post_no}`}
                        description={post.excerpt}
                        size="sm"
                       />
                    </div>
                  </div>
                  
                  {/* 카드 내용을 상단과 하단으로 분리 */}
                  <div className="p-4 sm:p-6 flex flex-col flex-1">
                    {/* 상단 내용 (날짜, 제목, 요약, 태그) */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
                          <span id={`blog-post-date-${post.id}`}>
                            {new Date(post.published_at || post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <h3 
                        id={`blog-post-title-${post.id}`} 
                        className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => navigate(`/blog/${post.post_no}`)}
                      >
                        {post.title}
                      </h3>
                      <p id={`blog-post-excerpt-${post.id}`} className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      {post.tags && post.tags.length > 0 && (
                        <div id={`blog-post-tags-${post.id}`} className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
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
                    </div>
                    
                    {/* 하단 고정 영역 (작성자와 자세히 보기) */}
                    <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400">
                          <User size={12} className="sm:w-3.5 sm:h-3.5" />
                          <span id={`blog-post-author-${post.id}`} className="text-xs sm:text-sm">{post.author}</span>
                        </div>
                        <button 
                          id={`blog-post-read-more-${post.id}`}
                          onClick={() => navigate(`/blog/${post.post_no}`)}
                          className="flex items-center gap-1 sm:gap-2 text-blue-600 hover:text-blue-700 transition-colors text-xs sm:text-sm"
                        >
                          <span>자세히 보기</span>
                          <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
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