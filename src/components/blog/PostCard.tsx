import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { BlogPost, Category } from '../../lib/supabase'
import ShareButtons from '../ShareButtons'

interface PostCardProps {
  post: BlogPost
  index?: number
  categories: Category[]
  getPostImageProps: (post: BlogPost) => { src?: string; className: string }
  getBackgroundStyle: (post: BlogPost) => React.CSSProperties
}

const PostCard: React.FC<PostCardProps> = ({ post, index = 0, categories, getPostImageProps, getBackgroundStyle }) => {
  const navigate = useNavigate()
  return (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col"
    >
      <div className="relative overflow-hidden">
        {post.image_url ? (
          <>
            <img
              {...getPostImageProps(post)}
              alt={post.title}
              className="w-full h-40 sm:h-48 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => navigate(`/blog/${post.post_no}`)}
            />
            {post.image_caption_text && (
              <div className="pointer-events-none absolute inset-0 flex items-end justify-center">
                <div className="w-full p-2 sm:p-3 bg-gradient-to-t from-black/60 to-transparent text-center">
                  <span
                    className="font-semibold drop-shadow-md"
                    style={{ color: post.image_caption_color || '#ffffff', fontSize: `${post.image_caption_size || 14}px`, textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                  >
                    {post.image_caption_text}
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div 
            className="w-full h-40 sm:h-48 flex items-center justify-center hover:scale-105 transition-transform duration-300 cursor-pointer"
            style={getBackgroundStyle(post)}
            onClick={() => navigate(`/blog/${post.post_no}`)}
          >
            <div className="text-white text-center px-3 sm:px-4">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">
                {(() => {
                  const foundCategory = categories.find(cat => cat.id === post.category || cat.slug === post.category)
                  return foundCategory ? foundCategory.name.toUpperCase() : (post.category?.toUpperCase() || 'BLOG')
                })()}
              </div>
              <div className="text-xs sm:text-sm opacity-90">Blog Post</div>
            </div>
          </div>
        )}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
          <ShareButtons 
            title={post.title}
            url={`${window.location.origin}/blog/${post.post_no}`}
            description={post.excerpt}
            size="sm"
          />
        </div>
      </div>

      <div className="p-4 sm:p-6 flex flex-col flex-1">
        <div className="flex-1">
          <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
              <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <h3 
            className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => navigate(`/blog/${post.post_no}`)}
          >
            {post.title}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
              {post.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full dark:bg-gray-700 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400">
              <User size={12} className="sm:w-3.5 sm:h-3.5" />
              <span className="text-xs sm:text-sm">{post.author}</span>
            </div>
            <button 
              onClick={() => navigate(`/blog/${post.post_no}`)}
              className="flex items-center gap-1 sm:gap-2 text-blue-600 hover:text-blue-700 transition-colors text-xs sm:text-sm"
            >
              <span>자세히 보기</span>
              <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default PostCard



