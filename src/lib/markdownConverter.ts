import { marked } from 'marked'
import TurndownService from 'turndown'

// HTML을 마크다운으로 변환하는 서비스
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  bulletListMarker: '-',
  strongDelimiter: '**'
})

// 코드 블록 설정
turndownService.addRule('codeBlocks', {
  filter: function (node: any) {
    return (
      node.nodeName === 'PRE' &&
      node.firstChild &&
      node.firstChild.nodeName === 'CODE'
    )
  },
  replacement: function (content: string, node: any) {
    const code = node.firstChild as HTMLElement
    const className = code.getAttribute('class') || ''
    const language = className.replace('language-', '')
    
    return '\n```' + language + '\n' + code.textContent + '\n```\n'
  }
})

// 이미지 설정
turndownService.addRule('images', {
  filter: 'img',
  replacement: function (_content: string, node: any) {
    const img = node as HTMLImageElement
    const src = img.src || ''
    const alt = img.getAttribute && (img.getAttribute('alt') || '')
    const title = img.getAttribute && img.getAttribute('title')
    const width = img.getAttribute && img.getAttribute('width')
    const height = img.getAttribute && img.getAttribute('height')
    let style = (img.getAttribute && img.getAttribute('style')) || ''
    const className = img.getAttribute && img.getAttribute('class')
    const borderAttr = img.getAttribute && img.getAttribute('border')
    const borderColorAttr = img.getAttribute && img.getAttribute('bordercolor')

    // width/height가 style에만 있을 경우도 보존
    const styleW = style && /width\s*:\s*(\d+)px/i.exec(style)
    const styleH = style && /height\s*:\s*(\d+)px/i.exec(style)

    // 구형 border 속성 보정 → style로 병합
    if (borderAttr && !/border(-width)?:/i.test(style)) {
      const bw = parseInt(borderAttr, 10)
      if (!Number.isNaN(bw) && bw > 0) {
        style = `${style ? style.replace(/;\s*$/, '') + '; ' : ''}border-width: ${bw}px; border-style: solid;`
      }
    }
    if (borderColorAttr && !/border-color:/i.test(style)) {
      style = `${style ? style.replace(/;\s*$/, '') + '; ' : ''}border-color: ${borderColorAttr};`
    }

    const attrs: string[] = []
    if (src) attrs.push(`src="${src}"`)
    if (alt) attrs.push(`alt="${alt}"`)
    if (title) attrs.push(`title="${title}"`)
    if (width || styleW) attrs.push(`width="${width || (styleW ? styleW[1] : '')}"`)
    if (height || styleH) attrs.push(`height="${height || (styleH ? styleH[1] : '')}"`)
    if (style) attrs.push(`style="${style}"`)
    if (className) attrs.push(`class="${className}"`)

    return `\n<img ${attrs.join(' ')} />\n`
  }
})

// 링크 설정
turndownService.addRule('links', {
  filter: 'a',
  replacement: function (content: string, node: any) {
    const link = node as HTMLAnchorElement
    const href = link.href || ''
    const title = link.title || ''
    
    if (title) {
      return `[${content}](${href} "${title}")`
    }
    return `[${content}](${href})`
  }
})

// 테이블 설정
turndownService.addRule('tables', {
  filter: 'table',
  replacement: function (content: string, node: any) {
    const table = node as HTMLTableElement
    const rows = Array.from(table.querySelectorAll('tr'))
    
    if (rows.length === 0) return ''
    
    let markdown = '\n'
    
    // 헤더 행
    const headerRow = rows[0]
    const headerCells = Array.from(headerRow.querySelectorAll('th, td'))
    markdown += '| ' + headerCells.map(cell => cell.textContent?.trim() || '').join(' | ') + ' |\n'
    markdown += '| ' + headerCells.map(() => '---').join(' | ') + ' |\n'
    
    // 데이터 행
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const cells = Array.from(row.querySelectorAll('td'))
      markdown += '| ' + cells.map(cell => cell.textContent?.trim() || '').join(' | ') + ' |\n'
    }
    
    return markdown
  }
})

// 인용 블록 설정
turndownService.addRule('blockquotes', {
  filter: 'blockquote',
  replacement: function (content: string) {
    return '\n> ' + content.trim().replace(/\n/g, '\n> ') + '\n'
  }
})

// 구분선 설정
turndownService.addRule('horizontalRule', {
  filter: 'hr',
  replacement: function () {
    return '\n---\n'
  }
})

// 인라인 스타일 보존: span, u, sup, sub, mark, br, kbd, abbr 등
turndownService.keep((node: any) => {
  if (!node || !node.nodeName) return false
  const name = node.nodeName
  if (name === 'BR') return true
  if (name === 'U' || name === 'SUP' || name === 'SUB' || name === 'MARK' || name === 'KBD' || name === 'ABBR') return true
  if (name === 'SPAN') {
    const hasStyle = !!node.getAttribute && !!node.getAttribute('style')
    const hasClass = !!node.getAttribute && !!node.getAttribute('class')
    return hasStyle || hasClass
  }
  return false
})

// 정렬이 있는 단락 보존: <p style="text-align: ..."> → 그대로 HTML 유지
turndownService.addRule('alignedParagraph', {
  filter: function (node: any) {
    if (!node || node.nodeName !== 'P') return false
    const style = node.getAttribute && node.getAttribute('style')
    return !!style && /text-align\s*:\s*(center|right|left|justify)/i.test(style)
  },
  replacement: function (content: string, node: any) {
    try {
      const style = node.getAttribute('style') || ''
      return `\n<p style="${style}">${content}</p>\n`
    } catch {
      return `\n<p>${content}</p>\n`
    }
  }
})

// 정렬을 위한 래퍼 DIV 보존: <div style="text-align:center"> ... </div>
turndownService.addRule('alignedDiv', {
  filter: function (node: any) {
    if (!node || node.nodeName !== 'DIV') return false
    const style = node.getAttribute && node.getAttribute('style')
    return !!style && /text-align\s*:\s*(center|right|left|justify)/i.test(style)
  },
  replacement: function (content: string, node: any) {
    try {
      const style = node.getAttribute('style') || ''
      return `\n<div style="${style}">${content}</div>\n`
    } catch {
      return `\n<div>${content}</div>\n`
    }
  }
})

// iframe(YouTube/Vimeo) → 링크로 변환하여 Markdown에 안전하게 보존
turndownService.addRule('iframesToLinks', {
  filter: function (node: any) {
    return node.nodeName === 'IFRAME'
  },
  replacement: function (_content: string, node: any) {
    try {
      const iframe = node as HTMLIFrameElement
      const src = iframe.src || ''
      const widthAttr = (iframe.getAttribute && iframe.getAttribute('width')) || ''
      const heightAttr = (iframe.getAttribute && iframe.getAttribute('height')) || ''
      const width = parseInt(widthAttr || '', 10) || 560
      const height = parseInt(heightAttr || '', 10) || 315
      // YouTube embed → watch 링크로 변환
      if (src.includes('youtube.com/embed/')) {
        const id = src.split('/embed/')[1]?.split(/[?&#]/)[0]
        if (id) return `\n[YouTube](https://www.youtube.com/watch?v=${id} "w=${width};h=${height}")\n`
      }
      // Vimeo embed → 일반 vimeo 링크로 변환
      if (src.includes('player.vimeo.com/video/')) {
        const id = src.split('/video/')[1]?.split(/[?&#]/)[0]
        if (id) return `\n[Vimeo](https://vimeo.com/${id} "w=${width};h=${height}")\n`
      }
      // 그 외 iframe은 src를 그대로 노출 (최소 보존)
      if (src) return `\n[Embed](${src})\n`
      return ''
    } catch {
      return ''
    }
  }
})

/**
 * HTML을 마크다운으로 변환
 */
export const htmlToMarkdown = (html: string): string => {
  try {
    return turndownService.turndown(html)
  } catch (error) {
    console.error('HTML to Markdown conversion error:', error)
    return html
  }
}

/**
 * 마크다운을 HTML로 변환
 */
export const markdownToHtml = (markdown: string): string => {
  try {
    // marked 설정
    marked.setOptions({
      breaks: true,
      gfm: true
    })

    const rawHtml = marked(markdown) as string

    // YouTube/Vimeo 링크를 iframe으로 후처리 (편집기 로딩 시 임베드 복원)
    const postProcessEmbeds = (html: string): string => {
      try {
        // YouTube (watch)
        html = html.replace(/<a[^>]*href="https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^"]+)"[^>]*?(?:title="([^"]*)")?[^>]*>.*?<\/a>/gi,
          (_match, id: string, title: string | undefined) => {
            const dims = (title || '').match(/w=(\d+);h=(\d+)/)
            const width = dims ? parseInt(dims[1], 10) : 560
            const height = dims ? parseInt(dims[2], 10) : 315
            const videoId = id.split('&')[0]
            return `\n<iframe width="${width}" height="${height}" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n`
          })

        // YouTube (youtu.be)
        html = html.replace(/<a[^>]*href="https?:\/\/(?:www\.)?youtu\.be\/([^"\?&#]+)[^"]*"[^>]*?(?:title="([^"]*)")?[^>]*>.*?<\/a>/gi,
          (_match, id: string, title: string | undefined) => {
            const dims = (title || '').match(/w=(\d+);h=(\d+)/)
            const width = dims ? parseInt(dims[1], 10) : 560
            const height = dims ? parseInt(dims[2], 10) : 315
            return `\n<iframe width="${width}" height="${height}" src="https://www.youtube.com/embed/${id}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n`
          })

        // Vimeo
        html = html.replace(/<a[^>]*href="https?:\/\/(?:www\.)?vimeo\.com\/([^"\?&#]+)[^"]*"[^>]*?(?:title="([^"]*)")?[^>]*>.*?<\/a>/gi,
          (_match, id: string, title: string | undefined) => {
            const dims = (title || '').match(/w=(\d+);h=(\d+)/)
            const width = dims ? parseInt(dims[1], 10) : 560
            const height = dims ? parseInt(dims[2], 10) : 315
            return `\n<iframe width="${width}" height="${height}" src="https://player.vimeo.com/video/${id}" title="Vimeo video player" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>\n`
          })

        return html
      } catch (e) {
        console.error('Embed post-process failed:', e)
        return html
      }
    }

    return postProcessEmbeds(rawHtml)
  } catch (error) {
    console.error('Markdown to HTML conversion error:', error)
    return markdown
  }
}

/**
 * HTML에서 순수 텍스트 추출
 */
export const htmlToText = (html: string): string => {
  try {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  } catch (error) {
    console.error('HTML to text conversion error:', error)
    return html
  }
}

/**
 * 텍스트에서 요약 생성 (첫 번째 문단)
 */
export const generateExcerpt = (content: string, maxLength: number = 150): string => {
  try {
    // HTML을 텍스트로 변환
    const text = htmlToText(content)
    
    // 첫 번째 문단 찾기
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0)
    const firstParagraph = paragraphs[0] || text
    
    // 길이 제한
    if (firstParagraph.length <= maxLength) {
      return firstParagraph.trim()
    }
    
    // 단어 단위로 자르기
    const words = firstParagraph.split(' ')
    let excerpt = ''
    
    for (const word of words) {
      if ((excerpt + ' ' + word).length <= maxLength) {
        excerpt += (excerpt ? ' ' : '') + word
      } else {
        break
      }
    }
    
    return excerpt.trim() + '...'
  } catch (error) {
    console.error('Excerpt generation error:', error)
    return content.substring(0, maxLength) + '...'
  }
}

/**
 * HTML에서 이미지 URL 추출
 */
export const extractImageUrl = (html: string): string | null => {
  try {
    const div = document.createElement('div')
    div.innerHTML = html
    const img = div.querySelector('img')
    return img?.src || null
  } catch (error) {
    console.error('Image URL extraction error:', error)
    return null
  }
}

/**
 * HTML에서 제목 추출
 */
export const extractTitle = (html: string): string | null => {
  try {
    const div = document.createElement('div')
    div.innerHTML = html
    const h1 = div.querySelector('h1')
    const h2 = div.querySelector('h2')
    const h3 = div.querySelector('h3')
    
    return h1?.textContent || h2?.textContent || h3?.textContent || null
  } catch (error) {
    console.error('Title extraction error:', error)
    return null
  }
}

/**
 * HTML에서 태그 추출
 */
export const extractTags = (html: string): string[] => {
  try {
    const div = document.createElement('div')
    div.innerHTML = html
    const codeBlocks = div.querySelectorAll('code')
    const tags: string[] = []
    
    codeBlocks.forEach(code => {
      const text = code.textContent || ''
      // 기술 스택 키워드 매칭
      const techKeywords = [
        'React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Node.js',
        'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
        'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'Express',
        'Django', 'Flask', 'Spring', 'Laravel', 'Rails', 'MongoDB',
        'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS',
        'Azure', 'GCP', 'Firebase', 'Supabase', 'Tailwind', 'Bootstrap',
        'Material-UI', 'Ant Design', 'Git', 'GitHub', 'GitLab'
      ]
      
      techKeywords.forEach(keyword => {
        if (text.includes(keyword) && !tags.includes(keyword)) {
          tags.push(keyword)
        }
      })
    })
    
    return tags.slice(0, 5) // 최대 5개 태그
  } catch (error) {
    console.error('Tag extraction error:', error)
    return []
  }
}
