/**
 * main.tsx
 * --------
 * Bootstraps the React application and mounts it to the root DOM node.
 *
 * The application is wrapped in StrictMode to surface potential side effects
 * and unsafe lifecycle usage during development.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
