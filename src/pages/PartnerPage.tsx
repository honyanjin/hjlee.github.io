import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PartnerLayout from '../components/PartnerLayout'
import { supabase } from '../lib/supabase'

const PartnerPage = () => {
  const { id } = useParams()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('partner_pages')
          .select('title, content')
          .eq('id', id)
          .maybeSingle()
        if (error) throw error
        if (!data) {
          setError('페이지를 찾을 수 없습니다.')
          return
        }
        setTitle(data.title)
        setContent(data.content)
      } catch (err: any) {
        setError('페이지를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchPage()
  }, [id])

  return (
    <PartnerLayout>
      <div className="px-4 max-w-4xl mx-auto">
        {loading ? (
          <div className="text-gray-700 dark:text-gray-300">로딩 중...</div>
        ) : error ? (
          <div className="text-red-600 dark:text-red-400">{error}</div>
        ) : (
          <article className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          </article>
        )}
      </div>
    </PartnerLayout>
  )
}

export default PartnerPage


