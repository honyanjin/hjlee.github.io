import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowLeft, Tag, Eye, Link, Copy } from 'lucide-react'
// ReactMarkdown 제거, HTML 직접 렌더링
import Navbar from '../components/Navbar'
import SEO from '../components/SEO'
import ShareButtons from '../components/ShareButtons'
import Comments from '../components/Comments'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { BlogPost, Category } from '../lib/supabase'

const BlogPost = () => {
  const { postNo } = useParams<{ postNo: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAdmin } = useAuth()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [copySuccess, setCopySuccess] = useState('')

  useEffect(() => {
    if (postNo) {
      // 미리보기 모드 확인
      const preview = searchParams.get('preview')
      if (preview === 'true') {
        setIsPreview(true)
        loadPreviewPost()
      } else {
        fetchPost(Number(postNo))
      }
    }
    fetchCategories()
  }, [postNo, searchParams])

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

  const fetchPost = async (postNumber: number) => {
    try {
      setLoading(true)
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('post_no', postNumber)
      
      // 관리자가 아닌 경우에만 발행된 포스트만 조회
      if (!isAdmin) {
        query = query.eq('is_published', true)
      }
      
      const { data, error } = await query.single()

      if (error) throw error
      setPost(data)
    } catch (err: any) {
      setError('포스트를 찾을 수 없습니다.')
      console.error('Error fetching post:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadPreviewPost = () => {
    try {
      setLoading(true)
      const tempPostData = sessionStorage.getItem('tempPost')
      
      if (!tempPostData) {
        setError('미리보기 데이터를 찾을 수 없습니다.')
        return
      }

      const tempPost = JSON.parse(tempPostData)
      setPost(tempPost)
    } catch (err: any) {
      setError('미리보기 데이터를 불러오는데 실패했습니다.')
      console.error('Error loading preview post:', err)
    } finally {
      setLoading(false)
    }
  }

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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              포스트를 찾을 수 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => navigate('/blog')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              블로그로 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 동적 배경 스타일 생성
  const getBackgroundStyle = (category: string) => {
    const foundCategory = categories.find(cat => 
      cat.slug === category || 
      cat.id === category || 
      cat.name.toLowerCase() === category?.toLowerCase()
    )
    
    if (foundCategory) {
      console.log('Found category:', foundCategory.name, 'Color:', foundCategory.color, 'Category input:', category)
      
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
        
        const gradientStyle = `linear-gradient(to bottom right, ${foundCategory.color}, ${darkerHex})`
        console.log('Generated gradient style:', gradientStyle)
        return {
          background: gradientStyle
        }
      }
      
      console.log('Color conversion failed for:', foundCategory.color)
    }
    
    console.log('Category not found for:', category, 'Available categories:', categories.map(c => ({ name: c.name, slug: c.slug, id: c.id })))
    
    return {
      background: 'linear-gradient(to bottom right, #6B7280, #374151)'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {post && (
        <SEO 
          title={`${post.title} - 이호진 블로그`}
          description={post.excerpt}
          keywords={post.tags?.join(', ') || ''}
          author={post.author || '이호진'}
          image={post.image_url || '/og-image.jpg'}
          url={window.location.href}
          type="article"
          publishedTime={post.published_at || post.created_at}
          modifiedTime={post.updated_at}
          section={post.category}
          tags={post.tags || []}
        />
      )}
      <Navbar />
      
      {/* Preview Banner */}
      {isPreview && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-3 text-center font-medium"
        >
          <div className="flex items-center justify-center gap-2">
            <Eye size={16} />
            <span>미리보기 모드 - 실제 포스트가 아닙니다</span>
          </div>
        </motion.div>
      )}
      
      {/* Back Button - 반응형 개선 */}
      <div className={`px-3 sm:px-4 lg:px-6 ${isPreview ? 'pt-32 sm:pt-36 lg:pt-40' : 'pt-24 sm:pt-28 lg:pt-32'}`}>
        <div className="max-w-4xl mx-auto">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6 sm:mb-8 text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            <span>블로그로 돌아가기</span>
          </motion.button>
        </div>
      </div>

      {/* Post Header - 반응형 개선 */}
      <section className="px-3 sm:px-4 lg:px-6 pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            {/* Featured Image - 반응형 개선 */}
            <div className="relative h-48 sm:h-64 lg:h-96 overflow-hidden">
              {post.image_url ? (
                <img 
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={getBackgroundStyle(post.category || '')}
                >
                  <div className="text-white text-center px-4">
                    <div className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-2 sm:mb-4">
                      {(() => {
                        const foundCategory = categories.find(cat => cat.id === post.category || cat.slug === post.category)
                        return foundCategory ? foundCategory.name.toUpperCase() : (post.category?.toUpperCase() || 'BLOG')
                      })()}
                    </div>
                    <div className="text-lg sm:text-xl lg:text-2xl opacity-90">Blog Post</div>
                  </div>
                </div>
              )}

            </div>

            {/* Post Content - 반응형 개선 */}
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Post Meta - 반응형 개선 */}
              <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Calendar size={14} className="sm:w-4 sm:h-4" />
                    <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <User size={14} className="sm:w-4 sm:h-4" />
                    <span>{post.author}</span>
                  </div>
                  {post.category && (
                    <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded-full dark:bg-blue-900 dark:text-blue-200">
                      {(() => {
                        const foundCategory = categories.find(cat => cat.id === post.category || cat.slug === post.category)
                        return foundCategory ? foundCategory.name : post.category
                      })()}
                    </span>
                  )}
                  {/* 관리자가 임시글을 볼 때 상태 표시 */}
                  {isAdmin && !post.is_published && (
                    <span className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-800 text-xs sm:text-sm rounded-full dark:bg-yellow-900 dark:text-yellow-200">
                      임시저장
                    </span>
                  )}
                </div>
                
                {/* 관리자 편집 버튼과 공유 버튼 */}
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      편집하기
                    </button>
                  )}
                  <ShareButtons 
                    title={post.title}
                    url={window.location.href}
                    description={post.excerpt}
                    size="sm"
                  />
                </div>
              </div>

              {/* Title - 반응형 개선 */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
                {post.title}
              </h1>

              {/* URL Display - 반응형 개선 */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <Link size={14} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                    포스트 주소:
                  </span>
                  <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-mono overflow-x-auto whitespace-nowrap scrollbar-hide">
                      {`${window.location.origin}/blog/${post.post_no}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/blog/${post.post_no}`)
                      setCopySuccess('URL이 클립보드에 복사되었습니다.')
                      setTimeout(() => setCopySuccess(''), 2000)
                    }}
                    className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    title="URL 복사"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                {copySuccess && (
                  <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                    {copySuccess}
                  </div>
                )}
              </div>

              {/* Excerpt - 반응형 개선 */}
              {post.excerpt && (
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              {/* Tags - 반응형 개선 */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2 mb-6 sm:mb-8">
                  <Tag size={16} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-full dark:bg-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 구분선 */}
              <div className="border-t border-gray-200 dark:border-gray-600 my-6 sm:my-8"></div>

              {/* Content - HTML 직접 렌더 */}
              <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none dark:prose-invert markdown-content" dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comments Section - 반응형 개선 */}
      {post.is_published && !isPreview && (
        <section className="px-3 sm:px-4 lg:px-6 pb-12 sm:pb-16 lg:pb-20">
          <div className="max-w-4xl mx-auto">
            <Comments postId={post.id} />
          </div>
        </section>
      )}
    </div>
  )
}

export default BlogPost 