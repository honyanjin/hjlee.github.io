import { useEffect, useState } from 'react'
import Breadcrumb from '../components/Breadcrumb'
import { supabase } from '../lib/supabase'
import { Loader2, Mail, Trash2 } from 'lucide-react'

type ContactMessage = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}

const AdminMessages = () => {
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setMessages(data || [])
    } catch (e: any) {
      setError(e.message || '메시지를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const remove = async (id: string) => {
    try {
      setDeleting(id)
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id)
      if (error) throw error
      setMessages(prev => prev.filter(m => m.id !== id))
    } catch (e: any) {
      setError(e.message || '삭제 실패')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="w-full">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb items={[{ label: 'Contact 메시지', path: '/admin/messages' }]} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact 메시지</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">{error}</div>
        )}
        {loading ? (
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> 불러오는 중...
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Mail size={18} />
                <span>총 {messages.length}건</span>
              </div>
              <button onClick={load} className="text-sm px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200">새로고침</button>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {messages.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">수신된 메시지가 없습니다.</div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4">
                    <div className="md:col-span-3">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{m.subject}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(m.created_at).toLocaleString()}</div>
                    </div>
                    <div className="md:col-span-3">
                      <div className="text-sm text-gray-800 dark:text-gray-200">{m.name}</div>
                      <a href={`mailto:${m.email}`} className="text-xs text-blue-600 dark:text-blue-400">{m.email}</a>
                    </div>
                    <div className="md:col-span-5">
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{m.message}</div>
                    </div>
                    <div className="md:col-span-1 flex md:justify-end">
                      <button
                        onClick={() => remove(m.id)}
                        disabled={deleting === m.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                        title="삭제"
                      >
                        <Trash2 size={14} /> 삭제
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminMessages

