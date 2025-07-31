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
  category: string
  author: string
  published_at: string | null
  created_at: string
  updated_at: string
  tags: string[]
  image_url?: string
  is_published: boolean
}

export type BlogPostInsert = Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>
export type BlogPostUpdate = Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>

export interface Database {
  public: {
    Tables: {
      blog_posts: {
        Row: BlogPost
        Insert: BlogPostInsert
        Update: BlogPostUpdate
      }
    }
  }
} 