import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Loader2, Image as ImageIcon, Info, Link as LinkIcon, Upload, ChevronDown, ChevronUp } from 'lucide-react'
import Breadcrumb from '../components/Breadcrumb'
import RichTextEditor from '../components/RichTextEditor'
import { ImageLibraryProvider, useImageLibrary } from '../contexts/ImageLibraryContext'
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
  intro_title: string | null
  intro_content_html: string | null
  profile_image_url: string | null
  side_image_url: string | null
  updated_at: string
}

const aboutSettingsSchema = z.object({
  show_about_me: z.boolean(),
  show_experience: z.boolean(),
  show_education: z.boolean(),
  show_skills: z.boolean()
})

type AboutSettingsForm = z.infer<typeof aboutSettingsSchema>

const DEFAULT_SETTINGS: AboutSettingsForm = {
  show_about_me: true,
  show_experience: true,
  show_education: true,
  show_skills: true
}

const AdminPagesAboutContent = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [current, setCurrent] = useState<AboutPageSettingsT | null>(null)
  const [aboutMe, setAboutMe] = useState<AboutMeSettingsT | null>(null)
  const { open } = useImageLibrary()

  // 섹션 표시 설정 카드 접기/펼치기 상태 (로컬 스토리지에 저장)
  const [isSectionExpanded, setIsSectionExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('adminSectionExpanded')
    return saved !== null ? JSON.parse(saved) : true // 기본값: 펼침
  })

  // About Me 요소 설정 카드 접기/펼치기 상태 (로컬 스토리지에 저장)
  const [isAboutMeExpanded, setIsAboutMeExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('adminAboutMeExpanded')
    return saved !== null ? JSON.parse(saved) : true // 기본값: 펼침
  })

  // 섹션 설정 접기/펼치기 상태 변경 시 로컬 스토리지에 저장
  const toggleSectionExpanded = () => {
    const newState = !isSectionExpanded
    setIsSectionExpanded(newState)
    localStorage.setItem('adminSectionExpanded', JSON.stringify(newState))
  }

  // About Me 설정 접기/펼치기 상태 변경 시 로컬 스토리지에 저장
  const toggleAboutMeExpanded = () => {
    const newState = !isAboutMeExpanded
    setIsAboutMeExpanded(newState)
    localStorage.setItem('adminAboutMeExpanded', JSON.stringify(newState))
  }

  const { register, handleSubmit, reset, watch } = useForm<AboutSettingsForm>({
    resolver: zodResolver(aboutSettingsSchema),
    defaultValues: DEFAULT_SETTINGS
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('about_page_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle()

        if (error) throw error

        if (data) {
          setCurrent(data)
          reset({
            show_about_me: data.show_about_me,
            show_experience: data.show_experience,
            show_education: data.show_education,
            show_skills: 'show_skills' in data ? (data as any).show_skills : true
          })
        } else {
          reset(DEFAULT_SETTINGS)
        }

        // About Me 요소 설정 로드
        const { data: aboutMeData, error: aboutMeErr } = await supabase
          .from('about_page_about_me')
          .select('*')
          .eq('id', 'default')
          .maybeSingle()
        if (aboutMeErr) throw aboutMeErr
        setAboutMe(aboutMeData ?? null)
      } catch (err: any) {
        setError(err.message || '설정을 불러오지 못했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [reset])

  const onSubmit = async (data: AboutSettingsForm) => {
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        id: 'default',
        show_about_me: data.show_about_me,
        show_experience: data.show_experience,
        show_education: data.show_education,
        updated_at: new Date().toISOString(),
        show_skills: watch('show_skills')
      }

      const { error } = await supabase
        .from('about_page_settings')
        .upsert(payload, { onConflict: 'id' })

      if (error) throw error

      setSuccess('섹션 설정이 저장되었습니다.')
    } catch (err: any) {
      setError(err.message || '설정 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb items={[{ label: '페이지 관리', path: '/admin/pages/about' }, { label: 'About' }]} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">About 페이지 관리</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            설정을 불러오는 중...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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

            <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div 
                className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={toggleSectionExpanded}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">섹션 표시 설정</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">About 페이지의 각 섹션 표기 여부를 토글합니다.</p>
                  </div>
                  <button
                    type="button"
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    aria-label={isSectionExpanded ? '접기' : '펼치기'}
                  >
                    {isSectionExpanded ? (
                      <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              {isSectionExpanded && (
              <div className="p-6 space-y-4">
                <label className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">About Me</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">상단 자기소개/프로필 영역</div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    {...register('show_about_me')}
                  />
                </label>

                <label className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">경력 사항</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">이력/타임라인</div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    {...register('show_experience')}
                  />
                </label>

                <label className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">학력 사항</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">교육/학위</div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    {...register('show_education')}
                  />
                </label>

                <label className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">기술 스택</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">독립 섹션으로 표시</div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    {...register('show_skills')}
                  />
                </label>
              </div>
              )}
            </section>

            {/* About Me 요소 설정 */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div 
                className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={toggleAboutMeExpanded}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Info size={18} /> About Me 요소 설정
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">프로필, 소개 텍스트, 버튼 등을 관리합니다.</p>
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
              <div className="p-6 space-y-8">
                {/* 기본 정보 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">기본 정보</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">이름</label>
                      <input defaultValue={aboutMe?.name ?? ''} id="aboutme-name" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" onChange={(e)=>setAboutMe(prev=>prev?{...prev,name:e.target.value}:{id:'default',display_profile_image:true,name:e.target.value,title:null,email:null,location:null,birth_year:null,show_email:true,show_location:true,show_birth_year:true,show_resume_button:false,resume_url:null,resume_label:null,intro_title:null,intro_content_html:null,profile_image_url:null,side_image_url:null,updated_at:new Date().toISOString()})} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">직함/타이틀</label>
                      <input defaultValue={aboutMe?.title ?? ''} id="aboutme-title" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" onChange={(e)=>setAboutMe(prev=>prev?{...prev,title:e.target.value}:{id:'default',display_profile_image:true,name:null,title:e.target.value,email:null,location:null,birth_year:null,show_email:true,show_location:true,show_birth_year:true,show_resume_button:false,resume_url:null,resume_label:null,intro_title:null,intro_content_html:null,profile_image_url:null,side_image_url:null,updated_at:new Date().toISOString()})} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">이메일</label>
                      <input defaultValue={aboutMe?.email ?? ''} id="aboutme-email" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" onChange={(e)=>setAboutMe(prev=>prev?{...prev,email:e.target.value}:{id:'default',display_profile_image:true,name:null,title:null,email:e.target.value,phone:null,location:null,birth_year:null,show_email:true,show_phone:true,show_location:true,show_birth_year:true,show_resume_button:false,resume_url:null,resume_label:null,intro_title:null,intro_content_html:null,profile_image_url:null,side_image_url:null,updated_at:new Date().toISOString()})} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">연락처(전화)</label>
                      <input defaultValue={aboutMe?.phone ?? ''} id="aboutme-phone" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" onChange={(e)=>setAboutMe(prev=>prev?{...prev,phone:e.target.value}:{id:'default',display_profile_image:true,name:null,title:null,email:null,phone:e.target.value,location:null,birth_year:null,show_email:true,show_phone:true,show_location:true,show_birth_year:true,show_resume_button:false,resume_url:null,resume_label:null,intro_title:null,intro_content_html:null,profile_image_url:null,side_image_url:null,updated_at:new Date().toISOString()})} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">위치</label>
                      <input defaultValue={aboutMe?.location ?? ''} id="aboutme-location" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" onChange={(e)=>setAboutMe(prev=>prev?{...prev,location:e.target.value}:{id:'default',display_profile_image:true,name:null,title:null,email:null,location:e.target.value,birth_year:null,show_email:true,show_location:true,show_birth_year:true,show_resume_button:false,resume_url:null,resume_label:null,intro_title:null,intro_content_html:null,profile_image_url:null,side_image_url:null,updated_at:new Date().toISOString()})} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">출생연도</label>
                      <input type="number" defaultValue={aboutMe?.birth_year ?? ''} id="aboutme-birth" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" onChange={(e)=>setAboutMe(prev=>prev?{...prev,birth_year:e.target.value?Number(e.target.value):null}:{id:'default',display_profile_image:true,name:null,title:null,email:null,location:null,birth_year:e.target.value?Number(e.target.value):null,show_email:true,show_location:true,show_birth_year:true,show_resume_button:false,resume_url:null,resume_label:null,intro_title:null,intro_content_html:null,profile_image_url:null,side_image_url:null,updated_at:new Date().toISOString()})} />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={aboutMe?.show_email ?? true} onChange={(e)=>setAboutMe(prev=>prev?{...prev,show_email:e.target.checked}:{id:'default',display_profile_image:true,name:null,title:null,email:null,location:null,birth_year:null,show_email:e.target.checked,show_location:true,show_birth_year:true,show_resume_button:false,resume_url:null,resume_label:null,intro_title:null,intro_content_html:null,profile_image_url:null,side_image_url:null,updated_at:new Date().toISOString()})} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">이메일 표시</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={aboutMe?.show_phone ?? true} onChange={(e)=>setAboutMe(prev=>prev?{...prev,show_phone:e.target.checked}:{id:'default',display_profile_image:true,name:null,title:null,email:null,phone:null,location:null,birth_year:null,show_email:true,show_phone:e.target.checked,show_location:true,show_birth_year:true,show_resume_button:false,resume_url:null,resume_label:null,intro_title:null,intro_content_html:null,profile_image_url:null,side_image_url:null,updated_at:new Date().toISOString()})} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">연락처 표시</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={aboutMe?.show_location ?? true} onChange={(e)=>setAboutMe(prev=>prev?{...prev,show_location:e.target.checked}:{id:'default',display_profile_image:true,name:null,title:null,email:null,location:null,birth_year:null,show_email:true,show_location:e.target.checked,show_birth_year:true,show_resume_button:false,resume_url:null,resume_label:null,intro_title:null,intro_content_html:null,profile_image_url:null,side_image_url:null,updated_at:new Date().toISOString()})} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">위치 표시</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={aboutMe?.show_birth_year ?? true} onChange={(e)=>setAboutMe(prev=>prev?{...prev,show_birth_year:e.target.checked}:{id:'default',display_profile_image:true,name:null,title:null,email:null,location:null,birth_year:null,show_email:true,show_location:true,show_birth_year:e.target.checked,show_resume_button:false,resume_url:null,resume_label:null,intro_title:null,intro_content_html:null,profile_image_url:null,side_image_url:null,updated_at:new Date().toISOString()})} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">출생연도 표시</span>
                    </label>
                  </div>
                </div>

                {/* 버튼 및 링크 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">버튼/링크</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">이력서 버튼 레이블</label>
                      <input defaultValue={aboutMe?.resume_label ?? '이력서 다운로드'} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" onChange={(e)=>setAboutMe(prev=>prev?{...prev,resume_label:e.target.value}:{id:'default',display_profile_image:true,name:null,title:null,email:null,location:null,birth_year:null,show_email:true,show_location:true,show_birth_year:true,show_resume_button:true,resume_url:null,resume_label:e.target.value,intro_title:null,intro_content_html:null,profile_image_url:null,side_image_url:null,updated_at:new Date().toISOString()})} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">이력서 URL</label>
                      <div className="relative">
                        <input defaultValue={aboutMe?.resume_url ?? ''} className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" onChange={(e)=>setAboutMe(prev=>prev?{...prev,resume_url:e.target.value}:{id:'default',display_profile_image:true,name:null,title:null,email:null,location:null,birth_year:null,show_email:true,show_location:true,show_birth_year:true,show_resume_button:true,resume_url:e.target.value,resume_label:'이력서 다운로드',intro_title:null,intro_content_html:null,profile_image_url:null,side_image_url:null,updated_at:new Date().toISOString()})} />
                        <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                    {/* 파일 업로드 */}
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">이력서 파일 업로드 (zip, hwp, doc, docx, pdf)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept=".zip,.hwp,.doc,.docx,.pdf,application/zip,application/x-hwp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            try {
                              setIsSaving(true)
                              const { uploadFile, getPublicUrl } = await import('../lib/storage')
                              const path = await uploadFile('resume-files', file, '')
                              const publicUrl = getPublicUrl('resume-files', path)
                              setAboutMe(prev => prev ? { ...prev, resume_url: publicUrl } : {
                                id: 'default', display_profile_image: true,
                                name: null, title: null, email: null, phone: null, location: null, birth_year: null,
                                show_email: true, show_phone: true, show_location: true, show_birth_year: true,
                                show_resume_button: true,
                                resume_url: publicUrl, resume_label: '이력서 다운로드',
                                intro_title: null, intro_content_html: null,
                                profile_image_url: null, side_image_url: null, updated_at: new Date().toISOString()
                              })
                              setSuccess('이력서 파일이 업로드되었습니다.')
                            } catch (err:any) {
                              setError(err.message || '이력서 파일 업로드에 실패했습니다.')
                            } finally {
                              setIsSaving(false)
                              e.currentTarget.value = ''
                            }
                          }}
                          className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
                        />
                        <Upload size={18} className="text-gray-400" />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">업로드하면 URL 입력란이 자동으로 채워집니다.</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={aboutMe?.show_resume_button ?? false} onChange={(e)=>setAboutMe(prev=>prev?{...prev,show_resume_button:e.target.checked}:{id:'default',display_profile_image:true,name:null,title:null,email:null,location:null,birth_year:null,show_email:true,show_location:true,show_birth_year:true,show_resume_button:e.target.checked,resume_url:null,resume_label:'이력서 다운로드',intro_title:null,intro_content_html:null,profile_image_url:null,side_image_url:null,updated_at:new Date().toISOString()})} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">이력서 버튼 표시</span>
                    </label>
                  </div>
                </div>

                {/* 소개 텍스트 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">소개 텍스트</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">소개 섹션 제목</label>
                      <input defaultValue={aboutMe?.intro_title ?? '자기소개'} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" onChange={(e)=>setAboutMe(prev=>prev?{...prev,intro_title:e.target.value}:{id:'default',display_profile_image:true,name:null,title:null,email:null,location:null,birth_year:null,show_email:true,show_location:true,show_birth_year:true,show_resume_button:false,resume_url:null,resume_label:null,intro_title:e.target.value,intro_content_html:null,profile_image_url:null,side_image_url:null,updated_at:new Date().toISOString()})} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">소개 내용 (리치 텍스트)</label>
                      <RichTextEditor
                        value={aboutMe?.intro_content_html ?? ''}
                        onChange={(content) =>
                          setAboutMe(prev => prev
                            ? { ...prev, intro_content_html: content }
                            : {
                                id: 'default',
                                display_profile_image: true,
                                name: null,
                                title: null,
                                email: null,
                                phone: null,
                                location: null,
                                birth_year: null,
                                show_email: true,
                                show_phone: true,
                                show_location: true,
                                show_birth_year: true,
                                show_resume_button: false,
                                resume_url: null,
                                resume_label: null,
                                intro_title: null,
                                intro_content_html: content,
                                profile_image_url: null,
                                side_image_url: null,
                                updated_at: new Date().toISOString(),
                              }
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* 이미지 설정 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><ImageIcon size={16}/> 이미지</h3>
                  
                  {/* 기본정보 카드 프로필 이미지 */}
                  <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">기본정보 카드 프로필 이미지</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">프로필 이미지 URL</label>
                        <input 
                          defaultValue={aboutMe?.profile_image_url ?? ''} 
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                          onChange={(e)=>setAboutMe(prev=>prev?{...prev,profile_image_url:e.target.value}:{id:'default',display_profile_image:true,name:null,title:null,email:null,phone:null,location:null,birth_year:null,show_email:true,show_phone:true,show_location:true,show_birth_year:true,show_resume_button:false,resume_url:null,resume_label:null,intro_title:null,intro_content_html:null,profile_image_url:e.target.value,side_image_url:null,updated_at:new Date().toISOString()})} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">프로필 이미지 업로드</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              try {
                                setIsSaving(true)
                                const { uploadFile, getPublicUrl } = await import('../lib/storage')
                                const path = await uploadFile('admin-pic', file, 'profile')
                                const publicUrl = getPublicUrl('admin-pic', path)
                                setAboutMe(prev => prev ? { ...prev, profile_image_url: publicUrl } : {
                                  id: 'default', display_profile_image: true,
                                  name: null, title: null, email: null, phone: null, location: null, birth_year: null,
                                  show_email: true, show_phone: true, show_location: true, show_birth_year: true,
                                  show_resume_button: false,
                                  resume_url: null, resume_label: null,
                                  intro_title: null, intro_content_html: null,
                                  profile_image_url: publicUrl, side_image_url: null, updated_at: new Date().toISOString()
                                })
                                setSuccess('프로필 이미지가 업로드되었습니다.')
                              } catch (err:any) {
                                setError(err.message || '프로필 이미지 업로드에 실패했습니다.')
                              } finally {
                                setIsSaving(false)
                                e.currentTarget.value = ''
                              }
                            }}
                            className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
                          />
                          <Upload size={18} className="text-gray-400" />
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const url = await open({ bucket: 'admin-pic' })
                                if (url) {
                                  setAboutMe(prev => prev ? { ...prev, profile_image_url: url } : {
                                    id: 'default', display_profile_image: true,
                                    name: null, title: null, email: null, phone: null, location: null, birth_year: null,
                                    show_email: true, show_phone: true, show_location: true, show_birth_year: true,
                                    show_resume_button: false,
                                    resume_url: null, resume_label: null,
                                    intro_title: null, intro_content_html: null,
                                    profile_image_url: url, side_image_url: null, updated_at: new Date().toISOString()
                                  })
                                  setSuccess('프로필 이미지가 선택되었습니다.')
                                }
                              } catch (err: any) {
                                setError(err.message || '이미지 선택에 실패했습니다.')
                              }
                            }}
                            className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                          >
                            라이브러리에서 선택
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">업로드하거나 라이브러리에서 선택하면 URL 입력란이 자동으로 채워집니다.</p>
                      </div>
                      <div>
                        <label className="inline-flex items-center gap-2">
                          <input type="checkbox" checked={aboutMe?.display_profile_image ?? true} onChange={(e)=>setAboutMe(prev=>prev?{...prev,display_profile_image:e.target.checked}:{id:'default',display_profile_image:e.target.checked,name:null,title:null,email:null,phone:null,location:null,birth_year:null,show_email:true,show_phone:true,show_location:true,show_birth_year:true,show_resume_button:false,resume_url:null,resume_label:null,intro_title:null,intro_content_html:null,profile_image_url:null,side_image_url:null,updated_at:new Date().toISOString()})} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">프로필 이미지 표시</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 소개 카드 사이드 이미지 */}
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">소개 카드 사이드 이미지</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">사이드 이미지 URL</label>
                        <input 
                          defaultValue={aboutMe?.side_image_url ?? ''} 
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                          onChange={(e)=>setAboutMe(prev=>prev?{...prev,side_image_url:e.target.value}:{id:'default',display_profile_image:true,name:null,title:null,email:null,phone:null,location:null,birth_year:null,show_email:true,show_phone:true,show_location:true,show_birth_year:true,show_resume_button:false,resume_url:null,resume_label:null,intro_title:null,intro_content_html:null,profile_image_url:null,side_image_url:e.target.value,updated_at:new Date().toISOString()})} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">사이드 이미지 업로드</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              try {
                                setIsSaving(true)
                                const { uploadFile, getPublicUrl } = await import('../lib/storage')
                                const path = await uploadFile('admin-pic', file, 'side')
                                const publicUrl = getPublicUrl('admin-pic', path)
                                setAboutMe(prev => prev ? { ...prev, side_image_url: publicUrl } : {
                                  id: 'default', display_profile_image: true,
                                  name: null, title: null, email: null, phone: null, location: null, birth_year: null,
                                  show_email: true, show_phone: true, show_location: true, show_birth_year: true,
                                  show_resume_button: false,
                                  resume_url: null, resume_label: null,
                                  intro_title: null, intro_content_html: null,
                                  profile_image_url: null, side_image_url: publicUrl, updated_at: new Date().toISOString()
                                })
                                setSuccess('사이드 이미지가 업로드되었습니다.')
                              } catch (err:any) {
                                setError(err.message || '사이드 이미지 업로드에 실패했습니다.')
                              } finally {
                                setIsSaving(false)
                                e.currentTarget.value = ''
                              }
                            }}
                            className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
                          />
                          <Upload size={18} className="text-gray-400" />
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const url = await open({ bucket: 'admin-pic' })
                                if (url) {
                                  setAboutMe(prev => prev ? { ...prev, side_image_url: url } : {
                                    id: 'default', display_profile_image: true,
                                    name: null, title: null, email: null, phone: null, location: null, birth_year: null,
                                    show_email: true, show_phone: true, show_location: true, show_birth_year: true,
                                    show_resume_button: false,
                                    resume_url: null, resume_label: null,
                                    intro_title: null, intro_content_html: null,
                                    profile_image_url: null, side_image_url: url, updated_at: new Date().toISOString()
                                  })
                                  setSuccess('사이드 이미지가 선택되었습니다.')
                                }
                              } catch (err: any) {
                                setError(err.message || '이미지 선택에 실패했습니다.')
                              }
                            }}
                            className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                          >
                            라이브러리에서 선택
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">업로드하거나 라이브러리에서 선택하면 URL 입력란이 자동으로 채워집니다.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 저장 버튼 */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={async ()=>{
                      try{
                        setIsSaving(true); setError(''); setSuccess('')
                        const payload = {
                          id: 'default',
                          display_profile_image: aboutMe?.display_profile_image ?? true,
                          name: aboutMe?.name ?? null,
                          title: aboutMe?.title ?? null,
                          email: aboutMe?.email ?? null,
                          phone: aboutMe?.phone ?? null,
                          location: aboutMe?.location ?? null,
                          birth_year: aboutMe?.birth_year ?? null,
                          show_email: aboutMe?.show_email ?? true,
                          show_phone: aboutMe?.show_phone ?? true,
                          show_location: aboutMe?.show_location ?? true,
                          show_birth_year: aboutMe?.show_birth_year ?? true,
                          show_resume_button: aboutMe?.show_resume_button ?? false,
                          resume_url: aboutMe?.resume_url ?? null,
                          resume_label: aboutMe?.resume_label ?? null,
                          intro_title: aboutMe?.intro_title ?? null,
                          intro_content_html: aboutMe?.intro_content_html ?? null,
                          profile_image_url: aboutMe?.profile_image_url ?? null,
                          side_image_url: aboutMe?.side_image_url ?? null,
                          updated_at: new Date().toISOString()
                        }
                        const { error } = await supabase
                          .from('about_page_about_me')
                          .upsert(payload, { onConflict: 'id' })
                        if (error) throw error
                        setSuccess('About Me 설정이 저장되었습니다.')
                      }catch(err:any){
                        setError(err.message || 'About Me 설정 저장에 실패했습니다.')
                      }finally{
                        setIsSaving(false)
                      }
                    }}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    {isSaving ? '저장 중...' : 'About Me 설정 저장'}
                  </button>
                </div>
              </div>
              )}
            </section>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
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



