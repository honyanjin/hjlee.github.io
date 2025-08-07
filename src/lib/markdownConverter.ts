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
  filter: function (node) {
    return (
      node.nodeName === 'PRE' &&
      node.firstChild &&
      node.firstChild.nodeName === 'CODE'
    )
  },
  replacement: function (content, node) {
    const code = node.firstChild as HTMLElement
    const className = code.getAttribute('class') || ''
    const language = className.replace('language-', '')
    
    return '\n```' + language + '\n' + code.textContent + '\n```\n'
  }
})

// 이미지 설정
turndownService.addRule('images', {
  filter: 'img',
  replacement: function (content, node) {
    const img = node as HTMLImageElement
    const alt = img.alt || ''
    const src = img.src || ''
    const title = img.title || ''
    
    if (title) {
      return `![${alt}](${src} "${title}")`
    }
    return `![${alt}](${src})`
  }
})

// 링크 설정
turndownService.addRule('links', {
  filter: 'a',
  replacement: function (content, node) {
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
  replacement: function (content, node) {
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
  replacement: function (content) {
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
      gfm: true,
      headerIds: true,
      mangle: false
    })
    
    return marked(markdown)
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
