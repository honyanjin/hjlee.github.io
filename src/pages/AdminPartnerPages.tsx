import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../lib/supabase'
import RichTextEditor from '../components/RichTextEditor'

interface PartnerPageRow {
  id: string
  title: string
  is_published: boolean
  created_at: string
}

const AdminPartnerPages = () => {
  const [rows, setRows] = useState<PartnerPageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editorContent, setEditorContent] = useState('')

  const schema = useMemo(() => z.object({
    title: z.string().min(1, '제목을 입력하세요'),
    excerpt: z.string().optional(),
    is_published: z.boolean().default(false)
  }), [])

  type FormData = z.infer<typeof schema>

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', excerpt: '', is_published: false }
  })

  const load = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('partner_pages')
        .select('id, title, is_published, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      setRows(data ?? [])
    } catch (e: any) {
      setError(e.message || '로딩 실패')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditingId(null)
    reset({ title: '', excerpt: '', is_published: false })
    setEditorContent('')
    setIsModalOpen(true)
  }

  const openEdit = async (id: string) => {
    try {
      setError('')
      const { data, error } = await supabase
        .from('partner_pages')
        .select('id, title, excerpt, is_published, content')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      if (!data) return
      setEditingId(id)
      reset({ title: data.title, excerpt: data.excerpt ?? '', is_published: !!data.is_published })
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
            excerpt: form.excerpt ?? null,
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
            excerpt: form.excerpt ?? null,
            is_published: form.is_published,
            content: editorContent
          })
        if (error) throw error
      }
      setIsModalOpen(false)
      await load()
    } catch (e: any) {
      setError(e.message || '저장 실패')
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
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">파트너 페이지</h1>
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-700 dark:text-gray-300">총 {rows.length}개</div>
        <button
          onClick={openCreate}
          className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
        >
          새 페이지
        </button>
      </div>
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
              {rows.map(r => (
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">요약</label>
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  {...register('excerpt')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">본문</label>
                <RichTextEditor value={editorContent} onChange={setEditorContent} height={400} />
              </div>
              <div className="flex items-center gap-2">
                <input id="is_published" type="checkbox" {...register('is_published')} />
                <label htmlFor="is_published" className="text-sm text-gray-800 dark:text-gray-200">발행</label>
              </div>
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
  )
}

export default AdminPartnerPages


