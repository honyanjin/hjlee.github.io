# 프로젝트 설정 가이드

이 문서는 이호진 포트폴리오 & 블로그 프로젝트의 완전한 설정 방법을 안내합니다.

## 🚀 빠른 시작

### 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Configuration
VITE_ADMIN_EMAIL=your_admin_email@example.com

# Editor Configuration
# TinyMCE Cloud API Key (리치 텍스트 에디터)
VITE_TINYMCE_API_KEY=your_tinymce_api_key

# Build/Deploy Configuration
# 프로덕션 베이스 경로 (GitHub Pages 프로젝트 사이트의 경우 필수)
# 예: /서브경로 (GitHub Pages 프로젝트 사이트의 경우 `/레포이름`)
VITE_BASE_PATH=/hjlee.github.io
```

### 2. Supabase 프로젝트 설정

#### 2.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트를 생성하세요
2. 프로젝트가 생성되면 Settings > API에서 다음 정보를 복사하세요:
   - Project URL
   - anon public key

#### 2.2 데이터베이스 스키마 설정
1. Supabase 대시보드에서 SQL Editor로 이동
2. `supabase-schema.sql` 파일의 전체 내용을 복사하여 실행하세요
3. 실행 후 Tables 섹션에서 다음 테이블들이 생성되었는지 확인:
   - `blog_posts`
   - `comments`
   - `comment_limits`
   - `categories`
   - `projects`

#### 2.3 Storage 버킷 생성
1. Storage 섹션으로 이동
2. "New bucket" 클릭
3. 버킷 이름: `blog-images`
4. Public bucket 체크
5. Create bucket 클릭

#### 2.4 관리자 계정 생성
1. Authentication > Users로 이동
2. "Add user" 클릭
3. 이메일과 비밀번호 입력
4. 생성한 이메일을 `VITE_ADMIN_EMAIL`에 설정

### 3. 개발 서버 실행

```bash
npm install
npm run dev
```

## 📋 기능별 설정

### 블로그 기능

#### 포스트 작성
1. `/admin/blog`로 이동하여 로그인
2. "새 포스트" 버튼 클릭
3. 제목, 카테고리, 요약 입력
4. TinyMCE 리치 텍스트로 내용 작성(HTML 저장/렌더)
5. 태그 설정 (쉼표로 구분)
6. 대표 이미지 업로드 (선택사항)
7. "즉시 발행" 체크하여 발행 또는 임시저장

#### 카테고리 관리
1. `/admin/categories`로 이동
2. "새 카테고리" 버튼 클릭
3. 카테고리명, 슬러그, 설명 입력
4. 색상 선택 (블로그에서 카테고리별 색상 표시)
5. 저장

#### 댓글 시스템
- 자동 스팸 방지 (하루 100개 댓글 제한)
- 작성자 본인 삭제 가능
- 관리자 권한으로 모든 댓글 삭제 가능

### 프로젝트 관리

#### 프로젝트 추가
1. `/admin/projects`로 이동
2. "새 프로젝트" 버튼 클릭
3. 제목, 설명, 카테고리 입력
4. 태그 설정
5. 라이브 URL, GitHub URL 입력 (선택사항)
6. 대표 이미지 업로드
7. "대표 프로젝트" 설정 (홈페이지에 표시)
8. 발행 상태 설정

## 🔧 고급 설정

### 본문 렌더링 스타일

`src/pages/BlogPost.tsx`에서 TinyMCE 저장본(HTML)을 직접 렌더링합니다. 코드 블록 라인 복사 UX는 `.copy-line-icon` 이벤트 위임으로 동작합니다.

### 색상 테마 변경

`tailwind.config.js`에서 색상 테마를 수정할 수 있습니다:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // 추가 색상...
      }
    }
  }
}
```

### SEO 설정

각 페이지의 `SEO` 컴포넌트에서 메타 태그를 설정할 수 있습니다:

```tsx
<SEO 
  title="페이지 제목"
  description="페이지 설명"
  keywords="키워드1, 키워드2"
  type="website"
  image="/og-image.jpg"
/>
```

## 🚀 배포

### Vercel 배포 (선택)

1. [Vercel](https://vercel.com)에 가입
2. GitHub 저장소 연결
3. 환경 변수 설정:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAIL`
4. Deploy 클릭

### Netlify 배포 (선택)
### GitHub Pages 배포 (현재 사용)

1. 환경 변수에서 `VITE_BASE_PATH`를 설정합니다(프로젝트 사이트의 경우 `/레포이름`).
2. 다음 스크립트를 사용합니다:
   - `npm run build`
   - `npm run deploy`
3. 라우터는 프로덕션에서 `basename`을 `VITE_BASE_PATH`로 자동 설정합니다.

1. [Netlify](https://netlify.com)에 가입
2. GitHub 저장소 연결
3. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. 환경 변수 설정
5. Deploy site 클릭

## 🔍 문제 해결

### 일반적인 문제들

#### 1. Supabase 연결 오류
- 환경 변수가 올바르게 설정되었는지 확인
- Supabase 프로젝트 URL과 키가 정확한지 확인
- RLS 정책이 올바르게 설정되었는지 확인

#### 2. 이미지 업로드 오류
- Storage 버킷이 `blog-images`로 생성되었는지 확인
- 버킷이 Public으로 설정되었는지 확인
- 파일 크기가 5MB 이하인지 확인

#### 3. 관리자 로그인 오류
- Supabase Authentication에서 사용자가 생성되었는지 확인
- `VITE_ADMIN_EMAIL`이 올바르게 설정되었는지 확인
- 비밀번호가 올바른지 확인

#### 4. 댓글 작성 오류
- 댓글 제한이 100개를 초과하지 않았는지 확인
- 모든 필수 필드가 입력되었는지 확인
- 네트워크 연결 상태 확인

### 디버깅

개발자 도구에서 다음을 확인하세요:

1. **Console**: JavaScript 오류 확인
2. **Network**: API 요청/응답 확인
3. **Application**: 로컬 스토리지 확인

### 로그 확인

Supabase 대시보드에서 다음을 확인할 수 있습니다:

1. **Logs**: API 요청 로그
2. **Database**: 테이블 데이터
3. **Storage**: 업로드된 파일
4. **Authentication**: 사용자 로그인 기록

## 📞 지원

문제가 발생하면 다음을 확인해주세요:

1. 이 문서의 문제 해결 섹션
2. [Supabase 문서](https://supabase.com/docs)
3. [React 문서](https://react.dev)
4. [Tailwind CSS 문서](https://tailwindcss.com/docs)

## 🔄 업데이트

프로젝트를 최신 상태로 유지하려면:

```bash
# 의존성 업데이트
npm update

# 보안 취약점 확인
npm audit

# 타입 체크
npm run build
```

---

이 가이드를 따라하면 완전히 작동하는 포트폴리오 & 블로그를 설정할 수 있습니다! 