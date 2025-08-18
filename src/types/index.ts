// =============================================================================
// 공통 타입 정의 중앙화
// =============================================================================

import type { Project, ProjectCategory, BlogPost, Category } from '../lib/supabase'

// =============================================================================
// 확장된 엔티티 타입들
// =============================================================================

export interface ProjectWithCategory extends Project {
  project_category?: ProjectCategory
}

export interface BlogPostWithCategory extends BlogPost {
  category_info?: Category
}

// =============================================================================
// 페이지 설정 타입들
// =============================================================================

// 공통 Hero 설정 인터페이스
export interface HeroSettings {
  hero_title?: string | null
  hero_description?: string | null
  hero_bg_image_url?: string | null
  hero_cta_label?: string | null
  hero_cta_url?: string | null
}

// About 페이지 설정
export interface AboutPageSettings {
  id: string
  show_about_me: boolean
  show_experience: boolean
  show_education: boolean
  show_skills?: boolean
  updated_at: string
}

export interface AboutMeSettings extends HeroSettings {
  id: string
  display_profile_image: boolean
  name: string | null
  title: string | null
  email: string | null
  phone?: string | null
  location: string | null
  birth_year: number | null
  show_email: boolean
  show_phone?: boolean
  show_location: boolean
  show_birth_year: boolean
  show_resume_button: boolean
  resume_url: string | null
  resume_label: string | null
  hero_subtitle?: string | null
  intro_title: string | null
  intro_content_html: string | null
  profile_image_url: string | null
  side_image_url: string | null
  updated_at: string
}

// Blog 페이지 설정
export interface BlogPageSettings extends HeroSettings {
  id: string
  featured_post_enabled?: boolean
  featured_post_title?: string | null
  featured_post_description?: string | null
  recommended_posts_enabled?: boolean
  recommended_posts_title?: string | null
  recommended_posts_description?: string | null
  updated_at: string
}

// Projects 페이지 설정
export interface ProjectsPageSettings extends HeroSettings {
  id: string
  featured_projects_enabled?: boolean
  featured_projects_title?: string | null
  featured_projects_description?: string | null
  updated_at: string
}

// Contact 페이지 설정
export interface ContactSettings {
  id: string
  show_hero: boolean
  hero_title?: string | null
  hero_description?: string | null
  hero_bg_image_url?: string | null
  hero_cta_label?: string | null
  hero_cta_url?: string | null
  show_form: boolean
  show_info: boolean
  show_socials: boolean
  show_hours: boolean
  success_message: string | null
  updated_at: string
}

// =============================================================================
// 콘텐츠 데이터 타입들
// =============================================================================

export interface Skill {
  id: string
  category: string
  skill_name: string
  proficiency: number
  display_order: number
  category_order?: number
  created_at: string
  updated_at: string
}

export interface Experience {
  id: string
  title: string
  period: string
  company: string
  location?: string | null
  is_current: boolean
  description_html?: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  field_of_study?: string | null
  start_date: string
  end_date?: string | null
  is_current: boolean
  description?: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface ContactInfo {
  id: string
  type: string
  label: string | null
  value: string | null
  link: string | null
  icon: string | null
  display_order: number
}

export interface Social {
  id: string
  name: string
  url: string
  icon: any
  color: string | null
  display_order: number
}

export interface Hour {
  id: string
  label: string
  time: string
  note: string | null
  display_order: number
}

// =============================================================================
// 폼 데이터 타입들
// =============================================================================

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

// =============================================================================
// 컴포넌트 Props 타입들
// =============================================================================

export interface ProjectCardProps {
  project: ProjectWithCategory
  index: number
}

export interface BlogBasicInfoProps {
  categories: Category[]
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export interface BlogPublishSettingsProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  redirectAfterSave: boolean
  setRedirectAfterSave: (value: boolean) => void
  previewDraftInNewTab: boolean
  setPreviewDraftInNewTab: (value: boolean) => void
}

export interface AdminLayoutProps {
  children: React.ReactNode
}

export interface HeroSettingsProps {
  settings: HeroSettings
  onSave: (settings: HeroSettings) => Promise<void>
  loading?: boolean
}

// Admin 페이지별 Props
export interface AboutSettingsProps {
  settings: AboutPageSettings | null
  aboutMe: AboutMeSettings | null
  onSettingsSave: (settings: AboutPageSettings) => Promise<void>
  onAboutMeSave: (aboutMe: AboutMeSettings) => Promise<void>
  loading?: boolean
}

export interface AboutEducationProps {
  educations: Education[]
  onSave: (educations: Education[]) => Promise<void>
  loading?: boolean
}

export interface AboutExperienceProps {
  experiences: Experience[]
  onSave: (experiences: Experience[]) => Promise<void>
  loading?: boolean
}

export interface AboutSkillsProps {
  skills: Skill[]
  onSave: (skills: Skill[]) => Promise<void>
  loading?: boolean
}

export interface AdminBlogFormProps {
  mode: 'new' | 'edit'
}

// =============================================================================
// 유틸리티 타입들
// =============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export interface PaginationOptions {
  page: number
  limit: number
  total?: number
}

export interface FilterOptions {
  category?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// =============================================================================
// 이미지 관련 타입들
// =============================================================================

// constants.ts의 ImageType을 재사용
import type { ImageType } from '../lib/constants'
export type { ImageType }

export interface ImageWithFallbackProps {
  src?: string | null
  alt: string
  className?: string
  defaultType?: ImageType
  fallbackType?: ImageType
  onError?: () => void
  onLoad?: () => void
  id?: string
}

export interface ImageUploadProps {
  onImageUpload: (url: string) => void
  currentImage?: string
  className?: string
  bucketName?: 'blog-images' | 'project-images'
}

// =============================================================================
// 재내보내기
// =============================================================================

// 기본 Supabase 타입들을 재내보내기하여 중앙에서 관리
export type {
  BlogPost,
  BlogPostInsert,
  BlogPostUpdate,
  Comment,
  CommentInsert,
  CommentLimit,
  CommentLimitInsert,
  Category,
  CategoryInsert,
  CategoryUpdate,
  ProjectCategory,
  ProjectCategoryInsert,
  ProjectCategoryUpdate,
  Project,
  ProjectInsert,
  ProjectUpdate,
  PartnerProfile,
  PartnerPage,
  PartnerPageAssignment,
  Database
} from '../lib/supabase'
