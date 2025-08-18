import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../lib/supabase'
import RichTextEditor from '../components/RichTextEditor'
import { useAuth } from '../contexts/AuthContext'
import { ImageLibraryProvider } from '../contexts/ImageLibraryContext'

interface PartnerPageRow {
  id: string
  title: string
  is_published: boolean
  created_at: string
  created_by: string | null
}

const AdminPartnerPages = () => {
  const [rows, setRows] = useState<PartnerPageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editorContent, setEditorContent] = useState('')
  const [notice, setNotice] = useState('')
  const [modalError, setModalError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [q, setQ] = useState('')
  const [filterPub, setFilterPub] = useState<'all' | 'pub' | 'draft'>('all')
  const [firstAssignee, setFirstAssignee] = useState<Record<string, string>>({})
  const { user } = useAuth()

  const schema = useMemo(() => z.object({
    title: z.string().min(1, '제목을 입력하세요'),
    is_published: z.boolean()
  }), [])

  type FormData = z.infer<typeof schema>

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', is_published: false as boolean }
  })

  const load = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('partner_pages')
        .select('id, title, is_published, created_at, created_by')
        .order('created_at', { ascending: false })
      if (error) throw error
      setRows(data ?? [])

      const pageIds = (data ?? []).map(r => r.id)
      if (pageIds.length > 0) {
        const { data: assigns } = await supabase
          .from('partner_page_assignments')
          .select('page_id, user_id')
          .in('page_id', pageIds)
        const map: Record<string, string> = {}
        for (const a of (assigns ?? []) as any[]) {
          const pid = a.page_id as string
          const uid = a.user_id as string
          if (!map[pid]) map[pid] = uid
        }
        setFirstAssignee(map)
      } else {
        setFirstAssignee({})
      }
    } catch (e: any) {
      setError(e.message || '로딩 실패')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      const mq = q.trim() === '' || r.title.toLowerCase().includes(q.toLowerCase()) || r.id.includes(q)
      const mp = filterPub === 'all' ? true : filterPub === 'pub' ? r.is_published : !r.is_published
      return mq && mp
    })
  }, [rows, q, filterPub])

  const openCreate = () => {
    setEditingId(null)
    reset({ title: '', is_published: false })
    setEditorContent('')
    setIsModalOpen(true)
    setModalError('')
  }

  const openEdit = async (id: string) => {
    try {
      setError('')
      setModalError('')
      const { data, error } = await supabase
        .from('partner_pages')
        .select('id, title, excerpt, is_published, content')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      if (!data) return
      setEditingId(id)
      reset({ title: data.title, is_published: !!data.is_published })
      setEditorContent(data.content || '')
      setIsModalOpen(true)
    } catch (e: any) {
      setError(e.message || '불러오기 실패')
    }
  }

  const onSubmit = async (form: FormData) => {
    try {
      if (!editorContent || editorContent.trim().length === 0) {
        throw new Error('콘텐츠(본문)를 입력하세요')
      }
      setError('')
      if (editingId) {
        const { error } = await supabase
          .from('partner_pages')
          .update({
            title: form.title,
            is_published: form.is_published,
            content: editorContent
          })
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('partner_pages')
          .insert({
            title: form.title,
            is_published: form.is_published,
            content: editorContent
          })
        if (error) throw error
      }
      setIsModalOpen(false)
      setEditorContent('')
      reset({ title: '', is_published: false })
      setNotice(editingId ? '페이지가 수정되었습니다.' : '새 페이지가 생성되었습니다.')
      setTimeout(() => setNotice(''), 3000)
      await load()
    } catch (e: any) {
      const msg = e?.message || '저장 실패'
      setModalError(msg)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    try {
      const { error } = await supabase
        .from('partner_pages')
        .delete()
        .eq('id', id)
      if (error) throw error
      await load()
    } catch (e: any) {
      setError(e.message || '삭제 실패')
    }
  }

  const togglePublish = async (id: string, next: boolean) => {
    try {
      const { error } = await supabase
        .from('partner_pages')
        .update({ is_published: next })
        .eq('id', id)
      if (error) throw error
      await load()
    } catch (e: any) {
      setError(e.message || '상태 변경 실패')
    }
  }

  return (
    <ImageLibraryProvider>
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">파트너 페이지</h1>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="제목/ID 검색"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
          />
          <select
            value={filterPub}
            onChange={(e) => setFilterPub(e.target.value as any)}
            className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
          >
            <option value="all">전체</option>
            <option value="pub">발행</option>
            <option value="draft">임시</option>
          </select>
        </div>
        <div className="text-gray-700 dark:text-gray-300">총 {filteredRows.length}개</div>
        <button
          onClick={openCreate}
          className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
        >
          새 페이지
        </button>
      </div>
      {notice && (
        <div className="mb-3 px-4 py-3 rounded bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800">
          {notice}
        </div>
      )}
      {loading ? (
        <div className="text-gray-700 dark:text-gray-300">로딩 중...</div>
      ) : error ? (
        <div className="text-red-600 dark:text-red-400">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Published</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
               {filteredRows.map(r => (
                <tr key={r.id}>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{r.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{r.title}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${r.is_published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {r.is_published ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-right space-x-2">
                    {(() => {
                      const ownerUid = r.created_by || firstAssignee[r.id] || user?.id
                      return ownerUid ? (
                        <a
                          href={`/partner/pages/${ownerUid}/${r.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                        >
                          보기
                        </a>
                      ) : null
                    })()}
                    <button onClick={() => togglePublish(r.id, !r.is_published)} className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {r.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => openEdit(r.id)} className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white">Edit</button>
                    <button onClick={() => handleDelete(r.id)} className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editingId ? '파트너 페이지 수정' : '새 파트너 페이지'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">닫기</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              {modalError && (
                <div className="px-4 py-3 rounded bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800">
                  {modalError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">제목</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  {...register('title')}
                />
                {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">본문</label>
                <RichTextEditor value={editorContent} onChange={setEditorContent} height={400} />
              </div>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <input id="is_published" type="checkbox" {...register('is_published')} />
                  <span className="text-sm text-gray-800 dark:text-gray-200">발행</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={showPreview} onChange={(e) => setShowPreview(e.target.checked)} />
                  <span className="text-sm text-gray-800 dark:text-gray-200">미리보기</span>
                </label>
              </div>
              {showPreview && (
                <div className="border border-gray-200 dark:border-gray-800 rounded p-3">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">미리보기</div>
                  <article className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: editorContent }} />
                </div>
              )}
              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
                  {isSubmitting ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </ImageLibraryProvider>
  )
}

export default AdminPartnerPages


