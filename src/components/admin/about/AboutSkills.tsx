import { useState, Fragment } from 'react'
import { Save, ChevronDown, ChevronUp, Plus, Trash2, Code } from 'lucide-react'

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

interface AboutSkillsProps {
  skills: SkillT[]
  onSaveSkills: (skills: SkillT[]) => Promise<void>
  isSaving: boolean
}

const AboutSkills: React.FC<AboutSkillsProps> = ({
  skills,
  onSaveSkills,
  isSaving
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [localSkills, setLocalSkills] = useState<SkillT[]>(skills)

  const handleAddSkill = () => {
    const newSkill: SkillT = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      category: '',
      skill_name: '',
      proficiency: 50,
      display_order: localSkills.length,
      category_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setLocalSkills([...localSkills, newSkill])
  }

  const handleUpdateSkill = (index: number, field: keyof SkillT, value: any) => {
    const updatedSkills = [...localSkills]
    updatedSkills[index] = { ...updatedSkills[index], [field]: value }
    setLocalSkills(updatedSkills)
  }

  const handleRemoveSkill = (index: number) => {
    setLocalSkills(localSkills.filter((_, i) => i !== index))
  }

  const handleMoveSkill = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === localSkills.length - 1) return

    const updatedSkills = [...localSkills]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[updatedSkills[index], updatedSkills[newIndex]] = [updatedSkills[newIndex], updatedSkills[index]]
    
    // display_order 업데이트
    updatedSkills.forEach((skill, i) => {
      skill.display_order = i
    })
    
    setLocalSkills(updatedSkills)
  }

  const handleSave = async () => {
    await onSaveSkills(localSkills)
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div 
        className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">스킬 관리</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">카테고리/스킬명/숙련도로 다건 관리</p>
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
              onClick={handleAddSkill}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              스킬 추가
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>입력 안내:</strong> 카테고리/스킬명은 자유 텍스트, 숙련도는 0-100% 슬라이더로 설정
              </p>
            </div>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">순서</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-48">카테고리</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-48">스킬명</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">숙련도</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {localSkills.map((skill, index) => (
                  <Fragment key={skill.id}>
                    <tr>
                      <td className="px-3 py-2">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleMoveSkill(index, 'up')}
                            className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveSkill(index, 'down')}
                            className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded"
                          >
                            ↓
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={skill.category}
                          onChange={(e) => handleUpdateSkill(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                          placeholder="예: Frontend"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={skill.skill_name}
                          onChange={(e) => handleUpdateSkill(index, 'skill_name', e.target.value)}
                          className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                          placeholder="예: React"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={skill.proficiency}
                          onChange={(e) => handleUpdateSkill(index, 'proficiency', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {skill.proficiency}%
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(index)}
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
              disabled={isSaving || localSkills.some(s => !s.category.trim() || !s.skill_name.trim())}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {isSaving ? '저장 중...' : '스킬 전체 저장'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default AboutSkills
