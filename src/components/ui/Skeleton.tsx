interface SkeletonProps {
  variant?: 'text' | 'card' | 'table'
  rows?: number
  className?: string
}

export function Skeleton({ variant = 'text', rows = 3, className = '' }: SkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={`card p-6 space-y-4 ${className}`}>
        <div className="shimmer-block h-4 w-1/3 rounded-full" />
        <div className="shimmer-block h-8 w-1/2 rounded-2xl" />
        <div className="shimmer-block h-3 w-2/3 rounded-full" />
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className={`card overflow-hidden ${className}`}>
        <div className="p-3 border-b border-border">
          <div className="shimmer-block h-4 w-full rounded-full" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-3 border-b border-border/50 flex gap-4">
            <div className="shimmer-block h-4 w-1/4 rounded-full" />
            <div className="shimmer-block h-4 w-1/3 rounded-full" />
            <div className="shimmer-block h-4 w-1/6 rounded-full" />
            <div className="shimmer-block h-4 w-1/5 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="shimmer-block h-4 rounded-full" style={{ width: `${70 + Math.random() * 30}%` }} />
      ))}
    </div>
  )
}
