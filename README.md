# 이호진 포트폴리오 & 블로그

React 19, TypeScript, Tailwind CSS로 구축된 개인 포트폴리오 및 블로그 웹사이트입니다.

## 🚀 주요 기능

### 포트폴리오
- 반응형 디자인 (모바일/태블릿/데스크톱)
- 다크 모드 지원
- 프로젝트 갤러리 (카테고리별 필터링)
- 애니메이션 효과 (Framer Motion)
- 이미지 업로드 및 관리

### 블로그
- 마크다운 지원 (React Markdown)
- 코드 하이라이팅 (Rehype Highlight)
- 카테고리 분류
- 댓글 시스템
- 관리자 패널

### 관리자 기능
- 포스트 작성/편집 (마크다운 에디터)
- 카테고리 관리
- 프로젝트 관리
- 이미지 업로드 (Supabase Storage)
- 댓글 관리
- 발행 상태 관리

## 🛠️ 기술 스택

### Frontend
- **React 19**: 최신 React 기능 활용
- **TypeScript**: 타입 안정성 및 개발자 경험 향상
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크
- **Framer Motion**: 부드러운 애니메이션 및 전환 효과

### Backend & Database
- **Supabase**: 
  - PostgreSQL 데이터베이스
  - 실시간 구독 기능
  - 인증 시스템 (JWT)
  - 파일 스토리지
  - Row Level Security (RLS)

### Form & Validation
- **React Hook Form**: 고성능 폼 라이브러리
- **Zod**: TypeScript 기반 스키마 검증
- **@hookform/resolvers**: 폼 리졸버 통합

### Markdown & Content
- **React Markdown**: 마크다운 렌더링
- **Remark GFM**: GitHub Flavored Markdown 지원
- **Rehype Highlight**: 코드 하이라이팅

### Build & Development
- **Vite**: 빠른 개발 서버 및 빌드 도구
- **ESLint**: 코드 품질 관리
- **PostCSS**: CSS 후처리

### Deployment
- **GitHub Pages**: 정적 사이트 호스팅
- **gh-pages**: 배포 자동화 도구

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/honyanjin/hjlee.github.io.git
cd hjlee.github.io
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Configuration
VITE_ADMIN_EMAIL=your_admin_email@example.com
```

### 4. Supabase 설정

#### 4.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성하세요
2. 프로젝트 URL과 anon key를 복사하여 환경 변수에 설정하세요

#### 4.2 데이터베이스 스키마 설정
Supabase SQL Editor에서 다음 테이블들을 생성하세요:

```sql
-- 블로그 포스트 테이블
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- 댓글 테이블
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카테고리 테이블
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 프로젝트 카테고리 테이블
CREATE TABLE project_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 프로젝트 테이블
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES project_categories(id),
  category TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  live_url TEXT,
  github_url TEXT,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4.3 Storage 버킷 생성
1. Storage 섹션에서 새 버킷을 생성하세요
2. 버킷 이름: `blog-images`, `project-images`
3. Public bucket으로 설정하세요
4. 각 버킷의 용도:
   - `blog-images`: 블로그 포스트 이미지
   - `project-images`: 프로젝트 썸네일 이미지

#### 4.4 관리자 계정 생성
1. Authentication > Users에서 새 사용자를 생성하세요
2. 생성한 이메일을 `VITE_ADMIN_EMAIL`에 설정하세요

### 5. 개발 서버 실행
```bash
npm run dev
```

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── Navbar.tsx
│   ├── SEO.tsx
│   ├── ShareButtons.tsx
│   ├── Comments.tsx
│   ├── ImageUpload.tsx
│   ├── ImageWithFallback.tsx
│   ├── InlineImageUpload.tsx
│   ├── PreviewModal.tsx
│   ├── ProtectedRoute.tsx
│   ├── ScrollToTop.tsx
│   ├── DotNavigation.tsx
│   └── Breadcrumb.tsx
├── contexts/           # React Context
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── lib/               # 유틸리티 및 설정
│   ├── supabase.ts
│   └── constants.ts
├── pages/             # 페이지 컴포넌트
│   ├── Home.tsx
│   ├── About.tsx
│   ├── Projects.tsx
│   ├── Blog.tsx
│   ├── BlogPost.tsx
│   ├── Contact.tsx
│   ├── Login.tsx
│   ├── AdminDashboard.tsx
│   ├── AdminBlog.tsx
│   ├── AdminBlogNew.tsx
│   ├── AdminBlogEdit.tsx
│   ├── AdminCategories.tsx
│   ├── AdminProjects.tsx
│   ├── AdminProjectNew.tsx
│   ├── AdminProjectEdit.tsx
│   ├── AdminProjectCategories.tsx
│   └── AdminComments.tsx
├── content/           # 정적 콘텐츠
│   ├── pic_about_me/
│   ├── pic_profile/
│   └── pic_projects/
├── assets/            # 이미지 및 아이콘
│   └── react.svg
├── App.tsx            # 메인 앱 컴포넌트
├── main.tsx           # 앱 진입점
├── index.css          # 전역 스타일
└── vite-env.d.ts     # Vite 타입 정의
```

## 🔧 주요 설정

### 블로그 포스트 작성
1. `/admin/blog`로 이동하여 로그인
2. "새 포스트" 버튼 클릭
3. 마크다운 형식으로 내용 작성
4. 카테고리 및 태그 설정
5. 발행 또는 임시저장

### 카테고리 관리
- `/admin/categories`에서 카테고리 추가/편집
- 각 카테고리에 색상 설정 가능

### 프로젝트 관리
- `/admin/projects`에서 프로젝트 추가/편집
- 이미지 업로드 및 링크 설정 가능
- Featured 프로젝트 설정 가능

## 🎨 커스터마이징

### 색상 테마
`tailwind.config.js`에서 색상 테마를 수정할 수 있습니다.

### 컴포넌트 스타일
각 컴포넌트의 CSS 클래스를 수정하여 디자인을 변경할 수 있습니다.

### 마크다운 스타일
`BlogPost.tsx`의 `ReactMarkdown` 컴포넌트 설정을 수정하여 마크다운 렌더링을 커스터마이징할 수 있습니다.

## 🚀 배포

### GitHub Pages 배포 (현재 사용 중)
```bash
npm run build    # 프로덕션 빌드
npm run deploy   # GitHub Pages 배포
```

### 환경 변수 설정
배포 시 환경 변수를 올바르게 설정해야 합니다:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAIL`

## 📊 현재 상태

### ✅ 완료된 기능 (90%)
- [x] React 19 업그레이드
- [x] 반응형 디자인 완성
- [x] 다크모드 구현
- [x] 블로그 시스템 (마크다운, 댓글)
- [x] 이미지 업로드 시스템
- [x] 관리자 패널 완성
- [x] 폼 검증 시스템 (React Hook Form + Zod)

### 🔄 진행 중인 작업
- 성능 최적화
- 접근성 개선
- SEO 최적화

## 🐛 알려진 이슈

### 성능 관련
- 이미지 최적화 필요 (WebP 포맷, lazy loading)
- 번들 크기 최적화 필요
- 초기 로딩 속도 개선 필요

### 기능 관련
- 프로젝트/블로그 검색 기능 미구현
- 사용자 관리 기능 미구현
- 고급 필터링 옵션 미구현

## 📝 라이선스

MIT License

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 연락처

이호진 - [GitHub](https://github.com/honyanjin) - hjlee.dev@gmail.com

프로젝트 링크: [https://github.com/honyanjin/hjlee.github.io](https://github.com/honyanjin/hjlee.github.io)

라이브 사이트: [https://honyanjin.github.io/hjlee.github.io](https://honyanjin.github.io/hjlee.github.io)
