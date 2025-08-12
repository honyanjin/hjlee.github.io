import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface HeroValues {
  subtitle?: string | null
  title?: string | null
  description?: string | null
  bgImageUrl?: string | null
  ctaLabel?: string | null
  ctaUrl?: string | null
}

export interface HeroSettingsProps {
  sectionTitle?: string
  helperText?: string
  expanded: boolean
  onToggle: () => void
  values: HeroValues
  onValuesChange: (patch: Partial<HeroValues>) => void
  fields?: {
    subtitle?: boolean
    title?: boolean
    description?: boolean
    bgImageUrl?: boolean
    cta?: boolean
  }
}

const HeroSettings: React.FC<HeroSettingsProps> = ({
  sectionTitle = 'Hero 설정',
  helperText = '타이틀/설명/배경 이미지/CTA 버튼을 설정합니다.',
  expanded,
  onToggle,
  values,
  onValuesChange,
  fields = { title: true, description: true, bgImageUrl: true, cta: true, subtitle: false },
}) => {
  const show = {
    subtitle: !!fields.subtitle,
    title: !!fields.title,
    description: !!fields.description,
    bgImageUrl: !!fields.bgImageUrl,
    cta: !!fields.cta,
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div
        className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{sectionTitle}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
          </div>
          <button type="button" className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label={expanded ? '접기' : '펼치기'}>
            {expanded ? <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" /> : <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="p-6 space-y-4">
          {show.subtitle && (
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">서브타이틀</label>
              <input
                value={values.subtitle ?? ''}
                onChange={(e) => onValuesChange({ subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="서브타이틀 텍스트"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {show.title && (
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">타이틀</label>
                <input
                  value={values.title ?? ''}
                  onChange={(e) => onValuesChange({ title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
            {show.bgImageUrl && (
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">배경 이미지 URL</label>
                <input
                  value={values.bgImageUrl ?? ''}
                  onChange={(e) => onValuesChange({ bgImageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {show.description && (
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">설명</label>
              <textarea
                rows={3}
                value={values.description ?? ''}
                onChange={(e) => onValuesChange({ description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          {show.cta && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">CTA 레이블</label>
                <input
                  value={values.ctaLabel ?? ''}
                  onChange={(e) => onValuesChange({ ctaLabel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">CTA URL</label>
                <input
                  value={values.ctaUrl ?? ''}
                  onChange={(e) => onValuesChange({ ctaUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default HeroSettings

