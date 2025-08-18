import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Mail, MapPin, Calendar, Briefcase, Phone, Code } from 'lucide-react'
import Navbar from '../components/Navbar'
import DotNavigation from '../components/DotNavigation'
import SEO from '../components/SEO'
import ImageWithFallback from '../components/ImageWithFallback'
import Hero from '../components/Hero'
import { supabase } from '../lib/supabase'
import type { 
  AboutPageSettings, 
  AboutMeSettings, 
  Skill
} from '../types'

// 중앙 타입 사용 (로컬 alias는 필요에 따라 유지)
type AboutPageSettingsT = AboutPageSettings
type AboutMeSettingsT = AboutMeSettings
type SkillT = Skill

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

const About = () => {
  const [settings, setSettings] = useState<AboutPageSettingsT | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [aboutMe, setAboutMe] = useState<AboutMeSettingsT | null>(null)
  const [skills, setSkills] = useState<SkillT[]>([])
  const [experiences, setExperiences] = useState<ExperienceT[]>([])
  const [educations, setEducations] = useState<EducationT[]>([])

  const formatPhone = (raw?: string | null): string => {
    if (!raw) return ''
    const digits = raw.replace(/\D/g, '')
    if (digits.length === 11) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
    }
    return raw
  }

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('about_page_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle()

        if (error) throw error
        setSettings(data ?? null)

        // About Me 요소 설정 로드
        const { data: aboutData, error: aboutErr } = await supabase
          .from('about_page_about_me')
          .select('*')
          .eq('id', 'default')
          .maybeSingle()
        if (aboutErr) {
          // 무시하고 기본값 유지
        } else {
          setAboutMe(aboutData ?? null)
        }

        // 기술 스택 데이터 로드
        const { data: skillsData, error: skillsErr } = await supabase
          .from('about_page_skills')
          .select('*')
          .order('category', { ascending: true })
          .order('category_order', { ascending: true })
        if (skillsErr) {
          // 무시하고 빈 배열 유지
        } else {
          setSkills(skillsData ?? [])
        }

        // 경력 데이터 로드
        const { data: expData, error: expErr } = await supabase
          .from('about_page_experiences')
          .select('*')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: true })
        if (!expErr) {
          setExperiences(expData ?? [])
        }

        // 학력 데이터 로드
        const { data: eduData, error: eduErr } = await supabase
          .from('about_page_educations')
          .select('*')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: true })
        if (!eduErr) {
          setEducations(eduData ?? [])
        }
      } catch (err) {
        // 설정이 없으면 null 유지 (모두 표시 기본값)
        setSettings(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const enabled = useMemo(() => ({
    about: settings?.show_about_me ?? true,
    skills: (settings as any)?.show_skills ?? true,
    experience: settings?.show_experience ?? true,
    education: settings?.show_education ?? true
  }), [settings])

  const experienceItems = experiences

  const education = educations

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DotNavigation
        sections={[
          ...(enabled.about ? ['about-hero'] as const : []),
          ...(enabled.skills ? ['skills-section'] as const : []),
          ...(enabled.experience ? ['experience-section'] as const : []),
          ...(enabled.education ? ['education-section'] as const : []),
        ]}
      />
      <SEO 
        title="About - 이호진 포트폴리오"
        description="프론트엔드 개발자 이호진에 대해 알아보세요. 경력, 기술 스택, 교육 배경을 확인할 수 있습니다."
        keywords="About, 소개, 경력, 기술스택, 개발자, 이호진"
        type="website"
      />
      <Navbar />
      
      {/* Hero Section */}
      {enabled.about && (
        <Hero
          id="about-hero"
          title={(aboutMe as any)?.hero_title ?? 'About Me'}
          description={(aboutMe as any)?.hero_description ?? '안녕하세요! 저는 사용자 경험을 중시하는 풀스택 개발자입니다. 깔끔하고 직관적인 웹 애플리케이션을 만드는 것을 좋아합니다.'}
          bgImageUrl={(aboutMe as any)?.hero_bg_image_url ?? undefined}
          ctaLabel={(aboutMe as any)?.hero_cta_label ?? undefined}
          ctaUrl={(aboutMe as any)?.hero_cta_url ?? undefined}
        >
          {/* Profile Section */}
          <div className="grid lg:grid-cols-3 gap-12 items-stretch">
            {/* Profile Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-1 h-full"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 h-full flex flex-col">
                { (aboutMe?.display_profile_image ?? true) && (
                  <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden shadow-lg">
                    <ImageWithFallback 
                      defaultType="PROFILE"
                      src={aboutMe?.profile_image_url ?? undefined}
                      alt={(aboutMe?.name ?? 'HJLEE') + ' Profile'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
                  {aboutMe?.name ?? 'HJLEE'}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                  {aboutMe?.title ?? '풀스택 개발자 & UI/UX 디자이너'}
                </p>
                
                {/* Contact Info */}
                <div className="space-y-3 flex-1">
                  { (aboutMe?.show_email ?? true) && (
                    <div className="flex items-center gap-3">
                      <Mail size={20} className="text-blue-600" />
                      <span className="text-gray-700 dark:text-gray-300">{aboutMe?.email ?? 'email@example.com'}</span>
                    </div>
                  )}
                  { (aboutMe?.show_phone ?? false) && (
                    <div className="flex items-center gap-3">
                      <Phone size={20} className="text-blue-600" />
                      {aboutMe?.phone ? (
                        <a href={`tel:${aboutMe.phone.replace(/\D/g,'')}`} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                          {formatPhone(aboutMe.phone)}
                        </a>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">연락처 미등록</span>
                      )}
                    </div>
                  )}
                  { (aboutMe?.show_location ?? true) && (
                    <div className="flex items-center gap-3">
                      <MapPin size={20} className="text-blue-600" />
                      <span className="text-gray-700 dark:text-gray-300">{aboutMe?.location ?? '서울, 대한민국'}</span>
                    </div>
                  )}
                  { (aboutMe?.show_birth_year ?? true) && aboutMe?.birth_year && (
                    <div className="flex items-center gap-3">
                      <Calendar size={20} className="text-blue-600" />
                      <span className="text-gray-700 dark:text-gray-300">{aboutMe.birth_year}년생</span>
                    </div>
                  )}
                </div>

                { (aboutMe?.show_resume_button ?? false) && (
                  aboutMe?.resume_url ? (
                    <a
                      href={aboutMe.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full mt-auto bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      {aboutMe?.resume_label ?? '이력서 다운로드'}
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full mt-auto bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                      aria-disabled="true"
                      title="이력서 파일 준비 중"
                    >
                      <Download size={20} />
                      {aboutMe?.resume_label ?? '이력서 다운로드'}
                    </button>
                  )
                )}
              </div>
            </motion.div>

            {/* About Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-2 h-full"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 h-full flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {aboutMe?.intro_title ?? '자기소개'}
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-600 dark:text-gray-300">
                    {aboutMe?.intro_content_html ? (
                      <div
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: aboutMe.intro_content_html }}
                      />
                    ) : (
                      <>
                        <p>
                          안녕하세요! 저는 3년차 풀스택 개발자입니다. React, TypeScript, Node.js를 주로 사용하며,
                          사용자 경험을 중시하는 웹 애플리케이션을 개발하는 것을 좋아합니다.
                        </p>
                        <p>
                          새로운 기술을 배우는 것을 즐기며, 깔끔하고 유지보수가 쉬운 코드를 작성하기 위해 노력합니다.
                          팀워크를 중요시하며, 다른 개발자들과의 협업을 통해 더 나은 솔루션을 만들어가는 것을 좋아합니다.
                        </p>
                        <p>
                          현재는 프론트엔드와 백엔드 모두를 다루는 풀스택 개발자로서, 
                          전체적인 시스템을 이해하고 효율적인 솔루션을 제공하는 것을 목표로 하고 있습니다.
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <div className="relative w-64 h-64 rounded-lg overflow-hidden shadow-lg">
                      <ImageWithFallback 
                        defaultType="ABOUT_ME"
                        src={aboutMe?.side_image_url ?? undefined}
                        alt="HJLEE About Me" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Hero>
      )}

      {/* Skills Section (독립 섹션) */}
      {enabled.skills && (
      <section id="skills-section" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">기술 스택</h2>
          </motion.div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            {skills.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Code size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>아직 등록된 기술 스택이 없습니다.</p>
                <p className="text-sm mt-2">관리자 페이지에서 기술 스택을 추가해주세요.</p>
              </div>
            ) : (
              (() => {
                // 카테고리별로 그룹화
                const groupedSkills = skills.reduce((acc, skill) => {
                  if (!acc[skill.category]) {
                    acc[skill.category] = []
                  }
                  acc[skill.category].push(skill)
                  return acc
                }, {} as Record<string, SkillT[]>)

                const categories = Object.keys(groupedSkills)
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.map((category) => (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: categories.indexOf(category) * 0.1 }}
                        viewport={{ once: true }}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                      >
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                          {category}
                        </h4>
                        <div className="space-y-3">
                          {groupedSkills[category].map((skill) => (
                            <div key={skill.id}>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {skill.skill_name}
                                </span>
                                <span className="text-sm text-blue-600 font-semibold">
                                  {skill.proficiency}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                                  style={{ width: `${skill.proficiency}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )
              })()
            )}
          </div>
        </div>
      </section>
      )}

      {/* Experience Section */}
      {enabled.experience && (
      <section id="experience-section" className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              경력 사항
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              지금까지의 경력을 소개합니다
            </p>
          </motion.div>

          <div className="space-y-8">
            {(experienceItems.length > 0 ? experienceItems : []).map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Briefcase size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {exp.title}
                      </h3>
                      <span className="text-sm text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full">
                        {exp.period}
                      </span>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                      {exp.company}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {exp.description ?? ''}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Education Section */}
      {enabled.education && (
      <section id="education-section" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              학력 사항
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              교육 배경을 소개합니다
            </p>
          </motion.div>

          <div className="space-y-8">
            {education.map((edu, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">학</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {edu.degree}
                      </h3>
                      <span className="text-sm text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full">
                        {edu.period}
                      </span>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                      {edu.school}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {edu.description ?? ''}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}
    </div>
  )
}

export default About 