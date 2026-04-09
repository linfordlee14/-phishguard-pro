import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variantClasses = {
  primary: 'border border-cyan bg-cyan text-navy shadow-[0_10px_28px_rgba(0,212,255,0.18)] hover:bg-[#34ddff] font-semibold',
  secondary: 'border border-white/[0.1] bg-white/[0.04] text-text-1 hover:border-cyan/20 hover:bg-cyan/[0.08]',
  danger: 'border border-red/40 bg-red text-white hover:bg-red/[0.9] font-semibold',
  ghost: 'border border-transparent bg-transparent text-text-2 hover:text-text-1 hover:bg-white/[0.06]',
}

const sizeClasses = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-[18px] py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({ variant = 'primary', size = 'md', loading, children, disabled, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-[background-color,border-color,color,transform,box-shadow] duration-200 cursor-pointer active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
