// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App';
import './index.css';

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found in index.html (id="root")')

createRoot(rootElement).render(
  // <StrictMode>
    <App />
  // </StrictMode>
)