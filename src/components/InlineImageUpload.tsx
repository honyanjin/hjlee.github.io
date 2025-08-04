import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface InlineImageUploadProps {
  onImageInsert: (markdownLink: string) => void
  className?: string
}

const InlineImageUpload = ({ onImageInsert, className = '' }: InlineImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const [showUploadArea, setShowUploadArea] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

      // 파일명 생성 (중복 방지)
      const fileExt = file.name.split('.').pop()
      const fileName = `inline-${Date.now()}.${fileExt}`

      // Supabase Storage에 업로드
      const { error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // 공개 URL 생성
      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName)

      // 마크다운 링크 생성
      const markdownLink = `![${file.name}](${urlData.publicUrl})`
      
      // 에디터에 삽입
      onImageInsert(markdownLink)
      
      // 업로드 영역 숨기기
      setShowUploadArea(false)
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

    const files = e.dataTransfer.files
    if (files && files[0]) {
      uploadImage(files[0])
    }
  }

  const handleButtonClick = () => {
    setShowUploadArea(!showUploadArea)
    setError('')
  }

  return (
    <div className={`relative ${className}`}>
      {/* 이미지 삽입 버튼 */}
      <button
        type="button"
        onClick={handleButtonClick}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors"
        title="이미지 삽입"
      >
        <ImageIcon size={16} />
        이미지 삽입
      </button>

      {/* 업로드 영역 */}
      {showUploadArea && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                이미지 업로드
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadArea(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded">
                {error}
              </div>
            )}

            {/* 드래그 앤 드롭 영역 */}
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  업로드 중...
                </div>
              ) : (
                <div>
                  <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    이미지를 드래그하거나 클릭하여 업로드
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    파일 선택
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              <p>• 지원 형식: JPG, PNG, GIF, WebP</p>
              <p>• 최대 크기: 5MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InlineImageUpload 