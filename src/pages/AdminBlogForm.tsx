import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Save, 
  ArrowLeft, 
  Plus,
  Loader2,
  Image,
  Link,
  Copy,
  Clock
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import AdminPageHeader from '../components/admin/AdminPageHeader'
import BlogBasicInfo from '../components/admin/blog/BlogBasicInfo'
import BlogPublishSettings from '../components/admin/blog/BlogPublishSettings'
import type { BlogPost, Category } from '../lib/supabase'
import type { AdminBlogFormProps } from '../types'
import ImageUpload from '../components/ImageUpload'
import { ImageLibraryProvider, useImageLibrary } from '../contexts/ImageLibraryContext'
import RichTextEditor from '../components/RichTextEditor'
import { generateExcerpt } from '../lib/markdownConverter'

const postSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  content: z.string().min(10, '내용은 10자 이상이어야 합니다'),
  excerpt: z.string().min(1, '요약을 입력해주세요'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  tags: z.string().optional(),
  is_published: z.boolean()
})

type PostFormData = z.infer<typeof postSchema>

const AdminBlogFormContent: React.FC<AdminBlogFormProps> = ({ mode }) => {
  const [isLoading, setIsLoading] = useState(mode === 'edit')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [post, setPost] = useState<BlogPost | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [isBasicInfoCollapsed, setIsBasicInfoCollapsed] = useState(false)
  const [isPublishSettingsCollapsed, setIsPublishSettingsCollapsed] = useState(true)
  const [redirectAfterSave, setRedirectAfterSave] = useState<boolean>(true)
  const [previewDraftInNewTab, setPreviewDraftInNewTab] = useState<boolean>(false)
  
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { open: openImageLibrary } = useImageLibrary()

  const methods = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      is_published: false
    }
  })

  const { watch, setValue, formState: { errors } } = methods
  const watchedContent = watch('content')

  // URL 미리보기: 편집 모드에서는 post_no를 사용하여 표시
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const previewUrl = mode === 'edit' && post
    ? `${window.location.origin}/blog/${post.id}`
    : ''

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchPost()
    }
    fetchCategories()
  }, [mode, id])

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
      setValue('title', data.title)
      setValue('content', data.content)
      setValue('excerpt', data.excerpt)
      setValue('category', data.category)
      setValue('tags', data.tags ? data.tags.join(', ') : '')
      setValue('is_published', data.is_published)
      setImageUrl(data.image_url || '')
    } catch (err: any) {
      setError('포스트를 불러오는데 실패했습니다.')
      console.error('Error fetching post:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (err: any) {
      console.error('Error fetching categories:', err)
    }
  }

  const onSubmit = async (data: PostFormData) => {
    try {
      setIsSaving(true)
      setError('')
      setSuccess('')

      const postData = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        category: data.category,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        is_published: data.is_published,
        image_url: imageUrl,
        author: user?.email || 'Unknown',
        published_at: data.is_published ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }

      let result
      if (mode === 'edit' && post) {
        result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id)
      } else {
        result = await supabase
          .from('blog_posts')
          .insert([{
            ...postData,
            created_at: new Date().toISOString()
          }])
      }

      if (result.error) throw result.error

      setSuccess('포스트가 저장되었습니다.')

      // 저장 후 동작 처리
      if (redirectAfterSave) {
        navigate('/admin/blog')
      } else if (previewDraftInNewTab && result.data) {
        const savedPost = Array.isArray(result.data) ? result.data[0] : result.data
        if (savedPost && 'id' in savedPost) {
          window.open(`/blog/${(savedPost as any).id}`, '_blank')
        }
      }
    } catch (err: any) {
      setError('포스트 저장에 실패했습니다.')
      console.error('Error saving post:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = (url: string) => {
    setImageUrl(url)
  }

  const handleCopyUrl = () => {
    if (previewUrl) {
      navigator.clipboard.writeText(previewUrl)
      setSuccess('URL이 클립보드에 복사되었습니다.')
      setTimeout(() => setSuccess(''), 2000)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">포스트를 불러오는 중...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        <AdminPageHeader
          title={mode === 'edit' ? '포스트 편집' : '새 포스트 작성'}
          description={mode === 'edit' ? '기존 포스트를 수정합니다.' : '새로운 블로그 포스트를 작성합니다.'}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/blog')}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={16} />
            목록으로
          </motion.button>
        </AdminPageHeader>

        {/* 에러/성공 메시지 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
            {/* 기본 정보 */}
            <BlogBasicInfo
              categories={categories}
              isCollapsed={isBasicInfoCollapsed}
              onToggleCollapse={() => setIsBasicInfoCollapsed(!isBasicInfoCollapsed)}
            />

            {/* 발행 설정 */}
            <BlogPublishSettings
              isCollapsed={isPublishSettingsCollapsed}
              onToggleCollapse={() => setIsPublishSettingsCollapsed(!isPublishSettingsCollapsed)}
              redirectAfterSave={redirectAfterSave}
              setRedirectAfterSave={setRedirectAfterSave}
              previewDraftInNewTab={previewDraftInNewTab}
              setPreviewDraftInNewTab={setPreviewDraftInNewTab}
            />

            {/* 대표 이미지 */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Image className="h-5 w-5 text-purple-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">대표 이미지</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">포스트의 대표 이미지를 설정합니다</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ImageUpload
                  currentImage={imageUrl}
                  onImageUpload={handleImageUpload}
                  bucketName="blog-images"
                />
              </div>
            </section>

            {/* 본문 내용 */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Link className="h-5 w-5 text-indigo-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">본문 내용</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">포스트의 메인 내용을 작성합니다</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <RichTextEditor
                  value={watchedContent}
                  onChange={(content) => setValue('content', content)}
                  placeholder="포스트 내용을 입력하세요..."
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-2">{errors.content.message}</p>
                )}
              </div>
            </section>

            {/* 미리보기 URL (편집 모드에서만) */}
            {mode === 'edit' && previewUrl && (
              <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">미리보기 URL</h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">발행된 포스트의 URL입니다</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Copy size={16} />
                      복사
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
                      {previewUrl}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* 저장 버튼 */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-600">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => navigate('/admin/blog')}
                className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                취소
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {isSaving ? '저장 중...' : '저장'}
              </motion.button>
            </div>
          </form>
        </FormProvider>
      </div>
    </AdminLayout>
  )
}

const AdminBlogForm: React.FC<AdminBlogFormProps> = ({ mode }) => {
  return (
    <ImageLibraryProvider>
      <AdminBlogFormContent mode={mode} />
    </ImageLibraryProvider>
  )
}

export default AdminBlogForm
