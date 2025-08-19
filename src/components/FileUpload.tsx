import { useEffect, useRef, useState } from 'react'
import { Upload, X, Loader2, FileText, Download } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface FileUploadProps {
  onFileUpload: (url: string) => void
  currentFile?: string | null
  className?: string
  bucketName?: string
  acceptedTypes?: string[]
  maxSize?: number // MB 단위
}

const FileUpload = ({ 
  onFileUpload, 
  currentFile, 
  className = '',
  bucketName = 'resume-files',
  acceptedTypes = ['.pdf', '.doc', '.docx', '.hwp', '.zip'],
  maxSize = 10 // 10MB
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    if (!file) return

    // 파일 크기 체크
    if (file.size > maxSize * 1024 * 1024) {
      setError(`파일 크기는 ${maxSize}MB 이하여야 합니다.`)
      return
    }

    // 파일 타입 체크
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.includes(fileExtension)) {
      setError(`지원하지 않는 파일 형식입니다. 지원 형식: ${acceptedTypes.join(', ')}`)
      return
    }

    try {
      setIsUploading(true)
      setError('')

      // 파일명 생성 (중복 방지 + 정규화)
      const fileExt = fileExtension
      const base = (file.name.split('.').slice(0, -1).join('.') || 'file')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'file'
      const fileName = `${base}-${Date.now().toString(36)}${fileExt}`

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

      onFileUpload(urlData.publicUrl)
    } catch (err: any) {
      setError(err.message || '파일 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadFile(file)
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
      uploadFile(file)
    }
  }

  const removeFile = () => {
    onFileUpload('')
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      case 'hwp':
        return '📋'
      case 'zip':
        return '📦'
      default:
        return '📎'
    }
  }

  const getFileName = (url: string) => {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      return pathParts[pathParts.length - 1] || '파일'
    } catch {
      return '파일'
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {currentFile ? (
        <div className="space-y-3">
          <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getFileIcon(currentFile)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {getFileName(currentFile)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  문서 파일
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={currentFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  title="파일 다운로드"
                >
                  <Download size={16} />
                </a>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  title="파일 제거"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
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
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">파일 업로드 중...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  파일을 드래그하여 업로드하거나
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  파일 선택
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                지원 형식: {acceptedTypes.join(', ')} (최대 {maxSize}MB)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FileUpload
