# 이호진 포트폴리오 & 블로그

React, TypeScript, Tailwind CSS로 구축된 개인 포트폴리오 및 블로그 웹사이트입니다.

## 🚀 주요 기능

### 포트폴리오
- 반응형 디자인
- 다크 모드 지원
- 프로젝트 갤러리
- 애니메이션 효과 (Framer Motion)

### 블로그
- 마크다운 지원
- 카테고리 분류
- 태그 시스템
- 댓글 기능
- 검색 기능
- 관리자 패널

### 관리자 기능
- 포스트 작성/편집
- 카테고리 관리
- 프로젝트 관리
- 이미지 업로드
- 발행 상태 관리

## 🛠️ 기술 스택

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI/UX**: Framer Motion, Lucide React
- **Form**: React Hook Form, Zod
- **Markdown**: React Markdown, Rehype Highlight
- **Build Tool**: Vite

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/hjlee.github.io.git
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
1. Supabase 대시보드에서 SQL Editor로 이동
2. `supabase-schema.sql` 파일의 내용을 실행하세요

#### 4.3 Storage 버킷 생성
1. Storage 섹션에서 새 버킷을 생성하세요
2. 버킷 이름: `blog-images`
3. Public bucket으로 설정하세요

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
│   └── ProtectedRoute.tsx
├── contexts/           # React Context
│   └── AuthContext.tsx
├── lib/               # 유틸리티 및 설정
│   └── supabase.ts
├── pages/             # 페이지 컴포넌트
│   ├── Home.tsx
│   ├── About.tsx
│   ├── Projects.tsx
│   ├── Blog.tsx
│   ├── BlogPost.tsx
│   ├── Contact.tsx
│   ├── Login.tsx
│   └── admin/         # 관리자 페이지
└── content/           # 정적 콘텐츠
    └── images/
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

## 🎨 커스터마이징

### 색상 테마
`tailwind.config.js`에서 색상 테마를 수정할 수 있습니다.

### 컴포넌트 스타일
각 컴포넌트의 CSS 클래스를 수정하여 디자인을 변경할 수 있습니다.

### 마크다운 스타일
`BlogPost.tsx`의 `ReactMarkdown` 컴포넌트 설정을 수정하여 마크다운 렌더링을 커스터마이징할 수 있습니다.

## 🚀 배포

### Vercel 배포 (권장)
1. Vercel에 프로젝트를 연결
2. 환경 변수 설정
3. 자동 배포 설정

### Netlify 배포
1. Netlify에 프로젝트를 연결
2. 환경 변수 설정
3. 빌드 명령어: `npm run build`

## 📝 라이선스

MIT License

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 연락처

이호진 - [@your-twitter](https://twitter.com/your-twitter) - email@example.com

프로젝트 링크: [https://github.com/your-username/hjlee.github.io](https://github.com/your-username/hjlee.github.io)
