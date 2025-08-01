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
import type { BlogPost } from '../lib/supabase'

const BlogPost = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      fetchPost(id)
    }
  }, [id])

  const fetchPost = async (postId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
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
      
      {/* Back Button */}
      <div className="pt-32 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            <span>블로그로 돌아가기</span>
          </motion.button>
        </div>
      </div>

      {/* Post Header */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            {/* Featured Image */}
            <div className="relative h-96 overflow-hidden">
              {post.image_url ? (
                <img 
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${getCategoryClass(post.category || '')}`}>
                  <div className="text-white text-center">
                    <div className="text-6xl font-bold mb-4">{post.category?.toUpperCase()}</div>
                    <div className="text-2xl opacity-90">Blog Post</div>
                  </div>
                </div>
              )}
            </div>

            {/* Post Content */}
            <div className="p-8">
              {/* Post Meta */}
              <div className="flex items-center gap-6 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>{post.author}</span>
                </div>
                {post.category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-900 dark:text-blue-200">
                    {post.category}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2 mb-8">
                  <Tag size={16} className="text-gray-600 dark:text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full dark:bg-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Buttons */}
              <div className="flex items-center justify-between mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    읽는 시간: 약 {Math.ceil(post.content.split(' ').length / 200)}분
                  </span>
                </div>
                <ShareButtons 
                  title={post.title}
                  url={window.location.href}
                  description={post.excerpt}
                />
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none dark:prose-invert markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    // 코드 블록 스타일링
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm" {...props}>
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
                          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props}>
                            {children}
                          </table>
                        </div>
                      )
                    },
                    th({ children, ...props }) {
                      return (
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-700 font-semibold" {...props}>
                          {children}
                        </th>
                      )
                    },
                    td({ children, ...props }) {
                      return (
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2" {...props}>
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

      {/* Comments Section */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <Comments postId={post.id} />
        </div>
      </section>
    </div>
  )
}

// 카테고리별 CSS 클래스 (Blog.tsx와 동일)
const getCategoryClass = (category: string) => {
  const categoryClasses: Record<string, string> = {
    'react': 'bg-gradient-to-br from-blue-400 to-blue-600',
    'typescript': 'bg-gradient-to-br from-blue-500 to-blue-700',
    'javascript': 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    'css': 'bg-gradient-to-br from-blue-600 to-blue-800',
    'backend': 'bg-gradient-to-br from-green-500 to-green-700',
    'database': 'bg-gradient-to-br from-blue-700 to-blue-900',
    'git': 'bg-gradient-to-br from-orange-500 to-orange-700'
  }
  return categoryClasses[category] || 'bg-gradient-to-br from-gray-500 to-gray-700'
}

export default BlogPost 