import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Loader2, Image as ImageIcon, Info, Link as LinkIcon, Upload, ChevronUp, ChevronDown } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import AdminPageHeader from '../components/admin/AdminPageHeader'
import AboutSettings from '../components/admin/about/AboutSettings'
import AboutSkills from '../components/admin/about/AboutSkills'
import AboutExperience from '../components/admin/about/AboutExperience'
import AboutEducation from '../components/admin/about/AboutEducation'
import HeroSettings from '../components/HeroSettings'
import RichTextEditor from '../components/RichTextEditor'
import { ImageLibraryProvider } from '../contexts/ImageLibraryContext'
import { supabase } from '../lib/supabase'

type AboutPageSettingsT = {
  id: string
  show_about_me: boolean
  show_experience: boolean
  show_education: boolean
  show_skills?: boolean
  updated_at: string
}

type AboutMeSettingsT = {
  id: string
  display_profile_image: boolean
  name: string | null
  title: string | null
  email: string | null
  phone?: string | null
  location: string | null
  birth_year: number | null
  show_email: boolean
  show_phone?: boolean
  show_location: boolean
  show_birth_year: boolean
  show_resume_button: boolean
  resume_url: string | null
  resume_label: string | null
  hero_title?: string | null
  hero_description?: string | null
  hero_bg_image_url?: string | null
  hero_cta_label?: string | null
  hero_cta_url?: string | null
  hero_subtitle?: string | null
  intro_title: string | null
  intro_content_html: string | null
  profile_image_url: string | null
  side_image_url: string | null
  updated_at: string
}

type SkillT = {
  id: string
  category: string
  skill_name: string
  proficiency: number
  display_order: number
  category_order?: number
  created_at: string
  updated_at: string
}

type ExperienceT = {
  id: string
  title: string
  period: string
  company: string
  description: string | null
  display_order: number
  created_at: string
  updated_at: string
}

type EducationT = {
  id: string
  degree: string
  period: string
  school: string
  description: string | null
  display_order: number
  created_at: string
  updated_at: string
}

const aboutMeSettingsSchema = z.object({
  display_profile_image: z.boolean(),
  name: z.string().min(1, '이름을 입력하세요'),
  title: z.string().min(1, '직책을 입력하세요'),
  email: z.string().email('올바른 이메일을 입력하세요'),
  phone: z.string().optional(),
  location: z.string().min(1, '위치를 입력하세요'),
  birth_year: z.number().min(1900, '올바른 출생년도를 입력하세요').max(new Date().getFullYear(), '올바른 출생년도를 입력하세요'),
  show_email: z.boolean(),
  show_phone: z.boolean(),
  show_location: z.boolean(),
  show_birth_year: z.boolean(),
  show_resume_button: z.boolean(),
  resume_url: z.string().url('올바른 URL을 입력하세요').optional().or(z.literal('')),
  resume_label: z.string().optional(),
  intro_title: z.string().min(1, '소개 제목을 입력하세요'),
  intro_content_html: z.string().min(1, '소개 내용을 입력하세요')
})

type AboutMeSettingsForm = z.infer<typeof aboutMeSettingsSchema>

const AdminPagesAboutContent = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  
  // 데이터 상태
  const [aboutPageSettings, setAboutPageSettings] = useState<AboutPageSettingsT | null>(null)
  const [aboutMeSettings, setAboutMeSettings] = useState<AboutMeSettingsT | null>(null)
  const [skills, setSkills] = useState<SkillT[]>([])
  const [experiences, setExperiences] = useState<ExperienceT[]>([])
  const [educations, setEducations] = useState<EducationT[]>([])
  const [isAboutMeExpanded, setIsAboutMeExpanded] = useState(true)



  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<AboutMeSettingsForm>({
    resolver: zodResolver(aboutMeSettingsSchema)
  })

  // 데이터 로드
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setIsLoading(true)
      setError('')

      const [
        settingsResult,
        aboutMeResult,
        skillsResult,
        experiencesResult,
        educationsResult
      ] = await Promise.allSettled([
        supabase.from('about_page_settings').select('*').eq('id', 'default').maybeSingle(),
        supabase.from('about_page_about_me').select('*').eq('id', 'default').maybeSingle(),
        supabase.from('about_page_skills').select('*').order('category', { ascending: true }).order('category_order', { ascending: true }),
        supabase.from('about_page_experiences').select('*').order('display_order', { ascending: true }),
        supabase.from('about_page_educations').select('*').order('display_order', { ascending: true })
      ])

      // 설정 데이터 처리
      if (settingsResult.status === 'fulfilled' && settingsResult.value.data) {
        setAboutPageSettings(settingsResult.value.data)
      }

      // About Me 설정 데이터 처리
      if (aboutMeResult.status === 'fulfilled' && aboutMeResult.value.data) {
        const data = aboutMeResult.value.data
        setAboutMeSettings(data)
        reset({
          display_profile_image: data.display_profile_image,
          name: data.name || '',
          title: data.title || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          birth_year: data.birth_year || 1990,
          show_email: data.show_email,
          show_phone: data.show_phone || false,
          show_location: data.show_location,
          show_birth_year: data.show_birth_year,
          show_resume_button: data.show_resume_button,
          resume_url: data.resume_url || '',
          resume_label: data.resume_label || '',
          intro_title: data.intro_title || '',
          intro_content_html: data.intro_content_html || ''
        })
      }

      // 스킬 데이터 처리
      if (skillsResult.status === 'fulfilled' && skillsResult.value.data) {
        setSkills(skillsResult.value.data)
      }

      // 경력 데이터 처리
      if (experiencesResult.status === 'fulfilled' && experiencesResult.value.data) {
        setExperiences(experiencesResult.value.data)
      }

      // 학력 데이터 처리
      if (educationsResult.status === 'fulfilled' && educationsResult.value.data) {
        setEducations(educationsResult.value.data)
      }

    } catch (err: any) {
      setError('데이터를 불러오는데 실패했습니다.')
      console.error('Error loading data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // About Me 설정 저장
  const handleSaveAboutMeSettings = async (data: AboutMeSettingsForm) => {
    try {
      setIsSaving(true)
      setError('')
      setSuccess('')

      const { error } = await supabase
        .from('about_page_about_me')
        .update({
          display_profile_image: data.display_profile_image,
          name: data.name,
          title: data.title,
          email: data.email,
          phone: data.phone,
          location: data.location,
          birth_year: data.birth_year,
          show_email: data.show_email,
          show_phone: data.show_phone,
          show_location: data.show_location,
          show_birth_year: data.show_birth_year,
          show_resume_button: data.show_resume_button,
          resume_url: data.resume_url || null,
          resume_label: data.resume_label,
          intro_title: data.intro_title,
          intro_content_html: data.intro_content_html,
          updated_at: new Date().toISOString()
        })
        .eq('id', aboutMeSettings?.id)

      if (error) throw error

      setSuccess('About Me 설정이 저장되었습니다.')
      await loadAllData()
    } catch (err: any) {
      setError('설정 저장에 실패했습니다.')
      console.error('Error saving about me settings:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // 페이지 설정 저장
  const handleSavePageSettings = async (data: any) => {
    try {
      setIsSaving(true)
      setError('')
      setSuccess('')

      const { error } = await supabase
        .from('about_page_settings')
        .update({
          show_about_me: data.show_about_me,
          show_experience: data.show_experience,
          show_education: data.show_education,
          show_skills: data.show_skills,
          updated_at: new Date().toISOString()
        })
        .eq('id', aboutPageSettings?.id)

      if (error) throw error

      setSuccess('페이지 설정이 저장되었습니다.')
      await loadAllData()
    } catch (err: any) {
      setError('설정 저장에 실패했습니다.')
      console.error('Error saving page settings:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // 스킬 저장
  const handleSaveSkills = async (skillsData: SkillT[]) => {
    try {
      setIsSaving(true)
      setError('')
      setSuccess('')

      // 기존 스킬 삭제
      await supabase.from('about_page_skills').delete().neq('id', '00000000-0000-0000-0000-000000000000')

      // 새 스킬 추가
      if (skillsData.length > 0) {
        const { error } = await supabase.from('about_page_skills').insert(skillsData)
        if (error) throw error
      }

      setSuccess('스킬이 저장되었습니다.')
      await loadAllData()
    } catch (err: any) {
      setError('스킬 저장에 실패했습니다.')
      console.error('Error saving skills:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // 경력 저장
  const handleSaveExperiences = async (experiencesData: ExperienceT[]) => {
    try {
      setIsSaving(true)
      setError('')
      setSuccess('')

      // 기존 경력 삭제
      await supabase.from('about_page_experiences').delete().neq('id', '00000000-0000-0000-0000-000000000000')

      // 새 경력 추가
      if (experiencesData.length > 0) {
        const { error } = await supabase.from('about_page_experiences').insert(experiencesData)
        if (error) throw error
      }

      setSuccess('경력이 저장되었습니다.')
      await loadAllData()
    } catch (err: any) {
      setError('경력 저장에 실패했습니다.')
      console.error('Error saving experiences:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // 학력 저장
  const handleSaveEducations = async (educationsData: EducationT[]) => {
    try {
      setIsSaving(true)
      setError('')
      setSuccess('')

      // 기존 학력 삭제
      await supabase.from('about_page_educations').delete().neq('id', '00000000-0000-0000-0000-000000000000')

      // 새 학력 추가
      if (educationsData.length > 0) {
        const { error } = await supabase.from('about_page_educations').insert(educationsData)
        if (error) throw error
      }

      setSuccess('학력이 저장되었습니다.')
      await loadAllData()
    } catch (err: any) {
      setError('학력 저장에 실패했습니다.')
      console.error('Error saving educations:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">데이터를 불러오는 중...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        <AdminPageHeader
          title="About 페이지 관리"
          description="About 페이지의 모든 설정과 콘텐츠를 관리합니다."
        />

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

        {/* 기본 설정 */}
        {aboutPageSettings && (
          <AboutSettings
            settings={aboutPageSettings}
            onSave={handleSavePageSettings}
            isSaving={isSaving}
          />
        )}

        {/* About Me 설정 */}
        {aboutMeSettings && (
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div 
              className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" 
              onClick={() => setIsAboutMeExpanded(!isAboutMeExpanded)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">About Me 설정</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">개인 정보와 소개 내용을 관리합니다</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label={isAboutMeExpanded ? '접기' : '펼치기'}
                >
                  {isAboutMeExpanded ? (
                    <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            {isAboutMeExpanded && (
              <div className="p-6">
              <form onSubmit={handleSubmit(handleSaveAboutMeSettings)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      이름 *
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="이름을 입력하세요"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      직책 *
                    </label>
                    <input
                      {...register('title')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="직책을 입력하세요"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      이메일 *
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="이메일을 입력하세요"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      위치 *
                    </label>
                    <input
                      {...register('location')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="위치를 입력하세요"
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    소개 제목 *
                  </label>
                  <input
                    {...register('intro_title')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="소개 제목을 입력하세요"
                  />
                  {errors.intro_title && (
                    <p className="text-red-500 text-sm mt-1">{errors.intro_title.message}</p>
                  )}
                </div>

                                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    소개 내용 *
                  </label>
                  <RichTextEditor
                    value={watch('intro_content_html')}
                    onChange={(content) => setValue('intro_content_html', content)}
                    placeholder="소개 내용을 입력하세요..."
                    height={300}
                  />
                  {errors.intro_content_html && (
                    <p className="text-red-500 text-sm mt-1">{errors.intro_content_html.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    {isSaving ? '저장 중...' : '설정 저장'}
                  </button>
                </div>
              </form>
            </div>
            )}
          </section>
        )}

        {/* 스킬 관리 */}
        <AboutSkills
          skills={skills}
          onSaveSkills={handleSaveSkills}
          isSaving={isSaving}
        />

        {/* 경력 관리 */}
        <AboutExperience
          experiences={experiences}
          onSaveExperiences={handleSaveExperiences}
          isSaving={isSaving}
        />

        {/* 학력 관리 */}
        <AboutEducation
          educations={educations}
          onSaveEducations={handleSaveEducations}
          isSaving={isSaving}
        />
      </div>
    </AdminLayout>
  )
}

const AdminPagesAbout = () => {
  return (
    <ImageLibraryProvider>
      <AdminPagesAboutContent />
    </ImageLibraryProvider>
  )
}

export default AdminPagesAbout



