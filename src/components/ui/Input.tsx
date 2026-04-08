import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 bg-surface border border-border rounded-[var(--radius-input)] text-text-1 placeholder:text-text-2/50 transition-colors ${error ? 'border-red' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red">{error}</p>}
    </div>
  )
}
