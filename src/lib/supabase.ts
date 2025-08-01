import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// 개발 환경에서만 경고 출력
if (import.meta.env.DEV) {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase environment variables are not set. Please check your .env.local file.')
    console.warn('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    }
  }
} 