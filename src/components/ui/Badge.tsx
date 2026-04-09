import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  children: ReactNode
  className?: string
}

const variantClasses = {
  success: 'border border-green/25 bg-green/[0.12] text-green',
  warning: 'border border-amber/25 bg-amber/[0.12] text-amber',
  danger: 'border border-red/25 bg-red/[0.12] text-red',
  info: 'border border-cyan/25 bg-cyan/[0.12] text-cyan',
  neutral: 'border border-white/[0.08] bg-white/[0.04] text-text-2',
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
