export function calculateRiskScore(clickCount: number, campaignsReceived: number): 'high' | 'medium' | 'low' {
  if (campaignsReceived === 0) return 'low'
  const clickRate = clickCount / campaignsReceived
  if (clickRate >= 0.5) return 'high'
  if (clickRate >= 0.25) return 'medium'
  return 'low'
}

export function getOrgRiskScore(avgClickRate: number): 'high' | 'medium' | 'low' {
  if (avgClickRate >= 40) return 'high'
  if (avgClickRate >= 20) return 'medium'
  return 'low'
}

export const riskColors = {
  high: 'bg-red/20 text-red',
  medium: 'bg-amber/20 text-amber',
  low: 'bg-green/20 text-green',
} as const
