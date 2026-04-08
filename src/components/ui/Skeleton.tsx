interface SkeletonProps {
  variant?: 'text' | 'card' | 'table'
  rows?: number
  className?: string
}

export function Skeleton({ variant = 'text', rows = 3, className = '' }: SkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={`card p-6 space-y-4 ${className}`}>
        <div className="h-4 bg-surface rounded w-1/3 animate-pulse" />
        <div className="h-8 bg-surface rounded w-1/2 animate-pulse" />
        <div className="h-3 bg-surface rounded w-2/3 animate-pulse" />
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className={`card overflow-hidden ${className}`}>
        <div className="p-3 border-b border-border">
          <div className="h-4 bg-surface rounded w-full animate-pulse" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-3 border-b border-border/50 flex gap-4">
            <div className="h-4 bg-surface rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-surface rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-surface rounded w-1/6 animate-pulse" />
            <div className="h-4 bg-surface rounded w-1/5 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-surface rounded animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
      ))}
    </div>
  )
}
