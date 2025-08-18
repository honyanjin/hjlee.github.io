import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, ChevronDown, ChevronUp } from 'lucide-react'

type AboutPageSettingsT = {
  id: string
  show_about_me: boolean
  show_experience: boolean
  show_education: boolean
  show_skills?: boolean
  updated_at: string
}

const aboutSettingsSchema = z.object({
  show_about_me: z.boolean(),
  show_experience: z.boolean(),
  show_education: z.boolean(),
  show_skills: z.boolean()
})

type AboutSettingsForm = z.infer<typeof aboutSettingsSchema>

interface AboutSettingsProps {
  settings: AboutPageSettingsT
  onSave: (data: AboutSettingsForm) => Promise<void>
  isSaving: boolean
}

const AboutSettings: React.FC<AboutSettingsProps> = ({
  settings,
  onSave,
  isSaving
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AboutSettingsForm>({
    resolver: zodResolver(aboutSettingsSchema),
    defaultValues: {
      show_about_me: settings.show_about_me,
      show_experience: settings.show_experience,
      show_education: settings.show_education,
      show_skills: settings.show_skills || true
    }
  })

  const onSubmit = async (data: AboutSettingsForm) => {
    await onSave(data)
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div 
        className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">기본 설정</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">페이지 섹션 표시 여부 설정</p>
          </div>
          <button 
            type="button" 
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label={isExpanded ? '접기' : '펼치기'}
          >
            {isExpanded ? (
              <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  {...register('show_about_me')}
                  type="checkbox"
                  id="show_about_me"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="show_about_me" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  About Me 섹션 표시
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  {...register('show_experience')}
                  type="checkbox"
                  id="show_experience"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="show_experience" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  경력 섹션 표시
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  {...register('show_education')}
                  type="checkbox"
                  id="show_education"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="show_education" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  학력 섹션 표시
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  {...register('show_skills')}
                  type="checkbox"
                  id="show_skills"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="show_skills" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  스킬 섹션 표시
                </label>
              </div>
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
  )
}

export default AboutSettings
