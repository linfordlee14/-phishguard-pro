import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-amber mb-4" />
          <h2 className="text-lg font-semibold text-text-1 mb-2">Something went wrong</h2>
          <p className="text-text-2 mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-cyan text-navy rounded-[var(--radius-btn)] font-semibold hover:bg-cyan-dim transition-colors"
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
