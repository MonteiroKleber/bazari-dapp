// apps/web/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

// IMPORTANTE: Importar i18n ANTES do App
import './lib/i18n'

// Importar App depois do i18n
import App from './App'

// Estilos globais
import './index.css'

// Criar QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})

// Renderizar app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1C1C1C',
              color: '#F5F1E0',
              border: '1px solid rgba(139, 0, 0, 0.2)',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)

