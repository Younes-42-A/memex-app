import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/layout.css'
import './styles/pages/dashboard.css'
import './styles/pages/courses.css'
import './styles/pages/files.css'
import './styles/pages/profile.css'
import './styles/pages/settings.css'
import './styles/pages/chat.css'
import './styles/pages/error-register.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
