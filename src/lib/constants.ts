// 기본 이미지 경로들
export const DEFAULT_IMAGES = {
  PROJECT: '/content/pic_projects/Project_Temp_0.jpg',
  PROFILE: '/content/pic_profile/hjlee_Profile_0.JPG',
  ABOUT_ME: '/content/pic_about_me/hjlee_about_me_0.jpg',
  BLOG: '/content/pic_projects/Project_Temp_1.jpg', // 블로그 기본 이미지
  CATEGORY: '/content/pic_projects/Project_Temp_2.jpg', // 카테고리 기본 이미지
} as const

// 이미지 로드 실패 시 대체 이미지
export const FALLBACK_IMAGES = {
  PROJECT: '/content/pic_projects/Project_Temp_3.jpg',
  PROFILE: '/content/pic_profile/hjlee_Profile_0.JPG',
  ABOUT_ME: '/content/pic_about_me/hjlee_about_me_0.jpg',
  BLOG: '/content/pic_projects/Project_Temp_3.jpg',
  CATEGORY: '/content/pic_projects/Project_Temp_3.jpg',
} as const

// 이미지 타입
export type ImageType = keyof typeof DEFAULT_IMAGES

// 기본 이미지 가져오기 함수
export const getDefaultImage = (type: ImageType, baseUrl?: string): string => {
  const base = baseUrl || import.meta.env.BASE_URL || '/'
  return `${base}${DEFAULT_IMAGES[type].substring(1)}`
}

// 대체 이미지 가져오기 함수
export const getFallbackImage = (type: ImageType, baseUrl?: string): string => {
  const base = baseUrl || import.meta.env.BASE_URL || '/'
  return `${base}${FALLBACK_IMAGES[type].substring(1)}`
} 