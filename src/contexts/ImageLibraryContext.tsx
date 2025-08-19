import { createContext, useCallback, useContext, useRef, useState } from 'react'
import ImageLibraryModal from '../components/ImageLibraryModal'

type BucketName = 'blog-images' | 'project-images' | 'admin-pic' | 'resume-files'

interface OpenOptions {
  bucket: BucketName
}

interface ImageLibraryContextValue {
  open: (options: OpenOptions) => Promise<string | null>
}

const Ctx = createContext<ImageLibraryContextValue | undefined>(undefined)

export const ImageLibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [bucket, setBucket] = useState<BucketName>('blog-images')
  const resolverRef = useRef<((value: string | null) => void) | null>(null)

  const open = useCallback(({ bucket }: OpenOptions) => {
    setBucket(bucket)
    setIsOpen(true)
    return new Promise<string | null>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const handleClose = () => {
    if (resolverRef.current) resolverRef.current(null)
    resolverRef.current = null
    setIsOpen(false)
  }

  const handleSelect = (url: string) => {
    if (resolverRef.current) resolverRef.current(url)
    resolverRef.current = null
    setIsOpen(false)
  }

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {/* Portal-like absolute container to ensure top-most z-index */}
      <div id="image-library-portal" className="fixed inset-0 pointer-events-none z-[100000]">
        <div className="pointer-events-auto">
          <ImageLibraryModal isOpen={isOpen} onClose={handleClose} onSelect={handleSelect} bucket={bucket} />
        </div>
      </div>
    </Ctx.Provider>
  )
}

export const useImageLibrary = (): ImageLibraryContextValue => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useImageLibrary must be used within ImageLibraryProvider')
  return ctx
}


