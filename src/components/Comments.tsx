import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, User, Calendar, Trash2, Shield } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Comment, CommentInsert, CommentLimit } from '../lib/supabase'
import { AuthContext } from '../contexts/AuthContext'

interface CommentsProps {
  postId: string
}

const Comments = ({ postId }: CommentsProps) => {
  const authContext = useContext(AuthContext)
  const isAdmin = authContext?.isAdmin || false
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [commentLimit, setCommentLimit] = useState<CommentLimit | null>(null)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockedUntil, setBlockedUntil] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => {
    // 로컬 스토리지에서 사용자 정보 복원
    const saved = localStorage.getItem('commentUser')
    return saved ? JSON.parse(saved) : null
  })

  // 댓글 가져오기
  useEffect(() => {
    fetchComments()
    fetchCommentLimit()
  }, [postId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data || [])
    } catch (err: any) {
      console.error('Error fetching comments:', err)
      setError('댓글을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 댓글 제한 정보 가져오기
  const fetchCommentLimit = async () => {
    try {
      const { data, error } = await supabase
        .from('comment_limits')
        .select('*')
        .eq('post_id', postId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116는 데이터가 없을 때
        console.error('Error fetching comment limit:', error)
        return
      }

      if (data) {
        setCommentLimit(data)
        checkBlockStatus(data)
      } else {
        // 댓글 제한 레코드가 없으면 생성
        await createCommentLimit()
      }
    } catch (err: any) {
      console.error('Error fetching comment limit:', err)
    }
  }

  // 댓글 제한 레코드 생성
  const createCommentLimit = async () => {
    try {
      const newLimit: any = {
        post_id: postId,
        daily_count: 0,
        last_reset_date: new Date().toISOString().split('T')[0],
        is_blocked: false,
        blocked_until: null
      }

      const { data, error } = await supabase
        .from('comment_limits')
        .insert(newLimit)
        .select()
        .single()

      if (error) throw error
      setCommentLimit(data)
    } catch (err: any) {
      console.error('Error creating comment limit:', err)
    }
  }

  // 차단 상태 확인
  const checkBlockStatus = (limit: CommentLimit) => {
    const now = new Date()
    const lastReset = new Date(limit.last_reset_date)
    const today = new Date().toISOString().split('T')[0]

    // 날짜가 바뀌었으면 카운트 리셋
    if (lastReset.toISOString().split('T')[0] !== today) {
      resetDailyCount(limit.id)
      return
    }

    // 100개 초과 시 차단
    if (limit.daily_count >= 100) {
      setIsBlocked(true)
      setBlockedUntil(limit.blocked_until)
    } else {
      setIsBlocked(false)
      setBlockedUntil(null)
    }
  }

  // 일일 카운트 리셋
  const resetDailyCount = async (limitId: string) => {
    try {
      const { error } = await supabase
        .from('comment_limits')
        .update({
          daily_count: 0,
          last_reset_date: new Date().toISOString().split('T')[0],
          is_blocked: false,
          blocked_until: null
        })
        .eq('id', limitId)

      if (error) throw error

      // 로컬 상태 업데이트
      setIsBlocked(false)
      setBlockedUntil(null)
      if (commentLimit) {
        setCommentLimit({
          ...commentLimit,
          daily_count: 0,
          last_reset_date: new Date().toISOString().split('T')[0],
          is_blocked: false,
          blocked_until: null
        })
      }
    } catch (err: any) {
      console.error('Error resetting daily count:', err)
    }
  }

  // 댓글 작성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!authorName.trim() || !authorEmail.trim() || !content.trim()) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    // 차단 상태 확인
    if (isBlocked) {
      setError('이 포스트는 하루 최대 댓글 수(100개)를 초과하여 임시로 댓글 작성이 차단되었습니다. 24시간 후에 다시 시도해주세요.')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const newComment: CommentInsert = {
        post_id: postId,
        author_name: authorName.trim(),
        author_email: authorEmail.trim(),
        content: content.trim()
      }

      const { data, error } = await supabase
        .from('comments')
        .insert(newComment)
        .select()
        .single()

      if (error) throw error

      // 새 댓글을 목록에 추가
      setComments(prev => [...prev, data])
      
      // 댓글 카운트 증가
      await updateCommentCount()
      
      // 현재 사용자 정보 저장
      const userInfo = {
        name: authorName.trim(),
        email: authorEmail.trim()
      }
      setCurrentUser(userInfo)
      localStorage.setItem('commentUser', JSON.stringify(userInfo))
      
      // 폼 초기화 (이름과 이메일은 유지)
      setContent('')
      
    } catch (err: any) {
      console.error('Error submitting comment:', err)
      setError('댓글 작성에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  // 댓글 카운트 업데이트
  const updateCommentCount = async () => {
    if (!commentLimit) return

    try {
      const newCount = commentLimit.daily_count + 1
      const isBlocked = newCount >= 100
      const blockedUntil = isBlocked ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null

      const { data, error } = await supabase
        .from('comment_limits')
        .update({
          daily_count: newCount,
          is_blocked: isBlocked,
          blocked_until: blockedUntil
        })
        .eq('id', commentLimit.id)
        .select()
        .single()

      if (error) throw error

      setCommentLimit(data)
      setIsBlocked(isBlocked)
      setBlockedUntil(blockedUntil)
    } catch (err: any) {
      console.error('Error updating comment count:', err)
    }
  }

  // 댓글 삭제 (작성자 또는 관리자만 가능)
  const handleDelete = async (comment: Comment) => {
    // 관리자이거나 댓글 작성자인지 확인
    const canDelete = isAdmin || 
      (currentUser && 
       currentUser.email === comment.author_email && 
       currentUser.name === comment.author_name)

    if (!canDelete) {
      alert('본인이 작성한 댓글만 삭제할 수 있습니다.')
      return
    }

    const confirmMessage = isAdmin 
      ? '관리자 권한으로 댓글을 삭제하시겠습니까?' 
      : '댓글을 삭제하시겠습니까?'

    if (!confirm(confirmMessage)) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', comment.id)

      if (error) throw error

      // 댓글 목록에서 제거
      setComments(prev => prev.filter(c => c.id !== comment.id))
    } catch (err: any) {
      console.error('Error deleting comment:', err)
      setError('댓글 삭제에 실패했습니다.')
    }
  }

  return (
    <div className="mt-12">
      {/* 댓글 섹션 헤더 */}
      <div className="flex items-center gap-2 mb-8">
        <MessageCircle size={24} className="text-blue-600" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          댓글 ({comments.length})
        </h3>
      </div>

                {/* 댓글 작성 폼 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg shadow-md p-6 mb-8 ${
              isBlocked 
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                : 'bg-white dark:bg-gray-800'
            }`}
          >
                  {isBlocked && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <Shield size={20} />
                <div>
                  <p className="font-semibold">댓글 작성이 차단되었습니다</p>
                  <p className="text-sm">
                    이 포스트는 하루 최대 댓글 수(100개)를 초과하여 임시로 댓글 작성이 차단되었습니다.
                    {blockedUntil && (
                      <span> 24시간 후({new Date(blockedUntil).toLocaleString()})에 다시 시도해주세요.</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이름 *
              </label>
                             <input
                 type="text"
                 id="authorName"
                 value={currentUser?.name || authorName}
                 onChange={(e) => setAuthorName(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                 placeholder="이름을 입력하세요"
                 required
               />
            </div>
            <div>
              <label htmlFor="authorEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이메일 *
              </label>
                             <input
                 type="email"
                 id="authorEmail"
                 value={currentUser?.email || authorEmail}
                 onChange={(e) => setAuthorEmail(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                 placeholder="이메일을 입력하세요"
                 required
               />
            </div>
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              댓글 *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              placeholder="댓글을 입력하세요..."
              required
            />
          </div>
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
                     <button
             type="submit"
             disabled={submitting || isBlocked}
             className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           >
             <Send size={16} />
             {submitting ? '작성 중...' : isBlocked ? '댓글 작성 차단됨' : '댓글 작성'}
           </button>
        </form>
      </motion.div>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 dark:text-gray-400">댓글을 불러오는 중...</span>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {comment.author_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                                         {(isAdmin || 
                       (currentUser && 
                        currentUser.email === comment.author_email && 
                        currentUser.name === comment.author_name)) && (
                       <button
                         onClick={() => handleDelete(comment)}
                         className={`transition-colors ${
                           isAdmin 
                             ? 'text-orange-500 hover:text-orange-700' 
                             : 'text-red-500 hover:text-red-700'
                         }`}
                         title={isAdmin ? '관리자 권한으로 댓글 삭제' : '댓글 삭제'}
                       >
                         {isAdmin ? <Shield size={14} /> : <Trash2 size={14} />}
                       </button>
                     )}
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {comment.content}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default Comments 