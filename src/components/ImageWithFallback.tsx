import { useState } from 'react'
import { getDefaultImage, getFallbackImage, type ImageType } from '../lib/constants'
import type { ImageWithFallbackProps } from '../types'

const ImageWithFallback = ({
  src,
  alt,
  className = '',
  defaultType = 'PROJECT',
  fallbackType = 'PROJECT',
  onError,
  onLoad,
  id
}: ImageWithFallbackProps) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 이미지 소스 결정
  const getImageSrc = () => {
    if (src && !hasError) {
      return src
    }
    if (hasError) {
      return getFallbackImage(fallbackType)
    }
    return getDefaultImage(defaultType)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    onError?.()
  }

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      )}
      <img
        id={id}
        src={getImageSrc()}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  )
}

export default ImageWithFallback 