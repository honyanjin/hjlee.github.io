import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowLeft, Tag, Clock } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import Navbar from '../components/Navbar'
import SEO from '../components/SEO'
import ShareButtons from '../components/ShareButtons'
import Comments from '../components/Comments'
import { supabase } from '../lib/supabase'
import type { BlogPost, Category } from '../lib/supabase'

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (slug) {
      fetchPost(slug)
    }
    fetchCategories()
  }, [slug])

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

  const fetchPost = async (postSlug: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', postSlug)
        .eq('is_published', true)
        .single()

      if (error) throw error
      setPost(data)
    } catch (err: any) {
      setError('포스트를 찾을 수 없습니다.')
      console.error('Error fetching post:', err)
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
      
      {/* Back Button - 반응형 개선 */}
      <div className="pt-24 sm:pt-28 lg:pt-32 px-3 sm:px-4 lg:px-6">
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
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
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
              </div>

              {/* Title - 반응형 개선 */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
                {post.title}
              </h1>

              {/* URL Display - 반응형 개선 */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                      이 포스트의 주소
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-mono break-all">
                      {window.location.href}
                    </div>
                  </div>
                  <ShareButtons 
                    title={post.title}
                    url={window.location.href}
                    description={post.excerpt}
                    size="sm"
                  />
                </div>
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

              {/* Reading Time - 반응형 개선 */}
              <div className="flex items-center gap-2 mb-6 sm:mb-8 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Clock size={16} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  읽는 시간: 약 {Math.ceil(post.content.split(' ').length / 200)}분
                </span>
              </div>

              {/* Content - 반응형 개선 */}
              <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none dark:prose-invert markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    // 코드 블록 스타일링
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      return match ? (
                        <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs sm:text-sm" {...props}>
                          {children}
                        </code>
                      )
                    },
                    // 링크 스타일링
                    a({ children, href, ...props }) {
                      return (
                        <a 
                          href={href} 
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        >
                          {children}
                        </a>
                      )
                    },
                    // 이미지 스타일링
                    img({ src, alt, ...props }) {
                      return (
                        <img 
                          src={src} 
                          alt={alt}
                          className="max-w-full h-auto rounded-lg shadow-md"
                          onError={(e) => {
                            // 이미지 로드 실패 시 기본 이미지로 대체
                            const target = e.target as HTMLImageElement
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjE2MTYxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7imqLvuI88L3RleHQ+PC9zdmc+'
                          }}
                          {...props}
                        />
                      )
                    },
                    // 테이블 스타일링
                    table({ children, ...props }) {
                      return (
                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 text-xs sm:text-sm" {...props}>
                            {children}
                          </table>
                        </div>
                      )
                    },
                    th({ children, ...props }) {
                      return (
                        <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 font-semibold" {...props}>
                          {children}
                        </th>
                      )
                    },
                    td({ children, ...props }) {
                      return (
                        <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2" {...props}>
                          {children}
                        </td>
                      )
                    }
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comments Section - 반응형 개선 */}
      <section className="px-3 sm:px-4 lg:px-6 pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-4xl mx-auto">
          <Comments postId={post.id} />
        </div>
      </section>
    </div>
  )
}

export default BlogPost 