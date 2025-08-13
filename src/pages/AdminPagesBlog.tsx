import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
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
  updated_at: string
}

const blogSettingsSchema = z.object({
  hero_title: z.string().optional(),
  hero_description: z.string().optional(),
  hero_bg_image_url: z.string().optional(),
  hero_cta_label: z.string().optional(),
  hero_cta_url: z.string().optional(),
})

type BlogSettingsForm = z.infer<typeof blogSettingsSchema>

const DEFAULT_SETTINGS: BlogSettingsForm = {
  hero_title: '',
  hero_description: '',
  hero_bg_image_url: '',
  hero_cta_label: '',
  hero_cta_url: '',
}

const AdminPagesBlog = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [current, setCurrent] = useState<BlogPageSettingsT | null>(null)

  // Hero 설정 카드 접기/펼치기 상태 (로컬 스토리지에 저장)
  const [heroExpanded, setHeroExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('blogHeroExpanded')
    return saved !== null ? JSON.parse(saved) : true // 기본값: 펼침
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

  const toggleHeroExpanded = () => {
    const newValue = !heroExpanded
    setHeroExpanded(newValue)
    localStorage.setItem('blogHeroExpanded', JSON.stringify(newValue))
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



