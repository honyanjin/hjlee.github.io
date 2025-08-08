import { createClient } from '@supabase/supabase-js'

// 환경 변수 로딩 개선
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 환경 변수 검증 (단일 체크, 구체적 메시지)
if (!supabaseUrl || !supabaseAnonKey) {
  const missing: string[] = []
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL')
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY')
  throw new Error(`Supabase 환경 변수 누락: ${missing.join(', ')} (.env.local 설정을 확인하세요)`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 연결 테스트 함수
export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabase
      .from('projects')
      .select('count')
      .limit(1)
    
    if (error) {
      return false
    }
    
    return true
  } catch (err) {
    return false
  }
}

// 데이터베이스 스키마 타입 정의
export interface BlogPost {
  id: string
  post_no: number
  title: string
  content: string
  excerpt: string
  author: string
  category: string
  tags: string[]
  image_url?: string
  slug: string
  is_published: boolean
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface BlogPostInsert {
  post_no?: number
  title: string
  content: string
  excerpt: string
  author: string
  category: string
  tags: string[]
  image_url?: string
  slug: string
  is_published: boolean
  published_at?: string | null
}

export interface BlogPostUpdate {
  post_no?: number
  title?: string
  content?: string
  excerpt?: string
  author?: string
  category?: string
  tags?: string[]
  image_url?: string
  slug?: string
  is_published?: boolean
  published_at?: string | null
}

export interface Comment {
  id: string
  post_id: string
  author_name: string
  author_email: string
  content: string
  created_at: string
}

export interface CommentInsert {
  post_id: string
  author_name: string
  author_email: string
  content: string
}

export interface CommentLimit {
  id: string
  post_id: string
  daily_count: number
  is_blocked: boolean
  blocked_until: string | null
  last_reset_date: string
}

export interface CommentLimitInsert {
  post_id: string
  daily_count: number
  is_blocked: boolean
  blocked_until?: string | null
  last_reset_date: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  icon?: string
  created_at: string
  updated_at: string
}

export interface CategoryInsert {
  name: string
  slug: string
  description?: string
  color: string
  icon?: string
}

export interface CategoryUpdate {
  name?: string
  slug?: string
  description?: string
  color?: string
  icon?: string
}

export interface ProjectCategory {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  icon?: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ProjectCategoryInsert {
  name: string
  slug: string
  description?: string
  color: string
  icon?: string
  sort_order?: number
}

export interface ProjectCategoryUpdate {
  name?: string
  slug?: string
  description?: string
  color?: string
  icon?: string
  sort_order?: number
}

export interface Project {
  id: string
  title: string
  description: string
  category_id?: string
  category: string
  image_url?: string
  tags: string[]
  live_url?: string
  github_url?: string
  featured: boolean
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface ProjectInsert {
  title: string
  description: string
  category_id?: string
  category: string
  image_url?: string
  tags: string[]
  live_url?: string
  github_url?: string
  featured?: boolean
  sort_order?: number
  is_published?: boolean
}

export interface ProjectUpdate {
  title?: string
  description?: string
  category_id?: string
  category?: string
  image_url?: string
  tags?: string[]
  live_url?: string
  github_url?: string
  featured?: boolean
  sort_order?: number
  is_published?: boolean
}

export interface Database {
  public: {
    Tables: {
      blog_posts: {
        Row: BlogPost
        Insert: BlogPostInsert
        Update: BlogPostUpdate
      }
      comments: {
        Row: Comment
        Insert: CommentInsert
        Update: Comment
      }
      comment_limits: {
        Row: CommentLimit
        Insert: CommentLimitInsert
        Update: CommentLimit
      }
      categories: {
        Row: Category
        Insert: CategoryInsert
        Update: CategoryUpdate
      }
      project_categories: {
        Row: ProjectCategory
        Insert: ProjectCategoryInsert
        Update: ProjectCategoryUpdate
      }
      projects: {
        Row: Project
        Insert: ProjectInsert
        Update: ProjectUpdate
      }
    }
  }
} 