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
  FolderOpen,
  Star
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import AdminPageHeader from '../components/admin/AdminPageHeader'
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

  const toggleRecommendStatus = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          is_recommended: !post.is_recommended
        })
        .eq('id', post.id)

      if (error) throw error
      
      setPosts(posts.map(p => 
        p.id === post.id 
          ? { ...p, is_recommended: !p.is_recommended }
          : p
      ))
    } catch (err: any) {
      setError('추천 상태 변경에 실패했습니다.')
      console.error('Error updating recommendation:', err)
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
    <AdminLayout>
      <div className="p-8">
        <AdminPageHeader
          title="블로그 관리"
          description="블로그 포스트를 관리하고 새로운 포스트를 작성합니다."
        >
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
        </AdminPageHeader>
        
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
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          {post.is_recommended && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full dark:bg-yellow-900 dark:text-yellow-200">
                              <Star size={12} />
                              추천
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            post.is_published 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {post.is_published ? '발행됨' : '임시저장'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>
                            {post.published_at 
                              ? new Date(post.published_at).toLocaleDateString()
                              : new Date(post.created_at).toLocaleDateString()
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag size={14} />
                          <span>{post.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>{post.author}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRecommendStatus(post)}
                        className={`p-2 rounded-lg transition-colors ${
                          post.is_recommended
                            ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
                            : 'text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400'
                        }`}
                        title={post.is_recommended ? '추천 해제' : '추천'}
                      >
                        <Star size={16} />
                      </button>
                      
                      <button
                        onClick={() => togglePublishStatus(post)}
                        className={`p-2 rounded-lg transition-colors ${
                          post.is_published
                            ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                            : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                        }`}
                        title={post.is_published ? '발행 취소' : '발행'}
                      >
                        {post.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      
                      <button
                        onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="편집"
                      >
                        <Edit size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
      </div>
    </AdminLayout>
  )
}

export default AdminBlog 