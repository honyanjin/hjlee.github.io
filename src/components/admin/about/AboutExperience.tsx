import { useState, Fragment } from 'react'
import { Save, ChevronDown, ChevronUp, Plus, Trash2, Briefcase } from 'lucide-react'

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

interface AboutExperienceProps {
  experiences: ExperienceT[]
  onSaveExperiences: (experiences: ExperienceT[]) => Promise<void>
  isSaving: boolean
}

const AboutExperience: React.FC<AboutExperienceProps> = ({
  experiences,
  onSaveExperiences,
  isSaving
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [localExperiences, setLocalExperiences] = useState<ExperienceT[]>(experiences)

  const handleAddExperience = () => {
    const newExperience: ExperienceT = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: '',
      period: '',
      company: '',
      description: '',
      display_order: localExperiences.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setLocalExperiences([...localExperiences, newExperience])
  }

  const handleUpdateExperience = (index: number, field: keyof ExperienceT, value: any) => {
    const updatedExperiences = [...localExperiences]
    updatedExperiences[index] = { ...updatedExperiences[index], [field]: value }
    setLocalExperiences(updatedExperiences)
  }

  const handleRemoveExperience = (index: number) => {
    setLocalExperiences(localExperiences.filter((_, i) => i !== index))
  }

  const handleMoveExperience = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === localExperiences.length - 1) return

    const updatedExperiences = [...localExperiences]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[updatedExperiences[index], updatedExperiences[newIndex]] = [updatedExperiences[newIndex], updatedExperiences[index]]
    
    // display_order 업데이트
    updatedExperiences.forEach((experience, i) => {
      experience.display_order = i
    })
    
    setLocalExperiences(updatedExperiences)
  }

  const handleSave = async () => {
    await onSaveExperiences(localExperiences)
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div 
        className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">경력 관리</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">직책/기간/회사/설명으로 다건 관리</p>
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
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleAddExperience}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              경력 추가
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>입력 안내:</strong> 직책/기간/회사/설명은 자유 텍스트입니다.
              </p>
            </div>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">순서</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-48">직책</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-48">기간</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-48">회사</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">설명</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {localExperiences.map((experience, index) => (
                  <Fragment key={experience.id}>
                    <tr>
                      <td className="px-3 py-2">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleMoveExperience(index, 'up')}
                            className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveExperience(index, 'down')}
                            className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded"
                          >
                            ↓
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={experience.title}
                          onChange={(e) => handleUpdateExperience(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                          placeholder="예: Frontend Developer"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={experience.period}
                          onChange={(e) => handleUpdateExperience(index, 'period', e.target.value)}
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                          placeholder="예: 2022.01 - 2023.12"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={experience.company}
                          onChange={(e) => handleUpdateExperience(index, 'company', e.target.value)}
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                          placeholder="예: ABC Company"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <textarea
                          value={experience.description || ''}
                          onChange={(e) => handleUpdateExperience(index, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                          placeholder="주요 업무 내용 등"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(index)}
                            className="px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
              onClick={handleSave}
              disabled={isSaving || localExperiences.some(e => !e.title.trim() || !e.period.trim() || !e.company.trim())}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {isSaving ? '저장 중...' : '경력 전체 저장'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default AboutExperience
