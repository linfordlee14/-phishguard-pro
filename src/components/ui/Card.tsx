import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  tint?: 'blue' | 'red' | 'green' | 'amber'
  id?: string
}

const tintClasses = {
  blue: 'border-cyan/30 bg-cyan/5',
  red: 'border-red/30 bg-red/5',
  green: 'border-green/30 bg-green/5',
  amber: 'border-amber/30 bg-amber/5',
}

export function Card({ children, className = '', tint, id }: CardProps) {
  return (
    <div
      id={id}
      className={`card p-6 ${tint ? tintClasses[tint] : ''} ${className}`}
    >
      {children}
    </div>
  )
}
