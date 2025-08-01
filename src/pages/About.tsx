import { motion } from 'framer-motion'
import { Download, Mail, MapPin, Calendar, Briefcase } from 'lucide-react'
import Navbar from '../components/Navbar'
import SEO from '../components/SEO'

const About = () => {
  const experiences = [
    {
      year: '2023 - 현재',
      title: '풀스택 개발자',
      company: 'Tech Company',
      description: 'React, Node.js를 사용한 웹 애플리케이션 개발'
    },
    {
      year: '2022 - 2023',
      title: '프론트엔드 개발자',
      company: 'Startup Inc',
      description: 'TypeScript와 Vue.js를 활용한 사용자 인터페이스 개발'
    },
    {
      year: '2021 - 2022',
      title: '웹 개발자 인턴',
      company: 'Digital Agency',
      description: 'HTML, CSS, JavaScript를 사용한 반응형 웹사이트 제작'
    }
  ]

  const education = [
    {
      year: '2017 - 2021',
      degree: '컴퓨터공학 학사',
      school: '한국대학교',
      description: '소프트웨어 공학 전공, 웹 개발 동아리 활동'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO 
        title="About - 이호진 포트폴리오"
        description="프론트엔드 개발자 이호진에 대해 알아보세요. 경력, 기술 스택, 교육 배경을 확인할 수 있습니다."
        keywords="About, 소개, 경력, 기술스택, 개발자, 이호진"
        type="website"
      />
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              About Me
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              안녕하세요! 저는 사용자 경험을 중시하는 풀스택 개발자입니다.
              깔끔하고 직관적인 웹 애플리케이션을 만드는 것을 좋아합니다.
            </p>
          </motion.div>

          {/* Profile Section */}
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Profile Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden shadow-lg">
                  <img 
                    src="/src/content/pic_profile/hjlee_Profile_0.JPG" 
                    alt="HJLEE Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
                  HJLEE
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                  풀스택 개발자 & UI/UX 디자이너
                </p>
                
                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">email@example.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">서울, 대한민국</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">1995년생</span>
                  </div>
                </div>

                <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Download size={20} />
                  이력서 다운로드
                </button>
              </div>
            </motion.div>

            {/* About Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  자기소개
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-600 dark:text-gray-300">
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
                  </div>
                  <div className="flex justify-center">
                    <div className="relative w-64 h-64 rounded-lg overflow-hidden shadow-lg">
                      <img 
                        src="/src/content/pic_about_me/hjlee_about_me_0.jpg" 
                        alt="HJLEE About Me" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  기술 스택
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Frontend</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">React</span>
                        <span className="text-blue-600">90%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">TypeScript</span>
                        <span className="text-blue-600">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Tailwind CSS</span>
                        <span className="text-blue-600">80%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Backend</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Node.js</span>
                        <span className="text-blue-600">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">PostgreSQL</span>
                        <span className="text-blue-600">75%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Docker</span>
                        <span className="text-blue-600">70%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800">
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
            {experiences.map((exp, index) => (
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
                        {exp.year}
                      </span>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                      {exp.company}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {exp.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className="py-20 px-4">
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
                        {edu.year}
                      </span>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                      {edu.school}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {edu.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default About 