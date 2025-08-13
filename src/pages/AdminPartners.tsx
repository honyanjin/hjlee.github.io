import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

interface PartnerProfileRow {
  user_id: string
  email: string | null
  name: string | null
  company: string | null
  status: 'active' | 'inactive'
  created_at: string
}

const AdminPartners = () => {
  const [rows, setRows] = useState<PartnerProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState<null | { user_id: string }>(null)
  const [pages, setPages] = useState<{ id: string; title: string }[]>([])
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [showUserId, setShowUserId] = useState<string | null>(null)

  const schema = useMemo(() => z.object({
    email: z.string().email('올바른 이메일을 입력하세요'),
    password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다').optional(),
    name: z.string().optional(),
    company: z.string().optional(),
    status: z.enum(['active','inactive'])
  }), [])

  type FormData = z.infer<typeof schema>

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', name: '', company: '', status: 'active' as 'active' | 'inactive' }
  })

  const load = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('partner_profiles')
        .select('user_id, email, name, company, status, created_at')
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
    reset({ email: '', password: '', name: '', company: '', status: 'active' })
    setIsCreateOpen(true)
  }

  const onCreate = async (form: FormData) => {
    try {
      setError('')
      const { data, error } = await supabase.functions.invoke('create-partner-user', {
        body: { email: form.email, password: form.password, name: form.name, company: form.company, status: form.status }
      })
      if (error) throw error
      if (!data || !data.user_id) throw new Error('파트너 생성에 실패했습니다')
      setIsCreateOpen(false)
      await load()
    } catch (e: any) {
      setError(e.message || '생성 실패')
    }
  }

  const removeProfile = async (user_id: string) => {
    if (!confirm('프로필을 삭제하시겠습니까? 할당도 함께 삭제됩니다.')) return
    try {
      const { error } = await supabase
        .from('partner_profiles')
        .delete()
        .eq('user_id', user_id)
      if (error) throw error
      await load()
    } catch (e: any) {
      setError(e.message || '삭제 실패')
    }
  }

  const toggleStatus = async (user_id: string, current: 'active'|'inactive') => {
    try {
      const next = current === 'active' ? 'inactive' : 'active'
      const { error } = await supabase
        .from('partner_profiles')
        .update({ status: next })
        .eq('user_id', user_id)
      if (error) throw error
      await load()
    } catch (e: any) {
      setError(e.message || '상태 변경 실패')
    }
  }

  const openAssign = async (user_id: string) => {
    try {
      setError('')
      setIsAssignOpen({ user_id })
      const [{ data: pageList }, { data: assigned }] = await Promise.all([
        supabase.from('partner_pages').select('id, title').order('title', { ascending: true }),
        supabase.from('partner_page_assignments').select('page_id').eq('user_id', user_id)
      ])
      setPages((pageList ?? []) as any)
      setSelectedPages((assigned ?? []).map(a => a.page_id))
    } catch (e: any) {
      setError(e.message || '할당 데이터 로딩 실패')
    }
  }

  const saveAssign = async () => {
    if (!isAssignOpen) return
    try {
      const user_id = isAssignOpen.user_id
      // 트랜잭션 유사 처리: 기존 할당 삭제 후 일괄 insert
      const { error: delErr } = await supabase
        .from('partner_page_assignments')
        .delete()
        .eq('user_id', user_id)
      if (delErr) throw delErr
      if (selectedPages.length > 0) {
        const inserts = selectedPages.map(pid => ({ user_id, page_id: pid }))
        const { error: insErr } = await supabase
          .from('partner_page_assignments')
          .insert(inserts)
        if (insErr) throw insErr
      }
      setIsAssignOpen(null)
      // rows는 크게 변하지 않으므로 재로딩 생략 가능
    } catch (e: any) {
      setError(e.message || '할당 저장 실패')
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">파트너 프로필</h1>
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-700 dark:text-gray-300">총 {rows.length}개</div>
        <button
          onClick={openCreate}
          className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
        >
          새 파트너 프로필
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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {rows.map(r => (
                <tr key={r.user_id}>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{r.email ?? '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{r.name ?? '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{r.company ?? '-'}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${r.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-right space-x-2">
                    <button onClick={() => setShowUserId(r.user_id)} className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">User ID 보기</button>
                    <button onClick={() => openAssign(r.user_id)} className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">할당</button>
                    <button onClick={() => toggleStatus(r.user_id, r.status)} className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white">상태</button>
                    <button onClick={() => removeProfile(r.user_id)} className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white">삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">새 파트너 프로필</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">닫기</button>
            </div>
            <form onSubmit={handleSubmit(onCreate)} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">이메일</label>
                <input type="email" className="mt-1 w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" {...register('email')} />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">초기 비밀번호 (선택)</label>
                <input type="password" className="mt-1 w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" {...register('password')} />
                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">이름</label>
                  <input type="text" className="mt-1 w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" {...register('name')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">회사</label>
                  <input type="text" className="mt-1 w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" {...register('company')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">상태</label>
                <select className="mt-1 w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" {...register('status')}>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">{isSubmitting ? '생성 중...' : '생성'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAssignOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">페이지 할당</h2>
              <button onClick={() => setIsAssignOpen(null)} className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">닫기</button>
            </div>
            <div className="p-4 space-y-3 max-h-[70vh] overflow-auto">
              {pages.length === 0 ? (
                <div className="text-gray-700 dark:text-gray-300">등록된 파트너 페이지가 없습니다.</div>
              ) : (
                pages.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={selectedPages.includes(p.id)}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setSelectedPages(prev => checked ? [...prev, p.id] : prev.filter(x => x !== p.id))
                      }}
                    />
                    <span>{p.title}</span>
                  </label>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button onClick={saveAssign} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">저장</button>
            </div>
          </div>
        </div>
      )}

      {/* User ID 표시 모달 */}
      {showUserId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User ID</h2>
              <button onClick={() => setShowUserId(null)} className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">닫기</button>
            </div>
            <div className="p-4">
              <code className="block p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-800 dark:text-gray-200 break-all">{showUserId}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPartners


