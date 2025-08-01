import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  author?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}

const SEO: React.FC<SEOProps> = ({
  title = '이호진 포트폴리오',
  description = '프론트엔드 개발자 이호진의 포트폴리오 사이트입니다.',
  keywords = '프론트엔드, React, TypeScript, 개발자, 포트폴리오',
  author = '이호진',
  image = '/og-image.jpg',
  url = window.location.href,
  type = 'website',
  publishedTime,
  modifiedTime,
  section,
  tags = []
}) => {
  useEffect(() => {
    // 기본 메타 태그 업데이트
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', name)
        meta.setAttribute('data-seo-added', 'true')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // Open Graph 태그 업데이트
    const updateOGTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('property', property)
        meta.setAttribute('data-seo-added', 'true')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // Twitter Card 태그 업데이트
    const updateTwitterTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', name)
        meta.setAttribute('data-seo-added', 'true')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // 제목 업데이트
    document.title = title

    // 기본 메타 태그
    updateMetaTag('description', description)
    updateMetaTag('keywords', keywords)
    updateMetaTag('author', author)

    // Open Graph 태그
    updateOGTag('og:title', title)
    updateOGTag('og:description', description)
    updateOGTag('og:type', type)
    updateOGTag('og:url', url)
    updateOGTag('og:image', image)
    updateOGTag('og:site_name', '이호진 포트폴리오')

    // Twitter Card 태그
    updateTwitterTag('twitter:card', 'summary_large_image')
    updateTwitterTag('twitter:title', title)
    updateTwitterTag('twitter:description', description)
    updateTwitterTag('twitter:image', image)

    // 블로그 포스트인 경우 추가 메타 태그
    if (type === 'article') {
      if (publishedTime) {
        updateOGTag('article:published_time', publishedTime)
        updateMetaTag('article:published_time', publishedTime)
      }
      if (modifiedTime) {
        updateOGTag('article:modified_time', modifiedTime)
        updateMetaTag('article:modified_time', modifiedTime)
      }
      if (section) {
        updateOGTag('article:section', section)
        updateMetaTag('article:section', section)
      }
      if (tags.length > 0) {
        tags.forEach(tag => {
          const meta = document.createElement('meta')
          meta.setAttribute('property', 'article:tag')
          meta.setAttribute('content', tag)
          meta.setAttribute('data-seo-added', 'true')
          document.head.appendChild(meta)
        })
      }
    }

    // JSON-LD 구조화된 데이터
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'Article' : 'WebSite',
      name: title,
      description: description,
      url: url,
      author: {
        '@type': 'Person',
        name: author
      },
      ...(type === 'article' && {
        datePublished: publishedTime,
        dateModified: modifiedTime,
        ...(section && { articleSection: section }),
        ...(tags.length > 0 && { keywords: tags.join(', ') })
      })
    }

    // 기존 JSON-LD 제거
    const existingJsonLd = document.querySelector('script[type="application/ld+json"]')
    if (existingJsonLd) {
      existingJsonLd.remove()
    }

    // 새로운 JSON-LD 추가
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(jsonLd)
    document.head.appendChild(script)

    // 정리 함수
    return () => {
      // 컴포넌트 언마운트 시 추가된 메타 태그들 정리
      const addedMetas = document.querySelectorAll('meta[data-seo-added="true"]')
      addedMetas.forEach(meta => meta.remove())
      
      const addedScript = document.querySelector('script[type="application/ld+json"]')
      if (addedScript) {
        addedScript.remove()
      }
    }
  }, [title, description, keywords, author, image, url, type, publishedTime, modifiedTime, section, tags])

  return null
}

export default SEO 