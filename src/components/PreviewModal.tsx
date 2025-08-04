import { useState, useEffect } from 'react'
import { X, Calendar, User, Tag, ExternalLink } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { motion, AnimatePresence } from 'framer-motion'

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
  excerpt: string
  category: string
  author: string
  imageUrl: string
  tags: string[]
  categories: Array<{ slug: string; name: string }>
}

const PreviewModal = ({
  isOpen,
  onClose,
  title,
  content,
  excerpt,
  category,
  author,
  imageUrl,
  tags,
  categories
}: PreviewModalProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <ExternalLink className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      포스트 미리보기
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      실제 블로그 포스트처럼 보이는 모습입니다
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* Blog Post Preview */}
                <div className="bg-white dark:bg-gray-900">
                  {/* Featured Image */}
                  {imageUrl && (
                    <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
                      <img 
                        src={imageUrl}
                        alt={title || 'Featured Image'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Post Content */}
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Post Meta */}
                    <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        <span>{author}</span>
                      </div>
                      {category && (
                        <div className="flex items-center gap-2">
                          <Tag size={16} />
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-900 dark:text-blue-200">
                            {categories.find(cat => cat.slug === category)?.name || category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                      {title || '제목 없음'}
                    </h1>

                    {/* Excerpt */}
                    {excerpt && (
                      <div className="mb-8">
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                          {excerpt}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {tags && tags.length > 0 && (
                      <div className="mb-8">
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="prose prose-lg sm:prose-xl max-w-none dark:prose-invert markdown-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          // 코드 블록 스타일링
                          code({ node, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '')
                            return match ? (
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
                          // 링크 스타일링 (유튜브 링크 감지)
                          a({ children, href, ...props }) {
                            // 유튜브 링크 감지 및 변환
                            if (href && (href.includes('youtube.com/watch') || href.includes('youtu.be/'))) {
                              const videoId = href.includes('youtube.com/watch') 
                                ? href.split('v=')[1]?.split('&')[0]
                                : href.split('youtu.be/')[1]?.split('?')[0]
                              
                              if (videoId) {
                                return (
                                  <div className="my-6">
                                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                      <iframe
                                        src={`https://www.youtube.com/embed/${videoId}`}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                                      />
                                    </div>
                                  </div>
                                )
                              }
                            }
                            
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
                          },
                          // 제목 스타일링
                          h1({ children, ...props }) {
                            return (
                              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4" {...props}>
                                {children}
                              </h1>
                            )
                          },
                          h2({ children, ...props }) {
                            return (
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-3" {...props}>
                                {children}
                              </h2>
                            )
                          },
                          h3({ children, ...props }) {
                            return (
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-5 mb-2" {...props}>
                                {children}
                              </h3>
                            )
                          },
                          // 단락 스타일링
                          p({ children, ...props }) {
                            return (
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4" {...props}>
                                {children}
                              </p>
                            )
                          },
                          // 인용구 스타일링
                          blockquote({ children, ...props }) {
                            return (
                              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4" {...props}>
                                {children}
                              </blockquote>
                            )
                          }
                        }}
                      >
                        {content || '내용을 입력하세요'}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default PreviewModal 