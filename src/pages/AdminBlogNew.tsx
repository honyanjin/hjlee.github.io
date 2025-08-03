import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { 
  Save, 
  Eye, 
  EyeOff,
  ArrowLeft, 
  Plus, 
  X,
  Calendar,
  Tag,
  User,
  Image,
  Link,
  Copy
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Breadcrumb from '../components/Breadcrumb'
import type { BlogPost, Category } from '../lib/supabase'
import ImageUpload from '../components/ImageUpload'

const postSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  content: z.string().min(10, '내용은 10자 이상이어야 합니다'),
  excerpt: z.string().min(1, '요약을 입력해주세요'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  tags: z.string().optional(),
  is_published: z.boolean()
})

type PostFormData = z.infer<typeof postSchema>

const AdminBlogNew = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [showFullHelp, setShowFullHelp] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      is_published: false
    }
  })

  const watchedContent = watch('content')
  const watchedTitle = watch('title')

  // URL 미리보기 생성
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const previewSlug = watchedTitle ? generateSlug(watchedTitle) : ''
  const previewUrl = previewSlug ? `${window.location.origin}/blog/${previewSlug}` : ''

  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // 태그 처리
      const tags = data.tags 
        ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : []

      const postData = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        category: data.category,
        author: user?.email || 'Unknown',
        tags,
        image_url: imageUrl,
        slug: generateSlug(data.title),
        is_published: data.is_published,
        published_at: data.is_published ? new Date().toISOString() : null
      }

      const { error } = await supabase
        .from('blog_posts')
        .insert(postData)

      if (error) throw error

      setSuccess('포스트가 성공적으로 저장되었습니다!')
      
      // 2초 후 목록으로 이동
      setTimeout(() => {
        navigate('/admin/blog')
      }, 2000)

    } catch (err: any) {
      setError(err.message || '포스트 저장에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <Breadcrumb items={[
              { label: '블로그 관리', path: '/admin/blog' },
              { label: '새 포스트 작성' }
            ]} />
          </div>
          <div className="flex justify-between items-center pb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/blog')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                목록으로
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  새 포스트 작성
                </h1>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              기본 정보
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  제목 *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  id="title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="포스트 제목을 입력하세요"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.title.message}
                  </p>
                )}
                
                {/* URL 미리보기 */}
                {watchedTitle && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Link size={16} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        포스트 URL 미리보기
                      </span>
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 font-mono break-all">
                      {previewUrl}
                    </div>
                  </div>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  카테고리 *
                </label>
                <select
                  {...register('category')}
                  id="category"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">카테고리 선택</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Excerpt */}
              <div className="lg:col-span-2">
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  요약 *
                </label>
                <textarea
                  {...register('excerpt')}
                  id="excerpt"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="포스트 요약을 입력하세요"
                />
                {errors.excerpt && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.excerpt.message}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="lg:col-span-2">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  태그
                </label>
                <input
                  {...register('tags')}
                  type="text"
                  id="tags"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="태그를 쉼표로 구분하여 입력하세요 (예: React, TypeScript, Frontend)"
                />
              </div>

              {/* Featured Image */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  대표 이미지
                </label>
                <ImageUpload
                  onImageUpload={setImageUrl}
                  currentImage={imageUrl}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                내용
              </h2>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {previewMode ? (
                  <>
                    <EyeOff size={16} />
                    편집 모드
                  </>
                ) : (
                  <>
                    <Eye size={16} />
                    미리보기
                  </>
                )}
              </button>
            </div>
            
            {previewMode ? (
              <div className="p-6">
                <div className="prose prose-lg max-w-none dark:prose-invert markdown-content">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    {watchedTitle || '제목 없음'}
                  </h1>
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
                              <div className="my-4">
                                <iframe
                                  width="100%"
                                  height="315"
                                  src={`https://www.youtube.com/embed/${videoId}`}
                                  title="YouTube video player"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="rounded-lg shadow-md"
                                />
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
                      }
                    }}
                  >
                    {watchedContent || '내용을 입력하세요'}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">💡 도움말</h3>
                    <button
                      type="button"
                      onClick={() => setShowFullHelp(!showFullHelp)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
                    >
                      {showFullHelp ? '간단히 보기' : '도움말 더보기'}
                    </button>
                  </div>
                  
                  {!showFullHelp ? (
                    <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <div><strong>유튜브 삽입:</strong> 마크다운에서 `[제목](https://youtube.com/watch?v=VIDEO_ID)` 형태로 작성하면 자동으로 iframe으로 변환됩니다.</div>
                      <div><strong>예시:</strong> `[React 튜토리얼](https://youtube.com/watch?v=dQw4w9WgXcQ)`</div>
                      <div><strong>지원 형식:</strong> youtube.com/watch?v= 또는 youtu.be/ 링크</div>
                    </div>
                  ) : (
                    <div className="text-xs text-blue-700 dark:text-blue-300 space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">📝 기본 문법</h4>
                        <div className="space-y-1 ml-2">
                          <div><code># 제목</code> - H1 제목</div>
                          <div><code>## 부제목</code> - H2 부제목</div>
                          <div><code>### 소제목</code> - H3 소제목</div>
                          <div><code>**굵게**</code> - 굵은 글씨</div>
                          <div><code>*기울임*</code> - 기울임 글씨</div>
                          <div><code>`코드`</code> - 인라인 코드</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">🔗 링크 & 미디어</h4>
                        <div className="space-y-1 ml-2">
                          <div><code>[텍스트](URL)</code> - 링크</div>
                          <div><code>![대체텍스트](이미지URL)</code> - 이미지</div>
                          <div><code>[제목](유튜브URL)</code> - 유튜브 비디오 (자동 변환)</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">📋 목록</h4>
                        <div className="space-y-1 ml-2">
                          <div><code>- 항목</code> - 순서 없는 목록</div>
                          <div><code>1. 항목</code> - 순서 있는 목록</div>
                          <div><code>  - 들여쓰기</code> - 중첩 목록</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">💻 코드 예시 블록</h4>
                        <div className="space-y-1 ml-2">
                          <div><code>```언어</code> - 코드 예시 블록 시작</div>
                          <div><code>```</code> - 코드 예시 블록 끝</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">📊 테이블</h4>
                        <div className="space-y-1 ml-2">
                          <div><code>| 헤더1 | 헤더2 |</code> - 테이블 헤더</div>
                          <div><code>|------|------|</code> - 구분선</div>
                          <div><code>| 셀1 | 셀2 |</code> - 테이블 셀</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">💬 인용</h4>
                        <div className="space-y-1 ml-2">
                          <div><code>&gt; 인용문</code> - 인용 블록</div>
                          <div><code>---</code> - 구분선</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">🎥 유튜브 삽입</h4>
                        <div className="space-y-1 ml-2">
                          <div><code>[제목](https://youtube.com/watch?v=VIDEO_ID)</code></div>
                          <div><code>[제목](https://youtu.be/VIDEO_ID)</code></div>
                          <div>자동으로 iframe으로 변환됩니다</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <textarea
                  {...register('content')}
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono"
                  placeholder="포스트 내용을 마크다운 형식으로 작성하세요...

예시:
# 제목

내용을 작성하세요.

[React 튜토리얼](https://youtube.com/watch?v=dQw4w9WgXcQ)

```javascript
console.log('코드 블록');
```"
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.content.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Publish Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              발행 설정
            </h2>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  {...register('is_published')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  즉시 발행
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/blog')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {isLoading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default AdminBlogNew 