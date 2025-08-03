import { createClient } from '@supabase/supabase-js'

// 환경 변수 로딩 개선
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 개발 환경에서만 경고 출력
if (import.meta.env.DEV) {
  console.log('🔧 Supabase 설정 확인:')
  console.log('URL:', supabaseUrl)
  console.log('Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET')
  console.log('모든 환경 변수:', import.meta.env)
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables are not set!')
    console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
    console.error('Please check your .env.local file.')
  } else {
    console.log('✅ Supabase 환경 변수가 정상적으로 설정되었습니다.')
  }
}

// 환경 변수가 없으면 에러 발생
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 연결 테스트 함수
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Supabase 연결 테스트 중...')
    const { error } = await supabase
      .from('projects')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase 연결 실패:', error)
      return false
    }
    
    console.log('✅ Supabase 연결 성공')
    return true
  } catch (err) {
    console.error('❌ Supabase 연결 테스트 실패:', err)
    return false
  }
}

// 데이터베이스 스키마 타입 정의
export interface BlogPost {
  id: string
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