import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight, LayoutDashboard, FileCog, Mail, FileText, FolderOpen, Tag, Database } from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
}

interface MenuItem {
  id: string
  label: string
  path: string
  icon?: ReactNode
}

interface MenuGroup {
  id: string
  label: string
  icon: ReactNode
  items: MenuItem[]
  isCollapsible?: boolean
}

// 사이드바 메뉴 데이터
const sidebarMenus: (MenuItem | MenuGroup)[] = [
  // 대시보드
  {
    id: 'dashboard',
    label: '대시보드',
    path: '/admin',
    icon: <LayoutDashboard size={18} />
  },
  
  // 블로그 관리
  {
    id: 'blog',
    label: '블로그 관리',
    icon: <FileText size={18} />,
    isCollapsible: false,
    items: [
      { id: 'blog-posts', label: '포스트 작성/편집', path: '/admin/blog' },
      { id: 'blog-categories', label: '포스트 카테고리', path: '/admin/blog/categories' }
    ]
  },
  
  // 프로젝트 관리
  {
    id: 'projects',
    label: '프로젝트 관리',
    icon: <FolderOpen size={18} />,
    isCollapsible: false,
    items: [
      { id: 'project-posts', label: '프로젝트 작성/편집', path: '/admin/projects' },
      { id: 'project-categories', label: '프로젝트 카테고리', path: '/admin/projects/categories' }
    ]
  },
  
  // 페이지 관리
  {
    id: 'pages',
    label: '페이지 관리',
    icon: <FileCog size={18} />,
    isCollapsible: false,
    items: [
      { id: 'page-home', label: 'Home', path: '/admin/pages/home' },
      { id: 'page-about', label: 'About', path: '/admin/pages/about' },
      { id: 'page-projects', label: 'Projects', path: '/admin/pages/projects' },
      { id: 'page-blog', label: 'Blog', path: '/admin/pages/blog' },
      { id: 'page-contact', label: 'Contact', path: '/admin/pages/contact' }
    ]
  },
  
  // 저장소 관리
  {
    id: 'storage',
    label: '저장소 관리',
    icon: <Database size={18} />,
    isCollapsible: false,
    items: [
      { id: 'storage-images', label: '스토리지 관리', path: '/admin/storage' }
    ]
  },
  
  // 파트너 관리
  {
    id: 'partners',
    label: '파트너 관리',
    icon: <Tag size={18} />,
    isCollapsible: false,
    items: [
      { id: 'partner-profiles', label: '파트너 프로필', path: '/admin/partners' },
      { id: 'partner-pages', label: '파트너 페이지', path: '/admin/partner-pages' }
    ]
  },
  
  // Contact 메시지
  {
    id: 'messages',
    label: 'Contact 메시지',
    path: '/admin/messages',
    icon: <Mail size={18} />
  }
]

// 메뉴 아이템 컴포넌트
const MenuItem = ({ item, isActive }: { item: MenuItem; isActive: boolean }) => (
  <Link
    to={item.path}
    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
    }`}
  >
    {item.icon}
    <span>{item.label}</span>
  </Link>
)

// 메뉴 그룹 컴포넌트
const MenuGroup = ({ 
  group, 
  isOpen, 
  onToggle, 
  isGroupActive, 
  isActive 
}: { 
  group: MenuGroup
  isOpen: boolean
  onToggle: () => void
  isGroupActive: boolean
  isActive: (path: string) => boolean
}) => (
  <div>
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-semibold transition-colors mt-2 ${
        isGroupActive
          ? 'bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
      aria-expanded={isOpen}
    >
      <span className="flex items-center gap-2">
        {group.icon}
        {group.label}
      </span>
      {group.isCollapsible && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
    </button>

    {(isOpen || !group.isCollapsible) && (
      <div className="mt-1 ml-2 space-y-1">
        {group.items.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`block px-3 py-2 rounded-md text-sm transition-colors ${
              isActive(item.path)
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    )}
  </div>
)

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path
  const isGroupActive = (prefix: string) => location.pathname.startsWith(prefix)

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-gray-900 dark:text-white">관리자</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">HJLEE Portfolio</div>
        </div>

        <nav className="p-2">
          {sidebarMenus.map((menu) => {
            // 단일 메뉴 아이템
            if ('path' in menu) {
              return (
                <MenuItem
                  key={menu.id}
                  item={menu}
                  isActive={isActive(menu.path)}
                />
              )
            }
            
            // 메뉴 그룹
            const isGroupActive = menu.items.some(item => 
              location.pathname.startsWith(item.path)
            )
            
            return (
              <MenuGroup
                key={menu.id}
                group={menu}
                isOpen={true}
                onToggle={() => {}}
                isGroupActive={isGroupActive}
                isActive={isActive}
              />
            )
          })}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}

export default AdminLayout




