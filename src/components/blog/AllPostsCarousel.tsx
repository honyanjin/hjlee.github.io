import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { BlogPost, Category } from '../../lib/supabase'
import PostsGrid from './PostsGrid'

interface AllPostsCarouselProps {
  posts: BlogPost[]
  categories: Category[]
  getPostImageProps: (post: BlogPost) => { src?: string; className: string }
  getBackgroundStyle: (post: BlogPost) => React.CSSProperties
}

const getItemsPerPage = (width: number): number => {
  if (width < 640) return 2 // < sm: 1행 2열
  if (width < 1024) return 4 // < lg: 2행 2열
  return 6 // >= lg: 2행 3열
}

const AllPostsCarousel: React.FC<AllPostsCarouselProps> = ({ posts, categories, getPostImageProps, getBackgroundStyle }) => {
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1280)
  const itemsPerPage = useMemo(() => getItemsPerPage(viewportWidth), [viewportWidth])
  const totalPages = Math.max(1, Math.ceil(posts.length / itemsPerPage))
  const [currentPage, setCurrentPage] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // 반응형 변화 시 현재 페이지 보정
  useEffect(() => {
    const maxPage = Math.max(0, totalPages - 1)
    if (currentPage > maxPage) setCurrentPage(maxPage)
  }, [itemsPerPage, totalPages, currentPage])

  const pages = useMemo(() => {
    const chunks: BlogPost[][] = []
    for (let i = 0; i < posts.length; i += itemsPerPage) {
      chunks.push(posts.slice(i, i + itemsPerPage))
    }
    return chunks
  }, [posts, itemsPerPage])

  const paginate = (newDirection: 1 | -1) => {
    setDirection(newDirection)
    setCurrentPage((prev) => {
      const next = prev + newDirection
      if (next < 0) return 0
      if (next > totalPages - 1) return totalPages - 1
      return next
    })
  }

  const variants = {
    enter: (dir: 1 | -1) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 1 | -1) => ({ x: dir > 0 ? -50 : 50, opacity: 0 }),
  }

  return (
    <div className="relative">
      {/* Controls */}
      {totalPages > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            disabled={currentPage === 0}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="이전"
            aria-label="포스트 이전 페이지"
          >
            <ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => paginate(1)}
            disabled={currentPage === totalPages - 1}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="다음"
            aria-label="포스트 다음 페이지"
          >
            <ChevronRight size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </>
      )}

      {/* Pages */}
      <div className="overflow-hidden">
        <AnimatePresence custom={direction} initial={false} mode="popLayout">
          <motion.div
            key={currentPage}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <PostsGrid
              posts={pages[currentPage] ?? []}
              categories={categories}
              getPostImageProps={getPostImageProps}
              getBackgroundStyle={getBackgroundStyle}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentPage ? 1 : -1)
                setCurrentPage(i)
              }}
              className={`h-3 w-3 rounded-full transition-colors ${i === currentPage ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
              aria-label={`포스트 페이지 ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Page Info */}
      {totalPages > 1 && (
        <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          페이지 {currentPage + 1} / {totalPages} 
          <span className="ml-2">
            (총 {posts.length}개 포스트)
          </span>
        </div>
      )}
    </div>
  )
}

export default AllPostsCarousel
