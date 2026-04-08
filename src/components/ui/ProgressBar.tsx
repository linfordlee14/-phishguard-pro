interface ProgressBarProps {
  value: number
  max?: number
  color?: string
  label?: string
  showValue?: boolean
  className?: string
}

export function ProgressBar({ value, max = 100, color = 'bg-cyan', label, showValue, className = '' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between text-sm mb-1">
          {label && <span className="text-text-2">{label}</span>}
          {showValue && <span className="font-mono-data text-text-1">{value} / {max}</span>}
        </div>
      )}
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
