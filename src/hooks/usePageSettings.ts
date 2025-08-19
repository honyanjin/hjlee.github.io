import { supabase } from '../lib/supabase'
import { useSupabaseQuery, useAsyncOperation } from './useSupabaseQuery'
import type { 
  AboutPageSettings, 
  AboutMeSettings, 
  BlogPageSettings, 
  ProjectsPageSettings, 
  ContactSettings,
  Skill,
  Experience,
  Education,
  ContactInfo,
  Social,
  Hour
} from '../types'

/**
 * About 페이지 설정을 가져오는 훅
 */
export const useAboutPageSettings = () => {
  return useSupabaseQuery<AboutPageSettings>(
    async () => {
      return supabase
        .from('about_page_settings')
        .select('*')
        .limit(1)
        .single()
    },
    [],
    {
      errorMessage: 'About 페이지 설정을 불러오는데 실패했습니다.'
    }
  )
}

/**
 * About Me 설정을 가져오는 훅
 */
export const useAboutMeSettings = () => {
  return useSupabaseQuery<AboutMeSettings>(
    async () => {
      return supabase
        .from('about_me_settings')
        .select('*')
        .limit(1)
        .single()
    },
    [],
    {
      errorMessage: 'About Me 설정을 불러오는데 실패했습니다.'
    }
  )
}

/**
 * 스킬 목록을 가져오는 훅
 */
export const useSkills = () => {
  return useSupabaseQuery<Skill[]>(
    async () => {
      return supabase
        .from('about_page_skills')
        .select('*')
        .order('category', { ascending: true })
        .order('category_order', { ascending: true })
    },
    [],
    {
      defaultValue: [],
      errorMessage: '스킬 목록을 불러오는데 실패했습니다.'
    }
  )
}

/**
 * 경력 목록을 가져오는 훅
 */
export const useExperiences = () => {
  return useSupabaseQuery<Experience[]>(
    async () => {
      return supabase
        .from('about_page_experiences')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })
    },
    [],
    {
      defaultValue: [],
      errorMessage: '경력 목록을 불러오는데 실패했습니다.'
    }
  )
}

/**
 * 학력 목록을 가져오는 훅
 */
export const useEducations = () => {
  return useSupabaseQuery<Education[]>(
    async () => {
      return supabase
        .from('about_page_educations')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })
    },
    [],
    {
      defaultValue: [],
      errorMessage: '학력 목록을 불러오는데 실패했습니다.'
    }
  )
}

/**
 * Blog 페이지 설정을 가져오는 훅
 */
export const useBlogPageSettings = () => {
  return useSupabaseQuery<BlogPageSettings>(
    async () => {
      return supabase
        .from('blog_page_settings')
        .select('*')
        .limit(1)
        .single()
    },
    [],
    {
      errorMessage: 'Blog 페이지 설정을 불러오는데 실패했습니다.'
    }
  )
}

/**
 * Projects 페이지 설정을 가져오는 훅
 */
export const useProjectsPageSettings = () => {
  return useSupabaseQuery<ProjectsPageSettings>(
    async () => {
      return supabase
        .from('projects_page_settings')
        .select('*')
        .limit(1)
        .single()
    },
    [],
    {
      errorMessage: 'Projects 페이지 설정을 불러오는데 실패했습니다.'
    }
  )
}

/**
 * Contact 페이지 설정을 가져오는 훅
 */
export const useContactSettings = () => {
  return useSupabaseQuery<ContactSettings>(
    async () => {
      return supabase
        .from('contact_page_settings')
        .select('*')
        .limit(1)
        .single()
    },
    [],
    {
      errorMessage: 'Contact 페이지 설정을 불러오는데 실패했습니다.'
    }
  )
}

/**
 * Contact 정보 목록을 가져오는 훅
 */
export const useContactInfos = () => {
  return useSupabaseQuery<ContactInfo[]>(
    async () => {
      return supabase
        .from('contact_page_infos')
        .select('*')
        .order('display_order', { ascending: true })
    },
    [],
    {
      defaultValue: [],
      errorMessage: '연락처 정보를 불러오는데 실패했습니다.'
    }
  )
}

/**
 * 소셜 링크 목록을 가져오는 훅
 */
export const useSocials = () => {
  return useSupabaseQuery<Social[]>(
    async () => {
      return supabase
        .from('contact_page_socials')
        .select('*')
        .order('display_order', { ascending: true })
    },
    [],
    {
      defaultValue: [],
      errorMessage: '소셜 링크를 불러오는데 실패했습니다.'
    }
  )
}

/**
 * 운영 시간 목록을 가져오는 훅
 */
export const useHours = () => {
  return useSupabaseQuery<Hour[]>(
    async () => {
      return supabase
        .from('contact_page_hours')
        .select('*')
        .order('display_order', { ascending: true })
    },
    [],
    {
      defaultValue: [],
      errorMessage: '운영 시간 정보를 불러오는데 실패했습니다.'
    }
  )
}

/**
 * 페이지 설정 업데이트를 위한 훅
 */
export const useUpdatePageSettings = <T>(tableName: string) => {
  return useAsyncOperation<T, { id: string; data: Partial<T> }>(
    async ({ id, data }) => {
      return supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .single()
    },
    {
      successMessage: '설정이 성공적으로 업데이트되었습니다.',
      errorMessage: '설정 업데이트에 실패했습니다.'
    }
  )
}
