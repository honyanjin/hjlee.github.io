import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Edit, Trash2, Save, X, Palette, Tag, BarChart3 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import Breadcrumb from '../components/Breadcrumb'
import type { Category, CategoryInsert, CategoryUpdate } from '../lib/supabase'

const categorySchema = z.object({
  name: z.string().min(2, '카테고리명은 2글자 이상이어야 합니다'),
  slug: z.string().min(2, '슬러그는 2글자 이상이어야 합니다').regex(/^[a-z0-9-]+$/, '영문 소문자, 숫자, 하이픈만 사용 가능합니다'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, '올바른 색상 코드를 입력하세요 (예: #3B82F6)'),
  icon: z.string().optional()
})

type CategoryFormData = z.infer<typeof categorySchema>

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema)
  })

  const watchedColor = watch('color', '#3B82F6')

  useEffect(() => {
    fetchCategories()
    
    // URL 파라미터에서 new=true인 경우 새 카테고리 폼 자동 열기
    if (searchParams.get('new') === 'true') {
      handleNewCategory()
    }
  }, [searchParams])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCategories(data || [])
    } catch (err: any) {
      setError('카테고리를 불러오는데 실패했습니다.')
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (editingId) {
        // 수정
        const { error } = await supabase
          .from('categories')
          .update({
            name: data.name,
            slug: data.slug,
            description: data.description,
            color: data.color,
            icon: data.icon
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        // 새로 생성
        const { error } = await supabase
          .from('categories')
          .insert([data])

        if (error) throw error
      }

      await fetchCategories()
      handleCancel()
    } catch (err: any) {
      setError('카테고리 저장에 실패했습니다.')
      console.error('Error saving category:', err)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setValue('name', category.name)
    setValue('slug', category.slug)
    setValue('description', category.description || '')
    setValue('color', category.color)
    setValue('icon', category.icon || '')
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 카테고리를 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchCategories()
    } catch (err: any) {
      setError('카테고리 삭제에 실패했습니다.')
      console.error('Error deleting category:', err)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setShowForm(false)
    reset()
  }

  const handleNewCategory = () => {
    setEditingId(null)
    setShowForm(true)
    reset({
      name: '',
      slug: '',
      description: '',
      color: '#3B82F6',
      icon: ''
    })
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
              { label: '블로그 관리', path: '/admin/blog' },
              { label: '포스트 카테고리 관리' }
            ]} />
          </div>
          <div className="flex justify-between items-center pb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                포스트 카테고리 관리
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewCategory}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                <span>새 카테고리</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Category Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8"
          >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingId ? '카테고리 수정' : '새 카테고리'}
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        카테고리명 *
                      </label>
                      <input
                        {...register('name')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="예: React"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        슬러그 *
                      </label>
                      <input
                        {...register('slug')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="예: react"
                      />
                      {errors.slug && (
                        <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      설명
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="카테고리에 대한 설명을 입력하세요"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        색상 *
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          {...register('color')}
                          type="color"
                          className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                          onChange={(e) => setValue('color', e.target.value)}
                        />
                        <input
                          {...register('color')}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="#3B82F6"
                        />
                      </div>
                      {errors.color && (
                        <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        아이콘
                      </label>
                      <input
                        {...register('icon')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="예: react"
                      />
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: watchedColor }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        미리보기
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        블로그 포스트에서 이 색상이 사용됩니다
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save size={16} />
                      <span>{editingId ? '수정' : '생성'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Categories List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon ? (
                          <Tag size={16} />
                        ) : (
                          <Tag size={16} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {category.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {category.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {category.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>생성일: {new Date(category.created_at).toLocaleDateString()}</span>
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {categories.length === 0 && !showForm && (
              <div className="text-center py-12">
                <Tag size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  카테고리가 없습니다
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  첫 번째 카테고리를 생성해보세요.
                </p>
                <button
                  onClick={handleNewCategory}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  카테고리 생성
                </button>
              </div>
        )}
      </main>
    </div>
  )
}

export default AdminCategories 