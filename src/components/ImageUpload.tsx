import { useEffect, useMemo, useRef, useState } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useImageLibrary } from '../contexts/ImageLibraryContext'

interface ImageUploadProps {
  onImageUpload: (url: string) => void
  currentImage?: string
  className?: string
  bucketName?: 'blog-images' | 'project-images'
}

const ImageUpload = ({ 
  onImageUpload, 
  currentImage, 
  className = '',
  bucketName = 'blog-images'
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 이미지 라이브러리 모달 상태
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)

  const uploadImage = async (file: File) => {
    if (!file) return

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.')
      return
    }

    try {
      setIsUploading(true)
      setError('')

      // 파일명 생성 (중복 방지 + 정규화)
      const fileExt = (file.name.split('.').pop() || 'png').toLowerCase()
      const base = (file.name.split('.').slice(0, -1).join('.') || 'image')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'image'
      const fileName = `${base}-${Date.now().toString(36)}.${fileExt}`

      // Supabase Storage에 업로드
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // 공개 URL 생성
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName)

      onImageUpload(urlData.publicUrl)
    } catch (err: any) {
      setError(err.message || '이미지 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadImage(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      uploadImage(file)
    }
  }

  const removeImage = () => {
    onImageUpload('')
  }

  // 권장 크기 메시지
  const getRecommendedSize = () => {
    if (bucketName === 'project-images') {
      return '💡 권장: 1200×630px (19:10 비율) - 프로젝트 썸네일용'
    }
    return '💡 권장: 896×384px (7:3 비율) - 블로그 헤더용'
  }

  const { open } = useImageLibrary()
  const openLibrary = async () => {
    const url = await open({ bucket: bucketName })
    if (url) onImageUpload(url)
  }

  // 이미지 라이브러리 모달로 대체되어 내부 목록/검색 로직 제거

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {currentImage ? (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={currentImage}
              alt="업로드된 이미지"
              className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
            >
              <X size={16} />
            </button>
            <button
              type="button"
              onClick={openLibrary}
              className="absolute top-2 left-2 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-md shadow hover:bg-white dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
            >
              <ImageIcon size={14} />
              라이브러리에서 선택
            </button>
          </div>
          <div className="text-center">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              {getRecommendedSize()}
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">이미지 업로드 중...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  이미지를 드래그하여 업로드하거나
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    파일 선택
                  </button>
                  <span className="text-gray-400">/</span>
                  <button
                    type="button"
                    onClick={openLibrary}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    <ImageIcon size={16} /> 라이브러리에서 선택
                  </button>
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF 최대 5MB
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {getRecommendedSize()}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 공용 ImageLibraryModal은 Provider로 전역에서 관리 */}
    </div>
  )
}

export default ImageUpload 