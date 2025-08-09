import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight, LayoutDashboard, FileCog } from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation()
  const [isPagesOpen, setIsPagesOpen] = useState(true)

  const isActive = (path: string) => location.pathname === path
  const isGroupActive = (prefix: string) => location.pathname.startsWith(prefix)

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-gray-900 dark:text-white">관리자</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">HJLEE Portfolio</div>
        </div>

        <nav className="p-2">
          {/* Dashboard */}
          <Link
            to="/admin"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors mb-1 ${
              isActive('/admin')
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>대시보드</span>
          </Link>

          {/* Pages group */}
          <button
            type="button"
            onClick={() => setIsPagesOpen((v) => !v)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-semibold transition-colors mt-2 ${
              isGroupActive('/admin/pages')
                ? 'bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            aria-expanded={isPagesOpen}
          >
            <span className="flex items-center gap-2">
              <FileCog size={18} />
              페이지 관리
            </span>
            {isPagesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {isPagesOpen && (
            <div className="mt-1 ml-2 space-y-1">
              <Link
                to="/admin/pages/home"
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive('/admin/pages/home')
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Home
              </Link>
              <Link
                to="/admin/pages/about"
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive('/admin/pages/about')
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                About
              </Link>
              <Link
                to="/admin/pages/projects"
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive('/admin/pages/projects')
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Projects
              </Link>
              <Link
                to="/admin/pages/blog"
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive('/admin/pages/blog')
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Blog
              </Link>
              <Link
                to="/admin/pages/contact"
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive('/admin/pages/contact')
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Contact
              </Link>
            </div>
          )}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}

export default AdminLayout



