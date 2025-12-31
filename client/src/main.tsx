// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App';
import './index.css';
import { StrictMode } from 'react';
import { AuthProvider } from './auth/AuthProvider';

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found in index.html (id="root")')

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
)