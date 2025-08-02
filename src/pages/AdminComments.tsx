import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Trash2, 
  LogOut, 
  Calendar,
  User,
  MessageSquare,
  BarChart3,
  FileText,
  FolderOpen,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Breadcrumb from '../components/Breadcrumb'
import type { Comment, BlogPost } from '../lib/supabase'

interface CommentWithPost extends Comment {
  post?: BlogPost
}

const AdminComments = () => {
  const [comments, setComments] = useState<CommentWithPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      setLoading(true)
      setError('')

      // 댓글과 관련 포스트 정보 가져오기
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          post:blog_posts(title)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setComments(data || [])
    } catch (err: any) {
      setError('댓글을 불러오는데 실패했습니다.')
      console.error('Error fetching comments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  const handleDeleteComment = async (id: string) => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setComments(comments.filter(comment => comment.id !== id))
    } catch (err: any) {
      setError('댓글 삭제에 실패했습니다.')
      console.error('Error deleting comment:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                댓글 관리
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <BarChart3 size={16} />
                대시보드
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[
          { label: '댓글 관리' }
        ]} />
        
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Comments List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              댓글 목록 ({comments.length})
            </h2>
          </div>
          
          {comments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                아직 댓글이 없습니다.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {comment.author_name}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {comment.author_email}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(comment.created_at).toLocaleDateString()}
                        </div>
                        {comment.post && (
                          <div className="flex items-center gap-1">
                            <FileText size={14} />
                            <span className="text-blue-600 dark:text-blue-400">
                              {comment.post.title}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminComments 