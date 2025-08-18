import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Loader2, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react'
import Breadcrumb from '../components/Breadcrumb'
import HeroSettings from '../components/HeroSettings'
import { supabase } from '../lib/supabase'

type BlogPageSettingsT = {
  id: string
  hero_title: string | null
  hero_description: string | null
  hero_bg_image_url: string | null
  hero_cta_label: string | null
  hero_cta_url: string | null
  featured_post_enabled: boolean
  featured_post_title: string | null
  featured_post_description: string | null
  recommended_posts_enabled: boolean
  recommended_posts_title: string | null
  recommended_posts_description: string | null
  all_posts_enabled: boolean
  all_posts_title: string | null
  all_posts_description: string | null
  updated_at: string
}

const blogSettingsSchema = z.object({
  hero_title: z.string().optional(),
  hero_description: z.string().optional(),
  hero_bg_image_url: z.string().optional(),
  hero_cta_label: z.string().optional(),
  hero_cta_url: z.string().optional(),
  featured_post_enabled: z.boolean(),
  featured_post_title: z.string().optional(),
  featured_post_description: z.string().optional(),
  recommended_posts_enabled: z.boolean(),
  recommended_posts_title: z.string().optional(),
  recommended_posts_description: z.string().optional(),
  all_posts_enabled: z.boolean(),
  all_posts_title: z.string().optional(),
  all_posts_description: z.string().optional(),
})

type BlogSettingsForm = z.infer<typeof blogSettingsSchema>

const DEFAULT_SETTINGS: BlogSettingsForm = {
  hero_title: '',
  hero_description: '',
  hero_bg_image_url: '',
  hero_cta_label: '',
  hero_cta_url: '',
  featured_post_enabled: true,
  featured_post_title: 'Featured Post',
  featured_post_description: '최신 블로그 포스트를 확인해보세요',
  recommended_posts_enabled: true,
  recommended_posts_title: 'Recommended Posts',
  recommended_posts_description: '추천 포스트를 확인해보세요',
  all_posts_enabled: true,
  all_posts_title: 'All Posts',
  all_posts_description: '모든 블로그 포스트를 확인해보세요',
}

const AdminPagesBlog = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [current, setCurrent] = useState<BlogPageSettingsT | null>(null)

  // 섹션 표시 설정 카드 접기/펼치기 상태 (로컬 스토리지에 저장)
  const [settingsExpanded, setSettingsExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('blogSettingsExpanded')
    return saved !== null ? JSON.parse(saved) : true // 기본값: 펼침
  })

  // Hero 설정 카드 접기/펼치기 상태 (로컬 스토리지에 저장)
  const [heroExpanded, setHeroExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('blogHeroExpanded')
    return saved !== null ? JSON.parse(saved) : true // 기본값: 펼침
  })

  // Featured Post 설정 카드 접기/펼치기 상태
  const [featuredPostExpanded, setFeaturedPostExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('blogFeaturedPostExpanded')
    return saved !== null ? JSON.parse(saved) : true
  })

  // Recommended Posts 설정 카드 접기/펼치기 상태
  const [recommendedPostsExpanded, setRecommendedPostsExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('blogRecommendedPostsExpanded')
    return saved !== null ? JSON.parse(saved) : true
  })

  // All Posts 설정 카드 접기/펼치기 상태
  const [allPostsExpanded, setAllPostsExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('blogAllPostsExpanded')
    return saved !== null ? JSON.parse(saved) : true
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<BlogSettingsForm>({
    resolver: zodResolver(blogSettingsSchema),
    defaultValues: DEFAULT_SETTINGS
  })

  const toggleSettingsExpanded = () => {
    const newValue = !settingsExpanded
    setSettingsExpanded(newValue)
    localStorage.setItem('blogSettingsExpanded', JSON.stringify(newValue))
  }

  const toggleHeroExpanded = () => {
    const newValue = !heroExpanded
    setHeroExpanded(newValue)
    localStorage.setItem('blogHeroExpanded', JSON.stringify(newValue))
  }

  const toggleFeaturedPostExpanded = () => {
    const newValue = !featuredPostExpanded
    setFeaturedPostExpanded(newValue)
    localStorage.setItem('blogFeaturedPostExpanded', JSON.stringify(newValue))
  }

  const toggleRecommendedPostsExpanded = () => {
    const newValue = !recommendedPostsExpanded
    setRecommendedPostsExpanded(newValue)
    localStorage.setItem('blogRecommendedPostsExpanded', JSON.stringify(newValue))
  }

  const toggleAllPostsExpanded = () => {
    const newValue = !allPostsExpanded
    setAllPostsExpanded(newValue)
    localStorage.setItem('blogAllPostsExpanded', JSON.stringify(newValue))
  }

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        setError('')

        const { data, error } = await supabase
          .from('blog_page_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle()

        if (error) {
          console.error('설정 로딩 에러:', error)
          setError('설정을 불러오는데 실패했습니다.')
          return
        }

        if (data) {
          setCurrent(data as BlogPageSettingsT)
          setValue('hero_title', data.hero_title ?? '')
          setValue('hero_description', data.hero_description ?? '')
          setValue('hero_bg_image_url', data.hero_bg_image_url ?? '')
          setValue('hero_cta_label', data.hero_cta_label ?? '')
          setValue('hero_cta_url', data.hero_cta_url ?? '')
          setValue('featured_post_enabled', data.featured_post_enabled ?? true)
          setValue('featured_post_title', data.featured_post_title ?? 'Featured Post')
          setValue('featured_post_description', data.featured_post_description ?? '최신 블로그 포스트를 확인해보세요')
          setValue('recommended_posts_enabled', data.recommended_posts_enabled ?? true)
          setValue('recommended_posts_title', data.recommended_posts_title ?? 'Recommended Posts')
          setValue('recommended_posts_description', data.recommended_posts_description ?? '추천 포스트를 확인해보세요')
          setValue('all_posts_enabled', data.all_posts_enabled ?? true)
          setValue('all_posts_title', data.all_posts_title ?? 'All Posts')
          setValue('all_posts_description', data.all_posts_description ?? '모든 블로그 포스트를 확인해보세요')
        }
      } catch (err) {
        console.error('설정 로딩 중 오류:', err)
        setError('설정을 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [setValue])

  const onSubmit = async (data: BlogSettingsForm) => {
    try {
      setIsSaving(true)
      setError('')
      setSuccess('')

      const updateData = {
        id: 'default',
        hero_title: data.hero_title || null,
        hero_description: data.hero_description || null,
        hero_bg_image_url: data.hero_bg_image_url || null,
        hero_cta_label: data.hero_cta_label || null,
        hero_cta_url: data.hero_cta_url || null,
        featured_post_enabled: data.featured_post_enabled,
        featured_post_title: data.featured_post_title || null,
        featured_post_description: data.featured_post_description || null,
        recommended_posts_enabled: data.recommended_posts_enabled,
        recommended_posts_title: data.recommended_posts_title || null,
        recommended_posts_description: data.recommended_posts_description || null,
        all_posts_enabled: data.all_posts_enabled,
        all_posts_title: data.all_posts_title || null,
        all_posts_description: data.all_posts_description || null,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('blog_page_settings')
        .upsert(updateData)

      if (error) {
        console.error('설정 저장 에러:', error)
        setError('설정을 저장하는데 실패했습니다.')
        return
      }

      setCurrent(updateData)
      setSuccess('설정이 성공적으로 저장되었습니다.')
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('설정 저장 중 오류:', err)
      setError('설정을 저장하는데 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Breadcrumb items={[{ label: '페이지 관리', path: '/admin/pages/blog' }, { label: 'Blog' }]} />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog 페이지 관리</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-300">설정을 불러오는 중...</span>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="w-full">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb items={[{ label: '페이지 관리', path: '/admin/pages/blog' }, { label: 'Blog' }]} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog 페이지 관리</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 알림 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
              {success}
            </div>
          )}

          {/* 섹션 표시 설정 */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div
              className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              onClick={toggleSettingsExpanded}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">섹션 표시 설정</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Hero/Featured Post/Recommended Posts/All Posts 섹션을 켜고 끌 수 있습니다.</p>
                </div>
                <button type="button" className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label={settingsExpanded ? '접기' : '펼치기'}>
                  {settingsExpanded ? <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" /> : <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />}
                </button>
              </div>
            </div>
            {settingsExpanded && (
              <div className="p-6 space-y-4">
                <label className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Featured Post 표시</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">최신 포스트를 강조 표시하는 섹션</div>
                  </div>
                  <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" {...register('featured_post_enabled')} />
                </label>

                <label className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Recommended Posts 표시</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">추천 포스트 카로셀 섹션</div>
                  </div>
                  <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" {...register('recommended_posts_enabled')} />
                </label>

                <label className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">All Posts 표시</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">모든 포스트 목록과 검색/필터링 섹션</div>
                  </div>
                  <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" {...register('all_posts_enabled')} />
                </label>
              </div>
            )}
          </section>

          {/* Hero 설정 */}
          <HeroSettings
            sectionTitle="Hero 설정"
            helperText="타이틀/설명/배경 이미지/CTA 버튼을 설정합니다."
            expanded={heroExpanded}
            onToggle={toggleHeroExpanded}
            values={{
              title: watch('hero_title') || '',
              description: watch('hero_description') || '',
              bgImageUrl: watch('hero_bg_image_url') || '',
              ctaLabel: watch('hero_cta_label') || '',
              ctaUrl: watch('hero_cta_url') || '',
            }}
            onValuesChange={(p) => {
              if (p.title !== undefined) setValue('hero_title', p.title ?? '')
              if (p.description !== undefined) setValue('hero_description', p.description ?? '')
              if (p.bgImageUrl !== undefined) setValue('hero_bg_image_url', p.bgImageUrl ?? '')
              if (p.ctaLabel !== undefined) setValue('hero_cta_label', p.ctaLabel ?? '')
              if (p.ctaUrl !== undefined) setValue('hero_cta_url', p.ctaUrl ?? '')
            }}
            fields={{ title: true, description: true, bgImageUrl: true, cta: true, subtitle: false }}
          />

          {/* Featured Post 설정 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleFeaturedPostExpanded}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {featuredPostExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Featured Post 설정</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">최신 포스트를 강조 표시하는 섹션을 설정합니다.</p>
                </div>
              </div>
            </div>
            
            {featuredPostExpanded && (
              <div className="px-6 pb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    섹션 제목
                  </label>
                  <input
                    type="text"
                    {...register('featured_post_title')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Featured Post"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    섹션 설명
                  </label>
                  <input
                    type="text"
                    {...register('featured_post_description')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="최신 블로그 포스트를 확인해보세요"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Recommended Posts 설정 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleRecommendedPostsExpanded}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {recommendedPostsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recommended Posts 설정</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">추천 포스트 카로셀 섹션을 설정합니다.</p>
                </div>
              </div>
            </div>
            
            {recommendedPostsExpanded && (
              <div className="px-6 pb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    섹션 제목
                  </label>
                  <input
                    type="text"
                    {...register('recommended_posts_title')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Recommended Posts"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    섹션 설명
                  </label>
                  <input
                    type="text"
                    {...register('recommended_posts_description')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="추천 포스트를 확인해보세요"
                  />
                </div>
              </div>
            )}
          </div>

          {/* All Posts 설정 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleAllPostsExpanded}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {allPostsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Posts 설정</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">모든 포스트 목록과 검색/필터링 섹션을 설정합니다.</p>
                </div>
              </div>
            </div>
            
            {allPostsExpanded && (
              <div className="px-6 pb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    섹션 제목
                  </label>
                  <input
                    type="text"
                    {...register('all_posts_title')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="All Posts"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    섹션 설명
                  </label>
                  <input
                    type="text"
                    {...register('all_posts_description')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="모든 블로그 포스트를 확인해보세요"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="-ml-1 mr-2 h-4 w-4" />
                  저장
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default AdminPagesBlog



