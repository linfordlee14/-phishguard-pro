import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className = '', id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-text-2">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full appearance-none cursor-pointer rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-text-1 transition-[border-color,box-shadow,background-color] hover:border-cyan/20 ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
