import { useEffect, useMemo, useRef, useState } from 'react'
import { Upload, X, Loader2, Image as ImageIcon, RefreshCw, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'

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

  // 버킷 라이브러리 상태
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [isListing, setIsListing] = useState(false)
  const [libraryError, setLibraryError] = useState('')
  const [files, setFiles] = useState<{ name: string; url: string }[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [searchText, setSearchText] = useState('')
  const PAGE_SIZE = 40

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
      const fileName = `${Date.now()}.${fileExt}`

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

  // 라이브러리(버킷) 목록 불러오기
  const fetchImages = async (reset = false) => {
    setIsListing(true)
    setLibraryError('')
    try {
      const nextPage = reset ? 0 : page
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('', {
          limit: PAGE_SIZE,
          offset: nextPage * PAGE_SIZE,
          sortBy: { column: 'name', order: 'desc' as const }
        })

      if (error) throw error

      const mapped = (data || []).map((item: any) => {
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(item.name)
        return { name: item.name as string, url: urlData.publicUrl as string }
      })

      setFiles(prev => (reset ? mapped : [...prev, ...mapped]))
      setHasMore((data?.length || 0) === PAGE_SIZE)
      setPage(reset ? 1 : nextPage + 1)
    } catch (err: any) {
      setLibraryError(err.message || '이미지 목록을 불러오지 못했습니다.')
    } finally {
      setIsListing(false)
    }
  }

  const openLibrary = () => {
    setIsLibraryOpen(true)
  }

  useEffect(() => {
    if (isLibraryOpen && files.length === 0) {
      fetchImages(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLibraryOpen])

  const filteredFiles = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    if (!q) return files
    return files.filter(f => f.name.toLowerCase().includes(q))
  }, [files, searchText])

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

      {/* 라이브러리 모달 */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsLibraryOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">버킷에서 이미지 선택 ({bucketName})</h3>
                </div>
                <button
                  onClick={() => setIsLibraryOpen(false)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* 도구 막대 */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="relative w-full sm:max-w-xs">
                    <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="파일명 검색"
                      className="w-full pl-8 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setFiles([]); setPage(0); fetchImages(true) }}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <RefreshCw size={16} /> 새로고침
                    </button>
                  </div>
                </div>

                {libraryError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
                    {libraryError}
                  </div>
                )}

                {/* 그리드 */}
                <div className="min-h-[200px]">
                  {isListing && files.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" /> 불러오는 중...
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      이미지가 없습니다.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {filteredFiles.map((file) => (
                        <button
                          key={file.name}
                          type="button"
                          onClick={() => {
                            onImageUpload(file.url)
                            setIsLibraryOpen(false)
                          }}
                          className="group relative border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden hover:ring-2 hover:ring-blue-500"
                          title={file.name}
                        >
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-28 object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                            <p className="text-[10px] text-white truncate">{file.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 더 보기 */}
                {hasMore && (
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      disabled={isListing}
                      onClick={() => fetchImages(false)}
                      className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      {isListing ? '불러오는 중...' : '더 보기'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUpload 