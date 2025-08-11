import { useEffect, useState, Fragment } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Loader2, Image as ImageIcon, Info, Link as LinkIcon, Upload, ChevronDown, ChevronUp, Code, Briefcase, GraduationCap, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
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
  const [hasHeroSubtitleCol, setHasHeroSubtitleCol] = useState<boolean>(false)
  const [skills, setSkills] = useState<SkillT[]>([])
  const [experiences, setExperiences] = useState<ExperienceT[]>([])
  const [educations, setEducations] = useState<EducationT[]>([])
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

  // 기술 스택 요소 설정 카드 접기/펼치기 상태 (로컬 스토리지에 저장)
  const [isSkillsExpanded, setIsSkillsExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('adminSkillsExpanded')
    return saved !== null ? JSON.parse(saved) : false // 기본값: 접음
  })

  // 경력사항 요소 설정 카드 접기/펼치기 상태 (로컬 스토리지에 저장)
  const [isExperienceExpanded, setIsExperienceExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('adminExperienceExpanded')
    return saved !== null ? JSON.parse(saved) : false // 기본값: 접음
  })

  // 학력사항 요소 설정 카드 접기/펼치기 상태 (로컬 스토리지에 저장)
  const [isEducationExpanded, setIsEducationExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('adminEducationExpanded')
    return saved !== null ? JSON.parse(saved) : false // 기본값: 접음
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

  // 기술 스택 설정 접기/펼치기 상태 변경 시 로컬 스토리지에 저장
  const toggleSkillsExpanded = () => {
    const newState = !isSkillsExpanded
    setIsSkillsExpanded(newState)
    localStorage.setItem('adminSkillsExpanded', JSON.stringify(newState))
  }

  // 경력사항 설정 접기/펼치기 상태 변경 시 로컬 스토리지에 저장
  const toggleExperienceExpanded = () => {
    const newState = !isExperienceExpanded
    setIsExperienceExpanded(newState)
    localStorage.setItem('adminExperienceExpanded', JSON.stringify(newState))
  }

  // 학력사항 설정 접기/펼치기 상태 변경 시 로컬 스토리지에 저장
  const toggleEducationExpanded = () => {
    const newState = !isEducationExpanded
    setIsEducationExpanded(newState)
    localStorage.setItem('adminEducationExpanded', JSON.stringify(newState))
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

        // 기술 스택 데이터 로드
        const { data: skillsData, error: skillsErr } = await supabase
          .from('about_page_skills')
          .select('*')
          .order('category', { ascending: true })
          .order('category_order', { ascending: true })
        if (skillsErr) throw skillsErr
        setSkills(skillsData ?? [])

        // 경력 데이터 로드
        const { data: expData, error: expErr } = await supabase
          .from('about_page_experiences')
          .select('*')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: true })
        if (expErr) throw expErr
        setExperiences(expData ?? [])

        // 학력 데이터 로드
        const { data: eduData, error: eduErr } = await supabase
          .from('about_page_educations')
          .select('*')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: true })
        if (eduErr) throw eduErr
        setEducations(eduData ?? [])
      } catch (err: any) {
        setError(err.message || '설정을 불러오지 못했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [reset])

  // about_page_about_me 테이블에 hero_subtitle 컬럼 존재 여부 확인
  useEffect(() => {
    const checkColumn = async () => {
      try {
        const { error } = await supabase
          .from('about_page_about_me')
          .select('hero_subtitle')
          .limit(1)
          .maybeSingle()
        if (error) {
          setHasHeroSubtitleCol(false)
        } else {
          setHasHeroSubtitleCol(true)
        }
      } catch {
        setHasHeroSubtitleCol(false)
      }
    }
    checkColumn()
  }, [])

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
                    <div className="text-sm font-medium text-gray-900 dark:text-white">기술 스택</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">독립 섹션으로 표시</div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    {...register('show_skills')}
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
                {/* 서브타이틀 설정 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">서브타이틀 설정</h3>
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">서브타이틀 텍스트</label>
                    <input
                      value={aboutMe?.hero_subtitle ?? ''}
                      onChange={(e) => setAboutMe(prev => prev ? { ...prev, hero_subtitle: e.target.value } : {
                        id: 'default', display_profile_image: true,
                        name: null, title: null, email: null, phone: null, location: null, birth_year: null,
                        show_email: true, show_phone: true, show_location: true, show_birth_year: true,
                        show_resume_button: false,
                        resume_url: null, resume_label: null,
                        hero_subtitle: e.target.value,
                        intro_title: null, intro_content_html: null,
                        profile_image_url: null, side_image_url: null, updated_at: new Date().toISOString()
                      })}
                      placeholder="예: 안녕하세요! 저는 사용자 경험을 중시하는 풀스택 개발자입니다. 깔끔하고 직관적인 웹 애플리케이션을 만드는 것을 좋아합니다."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {!hasHeroSubtitleCol && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        참고: 데이터베이스 컬럼(hero_subtitle)이 아직 없어 저장 시 이 필드는 무시됩니다. 컬럼 추가 후 자동으로 저장됩니다.
                      </p>
                    )}
                  </div>
                </div>

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
                          ...(hasHeroSubtitleCol ? { hero_subtitle: aboutMe?.hero_subtitle ?? null } : {}),
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

            {/* 기술 스택 요소 설정 */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div 
                className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={toggleSkillsExpanded}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Code size={18} /> 기술 스택 요소 설정
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">기술 스택 섹션의 내용과 표시 방식을 관리합니다.</p>
                  </div>
                  <button
                    type="button"
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    aria-label={isSkillsExpanded ? '접기' : '펼치기'}
                  >
                    {isSkillsExpanded ? (
                      <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              {isSkillsExpanded && (
                <div className="p-6 space-y-6">
                  {/* 기술 스택 목록 */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">기술 스택 목록</h3>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const categoryName = prompt('새 분야명을 입력하세요 (예: Frontend, Backend, Database):', '')
                            if (categoryName && categoryName.trim()) {
                              const initialOrder = 0
                              const newSkill = {
                                id: `local-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
                                category: categoryName.trim(),
                                skill_name: '',
                                proficiency: 50,
                                display_order: skills.length,
                                category_order: initialOrder,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                              } as any
                              setSkills([...skills, newSkill])
                            }
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          <Plus size={16} />
                          분야 추가
                        </button>
                      </div>
                    </div>

                    {skills.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Code size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p>아직 등록된 기술 스택이 없습니다.</p>
                        <p className="text-sm mt-2">"분야 추가" 버튼을 클릭하여 시작하세요.</p>
                      </div>
                    ) : (
                      (() => {
                        // 분야별로 그룹화
                        const groupedSkills = skills.reduce((acc, skill, originalIndex) => {
                          if (!acc[skill.category]) {
                            acc[skill.category] = []
                          }
                          acc[skill.category].push({ ...skill, originalIndex })
                          return acc
                        }, {} as Record<string, (SkillT & { originalIndex: number })[]>)

                        // 각 카테고리 내부는 category_order(없으면 display_order) 기준으로 정렬
                        Object.keys(groupedSkills).forEach(cat => {
                          groupedSkills[cat].sort((a, b) => {
                            const ao = (a.category_order ?? a.display_order) ?? 0
                            const bo = (b.category_order ?? b.display_order) ?? 0
                            return ao - bo
                          })
                        })

                        const categories = Object.keys(groupedSkills).sort()

                        return (
                          <div className="space-y-6">
                            {categories.map((category) => (
                              <div key={category} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="text"
                                      defaultValue={category}
                                      onBlur={async (e) => {
                                        const newName = e.target.value.trim()
                                        if (!newName || newName === category) return
                                        const updated = skills.map(s => s.category === category ? { ...s, category: newName } : s)
                                        setSkills(updated)
                                        try {
                                          setIsSaving(true)
                                          const { error } = await supabase
                                            .from('about_page_skills')
                                            .update({ category: newName })
                                            .eq('category', category)
                                          if (error) throw error
                                          setSuccess(`분야명이 "${category}" → "${newName}"(으)로 변경되었습니다.`)
                                        } catch (err: any) {
                                          setError(err.message || '분야명 변경 실패')
                                        } finally {
                                          setIsSaving(false)
                                        }
                                      }}
                                      className="text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none"
                                      aria-label="분야명"
                                    />
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      ({groupedSkills[category].length}개)
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextOrder = groupedSkills[category]?.length ?? 0
                                        const newSkill = {
                                          id: `local-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
                                          category: category,
                                          skill_name: '',
                                          proficiency: 50,
                                          display_order: skills.length,
                                          category_order: nextOrder,
                                          created_at: new Date().toISOString(),
                                          updated_at: new Date().toISOString()
                                        } as any
                                        setSkills([...skills, newSkill])
                                      }}
                                      className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                      title={`${category}에 기술 추가`}
                                    >
                                      <Plus size={14} />
                                      기술 추가
                                    </button>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (confirm(`"${category}" 분야의 모든 기술을 삭제하시겠습니까?`)) {
                                          // 해당 분야의 모든 기술 삭제
                                          const skillsToDelete = groupedSkills[category]
                                          const existingSkillsToDelete = skillsToDelete.filter(skill => 
                                            skill.id && !skill.id.startsWith('local-')
                                          )
                                          
                                          // DB에서 삭제
                                          for (const skill of existingSkillsToDelete) {
                                            try {
                                              setIsSaving(true)
                                              const { error } = await supabase
                                                .from('about_page_skills')
                                                .delete()
                                                .eq('id', skill.id)
                                              
                                              if (error) {
                                                console.error('분야 삭제 오류:', error)
                                                setError(`분야 삭제 실패: ${error.message}`)
                                                return
                                              }
                                            } catch (err: any) {
                                              setError(`분야 삭제 실패: ${err.message}`)
                                              return
                                            }
                                          }
                                          
                                          // 로컬 상태에서 해당 분야의 모든 기술 제거
                                          const updated = skills.filter(skill => skill.category !== category)
                                          // 순서 재정렬
                                          updated.forEach((skill, i) => {
                                            skill.display_order = i
                                          })
                                          setSkills(updated)
                                          setSuccess(`"${category}" 분야가 삭제되었습니다.`)
                                          setIsSaving(false)
                                        }
                                      }}
                                      disabled={isSaving}
                                      className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                      title={`${category} 분야 삭제`}
                                    >
                                      <Trash2 size={14} />
                                      분야 삭제
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">기술명</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">수준 (0-100)</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">순서</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">작업</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                      {groupedSkills[category].map((skill) => (
                                        <tr key={skill.id}>
                                          <td className="px-3 py-2 align-middle">
                                            <input
                                              type="text"
                                              value={skill.skill_name}
                                              onChange={(e) => {
                                                const updated = [...skills]
                                                updated[skill.originalIndex] = { ...skill, skill_name: e.target.value }
                                                setSkills(updated)
                                              }}
                                              placeholder="예: React"
                                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                          </td>
                                          <td className="px-3 py-2 align-middle">
                                            <input
                                              type="number"
                                              min="0"
                                              max="100"
                                              value={skill.proficiency}
                                              onChange={(e) => {
                                                const value = parseInt(e.target.value) || 0
                                                const clamped = Math.max(0, Math.min(100, value))
                                                const updated = [...skills]
                                                updated[skill.originalIndex] = { ...skill, proficiency: clamped }
                                                setSkills(updated)
                                              }}
                                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                          </td>
                                          <td className="px-3 py-2 align-middle">
                                            <div className="inline-flex gap-2">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const list = groupedSkills[category]
                                                  const idx = list.findIndex(s => s.id === skill.id)
                                                  if (idx > 0) {
                                                    // swap in overall skills preserving category group
                                                    const currentId = list[idx].id
                                                    const aboveId = list[idx - 1].id
                                                    const updated = [...skills]
                                                    const curIdxGlobal = updated.findIndex(s => s.id === currentId)
                                                    const aboveIdxGlobal = updated.findIndex(s => s.id === aboveId)
                                                    ;[updated[aboveIdxGlobal], updated[curIdxGlobal]] = [updated[curIdxGlobal], updated[aboveIdxGlobal]]
                                                    // assign category_order relative within category
                                                    let order = 0
                                                    updated
                                                      .filter(s => s.category === category)
                                                      .forEach(s => { (s as any).category_order = order++ })
                                                    setSkills(updated)
                                                  }
                                                }}
                                                className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                                                title="위로"
                                              >
                                                ↑
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const list = groupedSkills[category]
                                                  const idx = list.findIndex(s => s.id === skill.id)
                                                  if (idx < list.length - 1) {
                                                    const currentId = list[idx].id
                                                    const belowId = list[idx + 1].id
                                                    const updated = [...skills]
                                                    const curIdxGlobal = updated.findIndex(s => s.id === currentId)
                                                    const belowIdxGlobal = updated.findIndex(s => s.id === belowId)
                                                    ;[updated[belowIdxGlobal], updated[curIdxGlobal]] = [updated[curIdxGlobal], updated[belowIdxGlobal]]
                                                    let order = 0
                                                    updated
                                                      .filter(s => s.category === category)
                                                      .forEach(s => { (s as any).category_order = order++ })
                                                    setSkills(updated)
                                                  }
                                                }}
                                                className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                                                title="아래로"
                                              >
                                                ↓
                                              </button>
                                            </div>
                                          </td>
                                          <td className="px-3 py-2 align-middle">
                                            <div className="inline-flex gap-2">
                                              <button
                                                type="button"
                                                onClick={async () => {
                                                  try {
                                                    setIsSaving(true)
                                                    const payload: any = {
                                                      category: skill.category.trim(),
                                                      skill_name: skill.skill_name.trim(),
                                                      proficiency: skill.proficiency,
                                                      category_order: skill.category_order ?? 0,
                                                    }
                                                    if (skill.id && !skill.id.startsWith('local-')) {
                                                      const { error } = await supabase
                                                        .from('about_page_skills')
                                                        .update(payload)
                                                        .eq('id', skill.id)
                                                      if (error) throw error
                                                    } else {
                                                      const { error } = await supabase
                                                        .from('about_page_skills')
                                                        .insert([{ ...payload, display_order: skills.findIndex(s => s.id === skill.id) }])
                                                      if (error) throw error
                                                    }
                                                    setSuccess('기술이 저장되었습니다.')
                                                  } catch (err: any) {
                                                    setError(err.message || '저장 실패')
                                                  } finally {
                                                    setIsSaving(false)
                                                  }
                                                }}
                                                className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                                                title="저장"
                                              >
                                                저장
                                              </button>
                                              <button
                                                type="button"
                                                onClick={async () => {
                                                  const isExistingSkill = skill.id && !skill.id.startsWith('local-')
                                                  if (isExistingSkill) {
                                                    try {
                                                      setIsSaving(true)
                                                      const { error } = await supabase
                                                        .from('about_page_skills')
                                                        .delete()
                                                        .eq('id', skill.id)
                                                      if (error) throw error
                                                      setSuccess('기술 스택이 삭제되었습니다.')
                                                    } catch (err: any) {
                                                      setError(`삭제 실패: ${err.message}`)
                                                      return
                                                    } finally {
                                                      setIsSaving(false)
                                                    }
                                                  }
                                                  const updated = skills.filter((_, i) => i !== skill.originalIndex)
                                                  updated.forEach((s, i) => { s.display_order = i })
                                                  setSkills(updated)
                                                }}
                                                disabled={isSaving}
                                                className="px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                                                title="삭제"
                                              >
                                                삭제
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      })()
                    )}
                  </div>

                  {/* 저장 버튼 */}
                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          setIsSaving(true)
                          setError('')
                          setSuccess('')

                          // 새로운 항목과 기존 항목 구분
                          const newSkills = skills.filter(skill => skill.id.startsWith('local-'))
                          const existingSkills = skills.filter(skill => !skill.id.startsWith('local-'))

                          // 새로운 기술 스택 삽입
                          if (newSkills.length > 0) {
                            const { error: insertError } = await supabase
                              .from('about_page_skills')
                              .insert(newSkills.map((skill, index) => ({
                                category: skill.category.trim(),
                                skill_name: skill.skill_name.trim(),
                                proficiency: skill.proficiency,
                                display_order: skills.findIndex(s => s === skill), // 전체 배열에서의 인덱스
                                category_order: (skill as any).category_order ?? 0
                              })))

                            if (insertError) {
                              console.error('Insert error:', insertError)
                              throw insertError
                            }
                          }

                          // 기존 기술 스택 업데이트
                          for (const skill of existingSkills) {
                            const { error: updateError } = await supabase
                              .from('about_page_skills')
                              .update({
                                category: skill.category.trim(),
                                skill_name: skill.skill_name.trim(),
                                proficiency: skill.proficiency,
                                display_order: skills.findIndex(s => s === skill),
                                category_order: (skill as any).category_order ?? 0
                              })
                              .eq('id', skill.id)

                            if (updateError) {
                              console.error('Update error:', updateError)
                              throw updateError
                            }
                          }

                          // 저장 후 최신 데이터 다시 로드
                          const { data: updatedSkills, error: fetchError } = await supabase
                            .from('about_page_skills')
                            .select('*')
                            .order('display_order', { ascending: true })
                          
                          if (fetchError) {
                            console.error('Fetch error:', fetchError)
                          } else {
                            setSkills(updatedSkills ?? [])
                          }

                          setSuccess('기술 스택이 저장되었습니다.')
                        } catch (err: any) {
                          console.error('Save error:', err)
                          setError(err.message || '기술 스택 저장에 실패했습니다.')
                        } finally {
                          setIsSaving(false)
                        }
                      }}
                      disabled={isSaving || skills.some(s => !s.category.trim() || !s.skill_name.trim())}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={16} />
                      {isSaving ? '저장 중...' : '기술 스택 저장'}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* 경력사항 요소 설정 */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div 
                className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={toggleExperienceExpanded}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Briefcase size={18} /> 경력사항 요소 설정
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">경력사항 섹션의 내용과 타임라인을 관리합니다.</p>
                  </div>
                  <button
                    type="button"
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    aria-label={isExperienceExpanded ? '접기' : '펼치기'}
                  >
                    {isExperienceExpanded ? (
                      <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              {isExperienceExpanded && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">경력 목록</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newItem: ExperienceT = {
                          id: `local-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
                          title: '',
                          period: '',
                          company: '',
                          description: '',
                          display_order: experiences.length,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString()
                        }
                        setExperiences(prev => [...prev, newItem])
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus size={16} /> 경력 추가
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-64">경력명</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">경력기간</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-56">회사명</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">순서</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">작업</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {experiences.map((exp, idx) => (
                          <Fragment key={exp.id}>
                          <tr key={`${exp.id}-row1`}>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={exp.title}
                                onChange={(e) => {
                                  const updated = [...experiences]
                                  updated[idx] = { ...exp, title: e.target.value }
                                  setExperiences(updated)
                                }}
                                placeholder="예: 풀스택 개발자"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={exp.period}
                                onChange={(e) => {
                                  const updated = [...experiences]
                                  updated[idx] = { ...exp, period: e.target.value }
                                  setExperiences(updated)
                                }}
                                placeholder="예: 2023 - 현재"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => {
                                  const updated = [...experiences]
                                  updated[idx] = { ...exp, company: e.target.value }
                                  setExperiences(updated)
                                }}
                                placeholder="예: Tech Company"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <div className="inline-flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (idx === 0) return
                                    const updated = [...experiences]
                                    ;[updated[idx-1], updated[idx]] = [updated[idx], updated[idx-1]]
                                    updated.forEach((e, i) => e.display_order = i)
                                    setExperiences(updated)
                                  }}
                                  className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                                  title="위로"
                                >↑</button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (idx === experiences.length - 1) return
                                    const updated = [...experiences]
                                    ;[updated[idx+1], updated[idx]] = [updated[idx], updated[idx+1]]
                                    updated.forEach((e, i) => e.display_order = i)
                                    setExperiences(updated)
                                  }}
                                  className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                                  title="아래로"
                                >↓</button>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="inline-flex gap-2">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      setIsSaving(true)
                                      const payload = {
                                        title: exp.title.trim(),
                                        period: exp.period.trim(),
                                        company: exp.company.trim(),
                                        description: (exp.description ?? '').trim() || null,
                                        display_order: idx
                                      }
                                      if (exp.id && exp.id.startsWith('local-')) {
                                        const { error } = await supabase
                                          .from('about_page_experiences')
                                          .insert([payload])
                                        if (error) throw error
                                      } else {
                                        const { error } = await supabase
                                          .from('about_page_experiences')
                                          .update(payload)
                                          .eq('id', exp.id)
                                        if (error) throw error
                                      }
                                      // reload
                                      const { data: reload, error: rerr } = await supabase
                                        .from('about_page_experiences')
                                        .select('*')
                                        .order('display_order', { ascending: true })
                                        .order('created_at', { ascending: true })
                                      if (!rerr) setExperiences(reload ?? [])
                                      setSuccess('경력이 저장되었습니다.')
                                    } catch (e:any) {
                                      setError(e.message || '경력 저장 실패')
                                    } finally {
                                      setIsSaving(false)
                                    }
                                  }}
                                  className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                                >저장</button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (exp.id && !exp.id.startsWith('local-')) {
                                      try {
                                        setIsSaving(true)
                                        const { error } = await supabase
                                          .from('about_page_experiences')
                                          .delete()
                                          .eq('id', exp.id)
                                        if (error) throw error
                                      } catch (e:any) {
                                        setError(e.message || '삭제 실패')
                                      } finally {
                                        setIsSaving(false)
                                      }
                                    }
                                    setExperiences(prev => prev.filter((_, i) => i !== idx).map((e, i) => ({ ...e, display_order: i })))
                                  }}
                                  className="px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                                >삭제</button>
                              </div>
                            </td>
                          </tr>
                          <tr key={`${exp.id}-row2`}>
                            <td className="px-3 pb-4 pt-0" colSpan={5}>
                              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">경력설명</label>
                              <textarea
                                value={exp.description ?? ''}
                                onChange={(e) => {
                                  const updated = [...experiences]
                                  updated[idx] = { ...exp, description: e.target.value }
                                  setExperiences(updated)
                                }}
                                placeholder="간단한 역할/업무 설명"
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                          </tr>
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          setIsSaving(true)
                          setError('')
                          setSuccess('')
                          // upsert 전체 저장: 신규/기존 구분하여 처리
                          const newItems = experiences.filter(e => e.id.startsWith('local-'))
                          if (newItems.length) {
                            const { error } = await supabase
                              .from('about_page_experiences')
                              .insert(newItems.map((e, i) => ({
                                title: e.title.trim(),
                                period: e.period.trim(),
                                company: e.company.trim(),
                                description: (e.description ?? '').trim() || null,
                                display_order: experiences.findIndex(x => x === e)
                              })))
                            if (error) throw error
                          }
                          const existing = experiences.filter(e => !e.id.startsWith('local-'))
                          for (const e of existing) {
                            const { error } = await supabase
                              .from('about_page_experiences')
                              .update({
                                title: e.title.trim(),
                                period: e.period.trim(),
                                company: e.company.trim(),
                                description: (e.description ?? '').trim() || null,
                                display_order: experiences.findIndex(x => x === e)
                              })
                              .eq('id', e.id)
                            if (error) throw error
                          }
                          const { data: reload, error: rerr } = await supabase
                            .from('about_page_experiences')
                            .select('*')
                            .order('display_order', { ascending: true })
                            .order('created_at', { ascending: true })
                          if (!rerr) setExperiences(reload ?? [])
                          setSuccess('경력 목록이 저장되었습니다.')
                        } catch (e:any) {
                          setError(e.message || '경력 저장 실패')
                        } finally {
                          setIsSaving(false)
                        }
                      }}
                      disabled={isSaving || experiences.some(e => !e.title.trim() || !e.period.trim() || !e.company.trim())}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={16} /> {isSaving ? '저장 중...' : '경력 전체 저장'}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* 학력사항 요소 설정 */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div 
                className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={toggleEducationExpanded}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <GraduationCap size={18} /> 학력사항 요소 설정
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">학력사항 섹션의 내용과 표시 방식을 관리합니다.</p>
                  </div>
                  <button
                    type="button"
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    aria-label={isEducationExpanded ? '접기' : '펼치기'}
                  >
                    {isEducationExpanded ? (
                      <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              {isEducationExpanded && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">학력 목록</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newItem: EducationT = {
                          id: `local-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
                          degree: '',
                          period: '',
                          school: '',
                          description: '',
                          display_order: educations.length,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString()
                        }
                        setEducations(prev => [...prev, newItem])
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus size={16} /> 학력 추가
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-64">학위</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">기간</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-56">학교명</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">순서</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">작업</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {educations.map((edu, idx) => (
                          <Fragment key={edu.id}>
                          <tr key={`${edu.id}-row1`}>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => {
                                  const updated = [...educations]
                                  updated[idx] = { ...edu, degree: e.target.value }
                                  setEducations(updated)
                                }}
                                placeholder="예: 컴퓨터공학 학사"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={edu.period}
                                onChange={(e) => {
                                  const updated = [...educations]
                                  updated[idx] = { ...edu, period: e.target.value }
                                  setEducations(updated)
                                }}
                                placeholder="예: 2017 - 2021"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={edu.school}
                                onChange={(e) => {
                                  const updated = [...educations]
                                  updated[idx] = { ...edu, school: e.target.value }
                                  setEducations(updated)
                                }}
                                placeholder="예: 한국대학교"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <div className="inline-flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (idx === 0) return
                                    const updated = [...educations]
                                    ;[updated[idx-1], updated[idx]] = [updated[idx], updated[idx-1]]
                                    updated.forEach((e, i) => e.display_order = i)
                                    setEducations(updated)
                                  }}
                                  className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                                  title="위로"
                                >↑</button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (idx === educations.length - 1) return
                                    const updated = [...educations]
                                    ;[updated[idx+1], updated[idx]] = [updated[idx], updated[idx+1]]
                                    updated.forEach((e, i) => e.display_order = i)
                                    setEducations(updated)
                                  }}
                                  className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                                  title="아래로"
                                >↓</button>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="inline-flex gap-2">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      setIsSaving(true)
                                      const payload = {
                                        degree: edu.degree.trim(),
                                        period: edu.period.trim(),
                                        school: edu.school.trim(),
                                        description: (edu.description ?? '').trim() || null,
                                        display_order: idx
                                      }
                                      if (edu.id && edu.id.startsWith('local-')) {
                                        const { error } = await supabase
                                          .from('about_page_educations')
                                          .insert([payload])
                                        if (error) throw error
                                      } else {
                                        const { error } = await supabase
                                          .from('about_page_educations')
                                          .update(payload)
                                          .eq('id', edu.id)
                                        if (error) throw error
                                      }
                                      const { data: reload, error: rerr } = await supabase
                                        .from('about_page_educations')
                                        .select('*')
                                        .order('display_order', { ascending: true })
                                        .order('created_at', { ascending: true })
                                      if (!rerr) setEducations(reload ?? [])
                                      setSuccess('학력이 저장되었습니다.')
                                    } catch (e:any) {
                                      setError(e.message || '학력 저장 실패')
                                    } finally {
                                      setIsSaving(false)
                                    }
                                  }}
                                  className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                                >저장</button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (edu.id && !edu.id.startsWith('local-')) {
                                      try {
                                        setIsSaving(true)
                                        const { error } = await supabase
                                          .from('about_page_educations')
                                          .delete()
                                          .eq('id', edu.id)
                                        if (error) throw error
                                      } catch (e:any) {
                                        setError(e.message || '삭제 실패')
                                      } finally {
                                        setIsSaving(false)
                                      }
                                    }
                                    setEducations(prev => prev.filter((_, i) => i !== idx).map((e, i) => ({ ...e, display_order: i })))
                                  }}
                                  className="px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                                >삭제</button>
                              </div>
                            </td>
                          </tr>
                          <tr key={`${edu.id}-row2`}>
                            <td className="px-3 pb-4 pt-0" colSpan={5}>
                              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">상세 설명</label>
                              <textarea
                                value={edu.description ?? ''}
                                onChange={(e) => {
                                  const updated = [...educations]
                                  updated[idx] = { ...edu, description: e.target.value }
                                  setEducations(updated)
                                }}
                                placeholder="세부 학습 내용 등"
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                          </tr>
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          setIsSaving(true)
                          setError('')
                          setSuccess('')
                          const newItems = educations.filter(e => e.id.startsWith('local-'))
                          if (newItems.length) {
                            const { error } = await supabase
                              .from('about_page_educations')
                              .insert(newItems.map((e, i) => ({
                                degree: e.degree.trim(),
                                period: e.period.trim(),
                                school: e.school.trim(),
                                description: (e.description ?? '').trim() || null,
                                display_order: educations.findIndex(x => x === e)
                              })))
                            if (error) throw error
                          }
                          const existing = educations.filter(e => !e.id.startsWith('local-'))
                          for (const e of existing) {
                            const { error } = await supabase
                              .from('about_page_educations')
                              .update({
                                degree: e.degree.trim(),
                                period: e.period.trim(),
                                school: e.school.trim(),
                                description: (e.description ?? '').trim() || null,
                                display_order: educations.findIndex(x => x === e)
                              })
                              .eq('id', e.id)
                            if (error) throw error
                          }
                          const { data: reload, error: rerr } = await supabase
                            .from('about_page_educations')
                            .select('*')
                            .order('display_order', { ascending: true })
                            .order('created_at', { ascending: true })
                          if (!rerr) setEducations(reload ?? [])
                          setSuccess('학력 목록이 저장되었습니다.')
                        } catch (e:any) {
                          setError(e.message || '학력 저장 실패')
                        } finally {
                          setIsSaving(false)
                        }
                      }}
                      disabled={isSaving || educations.some(e => !e.degree.trim() || !e.period.trim() || !e.school.trim())}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={16} /> {isSaving ? '저장 중...' : '학력 전체 저장'}
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



