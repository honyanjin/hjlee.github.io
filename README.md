# 이호진 포트폴리오 & 블로그

React 19, TypeScript, Tailwind CSS로 구축된 개인 포트폴리오 및 블로그 웹사이트입니다. 협업 파트너를 위한 전용 관리 시스템과 각 페이지별 커스터마이징 기능을 제공합니다.

## 🚀 주요 기능

### 포트폴리오
- 반응형 디자인 (모바일/태블릿/데스크톱)
- 다크 모드 지원
- 프로젝트 갤러리 (카테고리별 필터링, Featured 프로젝트)
- 애니메이션 효과 (Framer Motion)
- 이미지 업로드 및 관리

### 블로그
- 리치 텍스트 편집기(TinyMCE) 기반 작성, HTML 저장 및 직접 렌더링
- 코드 하이라이팅 + 줄 단위 복사 UX(아이콘 클릭)
- 카테고리 분류
- 댓글 시스템 (스팸 방지)
- 추천 포스트 시스템
- 관리자 패널

### 관리자 기능
- 포스트 작성/편집 (TinyMCE 리치 텍스트, HTML 저장/렌더)
- 카테고리 관리
- 프로젝트 관리
- 이미지 업로드 (Supabase Storage)
- 댓글 관리
- 발행 상태 관리
- 스토리지 관리(`/admin/storage`): 파일 목록/검색/업로드/이동·복사·이름 변경/URL 및 서명 URL 복사, 참조 자동 업데이트
- 페이지 설정 관리: 각 페이지별 Hero 섹션 및 콘텐츠 구성
- 파트너 관리: 파트너 계정 및 페이지 할당 관리

### 파트너 시스템
- 파트너 전용 로그인 (`/partner/login`)
- 파트너 대시보드: 할당된 페이지 목록 및 관리
- 할당된 페이지 편집: 리치 텍스트 에디터로 콘텐츠 작성
- 권한 기반 접근: 할당된 페이지만 접근 가능
- RLS 기반 보안 정책

### 페이지 설정 시스템
- **Hero 섹션 설정**: 제목, 설명, 배경 이미지, CTA 버튼
- **콘텐츠 구성**: 섹션별 표시/숨김 설정
- **About 페이지**: 개인 정보, 프로필 이미지, 섹션 구성
- **Blog 페이지**: 추천 포스트, Featured 포스트 설정
- **Projects 페이지**: Featured 프로젝트, 정렬 설정
- **Contact 페이지**: 연락처 정보, 소셜 미디어, 운영 시간

## 🛠️ 기술 스택

### Frontend
- **React 19.1.0**: 최신 React 기능 활용 (Suspense, lazy loading, hooks)
- **TypeScript 5.8.3**: 타입 안정성 및 개발자 경험 향상
- **Tailwind CSS 3.4.17**: 유틸리티 퍼스트 CSS 프레임워크
- **Framer Motion 12.23.12**: 부드러운 애니메이션 및 전환 효과

### Backend & Database
- **Supabase 2.53.0**: 
  - PostgreSQL 데이터베이스
  - 실시간 구독 기능
  - 인증 시스템 (JWT)
  - 파일 스토리지
  - Row Level Security (RLS)

### Form & Validation
- **React Hook Form 7.61.1**: 고성능 폼 라이브러리
- **Zod 4.0.14**: TypeScript 기반 스키마 검증
- **@hookform/resolvers 5.2.1**: 폼 리졸버 통합

### Editor & Content
- **TinyMCE 6.3.0**: 리치 텍스트 편집기 (관리자 작성)
- **HTML 렌더링**: 본문은 HTML로 렌더링
- **코드 하이라이팅**: Rehype Highlight
- **마크다운 지원**: React Markdown (일부 컴포넌트)

### Build & Development
- **Vite 7.0.4**: 빠른 개발 서버 및 빌드 도구
- **ESLint 9.30.1**: 코드 품질 관리
- **PostCSS 8.5.6**: CSS 후처리

### Deployment
- **GitHub Pages**: 정적 사이트 호스팅
- **gh-pages 6.3.0**: 배포 자동화 도구

## 📦 설치 및 설정 가이드

이 섹션에서는 프로젝트의 완전한 설치 및 설정 방법을 안내합니다. 파트너 시스템과 페이지 설정 기능을 포함한 모든 기능의 설정 방법을 다룹니다.

### 🚀 빠른 시작

#### 1. 저장소 클론
```bash
git clone https://github.com/honyanjin/hjlee.github.io.git
cd hjlee.github.io
```

#### 2. 의존성 설치
```bash
npm install
```

#### 3. 환경 변수 설정
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

#### 4. Supabase 프로젝트 설정

**4.1 Supabase 프로젝트 생성**
1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트를 생성하세요
2. 프로젝트가 생성되면 Settings > API에서 다음 정보를 복사하세요:
   - Project URL
   - anon public key

**4.2 데이터베이스 스키마 설정**
1. Supabase 대시보드에서 SQL Editor로 이동
2. 아래의 전체 SQL을 복사하여 실행하세요
3. 실행 후 Tables 섹션에서 다음 테이블들이 생성되었는지 확인:

**핵심 테이블:**
- `blog_posts` (추천 포스트 필드 포함)
- `comments`
- `comment_limits`
- `categories`
- `project_categories`
- `projects`

**파트너 시스템 테이블:**
- `partner_profiles`
- `partner_pages`
- `partner_page_assignments`

**페이지 설정 테이블:**
- `about_page_settings`
- `about_me_settings`
- `blog_page_settings`
- `projects_page_settings`
- `contact_page_settings`

**콘텐츠 테이블:**
- `skills`
- `experiences`
- `educations`
- `contact_info`
- `contact_socials`
- `contact_hours`

```sql
-- 블로그 포스트 테이블
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_no INTEGER GENERATED ALWAYS AS IDENTITY UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  image_caption_text TEXT,
  image_caption_size INTEGER,
  image_caption_color TEXT,
  slug TEXT UNIQUE NOT NULL,
  is_published BOOLEAN DEFAULT false,
  is_recommended BOOLEAN DEFAULT false,
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

-- 댓글 일일 제한 테이블(스팸/남용 방지)
CREATE TABLE comment_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  daily_count INTEGER NOT NULL DEFAULT 0,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  blocked_until TIMESTAMP WITH TIME ZONE,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(post_id)
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

-- 파트너 프로필 테이블
CREATE TABLE partner_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  company TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 파트너 페이지 테이블
CREATE TABLE partner_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 파트너 페이지 할당 테이블
CREATE TABLE partner_page_assignments (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  page_id UUID REFERENCES partner_pages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, page_id)
);

-- 페이지 설정 테이블들
CREATE TABLE about_page_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  show_about_me BOOLEAN DEFAULT true,
  show_experience BOOLEAN DEFAULT true,
  show_education BOOLEAN DEFAULT true,
  show_skills BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE about_me_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  display_profile_image BOOLEAN DEFAULT true,
  name TEXT,
  title TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  birth_year INTEGER,
  show_email BOOLEAN DEFAULT true,
  show_phone BOOLEAN DEFAULT false,
  show_location BOOLEAN DEFAULT true,
  show_birth_year BOOLEAN DEFAULT true,
  show_resume_button BOOLEAN DEFAULT false,
  resume_url TEXT,
  resume_label TEXT,
  hero_subtitle TEXT,
  intro_title TEXT,
  intro_content_html TEXT,
  profile_image_url TEXT,
  side_image_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE blog_page_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hero_title TEXT,
  hero_description TEXT,
  hero_bg_image_url TEXT,
  hero_cta_label TEXT,
  hero_cta_url TEXT,
  featured_post_enabled BOOLEAN DEFAULT false,
  featured_post_title TEXT,
  featured_post_description TEXT,
  recommended_posts_enabled BOOLEAN DEFAULT true,
  recommended_posts_title TEXT,
  recommended_posts_description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE projects_page_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hero_title TEXT,
  hero_description TEXT,
  hero_bg_image_url TEXT,
  hero_cta_label TEXT,
  hero_cta_url TEXT,
  featured_projects_enabled BOOLEAN DEFAULT true,
  featured_projects_title TEXT,
  featured_projects_description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE contact_page_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  show_hero BOOLEAN DEFAULT true,
  hero_title TEXT,
  hero_description TEXT,
  hero_bg_image_url TEXT,
  hero_cta_label TEXT,
  hero_cta_url TEXT,
  show_form BOOLEAN DEFAULT true,
  show_info BOOLEAN DEFAULT true,
  show_socials BOOLEAN DEFAULT true,
  show_hours BOOLEAN DEFAULT true,
  success_message TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- About 페이지 콘텐츠 테이블들
CREATE TABLE skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  proficiency INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  category_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  period TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  is_current BOOLEAN DEFAULT false,
  description_html TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE educations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact 페이지 콘텐츠 테이블들
CREATE TABLE contact_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  label TEXT,
  value TEXT,
  link TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE contact_socials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE contact_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  time TEXT NOT NULL,
  note TEXT,
  display_order INTEGER DEFAULT 0
);
```

**4.3 Storage 버킷 생성**
1. Storage 섹션으로 이동
2. "New bucket" 클릭하여 다음 버킷들을 생성하세요:

**blog-images 버킷:**
- 버킷 이름: `blog-images`
- Public bucket 체크
- Create bucket 클릭

**project-images 버킷:**
- 버킷 이름: `project-images`
- Public bucket 체크
- Create bucket 클릭

**4.4 관리자 계정 생성**
1. Authentication > Users로 이동
2. "Add user" 클릭
3. 이메일과 비밀번호 입력
4. 생성한 이메일을 `VITE_ADMIN_EMAIL`에 설정

**4.5 보안 정책 설정**
1. SQL Editor에서 아래 RLS 정책을 실행하세요
2. 다음 정책들이 적용되었는지 확인:
   - 공개 테이블 읽기 권한
   - 관리자 전용 쓰기 권한
   - 파트너 시스템 권한 분리

```sql
-- 프로젝트 카테고리: 공개 읽기, 관리자만 쓰기
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS project_categories_public_read ON public.project_categories;
CREATE POLICY project_categories_public_read
ON public.project_categories
FOR SELECT
USING (true);

DROP POLICY IF EXISTS project_categories_admin_all ON public.project_categories;
CREATE POLICY project_categories_admin_all
ON public.project_categories
FOR ALL
USING ((auth.jwt() ->> 'email') = current_setting('app.admin_email', true))
WITH CHECK ((auth.jwt() ->> 'email') = current_setting('app.admin_email', true));

-- 파트너 시스템 RLS 정책
ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_page_assignments ENABLE ROW LEVEL SECURITY;

-- 파트너 프로필: 본인만 읽기, 관리자만 쓰기
CREATE POLICY partner_profiles_own_read ON public.partner_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY partner_profiles_admin_all ON public.partner_profiles
FOR ALL USING ((auth.jwt() ->> 'email') = current_setting('app.admin_email', true))
WITH CHECK ((auth.jwt() ->> 'email') = current_setting('app.admin_email', true));

-- 파트너 페이지: 할당된 파트너만 읽기/쓰기, 관리자만 모든 권한
CREATE POLICY partner_pages_assigned_read ON public.partner_pages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.partner_page_assignments 
    WHERE page_id = id AND user_id = auth.uid()
  )
);

CREATE POLICY partner_pages_assigned_update ON public.partner_pages
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.partner_page_assignments 
    WHERE page_id = id AND user_id = auth.uid()
  )
);

CREATE POLICY partner_pages_admin_all ON public.partner_pages
FOR ALL USING ((auth.jwt() ->> 'email') = current_setting('app.admin_email', true))
WITH CHECK ((auth.jwt() ->> 'email') = current_setting('app.admin_email', true));

-- 파트너 페이지 할당: 관리자만 관리
CREATE POLICY partner_page_assignments_admin_all ON public.partner_page_assignments
FOR ALL USING ((auth.jwt() ->> 'email') = current_setting('app.admin_email', true))
WITH CHECK ((auth.jwt() ->> 'email') = current_setting('app.admin_email', true));

-- updated_at 트리거 함수들: search_path 고정 및 내장함수 완전 수식
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at := pg_catalog.now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_projects_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at := pg_catalog.now();
  RETURN NEW;
END;
$$;

-- storage.objects 버킷 단위 RLS (예시): 공개 읽기, 관리자만 쓰기
-- 버킷: blog-images, project-images
-- 정책은 Supabase 대시보드에서 버킷별로 설정하세요.
```

추가 권장: Authentication → Providers → Email에서 "Prevent leaked passwords" 활성화, MFA(TOTP/Passkeys) 옵션 활성화.

#### 5. 개발 서버 실행
```bash
npm run dev
```

### 📋 기능별 설정 가이드

#### 블로그 기능

**포스트 작성**
1. `/admin/blog`로 이동하여 로그인
2. "새 포스트" 버튼 클릭
3. 제목, 카테고리, 요약 입력
4. TinyMCE 리치 텍스트로 내용 작성(HTML 저장/렌더)
5. 태그 설정 (쉼표로 구분)
6. 대표 이미지 업로드 (선택사항)
7. **추천 포스트 설정** (선택사항) - 홈페이지 캐러셀에 노출
8. "즉시 발행" 체크하여 발행 또는 임시저장

**카테고리 관리**
1. `/admin/categories`로 이동
2. "새 카테고리" 버튼 클릭
3. 카테고리명, 슬러그, 설명 입력
4. 색상 선택 (블로그에서 카테고리별 색상 표시)
5. 저장

**댓글 시스템**
- 자동 스팸 방지 (하루 100개 댓글 제한)
- 작성자 본인 삭제 가능
- 관리자 권한으로 모든 댓글 삭제 가능

#### 프로젝트 관리

**프로젝트 추가**
1. `/admin/projects`로 이동
2. "새 프로젝트" 버튼 클릭
3. 제목, 설명, 카테고리 입력
4. 태그 설정
5. 라이브 URL, GitHub URL 입력 (선택사항)
6. 대표 이미지 업로드
7. **"대표 프로젝트" 설정** (홈페이지에 표시)
8. 발행 상태 설정

#### 페이지 설정 관리

**About 페이지 설정**
1. `/admin/pages/about`로 이동
2. **About 페이지 설정** 탭:
   - About Me, Experience, Education, Skills 섹션 표시/숨김 설정
3. **About Me 설정** 탭:
   - 개인 정보 (이름, 직함, 연락처)
   - 프로필 이미지 및 사이드 이미지 설정
   - 이력서 버튼 설정
   - 소개 내용 (HTML 지원)
4. **Experience 관리** 탭:
   - 경력 사항 추가/편집/삭제
   - 현재 직장 표시 설정
5. **Education 관리** 탭:
   - 학력 사항 추가/편집/삭제
   - 현재 재학 중 표시 설정
6. **Skills 관리** 탭:
   - 스킬 카테고리별 관리
   - 숙련도 설정

**Blog 페이지 설정**
1. `/admin/pages/blog`로 이동
2. **Hero 섹션 설정**:
   - 제목, 설명, 배경 이미지, CTA 버튼
3. **추천 포스트 설정**:
   - 추천 포스트 섹션 활성화/비활성화
   - 섹션 제목 및 설명 설정
4. **Featured 포스트 설정**:
   - Featured 포스트 섹션 활성화/비활성화
   - 섹션 제목 및 설명 설정

**Projects 페이지 설정**
1. `/admin/pages/projects`로 이동
2. **Hero 섹션 설정**:
   - 제목, 설명, 배경 이미지, CTA 버튼
3. **Featured 프로젝트 설정**:
   - Featured 프로젝트 섹션 활성화/비활성화
   - 섹션 제목 및 설명 설정

**Contact 페이지 설정**
1. `/admin/pages/contact`로 이동
2. **Hero 섹션 설정**:
   - 제목, 설명, 배경 이미지, CTA 버튼
3. **섹션 표시 설정**:
   - 연락처 폼, 정보, 소셜 미디어, 운영 시간 표시/숨김
4. **연락처 정보 관리**:
   - 연락처 정보 추가/편집/삭제
5. **소셜 미디어 관리**:
   - 소셜 미디어 링크 추가/편집/삭제
6. **운영 시간 관리**:
   - 운영 시간 정보 추가/편집/삭제

#### 파트너 시스템 설정

**파트너 계정 생성**
1. `/admin/partners`로 이동
2. "새 파트너 추가" 버튼 클릭
3. 파트너 정보 입력:
   - 이메일 (Supabase Auth 계정과 연결)
   - 이름
   - 회사명
   - 상태 (active/inactive)
4. 저장

**파트너 페이지 할당**
1. `/admin/partner-pages`로 이동
2. "새 파트너 페이지" 버튼 클릭
3. 페이지 정보 입력:
   - 제목
   - 내용 (리치 텍스트 에디터)
   - 요약
4. 파트너 할당:
   - 할당할 파트너 선택
5. 발행 상태 설정
6. 저장

**파트너 로그인 및 관리**
1. 파트너는 `/partner/login`에서 로그인
2. 파트너 대시보드에서 할당된 페이지 목록 확인
3. 할당된 페이지 편집:
   - 제목, 내용 수정
   - 발행 상태 변경
4. 변경사항 자동 저장

#### 이미지 관리

**이미지 라이브러리 사용**
1. `/admin/storage`로 이동
2. **파일 업로드**:
   - 드래그 앤 드롭 또는 파일 선택
   - 자동 최적화 및 썸네일 생성
3. **파일 관리**:
   - 파일 이동, 복사, 이름 변경
   - URL 복사 (공개 URL 및 서명 URL)
   - 참조 자동 업데이트
4. **검색 및 필터링**:
   - 파일명, 확장자별 검색
   - 날짜별 정렬

### 🔧 고급 설정

#### 본문 렌더링 스타일

`src/pages/BlogPost.tsx`에서 TinyMCE 저장본(HTML)을 직접 렌더링합니다. 코드 블록 라인 복사 UX는 `.copy-line-icon` 이벤트 위임으로 동작합니다.

#### 색상 테마 변경

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

#### SEO 설정

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

#### 파트너 시스템 고급 설정

**RLS 정책 확인**
다음 SQL로 파트너 시스템 RLS 정책이 올바르게 설정되었는지 확인하세요:

```sql
-- 파트너 프로필 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'partner_profiles';

-- 파트너 페이지 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'partner_pages';
```

**관리자 이메일 설정**
관리자 권한 판단은 환경 변수 `VITE_ADMIN_EMAIL`을 사용합니다. Supabase에서 추가 설정이 필요한 경우:

```sql
-- 현재 세션에만 적용 (테스트용)
select set_config('app.admin_email', 'your_admin_email@example.com', true);

-- 데이터베이스에 영구 적용 (권장)
alter database postgres set app.admin_email to 'your_admin_email@example.com';
```

#### 페이지 설정 고급 설정

**기본 데이터 삽입**
페이지 설정 테이블에 기본 데이터를 삽입하려면:

```sql
-- About 페이지 기본 설정
INSERT INTO about_page_settings (id, show_about_me, show_experience, show_education, show_skills)
VALUES ('default', true, true, true, true)
ON CONFLICT (id) DO NOTHING;

-- Blog 페이지 기본 설정
INSERT INTO blog_page_settings (id, recommended_posts_enabled, featured_post_enabled)
VALUES ('default', true, false)
ON CONFLICT (id) DO NOTHING;

-- Projects 페이지 기본 설정
INSERT INTO projects_page_settings (id, featured_projects_enabled)
VALUES ('default', true)
ON CONFLICT (id) DO NOTHING;

-- Contact 페이지 기본 설정
INSERT INTO contact_page_settings (id, show_hero, show_form, show_info, show_socials, show_hours)
VALUES ('default', true, true, true, true, true)
ON CONFLICT (id) DO NOTHING;
```

### 🔍 문제 해결

#### 일반적인 문제들

**1. Supabase 연결 오류**
- 환경 변수가 올바르게 설정되었는지 확인
- Supabase 프로젝트 URL과 키가 정확한지 확인
- RLS 정책이 올바르게 설정되었는지 확인

**2. 이미지 업로드 오류**
- Storage 버킷이 `blog-images`, `project-images`로 생성되었는지 확인
- 버킷이 Public으로 설정되었는지 확인
- 파일 크기가 5MB 이하인지 확인

**3. 관리자 로그인 오류**
- Supabase Authentication에서 사용자가 생성되었는지 확인
- `VITE_ADMIN_EMAIL`이 올바르게 설정되었는지 확인
- 비밀번호가 올바른지 확인

**4. 파트너 시스템 오류**
- 파트너 프로필이 `partner_profiles` 테이블에 생성되었는지 확인
- 파트너 페이지 할당이 `partner_page_assignments` 테이블에 설정되었는지 확인
- RLS 정책이 올바르게 적용되었는지 확인

**5. 페이지 설정 오류**
- 페이지 설정 테이블에 기본 데이터가 삽입되었는지 확인
- 관리자 권한으로 접근하고 있는지 확인
- 환경 변수가 올바르게 설정되었는지 확인

**6. 댓글 작성 오류**
- 댓글 제한이 100개를 초과하지 않았는지 확인
- 모든 필수 필드가 입력되었는지 확인
- 네트워크 연결 상태 확인

#### 디버깅

개발자 도구에서 다음을 확인하세요:

1. **Console**: JavaScript 오류 확인
2. **Network**: API 요청/응답 확인
3. **Application**: 로컬 스토리지 확인

#### 로그 확인

Supabase 대시보드에서 다음을 확인할 수 있습니다:

1. **Logs**: API 요청 로그
2. **Database**: 테이블 데이터
3. **Storage**: 업로드된 파일
4. **Authentication**: 사용자 로그인 기록

#### 정상 동작 확인 체크리스트

**기본 기능**
- [ ] 관리자 로그인 가능
- [ ] 블로그 포스트 작성/편집 가능
- [ ] 프로젝트 추가/편집 가능
- [ ] 이미지 업로드 가능
- [ ] 댓글 작성 가능

**파트너 시스템**
- [ ] 파트너 계정 생성 가능
- [ ] 파트너 페이지 할당 가능
- [ ] 파트너 로그인 가능
- [ ] 파트너 페이지 편집 가능
- [ ] 권한 분리 정상 동작

**페이지 설정**
- [ ] About 페이지 설정 가능
- [ ] Blog 페이지 설정 가능
- [ ] Projects 페이지 설정 가능
- [ ] Contact 페이지 설정 가능
- [ ] 설정 변경사항 즉시 반영

### 🔄 업데이트

프로젝트를 최신 상태로 유지하려면:

```bash
# 의존성 업데이트
npm update

# 보안 취약점 확인
npm audit

# 타입 체크
npm run build

# 린트 검사
npm run lint
```

### 🎯 성능 최적화

#### 이미지 최적화
- WebP 포맷 사용 권장
- 이미지 크기 최적화 (최대 5MB)
- Lazy loading 활용

#### 코드 스플리팅
- 관리자 및 파트너 페이지는 자동으로 lazy loading됩니다
- 번들 크기 최적화가 자동으로 적용됩니다

#### 캐싱 전략
- Supabase CDN 활용
- 브라우저 캐싱 최적화
- 정적 자산 캐싱

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── admin/          # 관리자 전용 컴포넌트
│   │   ├── about/      # About 페이지 관리 컴포넌트
│   │   ├── blog/       # 블로그 관리 컴포넌트
│   │   └── AdminPageHeader.tsx
│   ├── blog/           # 블로그 관련 컴포넌트
│   │   ├── AllPostsCarousel.tsx
│   │   ├── PostCard.tsx
│   │   ├── PostsGrid.tsx
│   │   ├── RecommendedPostsCarousel.tsx
│   │   └── SectionHeader.tsx
│   ├── common/         # 공통 UI 컴포넌트
│   │   ├── EmptyState.tsx
│   │   ├── ErrorMessage.tsx
│   │   └── LoadingSpinner.tsx
│   ├── Navbar.tsx
│   ├── SEO.tsx
│   ├── ShareButtons.tsx
│   ├── Comments.tsx
│   ├── ImageUpload.tsx
│   ├── ImageWithFallback.tsx
│   ├── ImageLibraryModal.tsx
│   ├── PreviewModal.tsx
│   ├── ProtectedRoute.tsx
│   ├── ScrollToTop.tsx
│   ├── DotNavigation.tsx
│   ├── Breadcrumb.tsx
│   ├── Hero.tsx
│   ├── HeroSettings.tsx
│   ├── RichTextEditor.tsx
│   └── PartnerLayout.tsx
├── contexts/           # React Context
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── ImageLibraryContext.tsx
├── hooks/              # 커스텀 훅
│   ├── useBlogPosts.ts
│   ├── useCategoryManager.ts
│   ├── usePageSettings.ts
│   ├── useProjects.ts
│   └── useSupabaseQuery.ts
├── lib/               # 유틸리티 및 설정
│   ├── supabase.ts
│   ├── constants.ts
│   ├── storage.ts
│   └── markdownConverter.ts
├── pages/             # 페이지 컴포넌트
│   ├── Home.tsx
│   ├── About.tsx
│   ├── Projects.tsx
│   ├── Blog.tsx
│   ├── BlogPost.tsx
│   ├── Contact.tsx
│   ├── Login.tsx
│   ├── PartnerLogin.tsx
│   ├── PartnerDashboard.tsx
│   ├── PartnerPage.tsx
│   ├── PartnerNewPage.tsx
│   ├── AdminDashboard.tsx
│   ├── AdminBlog.tsx
│   ├── AdminBlogNew.tsx
│   ├── AdminBlogEdit.tsx
│   ├── AdminCategories.tsx
│   ├── AdminProjects.tsx
│   ├── AdminProjectNew.tsx
│   ├── AdminProjectEdit.tsx
│   ├── AdminProjectCategories.tsx
│   ├── AdminComments.tsx
│   ├── AdminStorage.tsx
│   ├── AdminPagesHome.tsx
│   ├── AdminPagesAbout.tsx
│   ├── AdminPagesProjects.tsx
│   ├── AdminPagesBlog.tsx
│   ├── AdminPagesContact.tsx
│   ├── AdminMessages.tsx
│   ├── AdminPartners.tsx
│   └── AdminPartnerPages.tsx
├── types/             # TypeScript 타입 정의
│   └── index.ts
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
3. TinyMCE 에디터로 내용 작성(HTML 저장/렌더)
4. 카테고리 및 태그 설정
5. 추천 포스트 설정 (선택사항)
6. 발행 또는 임시저장

### 카테고리 관리
- `/admin/categories`에서 카테고리 추가/편집
- 각 카테고리에 색상 설정 가능

### 프로젝트 관리
- `/admin/projects`에서 프로젝트 추가/편집
- 이미지 업로드 및 링크 설정 가능
- Featured 프로젝트 설정 가능

### 페이지 설정 관리
- `/admin/pages/*`에서 각 페이지별 설정 관리
- Hero 섹션 커스터마이징
- 콘텐츠 구성 설정
- About 페이지: 개인 정보, 경험, 교육, 스킬 관리
- Contact 페이지: 연락처 정보, 소셜 미디어, 운영 시간 관리

### 파트너 관리
- `/admin/partners`에서 파트너 계정 관리
- `/admin/partner-pages`에서 파트너 페이지 할당
- 파트너는 `/partner/login`에서 로그인하여 할당된 페이지 관리

## 🎨 커스터마이징

### 색상 테마
`tailwind.config.js`에서 색상 테마를 수정할 수 있습니다.

### 컴포넌트 스타일
각 컴포넌트의 CSS 클래스를 수정하여 디자인을 변경할 수 있습니다.

### 본문 렌더링 스타일
`BlogPost.tsx`의 HTML 렌더링 스타일(코드 하이라이팅 포함)을 필요에 맞게 조정할 수 있습니다.

### 페이지 설정
각 페이지별로 Hero 섹션과 콘텐츠 구성을 완전히 커스터마이징할 수 있습니다.

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
- `VITE_TINYMCE_API_KEY` (TinyMCE Cloud API Key)
- `VITE_BASE_PATH` (프로덕션 베이스 경로. GitHub Pages 프로젝트 사이트라면 `/레포이름`)

#### 베이스 경로 관리 안내
- 기본적으로 개발 모드에서는 `/`를 사용합니다.
- 프로덕션 빌드에서는 `VITE_BASE_PATH`를 사용합니다. 미설정 시 `/`로 동작합니다.
- GitHub Pages 사용자 사이트가 아닌 프로젝트 사이트로 배포하는 경우에 필수입니다.

## 📊 현재 상태

### ✅ 완료된 기능 (98%)
- [x] React 19.1.0 업그레이드 (Concurrent Features 활용)
- [x] TypeScript 5.8.3 (ES2022 타겟, 엄격한 타입 검사)
- [x] 반응형 디자인 완성 (모바일 퍼스트)
- [x] 다크모드 구현 (사용자 선호도 저장)
- [x] 블로그 시스템 (TinyMCE HTML 에디터, 댓글, 추천 포스트)
- [x] 프로젝트 갤러리 (카테고리별 필터링, Featured 프로젝트)
- [x] 이미지 관리 시스템 (중앙화된 라이브러리, 파일 관리)
- [x] 관리자 패널 완성 (전체 콘텐츠 관리)
- [x] 파트너 시스템 (전용 인증, 권한 관리, 페이지 할당)
- [x] 페이지 설정 시스템 (Hero, 콘텐츠 구성 커스터마이징)
- [x] 폼 검증 시스템 (React Hook Form + Zod)
- [x] 보안 강화: RLS + 함수 보안 + 관리자/파트너 권한 분리
- [x] 코드 스플리팅 (관리자 및 파트너 페이지 lazy loading)

### 🔄 진행 중인 작업 (2%)
- 고도화된 접근성 개선 (ARIA 라벨, 키보드 네비게이션)
- SEO 최적화 (메타 태그, 구조화된 데이터)
- 성능 최적화 (이미지 lazy loading, Core Web Vitals)

### 🎆 추가 개선 가능 영역 (선택사항)
- WebP 이미지 포맷 최적화
- PWA 기능 (Service Worker, 오프라인 지원)
- 고급 검색 기능 (전체 텍스트 검색)
- 파트너 알림 시스템 (이메일/인앱 알림)
- 다국어 지원 (i18n)
- MFA 옵션 확장 (TOTP + WebAuthn/Passkeys)

## 🚀 성능 개선 사항

### 완료된 성능 최적화
- **코드 스플리팅**: 관리자 및 파트너 페이지 lazy loading
- **번들 최적화**: vendor/router/ui 청크 분리
- **이미지 처리**: ImageWithFallback 컴포넌트
- **초기 로딩**: 1.5-2.5초로 개선

### 추가 최적화 가능 영역
- WebP 이미지 포맷 변환
- Service Worker 기반 캐싱
- 고급 검색 및 필터링 시스템

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

라이브 사이트: 환경 변수 `VITE_BASE_PATH`에 따라 달라집니다. 예) `https://honyanjin.github.io/hjlee.github.io`

---

🎆 **현재 프로젝트는 98% 완성된 상태로, 모든 핵심 기능이 구현되어 있습니다. 파트너 시스템과 페이지 설정 기능을 통해 협업과 커스터마이징이 가능합니다. 추가 개선 사항은 선택사항으로, 필요에 따라 구현할 수 있습니다.**
