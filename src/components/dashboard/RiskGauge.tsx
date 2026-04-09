interface RiskGaugeProps {
  value: number
}

const clamp = (value: number) => Math.max(0, Math.min(100, value))

const getGaugeColor = (value: number) => {
  if (value >= 65) return '#E63946'
  if (value >= 35) return '#F4A261'
  return '#2EC4B6'
}

export function RiskGauge({ value }: RiskGaugeProps) {
  const normalizedValue = clamp(value)
  const gaugeColor = getGaugeColor(normalizedValue)

  return (
    <div className="rounded-[24px] border border-white/[0.06] bg-[radial-gradient(circle_at_top,rgba(0,212,255,0.08),transparent_52%)] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-text-2">Risk Score</p>
          <h3 className="text-lg font-semibold text-text-1">Exposure Index</h3>
        </div>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-text-2">
          0–100
        </span>
      </div>

      <div className="relative mx-auto flex max-w-[260px] justify-center">
        <svg viewBox="0 0 200 120" className="w-full">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="16"
            strokeLinecap="round"
            pathLength="100"
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={gaugeColor}
            strokeWidth="16"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${normalizedValue} 100`}
            className="transition-all duration-700"
            style={{ filter: `drop-shadow(0 0 14px ${gaugeColor}66)` }}
          />
        </svg>

        <div className="absolute inset-x-0 bottom-3 text-center">
          <p className="font-mono-data text-4xl font-semibold text-text-1" data-testid="dashboard-risk-gauge-value">
            {normalizedValue}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.32em] text-text-2">Current risk</p>
        </div>
      </div>
    </div>
  )
}