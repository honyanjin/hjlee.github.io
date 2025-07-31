import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import Blog from './pages/Blog'
import Contact from './pages/Contact'
import Login from './pages/Login'
import AdminBlog from './pages/AdminBlog'
import AdminBlogNew from './pages/AdminBlogNew'
import AdminBlogEdit from './pages/AdminBlogEdit'

function App() {
  return (
    <AuthProvider>
      <div id="app">
        <Routes>
          <Route id="home-route" path="/" element={<Home />} />
          <Route id="about-route" path="/about" element={<About />} />
          <Route id="projects-route" path="/projects" element={<Projects />} />
          <Route id="blog-route" path="/blog" element={<Blog />} />
          <Route id="contact-route" path="/contact" element={<Contact />} />
          <Route id="login-route" path="/login" element={<Login />} />
          
          {/* Admin Routes */}
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
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
