import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Save, 
  ArrowLeft, 
  Plus,
  ExternalLink,
  Github,
  Star,
  Image
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { ProjectInsert } from '../lib/supabase'
import ImageUpload from '../components/ImageUpload'

const projectSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string().min(10, '설명은 10자 이상이어야 합니다'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  tags: z.string().optional(),
  live_url: z.string().url().optional().or(z.literal('')),
  github_url: z.string().url().optional().or(z.literal('')),
  featured: z.boolean().default(false),
  sort_order: z.number().min(0, '순서는 0 이상이어야 합니다'),
  is_published: z.boolean().default(false)
})

type ProjectFormData = z.infer<typeof projectSchema>

const AdminProjectNew = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  
  const { user } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      featured: false,
      sort_order: 0,
      is_published: false
    }
  })

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // 태그 처리
      const tags = data.tags 
        ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : []

      const projectData: ProjectInsert = {
        title: data.title,
        description: data.description,
        category: data.category,
        tags,
        image_url: imageUrl,
        live_url: data.live_url || undefined,
        github_url: data.github_url || undefined,
        featured: data.featured,
        sort_order: data.sort_order,
        is_published: data.is_published
      }

      const { error } = await supabase
        .from('projects')
        .insert(projectData)

      if (error) throw error

      setSuccess('프로젝트가 성공적으로 저장되었습니다!')
      
      // 2초 후 목록으로 이동
      setTimeout(() => {
        navigate('/admin/projects')
      }, 2000)

    } catch (err: any) {
      setError(err.message || '프로젝트 저장에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
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
                목록으로
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                새 프로젝트 추가
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              기본 정보
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Title */}
              <div className="lg:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  프로젝트 제목 *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  id="title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="프로젝트 제목을 입력하세요"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  카테고리 *
                </label>
                <select
                  {...register('category')}
                  id="category"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">카테고리 선택</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="Desktop App">Desktop App</option>
                  <option value="API">API</option>
                  <option value="Library">Library</option>
                  <option value="Tool">Tool</option>
                  <option value="Game">Game</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Sort Order */}
              <div>
                <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  정렬 순서
                </label>
                <input
                  {...register('sort_order', { valueAsNumber: true })}
                  type="number"
                  id="sort_order"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                />
                {errors.sort_order && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.sort_order.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  프로젝트 설명 *
                </label>
                <textarea
                  {...register('description')}
                  id="description"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="프로젝트에 대한 상세한 설명을 입력하세요"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="lg:col-span-2">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  기술 스택
                </label>
                <input
                  {...register('tags')}
                  type="text"
                  id="tags"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="사용된 기술을 쉼표로 구분하여 입력하세요 (예: React, TypeScript, Node.js)"
                />
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              링크
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live URL */}
              <div>
                <label htmlFor="live_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <ExternalLink size={16} className="inline mr-2" />
                  라이브 사이트 URL
                </label>
                <input
                  {...register('live_url')}
                  type="url"
                  id="live_url"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com"
                />
              </div>

              {/* GitHub URL */}
              <div>
                <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Github size={16} className="inline mr-2" />
                  GitHub URL
                </label>
                <input
                  {...register('github_url')}
                  type="url"
                  id="github_url"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://github.com/username/repo"
                />
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <Image size={20} className="inline mr-2" />
              프로젝트 이미지
            </h2>
            
            <ImageUpload
              onImageUpload={setImageUrl}
              currentImage={imageUrl}
            />
          </div>

          {/* Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              설정
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    {...register('featured')}
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    대표 프로젝트로 설정 (홈페이지에 표시)
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    {...register('is_published')}
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    즉시 발행
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/projects')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {isLoading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default AdminProjectNew 