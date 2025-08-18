import { useEffect, useMemo } from 'react'
import PartnerLayout from '../components/PartnerLayout'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { useParams, useNavigate } from 'react-router-dom'

const PartnerDashboard = () => {
  const { partnerPages, user } = useAuth()
  const { userId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    if (userId && userId !== user.id) {
      navigate(`/partner/${user.id}`, { replace: true })
    }
  }, [user, userId, navigate])


  const pages = useMemo(() => partnerPages, [partnerPages])

  return (
    <PartnerLayout>
      <div className="px-4 max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">파트너 대시보드</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">공지</h2>
          <p className="text-gray-700 dark:text-gray-300">환영합니다. 좌측 상단 내비게이션의 Partner 메뉴 또는 아래 목록에서 접근 가능한 파트너 페이지를 선택하세요.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">내 파트너 페이지</h2>
          {pages.length === 0 ? (
            <p className="text-gray-700 dark:text-gray-300">현재 할당된 파트너 페이지가 없습니다.</p>
          ) : (
            <ul className="space-y-3">
              {pages.map(p => (
                <li key={p.id}>
                  <Link to={user ? `/partner/pages/${user.id}/${p.id}` : `/partner/pages/${p.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PartnerLayout>
  )
}

export default PartnerDashboard


