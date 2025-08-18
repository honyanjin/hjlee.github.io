import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Trash2, Copy, Image as ImageIcon, RefreshCw, Search, Folder, ArrowRightLeft, XCircle } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { supabase } from '../lib/supabase'
import { listFiles, uploadFile, removeFile, moveFile, copyFile, getPublicUrl, isImage, createSignedUrl, sanitizeFileName, sanitizePrefix, type StorageFileItem } from '../lib/storage'

const DEFAULT_BUCKETS = ['blog-images', 'project-images'] as const
const PUBLIC_READ_BUCKETS = ['blog-images', 'project-images'] as const

const AdminStorage = () => {
  const [buckets, setBuckets] = useState<string[]>([...DEFAULT_BUCKETS])
  const [activeBucket, setActiveBucket] = useState<string>(DEFAULT_BUCKETS[0])
  const [prefix, setPrefix] = useState<string>('')
  const [files, setFiles] = useState<StorageFileItem[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isListing, setIsListing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [searchText, setSearchText] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)
  const [signedUrlSeconds, setSignedUrlSeconds] = useState<number>(60 * 5)
  const [typeFilter, setTypeFilter] = useState<'all'|'image'|'other'>('all')
  const [destBucket, setDestBucket] = useState<string>(DEFAULT_BUCKETS[0])
  const [destPrefix, setDestPrefix] = useState<string>('')
  const [isMoving, setIsMoving] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const [dimensionsMap, setDimensionsMap] = useState<Record<string, { w: number; h: number }>>({})
  const [usageCountMap, setUsageCountMap] = useState<Record<string, number>>({})
  const [sortKey, setSortKey] = useState<'created'|'name'|'size'|'usage'>('created')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc')

  const PAGE_SIZE = 50
  const isPublicReadBucket = PUBLIC_READ_BUCKETS.includes(activeBucket as any)

  const handleSelectAll = () => {
    if (filteredFiles.length === 0) return
    if (selected.size === filteredFiles.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredFiles.map(f => f.name)))
    }
  }

  // 상위 이동 옵션 제거됨

  // 현재 prefix 내 하위 폴더 목록(드롭다운용)
  const currentFolders = useMemo(() => {
    const dirs = files
      .filter(f => (f as any)?.metadata == null)
      .map(f => f.name.replace(/\/$/, ''))
    return Array.from(new Set(dirs)).sort((a, b) => a.localeCompare(b))
  }, [files])

  // 대상 프리픽스 드롭다운 옵션(루트/현재/하위 폴더 전체 경로)
  const destFolderOptions = useMemo(() => {
    const base = (prefix || '').replace(/\/$/, '')
    const fulls = currentFolders.map((d) => (base ? `${base}/${d}` : d))
    return Array.from(new Set(fulls))
  }, [currentFolders, prefix])

  useEffect(() => {
    // Optionally, attempt to list all buckets via REST (requires elevated key). For now, keep defaults.
    fetchFiles(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBucket, prefix])

  const fetchFiles = async (reset = false) => {
    try {
      setIsListing(true)
      setError('')
      const nextPage = reset ? 0 : page
      const data = await listFiles(activeBucket, {
        prefix,
        limit: PAGE_SIZE,
        offset: nextPage * PAGE_SIZE,
        sortBy: { column: 'name', order: 'desc' }
      })
      setFiles(prev => (reset ? data : [...prev, ...data]))
      setHasMore((data?.length || 0) === PAGE_SIZE)
      setPage(reset ? 1 : nextPage + 1)
    } catch (e: any) {
      setError(e.message || '파일을 불러오지 못했습니다.')
    } finally {
      setIsListing(false)
    }
  }

  const formatBytes = (bytes?: number) => {
    if (!bytes && bytes !== 0) return '—'
    const sizes = ['B', 'KB', 'MB', 'GB']
    let i = 0
    let v = bytes
    while (v >= 1024 && i < sizes.length - 1) { v /= 1024; i++ }
    return `${v.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`
  }

  const ensureImageDimensions = (path: string, url: string) => {
    if (dimensionsMap[path]) return
    const img = new Image()
    img.onload = () => {
      setDimensionsMap(prev => ({ ...prev, [path]: { w: img.naturalWidth, h: img.naturalHeight } }))
    }
    img.onerror = () => {
      setDimensionsMap(prev => ({ ...prev, [path]: { w: 0, h: 0 } }))
    }
    img.src = url
  }

  const fetchUsageCount = async (url: string) => {
    try {
      const { count: c1 } = await supabase
        .from('blog_posts')
        .select('id', { count: 'exact', head: true })
        .eq('image_url', url)
      const { count: c2 } = await supabase
        .from('blog_posts')
        .select('id', { count: 'exact', head: true })
        .ilike('content', `%${url}%`)
      return (c1 || 0) + (c2 || 0)
    } catch {
      return 0
    }
  }

  // NOTE: moved below after filteredFiles declaration to avoid temporal dead zone

  const handleUpload = async (file: File) => {
    // 용량/타입 검증: 10MB 이하, 일반 이미지/문서/텍스트
    const MAX = 10 * 1024 * 1024
    if (file.size > MAX) {
      setError('파일 크기는 10MB 이하여야 합니다.')
      return
    }
    const allowed = [
      'image/', 'text/plain', 'application/pdf', 'application/json',
      'application/zip', 'application/x-zip-compressed'
    ]
    if (!allowed.some((p) => file.type.startsWith(p))) {
      setError('허용되지 않는 파일 형식입니다.')
      return
    }
    if (!file) return
    try {
      setIsUploading(true)
      setError('')
      await uploadFile(activeBucket, file, prefix)
      await fetchFiles(true)
    } catch (e: any) {
      setError(e.message || '업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSelect = (path: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return
    if (!confirm(`선택한 ${selected.size}개 파일을 삭제하시겠습니까?`)) return
    try {
      setError('')
      for (const path of selected) {
        await removeFile(activeBucket, path)
      }
      setSelected(new Set())
      await fetchFiles(true)
    } catch (e: any) {
      setError(e.message || '삭제에 실패했습니다.')
    }
  }

  const clearSelection = () => setSelected(new Set())

  const handleMoveSelected = async () => {
    if (selected.size === 0) return
    if (destBucket !== activeBucket) {
      setError('서로 다른 버킷 간 이동은 현재 UI에서 지원되지 않습니다. 동일 버킷 내에서 이동해 주세요.')
      return
    }
    const safeDest = sanitizePrefix(destPrefix)
    try {
      setIsMoving(true)
      setError('')
      setNotice('파일 이동 중...')
      let done = 0
      for (const path of selected) {
        const name = path.split('/').pop() || path
        const to = safeDest ? `${safeDest}/${name}` : name
        if (to === path) { done++; continue }
        await moveFile(activeBucket, path, to)
        done++
        setNotice(`${done}/${selected.size} 이동 완료`)
      }
      setNotice('이동 완료')
      clearSelection()
      await fetchFiles(true)
    } catch (e: any) {
      setError(e.message || '이동에 실패했습니다.')
    } finally {
      setIsMoving(false)
      setTimeout(() => setNotice(''), 1500)
    }
  }

  const handleCopySelected = async () => {
    if (selected.size === 0) return
    if (destBucket !== activeBucket) {
      setError('서로 다른 버킷 간 복사는 현재 UI에서 지원되지 않습니다. 동일 버킷 내에서 복사해 주세요.')
      return
    }
    const safeDest = sanitizePrefix(destPrefix)
    try {
      setIsCopying(true)
      setError('')
      setNotice('파일 복사 중...')
      let done = 0
      for (const path of selected) {
        const name = path.split('/').pop() || path
        const to = safeDest ? `${safeDest}/${name}` : name
        await copyFile(activeBucket, path, to)
        done++
        setNotice(`${done}/${selected.size} 복사 완료`)
      }
      setNotice('복사 완료')
      clearSelection()
      await fetchFiles(true)
    } catch (e: any) {
      setError(e.message || '복사에 실패했습니다.')
    } finally {
      setIsCopying(false)
      setTimeout(() => setNotice(''), 1500)
    }
  }

  const handleRenameSelected = async () => {
    if (selected.size !== 1) return
    const only = [...selected][0]
    const currentName = only.split('/').pop() || only
    const input = prompt('새 파일명을 입력하세요(확장자 포함):', currentName)
    if (!input) return
    const safe = sanitizeFileName(input)
    const dir = only.includes('/') ? only.slice(0, only.lastIndexOf('/')) : ''
    const dest = dir ? `${dir}/${safe}` : safe
    if (dest === only) return
    try {
      setIsRenaming(true)
      setError('')
      setNotice('이름 변경 중...')
      const oldUrl = getPublicUrl(activeBucket, only)
      await moveFile(activeBucket, only, dest)
      const newUrl = getPublicUrl(activeBucket, dest)
      setNotice('이름 변경 완료 - 참조 업데이트 중...')
      // 참조도 함께 업데이트(기본)
      await updateReferences(oldUrl, newUrl)
      setNotice('이름 변경 및 참조 업데이트 완료')
      clearSelection()
      await fetchFiles(true)
    } catch (e: any) {
      setError(e.message || '이름 변경에 실패했습니다.')
    } finally {
      setIsRenaming(false)
      setTimeout(() => setNotice(''), 1500)
    }
  }

  const handleRenameSingle = async (path: string) => {
    const currentName = path.split('/').pop() || path
    const input = prompt('새 파일명을 입력하세요(확장자 포함):', currentName)
    if (!input) return
    const safe = sanitizeFileName(input)
    const dir = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : ''
    const dest = dir ? `${dir}/${safe}` : safe
    if (dest === path) return
    try {
      setIsRenaming(true)
      setError('')
      setNotice('이름 변경 중...')
      const oldUrl = getPublicUrl(activeBucket, path)
      await moveFile(activeBucket, path, dest)
      const newUrl = getPublicUrl(activeBucket, dest)
      setNotice('이름 변경 완료 - 참조 업데이트 중...')
      await updateReferences(oldUrl, newUrl)
      setNotice('이름 변경 및 참조 업데이트 완료')
      await fetchFiles(true)
    } catch (e: any) {
      setError(e.message || '이름 변경에 실패했습니다.')
    } finally {
      setIsRenaming(false)
      setTimeout(() => setNotice(''), 1500)
    }
  }

  const updateReferences = async (oldUrl: string, newUrl: string) => {
    try {
      // 1) blog_posts.image_url
      await supabase
        .from('blog_posts')
        .update({ image_url: newUrl })
        .eq('image_url', oldUrl)

      // 2) projects.image_url
      await supabase
        .from('projects')
        .update({ image_url: newUrl })
        .eq('image_url', oldUrl)

      // 3) blog_posts.content 내 문자열 치환(클라이언트에서 안전하게 업데이트)
      const { data: postsToFix } = await supabase
        .from('blog_posts')
        .select('id, content')
        .ilike('content', `%${oldUrl}%`)

      if (postsToFix && postsToFix.length > 0) {
        let done = 0
        for (const post of postsToFix as Array<{ id: string; content: string }>) {
          const replaced = (post.content || '').split(oldUrl).join(newUrl)
          if (replaced !== post.content) {
            await supabase
              .from('blog_posts')
              .update({ content: replaced })
              .eq('id', post.id)
            done++
            setNotice(`본문 참조 업데이트 중... ${done}/${postsToFix.length}`)
          }
        }
      }
    } catch (e) {
      // 실패해도 UI는 계속 진행, 에러 메시지만 표기
      setError('참조 업데이트 중 일부 실패가 발생했습니다. 상세 로그는 콘솔을 참고하세요.')
      // eslint-disable-next-line no-console
      console.error('updateReferences failed:', e)
    }
  }

  const filteredFiles = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    // 1) 폴더/숨김/플레이스홀더/0바이트 제거(실파일만 표시)
    let result = files.filter(f => {
      const size = f.metadata?.size
      const base = (f.name.split('/').pop() || f.name).toLowerCase()
      const hidden = base.startsWith('.') || base.includes('emptyfolderplaceholder')
      return size != null && size > 0 && !hidden
    })
    if (q) result = result.filter(f => f.name.toLowerCase().includes(q))
    if (typeFilter === 'image') result = result.filter(f => isImage(f.name))
    if (typeFilter === 'other') result = result.filter(f => !isImage(f.name))
    // 정렬
    const key = sortKey
    const dir = sortDir === 'asc' ? 1 : -1
    const toSize = (f: typeof result[number]) => (f.metadata?.size ?? -1)
    const toCreated = (f: typeof result[number]) => (f.created_at ? new Date(f.created_at).getTime() : 0)
    const toUsage = (f: typeof result[number]) => (usageCountMap[f.name] ?? -1)
    result = [...result].sort((a, b) => {
      let av = 0, bv = 0
      if (key === 'name') { av = a.name.localeCompare(b.name); bv = 0 } 
      else if (key === 'size') { av = toSize(a); bv = toSize(b) } 
      else if (key === 'usage') { av = toUsage(a); bv = toUsage(b) } 
      else { av = toCreated(a); bv = toCreated(b) }
      if (key === 'name') return av * dir
      return (av - bv) * dir
    })
    return result
  }, [files, searchText, typeFilter, sortKey, sortDir, usageCountMap])

  // lazy compute dimensions and usage counts for currently visible items
  useEffect(() => {
    filteredFiles.forEach(f => {
      const url = f.publicUrl || getPublicUrl(activeBucket, f.name)
      if (isImage(f.name)) ensureImageDimensions(f.name, url)
      if (usageCountMap[f.name] == null) {
        fetchUsageCount(url).then(cnt => {
          setUsageCountMap(prev => ({ ...prev, [f.name]: cnt }))
        })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredFiles])

  const onGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (filteredFiles.length === 0) return
    const cols = 5
    let idx = focusedIndex
    switch (e.key) {
      case 'ArrowRight': idx = Math.min((idx < 0 ? 0 : idx) + 1, filteredFiles.length - 1); break
      case 'ArrowLeft': idx = Math.max((idx < 0 ? 0 : idx) - 1, 0); break
      case 'ArrowDown': idx = Math.min((idx < 0 ? 0 : idx) + cols, filteredFiles.length - 1); break
      case 'ArrowUp': idx = Math.max((idx < 0 ? 0 : idx) - cols, 0); break
      case ' ':
      case 'Spacebar':
        if (idx >= 0) {
          e.preventDefault()
          handleSelect(filteredFiles[idx].name)
        }
        return
      case 'Enter':
        if (idx >= 0) {
          const f = filteredFiles[idx]
          window.open(f.publicUrl || getPublicUrl(activeBucket, f.name), '_blank')
        }
        return
      default:
        return
    }
    e.preventDefault()
    setFocusedIndex(idx)
    const el = document.querySelector(`[data-file-index="${idx}"]`) as HTMLElement | null
    el?.focus()
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            스토리지 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Supabase Storage 버킷의 파일들을 관리합니다.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Top row: left bucket/prefix, right search/filter */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={activeBucket}
                onChange={(e) => { setActiveBucket(e.target.value); setPage(0); setFiles([]); setSelected(new Set()); }}
                className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {buckets.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {/* 폴더 드롭다운 */}
              <select
                value={prefix}
                onChange={(e)=> setPrefix(e.target.value)}
                className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white w-56"
                aria-label="폴더 선택"
              >
                <option value="">/ (루트)</option>
                {prefix && (
                  <option value={prefix}>{`${prefix.replace(/\/+$/, '')}/ (현재)`}</option>
                )}
                {/* 상위(../) 옵션 제거 */}
                {currentFolders.map(dir => (
                  <option key={dir} value={dir+"/"}>{dir}/</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => fetchFiles(true)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <RefreshCw size={16} /> 새로고침
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="파일명 검색"
                  className="pl-8 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white w-60"
                  aria-label="파일명 검색"
                />
              </div>
              <select value={typeFilter} onChange={(e)=>setTypeFilter(e.target.value as any)} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" aria-label="유형 필터">
                <option value="all">전체</option>
                <option value="image">이미지</option>
                <option value="other">기타</option>
              </select>
            </div>
          </div>

          {/* Bottom row: upload/delete/clear selection + move/copy */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="file"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || [])
                  for (const f of files) await handleUpload(f)
                  if (inputRef.current) inputRef.current.value = ''
                }}
                className="hidden"
                accept="*/*"
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                aria-label="파일 업로드"
              >
                <Upload size={16} /> {isUploading ? '업로드 중...' : '새 이미지'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:inline">선택 항목 관리</span>
              <select value={destBucket} onChange={(e)=>setDestBucket(e.target.value)} disabled={selected.size===0} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed" aria-label="대상 버킷" title={selected.size===0 ? '항목을 선택하면 활성화됩니다' : undefined}>
                {buckets.map(b => (<option key={b} value={b}>{b}</option>))}
              </select>
              <select value={destPrefix} onChange={(e)=>setDestPrefix(e.target.value)} disabled={selected.size===0} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white w-56 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="대상 프리픽스" title={selected.size===0 ? '항목을 선택하면 활성화됩니다' : undefined}>
                <option value="">/ (루트)</option>
                {prefix && <option value={prefix}>{`${prefix.replace(/\/+$/, '')}/ (현재)`}</option>}
                {destFolderOptions.map(full => (
                  <option key={full} value={full+"/"}>{full}/</option>
                ))}
              </select>
              <button type="button" onClick={handleMoveSelected} disabled={selected.size===0 || isMoving} className="inline-flex items-center gap-2 bg-amber-600 text-white px-3 py-2 rounded-md hover:bg-amber-700 disabled:opacity-50" aria-label="이동">
                <ArrowRightLeft size={16} /> {isMoving ? '이동 중...' : '이동'}
              </button>
              <button type="button" onClick={handleCopySelected} disabled={selected.size===0 || isCopying} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50" aria-label="복사">
                <Copy size={16} /> {isCopying ? '복사 중...' : '복사'}
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={selected.size === 0}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                aria-label="삭제"
              >
                <Trash2 size={16} /> 삭제
              </button>
              <button type="button" onClick={()=>setSelected(new Set())} disabled={selected.size===0} className="inline-flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50" aria-label="선택 해제">
                <XCircle size={16} /> 선택 해제
              </button>
            </div>
          </div>
        </div>

        {/* Error and Notice Messages */}
        {(error || notice) && (
          <div aria-live="polite" className="mb-4 space-y-2">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">{error}</div>
            )}
            {notice && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-md">{notice}</div>
            )}
          </div>
        )}

        {/* File List */}
        <div className="min-h-[200px]">
          {isListing && files.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              불러오는 중...
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              파일이 없습니다.
            </div>
          ) : (
            <div className="overflow-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="w-12 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                      <input type="checkbox" aria-label="전체 선택" checked={filteredFiles.length>0 && selected.size===filteredFiles.length} onChange={handleSelectAll} className="h-4 w-4" />
                    </th>
                    <th className="w-28 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">미리보기</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 cursor-pointer select-none" onClick={()=>{setSortKey('name'); setSortDir(d=>d==='asc'?'desc':'asc')}}>
                      파일명 {sortKey==='name' ? (sortDir==='asc'?'▲':'▼') : ''}
                    </th>
                    <th className="w-28 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">이미지 크기</th>
                    <th className="w-24 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 cursor-pointer select-none" onClick={()=>{setSortKey('size'); setSortDir(d=>d==='asc'?'desc':'asc')}}>
                      파일 크기 {sortKey==='size' ? (sortDir==='asc'?'▲':'▼') : ''}
                    </th>
                    <th className="w-40 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 cursor-pointer select-none" onClick={()=>{setSortKey('created'); setSortDir(d=>d==='asc'?'desc':'asc')}}>
                      업로드일자 {sortKey==='created' ? (sortDir==='asc'?'▲':'▼') : ''}
                    </th>
                    <th className="w-28 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 cursor-pointer select-none" onClick={()=>{setSortKey('usage'); setSortDir(d=>d==='asc'?'desc':'asc')}}>
                      사용 {sortKey==='usage' ? (sortDir==='asc'?'▲':'▼') : ''}
                    </th>
                    <th className="w-32 px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {filteredFiles.map((file) => {
                    const url = file.publicUrl || getPublicUrl(activeBucket, file.name)
                    const dims = dimensionsMap[file.name]
                    const usage = usageCountMap[file.name]
                    return (
                      <tr key={file.name} className={selected.has(file.name) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                        <td className="px-3 py-2 align-middle">
                          <input
                            type="checkbox"
                            checked={selected.has(file.name)}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleSelect(file.name)
                            }}
                            aria-label="선택"
                            className="h-4 w-4"
                          />
                        </td>
                        <td className="px-3 py-2">
                          {isImage(file.name) ? (
                            <img src={url} alt={file.name} className="w-20 h-20 object-cover rounded" loading="lazy" />
                          ) : (
                            <div className="w-20 h-20 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><ImageIcon size={20} className="text-gray-500" /></div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm text-gray-900 dark:text-gray-100 break-all">{file.name}</div>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                          {isImage(file.name) ? (dims ? `${dims.w}×${dims.h}` : '측정 중...') : '—'}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{formatBytes(file.metadata?.size)}</td>
                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{file.created_at ? new Date(file.created_at).toLocaleString() : '—'}</td>
                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{usage != null ? usage : '집계 중...'}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col items-stretch gap-2 w-32">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full text-center px-2 py-1 text-xs rounded bg-teal-500 hover:bg-indigo-900 text-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              보기
                            </a>
                            <button
                              type="button"
                              className="w-full text-center px-2 py-1 text-xs rounded bg-teal-600 hover:bg-indigo-900 text-white"
                              onClick={(e) => { e.stopPropagation(); handleRenameSingle(file.name) }}
                              title="이름 변경"
                            >
                              이름변경
                            </button>
                            <button
                              type="button"
                              className="w-full text-center px-2 py-1 text-xs rounded bg-teal-700 hover:bg-indigo-900 text-white"
                              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(url) }}
                              title="URL 복사"
                            >
                              URL 복사
                            </button>
                            {!isPublicReadBucket && (
                              <button
                                type="button"
                                className="w-full text-center px-2 py-1 text-xs rounded bg-teal-800 hover:bg-indigo-900 text-white"
                                onClick={async (e) => { e.stopPropagation(); const s = await createSignedUrl(activeBucket, file.name, signedUrlSeconds); await navigator.clipboard.writeText(s) }}
                                title="서명 URL 복사"
                              >
                                서명 URL
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {hasMore && (
          <div className="flex justify-center pt-4">
            <button
              type="button"
              disabled={isListing}
              onClick={() => fetchFiles(false)}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              {isListing ? '불러오는 중...' : '더 보기'}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminStorage


