import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Save, X, Palette, Tag, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { ProjectCategory, ProjectCategoryInsert, ProjectCategoryUpdate } from '../lib/supabase'

const categorySchema = z.object({
  name: z.string().min(2, '카테고리명은 2글자 이상이어야 합니다'),
  slug: z.string().min(2, '슬러그는 2글자 이상이어야 합니다').regex(/^[a-z0-9-]+$/, '영문 소문자, 숫자, 하이픈만 사용 가능합니다'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, '올바른 색상 코드를 입력하세요 (예: #3B82F6)'),
  icon: z.string().optional(),
  sort_order: z.number().min(0, '순서는 0 이상이어야 합니다')
})

type CategoryFormData = z.infer<typeof categorySchema>

const AdminProjectCategories = () => {
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  
  const navigate = useNavigate()

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
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('project_categories')
        .select('*')
        .order('sort_order', { ascending: true })
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
          .from('project_categories')
          .update({
            name: data.name,
            slug: data.slug,
            description: data.description,
            color: data.color,
            icon: data.icon,
            sort_order: data.sort_order
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        // 새로 생성
        const { error } = await supabase
          .from('project_categories')
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

  const handleEdit = (category: ProjectCategory) => {
    setEditingId(category.id)
    setValue('name', category.name)
    setValue('slug', category.slug)
    setValue('description', category.description || '')
    setValue('color', category.color)
    setValue('icon', category.icon || '')
    setValue('sort_order', category.sort_order)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 카테고리를 삭제하시겠습니까? 이 카테고리를 사용하는 프로젝트들은 카테고리가 해제됩니다.')) return

    try {
      const { error } = await supabase
        .from('project_categories')
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
      icon: '',
      sort_order: 0
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="pt-32 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 dark:text-gray-400">카테고리를 불러오는 중...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/projects')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                프로젝트 관리로
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                프로젝트 카테고리 관리
              </h1>
            </div>
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
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
                    placeholder="예: Web Development"
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
                    placeholder="예: web-development"
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

              <div className="grid md:grid-cols-3 gap-6">
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
                    placeholder="예: globe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    정렬 순서
                  </label>
                  <input
                    {...register('sort_order', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                  {errors.sort_order && (
                    <p className="text-red-500 text-sm mt-1">{errors.sort_order.message}</p>
                  )}
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
                    프로젝트 목록에서 이 색상이 사용됩니다
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
                <span>순서: {category.sort_order}</span>
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

export default AdminProjectCategories 