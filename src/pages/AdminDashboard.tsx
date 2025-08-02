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
  FileText,
  FolderOpen,
  BarChart3,
  TrendingUp,
  Activity,
  Settings,
  ExternalLink,
  Github,
  Star,
  MessageSquare,
  Image,
  Database,
  Home
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Breadcrumb from '../components/Breadcrumb'
import type { BlogPost, Project, Category, ProjectCategory, Comment } from '../lib/supabase'

interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalProjects: number
  publishedProjects: number
  featuredProjects: number
  totalCategories: number
  totalProjectCategories: number
  totalComments: number
  recentPosts: BlogPost[]
  recentProjects: Project[]
  recentComments: Comment[]
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalProjects: 0,
    publishedProjects: 0,
    featuredProjects: 0,
    totalCategories: 0,
    totalProjectCategories: 0,
    totalComments: 0,
    recentPosts: [],
    recentProjects: [],
    recentComments: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      // 블로그 포스트 통계
      const { data: posts, error: postsError } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (postsError) throw postsError

      // 프로젝트 통계
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError

      // 카테고리 통계
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')

      if (categoriesError) throw categoriesError

      // 프로젝트 카테고리 통계
      const { data: projectCategories, error: projectCategoriesError } = await supabase
        .from('project_categories')
        .select('*')

      if (projectCategoriesError) throw projectCategoriesError

      // 댓글 통계
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })

      if (commentsError) throw commentsError

      // 통계 계산
      const publishedPosts = posts?.filter(post => post.is_published) || []
      const draftPosts = posts?.filter(post => !post.is_published) || []
      const publishedProjects = projects?.filter(project => project.is_published) || []
      const featuredProjects = projects?.filter(project => project.featured) || []

      setStats({
        totalPosts: posts?.length || 0,
        publishedPosts: publishedPosts.length,
        draftPosts: draftPosts.length,
        totalProjects: projects?.length || 0,
        publishedProjects: publishedProjects.length,
        featuredProjects: featuredProjects.length,
        totalCategories: categories?.length || 0,
        totalProjectCategories: projectCategories?.length || 0,
        totalComments: comments?.length || 0,
        recentPosts: posts?.slice(0, 5) || [],
        recentProjects: projects?.slice(0, 5) || [],
        recentComments: comments?.slice(0, 5) || []
      })

    } catch (err: any) {
      setError('대시보드 데이터를 불러오는데 실패했습니다.')
      console.error('Error fetching dashboard data:', err)
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
            <Breadcrumb items={[]} />
          </div>
          <div className="flex justify-between items-center pb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                관리자 대시보드
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Home size={16} />
                홈으로
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <LogOut size={16} />
                로그아웃
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

        {/* Core Management Tools */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            핵심 관리 도구
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/blog')}
              className="flex items-center gap-3 p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <FileText size={24} />
              <div className="text-left">
                <div className="font-semibold">블로그 관리</div>
                <div className="text-sm opacity-90">포스트 작성/편집</div>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/projects')}
              className="flex items-center gap-3 p-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
            >
              <FolderOpen size={24} />
              <div className="text-left">
                <div className="font-semibold">프로젝트 관리</div>
                <div className="text-sm opacity-90">프로젝트 작성/편집</div>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/blog/categories')}
              className="flex items-center gap-3 p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              <Tag size={24} />
              <div className="text-left">
                <div className="font-semibold">포스트 카테고리</div>
                <div className="text-sm opacity-90">포스트 분류/편집</div>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/projects/categories')}
              className="flex items-center gap-3 p-6 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-lg"
            >
              <Database size={24} />
              <div className="text-left">
                <div className="font-semibold">프로젝트 카테고리</div>
                <div className="text-sm opacity-90">프로젝트 분류/편집</div>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/comments')}
              className="flex items-center gap-3 p-6 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-lg"
            >
              <MessageSquare size={24} />
              <div className="text-left">
                <div className="font-semibold">댓글 관리</div>
                <div className="text-sm opacity-90">댓글 모니터링</div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            빠른 작업
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/blog/new')}
              className="flex items-center gap-3 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={20} />
              <span>새 포스트</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/projects/new')}
              className="flex items-center gap-3 p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Plus size={20} />
              <span>새 프로젝트</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/blog/categories?new=true')}
              className="flex items-center gap-3 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus size={20} />
              <span>새 포스트 카테고리</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/projects/categories?new=true')}
              className="flex items-center gap-3 p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus size={20} />
              <span>새 프로젝트 카테고리</span>
            </motion.button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            통계
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Blog Posts Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">총 포스트</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPosts}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex gap-2 text-sm">
                <span className="text-green-600 dark:text-green-400">
                  발행: {stats.publishedPosts}
                </span>
                <span className="text-yellow-600 dark:text-yellow-400">
                  임시저장: {stats.draftPosts}
                </span>
              </div>
            </motion.div>

            {/* Projects Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">총 프로젝트</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProjects}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <FolderOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex gap-2 text-sm">
                <span className="text-green-600 dark:text-green-400">
                  발행: {stats.publishedProjects}
                </span>
                <span className="text-yellow-600 dark:text-yellow-400">
                  대표: {stats.featuredProjects}
                </span>
              </div>
            </motion.div>

            {/* Categories Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">카테고리</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalCategories + stats.totalProjectCategories}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <Tag className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-4 flex gap-2 text-sm">
                <span className="text-blue-600 dark:text-blue-400">
                  블로그: {stats.totalCategories}
                </span>
                <span className="text-purple-600 dark:text-purple-400">
                  프로젝트: {stats.totalProjectCategories}
                </span>
              </div>
            </motion.div>

            {/* Comments Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">총 댓글</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalComments}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                최근 24시간 활동
              </div>
            </motion.div>


          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Posts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  최근 포스트
                </h3>
                <button
                  onClick={() => navigate('/admin/blog')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  모두 보기
                </button>
              </div>
            </div>
            <div className="p-6">
              {stats.recentPosts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  아직 포스트가 없습니다.
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.recentPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {post.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          post.is_published 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {post.is_published ? '발행' : '임시저장'}
                        </span>
                        <button
                          onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                          className="p-1 text-blue-600 hover:text-blue-700"
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Projects */}
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  최근 프로젝트
                </h3>
                <button
                  onClick={() => navigate('/admin/projects')}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  모두 보기
                </button>
              </div>
            </div>
            <div className="p-6">
              {stats.recentProjects.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  아직 프로젝트가 없습니다.
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {project.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {project.featured && (
                          <Star className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          project.is_published 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {project.is_published ? '발행' : '임시저장'}
                        </span>
                        <button
                          onClick={() => navigate(`/admin/projects/edit/${project.id}`)}
                          className="p-1 text-purple-600 hover:text-purple-700"
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Comments */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  최근 댓글
                </h3>
                <button
                  onClick={() => navigate('/admin/comments')}
                  className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                >
                  모두 보기
                </button>
              </div>
            </div>
            <div className="p-6">
              {stats.recentComments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  아직 댓글이 없습니다.
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.recentComments.map((comment) => (
                    <div key={comment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {comment.author_name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {comment.content}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate('/admin/comments')}
                        className="p-1 text-pink-600 hover:text-pink-700"
                      >
                        <MessageSquare size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>


      </main>
    </div>
  )
}

export default AdminDashboard 