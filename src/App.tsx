import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ImageLibraryProvider } from './contexts/ImageLibraryContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Contact from './pages/Contact'
import Login from './pages/Login'
const PartnerLogin = lazy(() => import('./pages/PartnerLogin'))
const PartnerDashboard = lazy(() => import('./pages/PartnerDashboard'))
const PartnerPage = lazy(() => import('./pages/PartnerPage'))
const PartnerNewPage = lazy(() => import('./pages/PartnerNewPage'))

// Admin pages (code-splitting)
const AdminBlog = lazy(() => import('./pages/AdminBlog'))
const AdminBlogNew = lazy(() => import('./pages/AdminBlogNew'))
const AdminBlogEdit = lazy(() => import('./pages/AdminBlogEdit'))
const AdminCategories = lazy(() => import('./pages/AdminCategories'))
const AdminProjects = lazy(() => import('./pages/AdminProjects'))
const AdminProjectNew = lazy(() => import('./pages/AdminProjectNew'))
const AdminProjectEdit = lazy(() => import('./pages/AdminProjectEdit'))
const AdminProjectCategories = lazy(() => import('./pages/AdminProjectCategories'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminComments = lazy(() => import('./pages/AdminComments'))
  const AdminStorage = lazy(() => import('./pages/AdminStorage'))
const AdminPagesHome = lazy(() => import('./pages/AdminPagesHome'))
const AdminPagesAbout = lazy(() => import('./pages/AdminPagesAbout'))
const AdminPagesProjects = lazy(() => import('./pages/AdminPagesProjects'))
const AdminPagesBlog = lazy(() => import('./pages/AdminPagesBlog'))
const AdminPagesContact = lazy(() => import('./pages/AdminPagesContact'))
const AdminMessages = lazy(() => import('./pages/AdminMessages'))
const AdminPartners = lazy(() => import('./pages/AdminPartners'))
const AdminPartnerPages = lazy(() => import('./pages/AdminPartnerPages'))

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ImageLibraryProvider>
        <div id="app">
          <Suspense
            fallback={
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              </div>
            }
          >
          <Routes>
            <Route id="home-route" path="/" element={<Home />} />
            <Route id="about-route" path="/about" element={<About />} />
            <Route id="projects-route" path="/projects" element={<Projects />} />
            <Route id="blog-route" path="/blog" element={<Blog />} />
            <Route id="blog-post-route" path="/blog/:postNo" element={<BlogPost />} />
            <Route id="contact-route" path="/contact" element={<Contact />} />
            <Route id="login-route" path="/login" element={<Login />} />
            {/* Partner Routes */}
            <Route id="partner-login-route" path="/partner/login" element={<PartnerLogin />} />
            <Route 
              id="partner-dashboard-route"
              path="/partner/:userId"
              element={
                <ProtectedRoute requirePartner={true}>
                  <PartnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route 
              id="partner-new-page-route"
              path="/partner/:userId/pages/new"
              element={
                <ProtectedRoute requirePartner={true}>
                  <PartnerNewPage />
                </ProtectedRoute>
              }
            />
            <Route 
              id="partner-page-route"
              path="/partner/pages/:userId/:pageId"
              element={
                <ProtectedRoute requirePartner={true}>
                  <PartnerPage />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route 
              id="admin-dashboard-route" 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-pages-home-route" 
              path="/admin/pages/home" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminPagesHome />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-pages-about-route" 
              path="/admin/pages/about" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPagesAbout />
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-pages-projects-route" 
              path="/admin/pages/projects" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminPagesProjects />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-pages-blog-route" 
              path="/admin/pages/blog" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminPagesBlog />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-pages-contact-route" 
              path="/admin/pages/contact" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminPagesContact />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-blog-route" 
              path="/admin/blog" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminBlog />
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-blog-new-route" 
              path="/admin/blog/new" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminBlogNew />
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-blog-edit-route" 
              path="/admin/blog/edit/:id" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminBlogEdit />
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-categories-route" 
              path="/admin/categories" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminCategories />
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-blog-categories-route" 
              path="/admin/blog/categories" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminCategories />
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-projects-route" 
              path="/admin/projects" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminProjects />
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-project-new-route" 
              path="/admin/projects/new" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminProjectNew />
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-project-edit-route" 
              path="/admin/projects/edit/:id" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminProjectEdit />
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-project-categories-route" 
              path="/admin/projects/categories" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminProjectCategories />
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-comments-route" 
              path="/admin/comments" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminComments />
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-storage-route" 
              path="/admin/storage" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminStorage />
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-messages-route" 
              path="/admin/messages" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminMessages />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-partners-route" 
              path="/admin/partners" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminPartners />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              id="admin-partner-pages-route" 
              path="/admin/partner-pages" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminPartnerPages />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
          </Routes>
          </Suspense>
        </div>
        </ImageLibraryProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
