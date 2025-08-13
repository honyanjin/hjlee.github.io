import React from 'react'
import PostCard from './PostCard'
import type { BlogPost, Category } from '../../lib/supabase'

interface PostsGridProps {
  posts: BlogPost[]
  categories: Category[]
  getPostImageProps: (post: BlogPost) => { src?: string; className: string }
  getBackgroundStyle: (post: BlogPost) => React.CSSProperties
}

const PostsGrid: React.FC<PostsGridProps> = ({ posts, categories, getPostImageProps, getBackgroundStyle }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          index={index}
          categories={categories}
          getPostImageProps={getPostImageProps}
          getBackgroundStyle={getBackgroundStyle}
        />
      ))}
    </div>
  )
}

export default PostsGrid



