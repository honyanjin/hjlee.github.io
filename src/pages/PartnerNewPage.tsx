import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PartnerLayout from '../components/PartnerLayout'
import { ImageLibraryProvider } from '../contexts/ImageLibraryContext'
import RichTextEditor from '../components/RichTextEditor'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const PartnerNewPage = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!user || userId !== user.id) {
      setError('권한이 없습니다.')
      return
    }
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력하세요')
      return
    }
    try {
      setSaving(true)
      setError('')
      const { data: page, error: pageErr } = await supabase
        .from('partner_pages')
        .insert({ title, content, is_published: true })
        .select('id')
        .single()
      if (pageErr) throw pageErr
      const pageId = page?.id
      if (pageId) {
        const { error: assignErr } = await supabase
          .from('partner_page_assignments')
          .insert({ user_id: user.id, page_id: pageId })
        if (assignErr) throw assignErr
        navigate(`/partner/pages/${user.id}/${pageId}`, { replace: true })
      }
    } catch (e: any) {
      setError(e.message || '생성 실패')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ImageLibraryProvider>
    <PartnerLayout>
      <div className="px-4 max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">새 파트너 페이지</h1>
        {error && <div className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
          />
          <RichTextEditor value={content} onChange={setContent} height={400} />
          <div className="flex gap-2 justify-end">
            <button onClick={() => navigate(-1)} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm">취소</button>
            <button onClick={handleCreate} disabled={saving} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-50">{saving ? '생성 중...' : '생성'}</button>
          </div>
        </div>
      </div>
    </PartnerLayout>
    </ImageLibraryProvider>
  )
}

export default PartnerNewPage


