import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PartnerLayout from '../components/PartnerLayout'
import { ImageLibraryProvider } from '../contexts/ImageLibraryContext'
import { supabase } from '../lib/supabase'
import RichTextEditor from '../components/RichTextEditor'
import { useAuth } from '../contexts/AuthContext'

const PartnerPage = () => {
  const { pageId, userId } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('partner_pages')
          .select('title, content')
          .eq('id', pageId)
          .maybeSingle()
        if (error) {
          setError(error.message || '데이터 로딩 오류')
          return
        }
        if (!data) {
          setError('페이지를 찾을 수 없습니다.')
          return
        }
        setTitle(data.title)
        setContent(data.content)
        setError('')
      } catch (err: any) {
        setError(err?.message || '페이지를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }
    if (pageId) fetchPage()
  }, [pageId])

  const saveChanges = async () => {
    if (!pageId) return
    try {
      setSaving(true)
      const { error } = await supabase
        .from('partner_pages')
        .update({ content })
        .eq('id', pageId)
      if (error) throw error
      setIsEditing(false)
    } catch (e: any) {
      setError(e.message || '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ImageLibraryProvider>
    <PartnerLayout>
      <div className="px-4 max-w-4xl mx-auto">
        {loading ? (
          <div className="text-gray-700 dark:text-gray-300">로딩 중...</div>
        ) : error ? (
          <div className="text-red-600 dark:text-red-400">{error}</div>
        ) : isEditing ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
            <RichTextEditor value={content} onChange={setContent} height={500} />
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">취소</button>
              <button onClick={saveChanges} disabled={saving} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">{saving ? '저장 중...' : '저장'}</button>
            </div>
          </div>
        ) : (
          <article className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
              {user && userId === user.id && (
                <button onClick={() => setIsEditing(true)} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm text-gray-800 dark:text-gray-200">수정</button>
              )}
            </div>
            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          </article>
        )}
      </div>
    </PartnerLayout>
    </ImageLibraryProvider>
  )
}

export default PartnerPage


