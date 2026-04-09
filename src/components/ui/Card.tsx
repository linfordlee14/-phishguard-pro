import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  tint?: 'blue' | 'red' | 'green' | 'amber'
  id?: string
}

const tintClasses = {
  blue: 'bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.12),transparent_46%)]',
  red: 'bg-[radial-gradient(circle_at_top_left,rgba(230,57,70,0.12),transparent_46%)]',
  green: 'bg-[radial-gradient(circle_at_top_left,rgba(46,196,182,0.12),transparent_46%)]',
  amber: 'bg-[radial-gradient(circle_at_top_left,rgba(244,162,97,0.14),transparent_46%)]',
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
