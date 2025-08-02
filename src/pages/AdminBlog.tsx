import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  LogOut, 
  Calendar,
  Tag,
  User,
  BarChart3,
  FolderOpen
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import Breadcrumb from '../components/Breadcrumb'
import type { BlogPost } from '../lib/supabase'

const AdminBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // published_at이 null인 경우를 고려하여 정렬
      const sortedPosts = (data || []).sort((a, b) => {
        const aDate = a.published_at ? new Date(a.published_at) : new Date(a.created_at)
        const bDate = b.published_at ? new Date(b.published_at) : new Date(b.created_at)
        return bDate.getTime() - aDate.getTime() // 최신순 정렬
      })
      
      setPosts(sortedPosts)
    } catch (err: any) {
      setError('포스트를 불러오는데 실패했습니다.')
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }



  const handleDeletePost = async (id: string) => {
    if (!confirm('정말로 이 포스트를 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setPosts(posts.filter(post => post.id !== id))
    } catch (err: any) {
      setError('포스트 삭제에 실패했습니다.')
      console.error('Error deleting post:', err)
    }
  }

  const togglePublishStatus = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          is_published: !post.is_published,
          published_at: !post.is_published ? new Date().toISOString() : null
        })
        .eq('id', post.id)

      if (error) throw error
      
      setPosts(posts.map(p => 
        p.id === post.id 
          ? { ...p, is_published: !p.is_published }
          : p
      ))
    } catch (err: any) {
      setError('포스트 상태 변경에 실패했습니다.')
      console.error('Error updating post:', err)
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
          <div>
            <Breadcrumb items={[
              { label: '블로그 관리', path: '/admin/blog' }
            ]} />
          </div>
          <div className="flex justify-between items-center pb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                블로그 관리
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
              <button
                onClick={() => navigate('/admin/blog/categories')}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Tag size={16} />
                포스트 카테고리
              </button>
              <button
                onClick={() => navigate('/admin/blog/new')}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                새 포스트
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Posts List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              포스트 목록 ({posts.length})
            </h2>
          </div>
          
          {posts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                아직 포스트가 없습니다.
              </p>
              <button
                onClick={() => navigate('/admin/blog/new')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                첫 포스트 작성하기
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {post.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          post.is_published 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {post.is_published ? '발행됨' : '임시저장'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(post.created_at).toLocaleDateString()}
                        </div>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag size={14} />
                            {post.tags.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePublishStatus(post)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        title={post.is_published ? '발행 취소' : '발행'}
                      >
                        {post.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                        className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                        title="편집"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
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

export default AdminBlog 