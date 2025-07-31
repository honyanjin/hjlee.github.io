import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import Blog from './pages/Blog'
import Contact from './pages/Contact'

function App() {
  return (
    <div id="app">
      <Routes>
        <Route id="home-route" path="/" element={<Home />} />
        <Route id="about-route" path="/about" element={<About />} />
        <Route id="projects-route" path="/projects" element={<Projects />} />
        <Route id="blog-route" path="/blog" element={<Blog />} />
        <Route id="contact-route" path="/contact" element={<Contact />} />
      </Routes>
    </div>
  )
}

export default App
