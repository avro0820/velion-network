import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { Analytics } from '@vercel/analytics/react';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0a1628',
              border: '1px solid rgba(0,212,255,0.2)',
              color: '#e2e8f0',
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
            },
          }}
        />
        <Analytics />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
