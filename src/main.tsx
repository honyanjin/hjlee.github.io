import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ScrollToTop from './components/ScrollToTop'

// GitHub Pages 배포 시에만 basename 설정 (환경 변수로 관리)
const normalizeBasename = (value?: string) => {
  if (!value) return undefined
  return value.endsWith('/') ? value.slice(0, -1) : value
}
const basename = import.meta.env.PROD ? normalizeBasename(import.meta.env.VITE_BASE_PATH) : undefined

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <ScrollToTop />
      <App />
    </BrowserRouter>
  </StrictMode>,
)
