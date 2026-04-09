import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-text-1 placeholder:text-text-2/50 transition-[border-color,box-shadow,background-color] ${error ? 'border-red' : 'hover:border-cyan/20'} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red">{error}</p>}
    </div>
  )
}
