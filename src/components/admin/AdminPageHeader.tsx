import { ReactNode } from 'react'

interface AdminPageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ 
  title, 
  description, 
  children 
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-4">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPageHeader
