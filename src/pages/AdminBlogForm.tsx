import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Save, 
  ArrowLeft, 
  Plus,
  Loader2,
  Calendar,
  Tag,
  User,
  Image,
  Link,
  Copy,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Breadcrumb from '../components/Breadcrumb'
import type { BlogPost, Category } from '../lib/supabase'
import ImageUpload from '../components/ImageUpload'
import RichTextEditor from '../components/RichTextEditor'
import { htmlToMarkdown, markdownToHtml, generateExcerpt } from '../lib/markdownConverter'

const postSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  content: z.string().min(10, '내용은 10자 이상이어야 합니다'),
  excerpt: z.string().min(1, '요약을 입력해주세요'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  tags: z.string().optional(),
  is_published: z.boolean()
})

type PostFormData = z.infer<typeof postSchema>

interface AdminBlogFormProps {
  mode: 'new' | 'edit'
}

const AdminBlogForm: React.FC<AdminBlogFormProps> = ({ mode }) => {
  const [isLoading, setIsLoading] = useState(mode === 'edit')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [post, setPost] = useState<BlogPost | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [isBasicInfoCollapsed, setIsBasicInfoCollapsed] = useState(false)
  const [isPublishSettingsCollapsed, setIsPublishSettingsCollapsed] = useState(true)
  
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchPost()
    }
    fetchCategories()
  }, [mode, id])

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

  const fetchPost = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setPost(data)
      
      // 마크다운 콘텐츠를 HTML로 변환
      const htmlContent = markdownToHtml(data.content)
      
      // 폼에 데이터 설정
      setValue('title', data.title)
      setValue('content', htmlContent) // HTML 콘텐츠로 설정
      setValue('excerpt', data.excerpt)
      setValue('category', data.category)
      setValue('tags', data.tags?.join(', ') || '')
      setValue('is_published', data.is_published)
      setImageUrl(data.image_url || '')

    } catch (err: any) {
      setError('포스트를 불러오는데 실패했습니다.')
      console.error('Error fetching post:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: PostFormData) => {
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      // 태그 처리
      const tags = data.tags 
        ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : []

      // HTML을 마크다운으로 변환
      const markdownContent = htmlToMarkdown(data.content)
      
      // 자동으로 excerpt 생성 (사용자가 입력하지 않은 경우)
      const autoExcerpt = data.excerpt || generateExcerpt(data.content)

      const postData = {
        title: data.title,
        content: markdownContent, // 마크다운으로 저장
        excerpt: autoExcerpt,
        category: data.category,
        author: user?.email || 'Unknown',
        tags,
        image_url: imageUrl,
        slug: generateSlug(data.title),
        is_published: data.is_published,
        published_at: data.is_published ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }

      let result
      if (mode === 'new') {
        result = await supabase
          .from('blog_posts')
          .insert(postData)
      } else {
        result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id)
      }

      if (result.error) throw result.error

      setSuccess(mode === 'new' ? '포스트가 성공적으로 저장되었습니다!' : '포스트가 성공적으로 수정되었습니다!')
      
      // 2초 후 목록으로 이동
      setTimeout(() => {
        navigate('/admin/blog')
      }, 2000)

    } catch (err: any) {
      setError(err.message || (mode === 'new' ? '포스트 저장에 실패했습니다.' : '포스트 수정에 실패했습니다.'))
    } finally {
      setIsSaving(false)
    }
  }

  const onSaveDraft = async () => {
    const formData = watch()
    
    if (!formData.title || !formData.content || !formData.excerpt || !formData.category) {
      setError('임시저장을 위해서는 제목, 내용, 요약, 카테고리가 모두 필요합니다.')
      return
    }

    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      // 태그 처리
      const tags = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : []

      // HTML을 마크다운으로 변환
      const markdownContent = htmlToMarkdown(formData.content)
      
      // 자동으로 excerpt 생성 (사용자가 입력하지 않은 경우)
      const autoExcerpt = formData.excerpt || generateExcerpt(formData.content)

      const postData = {
        title: formData.title,
        content: markdownContent, // 마크다운으로 저장
        excerpt: autoExcerpt,
        category: formData.category,
        author: user?.email || 'Unknown',
        tags,
        image_url: imageUrl,
        slug: generateSlug(formData.title),
        is_published: false,
        published_at: null,
        updated_at: new Date().toISOString()
      }

      let result
      if (mode === 'new') {
        result = await supabase
          .from('blog_posts')
          .insert(postData)
      } else {
        result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id)
      }

      if (result.error) throw result.error

      setSuccess('포스트가 임시저장되었습니다!')
      
      // 3초 후 성공 메시지 숨기기
      setTimeout(() => {
        setSuccess('')
      }, 3000)

    } catch (err: any) {
      setError(err.message || '임시저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">
            {mode === 'edit' ? '포스트를 불러오는 중...' : '로딩 중...'}
          </span>
        </div>
      </div>
    )
  }

  if (mode === 'edit' && !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            포스트를 찾을 수 없습니다
          </h2>
          <button
            onClick={() => navigate('/admin/blog')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const pageTitle = mode === 'new' ? '새 포스트 작성' : '포스트 편집'
  const breadcrumbLabel = mode === 'new' ? '새 포스트 작성' : '포스트 편집'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <Breadcrumb items={[
              { label: '블로그 관리', path: '/admin/blog' },
              { label: breadcrumbLabel }
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
                  {pageTitle}
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

        {/* Post Info (편집 모드에서만 표시) */}
        {mode === 'edit' && post && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              포스트 정보
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">작성자: {post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  생성일: {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  상태: {post.is_published ? '발행됨' : '임시저장'}
                </span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsBasicInfoCollapsed(!isBasicInfoCollapsed)}
                className="flex items-center justify-between w-full text-left"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  기본 정보
                </h2>
                {isBasicInfoCollapsed ? (
                  <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" />
                )}
              </button>
            </div>
            
            {!isBasicInfoCollapsed && (
              <div className="p-6">
                <div className="space-y-6">
                  {/* Title and Category Row */}
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
                  </div>

                  {/* URL Preview */}
                  {watchedTitle && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Link size={14} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                          포스트 주소:
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-700 dark:text-gray-300 font-mono overflow-x-auto whitespace-nowrap scrollbar-hide">
                            {previewUrl}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(previewUrl)
                            setSuccess('URL이 클립보드에 복사되었습니다.')
                            setTimeout(() => setSuccess(''), 2000)
                          }}
                          className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                          title="URL 복사"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Excerpt */}
                  <div>
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
                  <div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      대표 이미지
                    </label>
                    <div onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}>
                      <ImageUpload
                        onImageUpload={setImageUrl}
                        currentImage={imageUrl}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow" data-preview-content>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                내용
              </h2>
            </div>
            
            <div className="p-6">
              <RichTextEditor
                value={watch('content')}
                onChange={(content) => setValue('content', content)}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.content.message}
                </p>
              )}
            </div>
          </div>

          {/* Publish Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsPublishSettingsCollapsed(!isPublishSettingsCollapsed)}
                className="flex items-center justify-between w-full text-left"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  발행 설정
                </h2>
                {isPublishSettingsCollapsed ? (
                  <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" />
                )}
              </button>
            </div>
            
            {!isPublishSettingsCollapsed && (
              <div className="p-6">
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
            )}
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
              type="button"
              onClick={onSaveDraft}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Clock size={16} />
              {isSaving ? '저장 중...' : '임시저장'}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default AdminBlogForm
