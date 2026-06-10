'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
          mutations: { retry: 0 },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#202124',
            color: '#ffffff',
            borderRadius: '8px',
            fontSize: '14px',
            padding: '10px 16px',
          },
          success: {
            iconTheme: { primary: '#1a73e8', secondary: '#fff' },
          },
        }}
      />
    </QueryClientProvider>
  )
}
