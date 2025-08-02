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
  ExternalLink,
  Github,
  Star,
  BarChart3,
  FileText
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Project } from '../lib/supabase'

const AdminProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (err: any) {
      setError('프로젝트를 불러오는데 실패했습니다.')
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }



  const handleDeleteProject = async (id: string) => {
    if (!confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setProjects(projects.filter(project => project.id !== id))
    } catch (err: any) {
      setError('프로젝트 삭제에 실패했습니다.')
      console.error('Error deleting project:', err)
    }
  }

  const togglePublishStatus = async (project: Project) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_published: !project.is_published })
        .eq('id', project.id)

      if (error) throw error
      
      setProjects(projects.map(p => 
        p.id === project.id 
          ? { ...p, is_published: !p.is_published }
          : p
      ))
    } catch (err: any) {
      setError('프로젝트 상태 변경에 실패했습니다.')
      console.error('Error updating project:', err)
    }
  }

  const toggleFeaturedStatus = async (project: Project) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ featured: !project.featured })
        .eq('id', project.id)

      if (error) throw error
      
      setProjects(projects.map(p => 
        p.id === project.id 
          ? { ...p, featured: !p.featured }
          : p
      ))
    } catch (err: any) {
      setError('대표 프로젝트 설정에 실패했습니다.')
      console.error('Error updating project:', err)
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
                프로젝트 관리
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
                onClick={() => navigate('/admin/projects/categories')}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Tag size={16} />
                프로젝트 카테고리
              </button>
              <button
                onClick={() => navigate('/admin/projects/new')}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus size={16} />
                새 프로젝트
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

        <div className="grid gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {project.featured && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full dark:bg-yellow-900 dark:text-yellow-200">
                          <Star size={12} />
                          대표
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        project.is_published 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {project.is_published ? '발행됨' : '임시저장'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag size={14} />
                      <span>{project.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>순서: {project.sort_order}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {project.live_url && (
                      <a 
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <ExternalLink size={14} />
                        <span className="text-sm">라이브 사이트</span>
                      </a>
                    )}
                    {project.github_url && (
                      <a 
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <Github size={14} />
                        <span className="text-sm">GitHub</span>
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleFeaturedStatus(project)}
                    className={`p-2 rounded-lg transition-colors ${
                      project.featured
                        ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
                        : 'text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400'
                    }`}
                    title={project.featured ? '대표 프로젝트 해제' : '대표 프로젝트 설정'}
                  >
                    <Star size={16} />
                  </button>
                  
                  <button
                    onClick={() => togglePublishStatus(project)}
                    className={`p-2 rounded-lg transition-colors ${
                      project.is_published
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                        : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                    }`}
                    title={project.is_published ? '발행 취소' : '발행'}
                  >
                    {project.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  
                  <button
                    onClick={() => navigate(`/admin/projects/edit/${project.id}`)}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="편집"
                  >
                    <Edit size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteProject(project.id)}
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

        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              프로젝트가 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              첫 번째 프로젝트를 추가해보세요.
            </p>
            <button
              onClick={() => navigate('/admin/projects/new')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              프로젝트 추가
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminProjects 