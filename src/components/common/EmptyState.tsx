import { FileText, Folder, Search } from 'lucide-react'

interface EmptyStateProps {
  type?: 'general' | 'search' | 'data'
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const EmptyState = ({ 
  type = 'general',
  title,
  message,
  action,
  className = ''
}: EmptyStateProps) => {
  const getIcon = () => {
    switch (type) {
      case 'search':
        return <Search className="h-12 w-12 text-gray-400" />
      case 'data':
        return <Folder className="h-12 w-12 text-gray-400" />
      default:
        return <FileText className="h-12 w-12 text-gray-400" />
    }
  }

  const getDefaultTitle = () => {
    switch (type) {
      case 'search':
        return '검색 결과가 없습니다'
      case 'data':
        return '데이터가 없습니다'
      default:
        return '내용이 없습니다'
    }
  }

  const getDefaultMessage = () => {
    switch (type) {
      case 'search':
        return '다른 검색어로 시도해보세요.'
      case 'data':
        return '아직 등록된 데이터가 없습니다.'
      default:
        return '표시할 내용이 없습니다.'
    }
  }

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="flex justify-center mb-4">
        {getIcon()}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title || getDefaultTitle()}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {message || getDefaultMessage()}
      </p>
      
      {action && (
        <button 
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState
