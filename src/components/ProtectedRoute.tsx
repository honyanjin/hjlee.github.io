import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
  requirePartner?: boolean
}

const ProtectedRoute = ({ children, requireAdmin = false, requirePartner = false }: ProtectedRouteProps) => {
  const { user, isAdmin, loading, isPartner } = useAuth()
  const [timeoutPassed, setTimeoutPassed] = useState(false)

  useEffect(() => {
    if (!loading) return
    const t = setTimeout(() => setTimeoutPassed(true), 5000)
    return () => clearTimeout(t)
  }, [loading])

  if (loading && !timeoutPassed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (loading && timeoutPassed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-4">세션 확인이 지연되고 있습니다. 다시 시도하거나 로그인 페이지로 이동하세요.</p>
          <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">로그인 페이지로</a>
        </div>
      </div>
    )
  }

  if (!user) {
    // 파트너 전용 경로는 파트너 로그인으로 유도
    return <Navigate to={requirePartner ? "/partner/login" : "/login"} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  if (requirePartner && !isPartner) {
    return <Navigate to="/partner/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute 