import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  children: ReactNode
  className?: string
}

const variantClasses = {
  success: 'bg-green/20 text-green',
  warning: 'bg-amber/20 text-amber',
  danger: 'bg-red/20 text-red',
  info: 'bg-cyan/20 text-cyan',
  neutral: 'bg-surface text-text-2',
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
