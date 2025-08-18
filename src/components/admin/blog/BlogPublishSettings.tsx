import { useFormContext } from 'react-hook-form'
import { ChevronDown, ChevronUp, Globe, Clock, Eye, EyeOff } from 'lucide-react'

import type { BlogPublishSettingsProps } from '../../../types'

const BlogPublishSettings: React.FC<BlogPublishSettingsProps> = ({
  isCollapsed = true,
  onToggleCollapse,
  redirectAfterSave,
  setRedirectAfterSave,
  previewDraftInNewTab,
  setPreviewDraftInNewTab
}) => {
  const {
    register,
    formState: { errors }
  } = useFormContext()

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div 
        className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" 
        onClick={onToggleCollapse}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-green-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">발행 설정</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">포스트 발행 상태와 관련 설정을 관리합니다</p>
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
          {/* 발행 상태 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                {...register('is_published')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span>즉시 발행</span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              체크하면 포스트가 즉시 공개됩니다. 체크하지 않으면 임시저장 상태로 유지됩니다.
            </p>
          </div>

          {/* 저장 후 동작 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              저장 후 동작
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={redirectAfterSave}
                  onChange={(e) => setRedirectAfterSave(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span>저장 후 블로그 목록으로 이동</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={previewDraftInNewTab}
                  onChange={(e) => setPreviewDraftInNewTab(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span>저장 후 새 탭에서 미리보기</span>
              </label>
            </div>
          </div>

          {/* 발행 상태 안내 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Eye size={16} />
                <span className="text-sm font-medium">발행 상태 안내</span>
              </div>
            </div>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>• <strong>발행됨:</strong> 모든 사용자가 볼 수 있는 공개 상태</p>
              <p>• <strong>임시저장:</strong> 관리자만 볼 수 있는 비공개 상태</p>
              <p>• 발행된 포스트는 언제든지 임시저장으로 되돌릴 수 있습니다</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default BlogPublishSettings
