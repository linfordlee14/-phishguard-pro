import type { ReactNode } from 'react'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

interface PageWrapperProps {
  children: ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <ErrorBoundary>
      <main className="p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </ErrorBoundary>
  )
}
