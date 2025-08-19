import { supabase } from '../lib/supabase'
import { useSupabaseQuery } from './useSupabaseQuery'
import type { ProjectWithCategory, ProjectCategory } from '../types'

// 프로젝트 필터 옵션
interface ProjectFilters {
  category?: string
  featured?: boolean
  published?: boolean
}

/**
 * 프로젝트 목록을 가져오는 훅
 */
export const useProjects = (filters: ProjectFilters = {}) => {
  return useSupabaseQuery<ProjectWithCategory[]>(
    async () => {
      let query = supabase
        .from('projects')
        .select(`
          *,
          project_category:project_categories(*)
        `)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      // 발행 상태 필터 (기본값: true)
      if (filters.published !== false) {
        query = query.eq('is_published', true)
      }

      // 카테고리 필터
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }
      
      // 특집 프로젝트 필터
      if (filters.featured) {
        query = query.eq('featured', true)
      }

      return query
    },
    [filters.category, filters.featured, filters.published],
    {
      defaultValue: [],
      errorMessage: '프로젝트 목록을 불러오는데 실패했습니다.'
    }
  )
}

/**
 * 단일 프로젝트를 가져오는 훅
 */
export const useProject = (projectId: string | undefined) => {
  return useSupabaseQuery<ProjectWithCategory>(
    async () => {
      if (!projectId) {
        throw new Error('프로젝트 ID가 필요합니다.')
      }

      return supabase
        .from('projects')
        .select(`
          *,
          project_category:project_categories(*)
        `)
        .eq('id', projectId)
        .single()
    },
    [projectId],
    {
      immediate: !!projectId,
      errorMessage: '프로젝트를 불러오는데 실패했습니다.'
    }
  )
}

/**
 * 프로젝트 카테고리 목록을 가져오는 훅
 */
export const useProjectCategories = () => {
  return useSupabaseQuery<ProjectCategory[]>(
    async () => {
      return supabase
        .from('project_categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })
    },
    [],
    {
      defaultValue: [],
      errorMessage: '프로젝트 카테고리를 불러오는데 실패했습니다.'
    }
  )
}

/**
 * 특집 프로젝트들을 가져오는 훅
 */
export const useFeaturedProjects = (limit?: number) => {
  return useSupabaseQuery<ProjectWithCategory[]>(
    async () => {
      let query = supabase
        .from('projects')
        .select(`
          *,
          project_category:project_categories(*)
        `)
        .eq('is_published', true)
        .eq('featured', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      return query
    },
    [limit],
    {
      defaultValue: [],
      errorMessage: '특집 프로젝트를 불러오는데 실패했습니다.'
    }
  )
}
