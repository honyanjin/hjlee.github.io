import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, Github, Linkedin, Twitter } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Navbar from '../components/Navbar'
import DotNavigation from '../components/DotNavigation'
import SEO from '../components/SEO'

const contactSchema = z.object({
  name: z.string().min(2, '이름은 2글자 이상이어야 합니다'),
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  subject: z.string().min(5, '제목은 5글자 이상이어야 합니다'),
  message: z.string().min(10, '메시지는 10글자 이상이어야 합니다')
})

type ContactFormData = z.infer<typeof contactSchema>

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    // 실제 폼 제출 로직을 여기에 구현
    console.log('Form data:', data)
    
    // 시뮬레이션을 위한 지연
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setSubmitSuccess(true)
    reset()
    
    // 3초 후 성공 메시지 숨기기
    setTimeout(() => setSubmitSuccess(false), 3000)
  }

  const contactInfo = [
    {
      icon: Mail,
      title: '이메일',
      value: 'email@example.com',
      link: 'mailto:email@example.com'
    },
    {
      icon: Phone,
      title: '전화번호',
      value: '+82 10-1234-5678',
      link: 'tel:+821012345678'
    },
    {
      icon: MapPin,
      title: '위치',
      value: '서울, 대한민국',
      link: '#'
    }
  ]

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com',
      color: 'hover:bg-gray-900'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://linkedin.com',
      color: 'hover:bg-blue-700'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: 'https://twitter.com',
      color: 'hover:bg-blue-500'
    }
  ]

  return (
    <div id="contact-page" className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DotNavigation
        sections={[
          'contact-hero',
          'contact-form-section',
        ]}
      />
      <SEO 
        title="Contact - 이호진 포트폴리오"
        description="프론트엔드 개발자 이호진에게 연락하세요. 이메일, 전화번호, 소셜 미디어를 통해 언제든지 문의해주세요."
        keywords="Contact, 연락처, 문의, 이메일, 전화번호, 소셜미디어, 개발자 연락"
        type="website"
      />
      <Navbar />
      
      {/* Hero Section - 반응형 개선 */}
      <section id="contact-hero" className="pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-3 sm:px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            id="contact-hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h1 id="contact-hero-title" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Contact Me
            </h1>
            <p id="contact-hero-description" className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
              프로젝트나 협업에 관심이 있으시다면 언제든 연락주세요! 
              새로운 아이디어나 기술에 대한 이야기를 나누고 싶습니다.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info - 반응형 개선 */}
      <section id="contact-form-section" className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          <div id="contact-content" className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
            {/* Contact Form - 반응형 개선 */}
            <motion.div
              id="contact-form-container"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8"
            >
              <h2 id="contact-form-title" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                메시지 보내기
              </h2>
              
              {submitSuccess && (
                <motion.div
                  id="success-message"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg dark:bg-green-900 dark:border-green-700 dark:text-green-200 text-sm sm:text-base"
                >
                  메시지가 성공적으로 전송되었습니다! 곧 답변드리겠습니다.
                </motion.div>
              )}

              <form id="contact-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                <div id="name-field">
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    이름 *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                    placeholder="이름을 입력해주세요"
                  />
                  {errors.name && (
                    <p id="name-error" className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div id="email-field">
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    이메일 *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                    placeholder="이메일을 입력해주세요"
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div id="subject-field">
                  <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    제목 *
                  </label>
                  <input
                    {...register('subject')}
                    type="text"
                    id="subject"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                    placeholder="제목을 입력해주세요"
                  />
                  {errors.subject && (
                    <p id="subject-error" className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div id="message-field">
                  <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    메시지 *
                  </label>
                  <textarea
                    {...register('message')}
                    id="message"
                    rows={5}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none text-sm sm:text-base"
                    placeholder="메시지를 입력해주세요"
                  />
                  {errors.message && (
                    <p id="message-error" className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <button
                  id="submit-button"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <div id="loading-spinner" className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      전송 중...
                    </>
                  ) : (
                    <>
                      <Send size={16} className="sm:w-5 sm:h-5" />
                      메시지 보내기
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Contact Info - 반응형 개선 */}
            <motion.div
              id="contact-info-container"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Contact Information - 반응형 개선 */}
              <div id="contact-info-card" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
                <h2 id="contact-info-title" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                  연락처 정보
                </h2>
                <div id="contact-info-list" className="space-y-4 sm:space-y-6">
                  {contactInfo.map((info, index) => (
                    <motion.div
                      key={index}
                      id={`contact-info-item-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-3 sm:gap-4"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <info.icon size={20} className="sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div>
                        <h3 id={`contact-info-label-${index}`} className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          {info.title}
                        </h3>
                        <a
                          id={`contact-info-link-${index}`}
                          href={info.link}
                          className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {info.value}
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Social Links - 반응형 개선 */}
              <div id="social-links-card" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
                <h2 id="social-links-title" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                  소셜 미디어
                </h2>
                <div id="social-links-list" className="flex gap-3 sm:gap-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      id={`social-link-${social.name.toLowerCase()}`}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                      className={`w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:scale-110 transition-all ${social.color}`}
                    >
                      <social.icon size={20} className="sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Availability - 반응형 개선 */}
              <div id="availability-card" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
                <h2 id="availability-title" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                  업무 가능 시간
                </h2>
                <div id="availability-list" className="space-y-3 sm:space-y-4">
                  <div id="weekday-hours" className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">월요일 - 금요일</span>
                    <span className="text-sm sm:text-base text-gray-900 dark:text-white font-semibold">09:00 - 18:00</span>
                  </div>
                  <div id="saturday-hours" className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">토요일</span>
                    <span className="text-sm sm:text-base text-gray-900 dark:text-white font-semibold">10:00 - 16:00</span>
                  </div>
                  <div id="sunday-hours" className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">일요일</span>
                    <span className="text-sm sm:text-base text-red-600 font-semibold">휴무</span>
                  </div>
                </div>
                <p id="availability-note" className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  * 긴급한 프로젝트나 협업 문의는 언제든 연락주세요
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact 