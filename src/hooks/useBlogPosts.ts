import { supabase } from '../lib/supabase'
import { useSupabaseQuery } from './useSupabaseQuery'
import type { BlogPost, Category } from '../types'

// 블로그 포스트 필터 옵션
interface BlogPostFilters {
  category?: string
  recommended?: boolean
  published?: boolean
  author?: string
  search?: string
}

/**
 * 블로그 포스트 목록을 가져오는 훅
 */
export const useBlogPosts = (filters: BlogPostFilters = {}) => {
  return useSupabaseQuery<BlogPost[]>(
    async () => {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false })
        .order('created_at', { ascending: false })

      // 발행 상태 필터 (기본값: true)
      if (filters.published !== false) {
        query = query.eq('is_published', true)
      }

      // 카테고리 필터
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }
      
      // 추천 포스트 필터
      if (filters.recommended) {
        query = query.eq('is_recommended', true)
      }

      // 작성자 필터
      if (filters.author) {
        query = query.eq('author', filters.author)
      }

      // 검색 필터 (제목 또는 내용에서 검색)
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
      }

      return query
    },
    [filters.category, filters.recommended, filters.published, filters.author, filters.search],
    {
      defaultValue: [],
      errorMessage: '블로그 포스트 목록을 불러오는데 실패했습니다.'
    }
  )
}

/**
 * 단일 블로그 포스트를 가져오는 훅
 */
export const useBlogPost = (postId: string | undefined) => {
  return useSupabaseQuery<BlogPost>(
    async () => {
      if (!postId) {
        throw new Error('포스트 ID가 필요합니다.')
      }

      return supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single()
    },
    [postId],
    {
      immediate: !!postId,
      errorMessage: '블로그 포스트를 불러오는데 실패했습니다.'
    }
  )
}

/**
 * 포스트 번호로 블로그 포스트를 가져오는 훅
 */
export const useBlogPostByPostNo = (postNo: string | undefined) => {
  return useSupabaseQuery<BlogPost>(
    async () => {
      if (!postNo) {
        throw new Error('포스트 번호가 필요합니다.')
      }

      return supabase
        .from('blog_posts')
        .select('*')
        .eq('post_no', parseInt(postNo))
        .eq('is_published', true)
        .single()
    },
    [postNo],
    {
      immediate: !!postNo,
      errorMessage: '블로그 포스트를 찾을 수 없습니다.'
    }
  )
}

/**
 * 블로그 카테고리 목록을 가져오는 훅
 */
export const useBlogCategories = () => {
  return useSupabaseQuery<Category[]>(
    async () => {
      return supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })
    },
    [],
    {
      defaultValue: [],
      errorMessage: '블로그 카테고리를 불러오는데 실패했습니다.'
    }
  )
}

/**
 * 추천 블로그 포스트들을 가져오는 훅
 */
export const useRecommendedBlogPosts = (limit?: number) => {
  return useSupabaseQuery<BlogPost[]>(
    async () => {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .eq('is_recommended', true)
        .order('published_at', { ascending: false })
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      return query
    },
    [limit],
    {
      defaultValue: [],
      errorMessage: '추천 블로그 포스트를 불러오는데 실패했습니다.'
    }
  )
}

/**
 * 최신 블로그 포스트들을 가져오는 훅
 */
export const useLatestBlogPosts = (limit: number = 5) => {
  return useSupabaseQuery<BlogPost[]>(
    async () => {
      return supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)
    },
    [limit],
    {
      defaultValue: [],
      errorMessage: '최신 블로그 포스트를 불러오는데 실패했습니다.'
    }
  )
}
