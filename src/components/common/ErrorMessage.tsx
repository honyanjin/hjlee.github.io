import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
  showIcon?: boolean
}

const ErrorMessage = ({ 
  message, 
  onRetry, 
  className = '',
  showIcon = true
}: ErrorMessageProps) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      {showIcon && (
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        오류가 발생했습니다
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
        {message}
      </p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          다시 시도
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
