import { useEffect, useMemo, useState } from 'react'
import { X, RefreshCw, Search } from 'lucide-react'
import { listFiles, getPublicUrl, isImage, type StorageFileItem } from '../lib/storage'

interface ImageLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
  bucket: 'blog-images' | 'project-images' | 'admin-pic'
}

const PAGE_SIZE = 50

const ImageLibraryModal: React.FC<ImageLibraryModalProps> = ({ isOpen, onClose, onSelect, bucket }) => {
  const [files, setFiles] = useState<StorageFileItem[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isListing, setIsListing] = useState(false)
  const [error, setError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [prefix, setPrefix] = useState('')
  const [sortKey, setSortKey] = useState<'created'|'name'|'size'>('created')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc')

  useEffect(() => {
    if (isOpen) {
      // reset and fetch
      setFiles([])
      setPage(0)
      setHasMore(false)
      setError('')
      void fetchFiles(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, bucket, prefix])

  const fetchFiles = async (reset = false) => {
    try {
      setIsListing(true)
      setError('')
      const nextPage = reset ? 0 : page
      const data = await listFiles(bucket, {
        prefix,
        limit: PAGE_SIZE,
        offset: nextPage * PAGE_SIZE,
        sortBy: { column: 'name', order: 'desc' }
      })
      setFiles(prev => (reset ? data : [...prev, ...data]))
      setHasMore((data?.length || 0) === PAGE_SIZE)
      setPage(reset ? 1 : nextPage + 1)
    } catch (e: any) {
      setError(e.message || '이미지 목록을 불러오지 못했습니다.')
    } finally {
      setIsListing(false)
    }
  }

  const currentFolders = useMemo(() => {
    // listFiles는 파일/폴더를 모두 반환; 폴더는 metadata가 null/undefined
    return Array.from(new Set(
      files.filter(f => (f as any)?.metadata == null).map(f => f.name.replace(/\/$/, ''))
    )).sort((a, b) => a.localeCompare(b))
  }, [files])

  const filtered = useMemo(() => {
    // 파일만 표시 + 유효 이미지 + 숨김/플레이스홀더 제외
    let result = files.filter(f => {
      const size = f.metadata?.size
      const base = (f.name.split('/').pop() || f.name).toLowerCase()
      const isHidden = base.startsWith('.')
      return size != null && size > 0 && !isHidden && isImage(f.name)
    })
    const q = searchText.trim().toLowerCase()
    if (q) result = result.filter(f => f.name.toLowerCase().includes(q))
    const dir = sortDir === 'asc' ? 1 : -1
    const toSize = (f: typeof result[number]) => (f.metadata?.size ?? -1)
    const toCreated = (f: typeof result[number]) => (f.created_at ? new Date(f.created_at).getTime() : 0)
    result = [...result].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir
      if (sortKey === 'size') return (toSize(a) - toSize(b)) * dir
      return (toCreated(a) - toCreated(b)) * dir
    })
    return result
  }, [files, searchText, sortKey, sortDir])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100000]"> {/* ensure above TinyMCE dialogs */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">라이브러리에서 선택 ({bucket})</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* 도구 막대 */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2">
                <select value={prefix} onChange={(e)=>setPrefix(e.target.value)} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white w-56" aria-label="폴더 선택">
                  <option value="">/ (루트)</option>
                  {prefix && (
                    <option value={prefix}>{`${prefix.replace(/\/+$/, '')}/ (현재)`}</option>
                  )}
                  {currentFolders.map(d => (
                    <option key={d} value={d+"/"}>{d}/</option>
                  ))}
                </select>
                <button type="button" onClick={()=>fetchFiles(true)} className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <RefreshCw size={16} /> 새로고침
                </button>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={searchText} onChange={(e)=>setSearchText(e.target.value)} placeholder="파일명 검색" className="pl-8 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white w-64" />
              </div>
            </div>

            {/* 리스트 */}
            <div className="min-h-[240px]">
              {isListing && files.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">불러오는 중...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">파일이 없습니다.</div>
              ) : (
                <div className="overflow-auto rounded-md border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="w-28 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">미리보기</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 cursor-pointer select-none" onClick={()=>{setSortKey('name'); setSortDir(d=>d==='asc'?'desc':'asc')}}>
                          파일명 {sortKey==='name' ? (sortDir==='asc'?'▲':'▼') : ''}
                        </th>
                        <th className="w-24 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 cursor-pointer select-none" onClick={()=>{setSortKey('size'); setSortDir(d=>d==='asc'?'desc':'asc')}}>
                          크기 {sortKey==='size' ? (sortDir==='asc'?'▲':'▼') : ''}
                        </th>
                        <th className="w-40 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 cursor-pointer select-none" onClick={()=>{setSortKey('created'); setSortDir(d=>d==='asc'?'desc':'asc')}}>
                          업로드일자 {sortKey==='created' ? (sortDir==='asc'?'▲':'▼') : ''}
                        </th>
                        <th className="w-28 px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">선택</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                      {filtered.map((f) => {
                        const url = f.publicUrl || getPublicUrl(bucket, f.name)
                        return (
                          <tr key={f.name}>
                            <td className="px-3 py-2">
                              {isImage(f.name) ? (
                                <img src={url} alt={f.name} className="w-20 h-20 object-cover rounded" loading="lazy" />
                              ) : (
                                <div className="w-20 h-20 rounded bg-gray-100 dark:bg-gray-800" />
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-sm text-gray-900 dark:text-gray-100 break-all">{f.name}</div>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{(f.metadata?.size ?? 0) > 0 ? `${(f.metadata!.size! / 1024).toFixed(1)} KB` : '—'}</td>
                            <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{f.created_at ? new Date(f.created_at).toLocaleString() : '—'}</td>
                            <td className="px-3 py-2">
                              <div className="flex justify-end">
                                <button type="button" className="px-3 py-1 text-xs rounded bg-teal-600 hover:bg-indigo-900 text-white" onClick={()=>onSelect(url)}>선택</button>
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
              <div className="flex justify-center pt-2">
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
        </div>
      </div>
    </div>
  )
}

export default ImageLibraryModal


