import { useRef } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { supabase } from '../lib/supabase'

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  height?: number
  disabled?: boolean
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  height = 500,
  disabled = false
}) => {
  const editorRef = useRef<any>(null)

  // 간단 HTML 포맷터 (외부 의존성 없이 들여쓰기 정리)
  const formatHtmlContent = (html: string, indentSize = 2): string => {
    try {
      const voidTags = new Set([
        'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'
      ])
      const tokens = html
        .replace(/>\s+</g, '><') // 태그 사이 공백 정규화
        .replace(/\n+/g, '')
        .split(/(<[^>]+>)/g)
        .map(t => t)
        .filter(t => t.length > 0)
      
      const spaces = (n: number) => ' '.repeat(n * indentSize)
      let indentLevel = 0
      let result: string[] = []
      
      for (const token of tokens) {
        if (!token) continue
        if (token.startsWith('<!--')) {
          // 주석은 현재 들여쓰기 라인에 그대로
          result.push(`${spaces(indentLevel)}${token.trim()}`)
          continue
        }
        if (token.startsWith('<') && token.endsWith('>')) {
          const isClosing = /^<\//.test(token)
          const isSelfClosing = /\/>$/.test(token)
          const tagMatch = token.match(/^<\/?\s*([a-zA-Z0-9-]+)/)
          const tagName = tagMatch ? tagMatch[1].toLowerCase() : ''
          const isVoid = voidTags.has(tagName)
          
          if (isClosing) {
            indentLevel = Math.max(indentLevel - 1, 0)
            result.push(`${spaces(indentLevel)}${token.trim()}`)
          } else {
            result.push(`${spaces(indentLevel)}${token.trim()}`)
            if (!isSelfClosing && !isVoid) {
              indentLevel += 1
            }
          }
        } else {
          const text = token.trim()
          if (text) {
            result.push(`${spaces(indentLevel)}${text}`)
          }
        }
      }
      return result.join('\n')
    } catch {
      return html
    }
  }

  // TinyMCE API 키 설정 (환경 변수 기반)
  const apiKey: string | undefined = import.meta.env.VITE_TINYMCE_API_KEY
  if (import.meta.env.DEV && !apiKey) {
    // 개발 환경에서 키 누락 시 경고 (프로덕션에서는 Tiny Cloud 사용 시 반드시 설정 필요)
    // eslint-disable-next-line no-console
    console.warn('[TinyMCE] VITE_TINYMCE_API_KEY가 설정되지 않았습니다. 개발 모드에서는 기본 키로 동작할 수 있습니다.')
  }

  // 이미지 업로드 핸들러
  const handleImageUpload = async (blobInfo: any, progress: any, failure: any) => {
    try {
      const file = blobInfo.blob()
      const fileExt = file.name.split('.').pop()
      const fileName = `tinymce-${Date.now()}.${fileExt}`
      
      const { error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) throw error
      
      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName)
      
      return urlData.publicUrl
    } catch (err: any) {
      failure('이미지 업로드에 실패했습니다.')
      return ''
    }
  }

  // 미디어 파일 업로드 핸들러 (버킷 통일: blog-images 사용)
  const handleMediaUpload = async (blobInfo: any, progress: any, failure: any) => {
    try {
      const file = blobInfo.blob()
      const fileExt = file.name.split('.').pop()
      const fileName = `tinymce-media-${Date.now()}.${fileExt}`
      
      const { error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) throw error
      
      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName)
      
      return urlData.publicUrl
    } catch (err: any) {
      failure('미디어 파일 업로드에 실패했습니다.')
      return ''
    }
  }

  return (
    <Editor
      apiKey={apiKey}
      ref={editorRef}
      value={value}
      onEditorChange={onChange}
      disabled={disabled}
      init={{
        height,
        width: '100%',
        menubar: false,
        plugins: [
          // Core editing features
          'anchor', 'autolink', 'charmap', 'codesample', 'code', 'emoticons', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'visualchars', 'wordcount', 'image', 'preview', 'fullscreen', 'help', 'paste', 'hr', 'visualaid'
        ],
        toolbar: [
          'undo redo | cut copy paste selectall | blocks fontfamily fontsize | bold italic underline strikethrough subscript superscript | forecolor backcolor',
          'alignleft aligncenter alignright alignjustify | toParagraph toBulletedList toNumberedList | numlist bullist indent outdent | link image media table | blockquote hr | visualblocks visualchars | removeformat formathtml code codesample | preview fullscreen help'
        ],
        // 사용자 정의 버튼 등록
        setup: (editor: any) => {
          editor.ui.registry.addButton('formathtml', {
            text: 'HTML 정렬',
            tooltip: '현재 내용을 HTML 들여쓰기로 정리하여 소스 보기로 표시합니다',
            onAction: () => {
              const current = editor.getContent({ format: 'html' })
              const pretty = formatHtmlContent(current)
              editor.windowManager.open({
                title: '소스 코드 (정렬됨)',
                size: 'large',
                body: {
                  type: 'panel',
                  items: [
                    { type: 'textarea', name: 'source', label: 'HTML', multiline: true, flex: true }
                  ]
                },
                initialData: { source: pretty },
                buttons: [
                  { type: 'cancel', name: 'cancel', text: '닫기' },
                  { type: 'submit', name: 'apply', text: '적용', primary: true }
                ],
                onSubmit: (api: any) => {
                  const data = api.getData()
                  const updated = typeof data?.source === 'string' ? data.source : ''
                  if (updated) {
                    editor.setContent(updated)
                  }
                  api.close()
                }
              })
            }
          })

          // 문단으로 변환 (리스트 해제)
          editor.ui.registry.addButton('toParagraph', {
            text: '문단',
            tooltip: '선택한 내용을 문단(P)으로 변환',
            onAction: () => {
              // 리스트면 해제하고 문단으로
              editor.execCommand('RemoveList')
              // 커서 위치 블록을 P로 강제 지정 (가능한 경우)
              try {
                editor.execCommand('FormatBlock', false, 'p')
              } catch {
                // 지원되지 않는 경우 무시
              }
            }
          })

          // 순서 없는 목록으로 변환
          editor.ui.registry.addButton('toBulletedList', {
            text: '• 목록',
            tooltip: '선택한 내용을 순서 없는 목록으로 변환',
            onAction: () => {
              editor.execCommand('InsertUnorderedList')
            }
          })

          // 순서 있는 목록으로 변환
          editor.ui.registry.addButton('toNumberedList', {
            text: '1. 목록',
            tooltip: '선택한 내용을 순서 있는 목록으로 변환',
            onAction: () => {
              editor.execCommand('InsertOrderedList')
            }
          })
        },
        // 블록 포맷(태그) 드롭다운 항목 구성
        block_formats: '본문=p; 제목 1=h1; 제목 2=h2; 제목 3=h3; 인용문=blockquote; 코드=pre',
        content_style: `
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            font-size: 16px; 
            line-height: 1.6; 
            color: #374151; 
          }
          .dark body { 
            color: #d1d5db; 
          }
          h1, h2, h3, h4, h5, h6 { 
            margin-top: 1.5em; 
            margin-bottom: 0.5em; 
            font-weight: 600; 
          }
          h1 { font-size: 2em; }
          h2 { font-size: 1.5em; }
          h3 { font-size: 1.25em; }
          p { margin-bottom: 1em; }
          ul, ol { margin-bottom: 1em; padding-left: 2em; }
          blockquote { 
            border-left: 4px solid #e5e7eb; 
            padding-left: 1em; 
            margin: 1em 0; 
            font-style: italic; 
          }
          code { 
            background-color: #f3f4f6; 
            padding: 0.2em 0.4em; 
            border-radius: 0.25em; 
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; 
          }
          pre { 
            background-color: #f3f4f6; 
            padding: 1em; 
            border-radius: 0.5em; 
            overflow-x: auto; 
          }
          pre code { 
            background-color: transparent; 
            padding: 0; 
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 1em 0; 
          }
          th, td { 
            border: 1px solid #e5e7eb; 
            padding: 0.5em; 
            text-align: left; 
          }
          th { 
            background-color: #f9fafb; 
            font-weight: 600; 
          }
          img { 
            max-width: 100%; 
            height: auto; 
            border-radius: 0.5em; 
          }
        `,
        skin: 'oxide',
        content_css: 'default',
        // 다크모드 지원
        body_class: 'dark:bg-gray-800 dark:text-white',
        // 이미지 업로드 설정
        images_upload_handler: handleImageUpload,
        images_upload_base_path: '/',
        images_upload_credentials: false,
        // 미디어 업로드 설정
        media_upload_handler: handleMediaUpload,
        media_upload_base_path: '/',
        media_upload_credentials: false,
        // 코드 블록 설정
        codesample_languages: [
          { text: 'HTML/XML', value: 'markup' },
          { text: 'JavaScript', value: 'javascript' },
          { text: 'CSS', value: 'css' },
          { text: 'PHP', value: 'php' },
          { text: 'Ruby', value: 'ruby' },
          { text: 'Python', value: 'python' },
          { text: 'Java', value: 'java' },
          { text: 'C', value: 'c' },
          { text: 'C++', value: 'cpp' },
          { text: 'C#', value: 'csharp' },
          { text: 'TypeScript', value: 'typescript' },
          { text: 'JSX', value: 'jsx' },
          { text: 'TSX', value: 'tsx' },
          { text: 'JSON', value: 'json' },
          { text: 'SQL', value: 'sql' },
          { text: 'Bash', value: 'bash' },
          { text: 'Markdown', value: 'markdown' }
        ],
        // 링크 설정
        link_list: [
          { title: '홈페이지', value: '/' },
          { title: '블로그', value: '/blog' },
          { title: '프로젝트', value: '/projects' },
          { title: '소개', value: '/about' },
          { title: '연락처', value: '/contact' }
        ],
        // 미디어 설정
        media_live_embeds: true,
        media_alt_source: true,
        media_poster: true,
        media_dimensions: true,
        media_url_resolver: (data: any, resolve: any, reject: any) => {
          // YouTube, Vimeo 등 지원
          if (data.url.indexOf('youtube.com') !== -1 || data.url.indexOf('youtu.be') !== -1) {
            const videoId = data.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            if (videoId) {
              data.source1 = `https://www.youtube.com/embed/${videoId[1]}`;
              data.type = 'iframe';
              data.width = 560;
              data.height = 315;
            }
          } else if (data.url.indexOf('vimeo.com') !== -1) {
            const videoId = data.url.match(/vimeo\.com\/(\d+)/);
            if (videoId) {
              data.source1 = `https://player.vimeo.com/video/${videoId[1]}`;
              data.type = 'iframe';
              data.width = 560;
              data.height = 315;
            }
          }
          resolve(data);
        },
        // 자동 저장 설정
        auto_save: true,
        auto_save_interval: '30s',
        // 접근성 설정
        accessibility_focus: true,
        // 한국어 설정
        language: 'ko-KR',
        // 플레이스홀더
        placeholder: placeholder,
        // 자동 링크
        auto_link: true,
        // 자동 리사이즈
        autoresize_bottom_margin: 50,
        // 스펠링 체크
        browser_spellcheck: true,
        // 컨텍스트 메뉴
        contextmenu: 'link image table lists configurepermanentpen',
        // 드래그 앤 드롭
        dragdrop_callbacks: true,
        // 파일 드롭
        file_picker_types: 'image media',
        // 이미지 설명
        image_description: true,
        // 이미지 제목
        image_title: true,
        // 이미지 크기 조정
        image_advtab: true,
        // 링크 제목
        link_title: true,
        // 링크 타겟
        link_target_list: [
          { text: '현재 창', value: '' },
          { text: '새 창', value: '_blank' },
          { text: '부모 창', value: '_parent' },
          { text: '최상위 창', value: '_top' }
        ],
        // 리스트 설정
        lists_indent_on_tab: true,
        // 테이블 설정
        table_tab_navigation: true,
        table_default_attributes: {
          border: '1'
        },
        table_default_styles: {
          'border-collapse': 'collapse',
          width: '100%'
        },
        // 코드 블록 설정
        codesample_global_prismjs: true,
        // 미리보기 설정
        preview_styles: 'font-family font-size',
        // 검색 설정
        searchreplace_replace: true,
        // 전체화면 설정
        fullscreen_native: true,
        // 도움말 설정
        help_tabs: ['shortcuts', 'keyboard_navigation'],
        // 키보드 단축키
        custom_shortcuts: {
          'meta+s': {
            cmd: 'mceSave',
            desc: '저장'
          }
        },
        // 툴바 최적화 설정
        toolbar_mode: 'wrap',
        toolbar_sticky: true,
        toolbar_sticky_offset: 0,
        // 툴바 아이콘 크기 조정
        toolbar_groups: {
          formatting: {
            icon: 'bold',
            tooltip: '텍스트 서식'
          },
          alignment: {
            icon: 'align-left',
            tooltip: '정렬'
          },
          lists: {
            icon: 'list-ul',
            tooltip: '목록'
          },
          insert: {
            icon: 'plus',
            tooltip: '삽입'
          }
        }
      }}
    />
  )
}

export default RichTextEditor
