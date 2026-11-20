import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { Analytics } from "@vercel/analytics/react"
import './index.css'
import App from './App.tsx'

hydrateRoot(document.getElementById('root')!,
  <StrictMode>
    <Analytics />
    <App />
  </StrictMode>,
)
