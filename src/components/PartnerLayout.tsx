import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import { useAuth } from '../contexts/AuthContext'

interface PartnerLayoutProps {
  children: ReactNode
}

const PartnerLayout = ({ children }: PartnerLayoutProps) => {
  const { partnerPages } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <aside className="md:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">파트너 메뉴</div>
                <nav className="space-y-1">
                  <Link
                    to="/partner"
                    className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive('/partner')
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    대시보드
                  </Link>
                  <div className="mt-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">내 페이지</div>
                  {partnerPages.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">할당된 페이지 없음</div>
                  ) : (
                    partnerPages.map(p => (
                      <Link
                        key={p.id}
                        to={`/partner/pages/${p.id}`}
                        className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                          isActive(`/partner/pages/${p.id}`)
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {p.title}
                      </Link>
                    ))
                  )}
                </nav>
              </div>
            </aside>
            <main className="md:col-span-9">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PartnerLayout


