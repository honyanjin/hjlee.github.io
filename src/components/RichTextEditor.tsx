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

  // API 키 설정
  const apiKey = import.meta.env.VITE_TINYMCE_API_KEY || 'your_tinymce_api_key_here'

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

  // 미디어 파일 업로드 핸들러
  const handleMediaUpload = async (blobInfo: any, progress: any, failure: any) => {
    try {
      const file = blobInfo.blob()
      const fileExt = file.name.split('.').pop()
      const fileName = `tinymce-media-${Date.now()}.${fileExt}`
      
      const { error } = await supabase.storage
        .from('blog-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) throw error
      
      const { data: urlData } = supabase.storage
        .from('blog-media')
        .getPublicUrl(fileName)
      
      return urlData.publicUrl
    } catch (err: any) {
      failure('미디어 파일 업로드에 실패했습니다.')
      return ''
    }
  }

  return (
    <Editor
      apiKey={apiKey || 'your_tinymce_api_key_here'}
      ref={editorRef}
      value={value}
      onEditorChange={onChange}
      disabled={disabled}
      init={{
        height,
        menubar: false,
        plugins: [
          // Core editing features
          'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount', 'image', 'preview', 'fullscreen', 'help'
        ],
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat | code codesample | preview fullscreen help',
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
        contextmenu: 'link image table configurepermanentpen',
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
        }
      }}
    />
  )
}

export default RichTextEditor
