import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { ChevronDown, ChevronUp, Calendar, Tag, User } from 'lucide-react'
import type { Category } from '../../../lib/supabase'
import type { BlogBasicInfoProps } from '../../../types'

const BlogBasicInfo: React.FC<BlogBasicInfoProps> = ({
  categories,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const {
    register,
    formState: { errors },
    watch
  } = useFormContext()

  const watchedTitle = watch('title')

  // URL 미리보기 생성
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const previewUrl = watchedTitle
    ? `${window.location.origin}/blog/${generateSlug(watchedTitle)}`
    : ''

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div 
        className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" 
        onClick={onToggleCollapse}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">기본 정보</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">포스트의 기본 정보를 입력합니다</p>
            </div>
          </div>
          <button 
            type="button" 
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label={isCollapsed ? '펼치기' : '접기'}
          >
            {isCollapsed ? (
              <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="p-6 space-y-6">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              제목 *
            </label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="포스트 제목을 입력하세요"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{String(errors.title.message)}</p>
            )}
          </div>

          {/* URL 미리보기 */}
          {watchedTitle && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL 미리보기
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
                  {previewUrl}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                제목을 기반으로 자동 생성됩니다
              </p>
            </div>
          )}

          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              카테고리 *
            </label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">카테고리를 선택하세요</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{String(errors.category.message)}</p>
            )}
          </div>

          {/* 태그 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              태그
            </label>
            <input
              {...register('tags')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="태그를 쉼표로 구분하여 입력하세요 (예: React, TypeScript, Web)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              쉼표로 구분하여 여러 태그를 입력할 수 있습니다
            </p>
          </div>

          {/* 요약 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              요약 *
            </label>
            <textarea
              {...register('excerpt')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="포스트의 요약을 입력하세요"
            />
            {errors.excerpt && (
              <p className="text-red-500 text-sm mt-1">{String(errors.excerpt.message)}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              블로그 목록에서 표시될 요약 내용입니다
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

export default BlogBasicInfo
